import { env } from 'cloudflare:workers';
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client';
import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '@/auth/server';

/**
 * Prepares the Electric SQL proxy URL from a request URL
 * Copies over Electric-specific query params and adds auth if configured
 * @param requestUrl - The incoming request URL
 * @returns The prepared Electric SQL origin URL
 */
export function prepareElectricUrl(requestUrl: string): URL {
  const url = new URL(requestUrl);
  const originUrl = new URL(`${env.ELECTRIC_URL}/v1/shape`);
  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value);
    }
  });
  return originUrl;
}

/**
 * Proxies a request to Electric SQL and returns the response
 * @param originUrl - The prepared Electric SQL URL
 * @returns The proxied response
 */
export async function proxyElectricRequest(originUrl: URL): Promise<Response> {
  const response = await fetch(originUrl);
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.set('vary', 'cookie');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const serve = async ({ request }: { request: Request }) => {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  const originUrl = prepareElectricUrl(request.url);
  const table = new URL(request.url).searchParams.get('table');
  if (!table) {
    return new Response(JSON.stringify({ error: 'No table specified' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  originUrl.searchParams.set('table', table);
  // const filter = `'${session?.user.id}' = ANY(user_ids)`;
  // originUrl.searchParams.set(`where`, filter);
  originUrl.searchParams.set('secret', env.ELECTRIC_SECRET);

  return proxyElectricRequest(originUrl);
};

export const Route = createFileRoute('/api/electric/$')({
  server: {
    handlers: {
      GET: serve,
    },
  },
});
