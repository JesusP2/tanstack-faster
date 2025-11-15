import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { collectionsOptions } from "@/lib/functions";
import { prefetchImagesOptions } from "@/lib/prefetch-images";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  beforeLoad: ({ context, preload }) => {
    if (preload) {
      Promise.all([
        context.queryClient.ensureQueryData(collectionsOptions),
        context.queryClient.ensureQueryData(
          prefetchImagesOptions(location.href),
        ),
      ]);
    } else {
      context.queryClient.ensureQueryData(collectionsOptions);
    }
  },
});

function RouteComponent() {
  const allCollections = useSuspenseQuery(collectionsOptions);
  return (
    <div className="flex flex-grow font-mono">
      <aside className="fixed left-0 hidden w-64 min-w-64 max-w-64 overflow-y-auto border-r p-4 md:block">
        <h2 className="border-accent1 border-b font-semibold text-accent1 text-sm">
          Choose a Category
        </h2>
        <ul className="flex flex-col items-start justify-center overflow-auto">
          {allCollections.data.map((collection) => (
            <li className="w-full" key={collection.slug}>
              <Link
                className="block w-full py-1 text-gray-800 text-xs hover:bg-accent2 hover:underline"
                params={{
                  collection: collection.slug,
                }}
                to="/$collection"
              >
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main
        className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4 pt-0 md:pl-64"
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}
