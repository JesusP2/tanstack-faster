import { QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Suspense } from 'react';
import { AuthProvider } from '@/auth/provider';
import Loader from '@/components/loader';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/shared/query-client';
import { ThemeProvider } from '@/theme/provider';
import { ConfirmDialogProvider } from '../components/providers/confirm-dialog';
import { IsOnlineProvider } from '../components/providers/is-online';
import appCss from '../index.css?url';

export type RouterAppContext = {};

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
  // beforeLoad: async () => queryClient.ensureQueryData(useUserQueryOptions()),
});

function RootDocument() {
  return (
    <html className="dark" lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Suspense fallback={<Loader />}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <IsOnlineProvider>
                <AuthProvider>
                  <ConfirmDialogProvider>
                    <Outlet />
                    <Toaster richColors />
                  </ConfirmDialogProvider>
                </AuthProvider>
              </IsOnlineProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </Suspense>
        <TanStackRouterDevtools position="bottom-left" />
        <Scripts />
      </body>
    </html>
  );
}
