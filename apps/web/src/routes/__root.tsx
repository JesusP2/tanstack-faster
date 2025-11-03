import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from '@/auth/provider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/theme/provider';
import { ConfirmDialogProvider } from '../components/providers/confirm-dialog';
import appCss from '../index.css?url';
import { getThemeServerFn } from '@/theme/functions';
import { useUserQueryOptions } from '@/auth/use-user';

export type RouterAppContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'My App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootDocument,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(useUserQueryOptions)
    return getThemeServerFn()
  }
});

function RootDocument() {
  const data = Route.useLoaderData();
  return (
    <html className={data.theme} lang="en">
      <head>
        <HeadContent />
      </head>
      <body style={data.presetProperties}>
        <ThemeProvider defaultPreset={data.preset} defaultTheme={data.theme}>
            <AuthProvider>
              <ConfirmDialogProvider>
                <Outlet />
                <Toaster richColors />
              </ConfirmDialogProvider>
            </AuthProvider>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
