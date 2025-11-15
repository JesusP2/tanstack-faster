import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { collectionDetailsOptions } from "@/lib/functions";
import { Image } from "@/components/image";
import {
  prefetchImagesOptions,
} from "@/lib/prefetch-images";

export const Route = createFileRoute("/_layout/$collection")({
  component: RouteComponent,
  beforeLoad: async ({ context, params, preload, location }) => {
    if (preload) {
      Promise.all([
        context.queryClient.ensureQueryData(
          collectionDetailsOptions(params.collection),
        ),
        context.queryClient.ensureQueryData(
          prefetchImagesOptions(location.href),
        ),
      ]);
    } else {
      context.queryClient.ensureQueryData(
        collectionDetailsOptions(params.collection),
      );
    }
  },
});

function RouteComponent() {
  const { collection } = Route.useParams();
  const { data: collections } = useSuspenseQuery(
    collectionDetailsOptions(collection),
  );
  let imageCount = 0;
  return (
    <div className="w-full p-4">
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="font-semibold text-xl">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                className="flex w-[125px] flex-col items-center text-center"
                key={category.name}
                params={{ categorySlug: category.slug }}
                to="/products/$categorySlug"
              >
                <Image
                  alt={`A small picture of ${category.name}`}
                  className="mb-2 h-14 w-14 border hover:bg-accent2"
                  decoding="sync"
                  src={category.image_url ?? "placeholder.jpg"}
                  height={48}
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  width={48}
                />
                <span className="text-xs">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
