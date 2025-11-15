import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { collectionsOptions, productCountOptions } from "@/lib/functions";
import { Image } from "@/components/image";
import { prefetchImagesOptions } from "@/lib/prefetch-images";

export const Route = createFileRoute("/_layout/")({
  component: HomeComponent,
  beforeLoad: async ({ context, preload, location }) => {
    if (preload) {
      Promise.all([
        context.queryClient.ensureQueryData(collectionsOptions),
        context.queryClient.ensureQueryData(productCountOptions),
        context.queryClient.ensureQueryData(
          prefetchImagesOptions(location.href),
        ),
      ]);
    } else {
      Promise.all([
        context.queryClient.ensureQueryData(collectionsOptions),
        context.queryClient.ensureQueryData(productCountOptions),
      ]);
    }
  },
});

function HomeComponent() {
  const { data: collections } = useSuspenseQuery(collectionsOptions);
  const { data: productCount } = useSuspenseQuery(productCountOptions);
  let imageCount = 0;
  return (
    <div className="w-full p-4">
      <div className="mb-2 w-full flex-grow border-accent1 border-b-[1px] font-semibold text-black text-sm">
        Explore {productCount.at(0)?.count.toLocaleString()} products
      </div>
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
                  height={48}
                  loading={imageCount++ < 15 ? "eager" : "lazy"}
                  src={category.image_url ?? "placeholder.jpg"}
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
