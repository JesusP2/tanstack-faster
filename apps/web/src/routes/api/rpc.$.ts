import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '@/auth/server';
import { getDb } from '@/db';
import { handler } from '@/shared/orpc/router';

async function handle({ request }: { request: Request }) {
  const auth = getAuth();
  const db = getDb();
  const session = await auth.api.getSession({ headers: request.headers });
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {
      session,
      db,
    },
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
