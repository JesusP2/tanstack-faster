import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Link } from "@/components/link";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "@/auth/provider";
import { useUserQueryOptions } from "@/auth/use-user";
import { Toaster } from "@/components/ui/sonner";
import { getThemeServerFn } from "@/theme/functions";
import { ThemeProvider } from "@/theme/provider";
import { ConfirmDialogProvider } from "../components/providers/confirm-dialog";
import appCss from "../index.css?url";
import { Suspense } from "react";
import { Cart } from "@/components/cart";
import { MenuIcon } from "lucide-react";
import Autocomplete from "@/components/search-components";

export type RouterAppContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Tanstack Faster",
      },
      {
        name: "description",
        content: "",
      },
      {
        property: "og:url",
        content: "https://tanstack-faster.jesusp2.com/",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "Tanstack Faster",
      },
      {
        property: "og:description",
        content: "",
      },
      {
        property: "og:image",
        content: "https://tanstack-faster.jesusp2.com/opengraph.png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        property: "twitter:domain",
        content: "tanstack-faster.jesusp2.com",
      },
      {
        property: "twitter:url",
        content: "https://tanstack-faster.jesusp2.com/",
      },
      {
        name: "twitter:title",
        content: "Tanstack Faster",
      },
      {
        name: "twitter:description",
        content: "",
      },
      {
        name: "twitter:image",
        content: "https://tanstack-faster.jesusp2.com/opengraph.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      }
    ],
  }),
  component: RootDocument,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(useUserQueryOptions);
    return getThemeServerFn();
  },
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
              <div>
                <header className="fixed top-0 z-10 flex h-[90px] w-[100vw] flex-grow items-center justify-between border-b-2 border-accent2 bg-background p-2 pb-[4px] pt-2 sm:h-[70px] sm:flex-row sm:gap-4 sm:p-4 sm:pb-[4px] sm:pt-0">
                  <div className="flex flex-grow flex-col">
                    <div className="flex w-full flex-col items-start justify-center sm:w-auto sm:flex-row sm:items-center sm:gap-2">
                      <Link to="/" className="text-4xl font-bold text-accent1">
                        TanstackFaster
                      </Link>
                      <div className="items flex w-full flex-row items-center justify-between gap-4">
                        <div className="mx-0 flex-grow sm:mx-auto sm:flex-grow-0">
                          <Autocomplete />
                        </div>
                        <div className="flex flex-row justify-between space-x-4">
                          <div className="relative">
                            <Link
                              to="/order"
                              className="text-lg text-accent1 hover:underline"
                            >
                              ORDER
                            </Link>
                            <Suspense>
                              <Cart />
                            </Suspense>
                          </div>
                          <Link
                            to="/order-history"
                            className="hidden text-lg text-accent1 hover:underline md:block"
                          >
                            ORDER HISTORY
                          </Link>
                          <Link
                            to="/order-history"
                            aria-label="Order History"
                            className="block text-lg text-accent1 hover:underline md:hidden"
                          >
                            <MenuIcon />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="pt-[85px] sm:pt-[70px]">
                  <Outlet />
                </div>
              </div>
              <footer className="fixed bottom-0 flex h-12 w-screen flex-col items-center justify-between space-y-2 border-t border-gray-400 bg-background px-4 font-sans text-[11px] sm:h-6 sm:flex-row sm:space-y-0">
                <div className="flex flex-wrap justify-center space-x-2 pt-2 sm:justify-start">
                  <span className="hover:bg-accent2 hover:underline">Home</span>
                  <span>|</span>
                  <span className="hover:bg-accent2 hover:underline">FAQ</span>
                  <span>|</span>
                  <span className="hover:bg-accent2 hover:underline">
                    Returns
                  </span>
                  <span>|</span>
                  <span className="hover:bg-accent2 hover:underline">
                    Careers
                  </span>
                  <span>|</span>
                  <span className="hover:bg-accent2 hover:underline">
                    Contact
                  </span>
                </div>
                <div className="text-center sm:text-right">
                  By using this website, you agree to check out the{" "}
                  <a
                    href="https://github.com/jesusp2/tanstack-faster"
                    className="font-bold text-accent1 hover:underline"
                    target="_blank"
                  >
                    Source Code
                  </a>
                </div>
              </footer>
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
