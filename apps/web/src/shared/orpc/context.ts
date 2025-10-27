import { getAuth } from "@/auth/server";
import { getDb } from "@/db";

export async function createContext({ req }: { req: Request }) {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const db = getDb();
  return {
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
