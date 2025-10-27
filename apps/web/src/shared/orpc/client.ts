import { createRouterClient } from "@orpc/server";
import { createIsomorphicFn } from "@tanstack/react-start";
import { createContext } from "./context";
import { type ORPCRouter, orpcRouter } from "./router";
import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(orpcRouter, {
      context: async ({ req }) => {
        return createContext({ req });
      },
    }),
  )
  .client((): RouterClient<ORPCRouter> => {
    const link = new RPCLink({
      url: `${import.meta.env.VITE_SERVER_URL}/api/rpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
      interceptors: [
        onError((error) => {
          console.error(error);
        }),
      ],
    });

    return createORPCClient(link);
  });

export const orpcClient: RouterClient<ORPCRouter> = getORPCClient();
