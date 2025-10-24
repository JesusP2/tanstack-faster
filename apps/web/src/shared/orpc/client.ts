import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { ORPCRouter } from "./router";

const link = new RPCLink({
  url: `${window.location.origin}/api/rpc`,
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const orpcClient: RouterClient<ORPCRouter> = createORPCClient(link);
