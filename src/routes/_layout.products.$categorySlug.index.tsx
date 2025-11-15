import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { useServerFn } from "@tanstack/react-start";
import {
  categoryOptions,
  categoryProductCountOptions,
  getCategory,
} from "@/lib/functions";
import { Image } from "@/components/image";
import { prefetchImagesOptions } from "@/lib/prefetch-images";

export const Route = createFileRoute("/_layout/products/$categorySlug/")({
  component: RouteComponent,
  beforeLoad: async ({ context, params, preload, location }) => {
    const { categorySlug } = params;
    if (preload) {
      Promise.all([
        context.queryClient.ensureQueryData(categoryOptions(categorySlug)),
        context.queryClient.ensureQueryData(
          categoryProductCountOptions(categorySlug),
        ),
        context.queryClient.ensureQueryData(
          prefetchImagesOptions(location.href),
        ),
      ]);
    } else {
      Promise.all([
        context.queryClient.ensureQueryData(categoryOptions(categorySlug)),
        context.queryClient.ensureQueryData(
          categoryProductCountOptions(categorySlug),
        ),
      ]);
    }
  },
});

function RouteComponent() {
  const { categorySlug } = Route.useParams();
  const serverFn = useServerFn(getCategory);
  const { data: category } = useSuspenseQuery({
    queryKey: ["category", categorySlug],
    queryFn: () => serverFn({ data: { categorySlug } }),
  });
  const { data: countRes } = useSuspenseQuery(
    categoryProductCountOptions(categorySlug),
  );
  const finalCount = countRes[0]?.count;
  return (
    <div className="container p-4">
      {finalCount && (
        <h1 className="mb-2 border-b-2 font-bold text-sm">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      )}
      <div className="space-y-4">
        {category.subcollections.map((subcollection, index) => (
          <div key={index}>
            <h2 className="mb-2 border-b-2 font-semibold text-lg">
              {subcollection.name}
            </h2>
            <div className="flex flex-row flex-wrap gap-2">
              {subcollection.subcategories.map(
                (subcategory, subcategoryIndex) => (
                  <Link
                    className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                    key={subcategoryIndex}
                    params={{
                      categorySlug,
                      subcategorySlug: subcategory.slug,
                    }}
                    to="/products/$categorySlug/$subcategorySlug"
                  >
                    <div className="py-2">
                      <Image
                        alt={`A small picture of ${subcategory.name}`}
                        className="h-12 w-12 flex-shrink-0 object-cover"
                        decoding="sync"
                        height={48}
                        loading="eager"
                        src={subcategory.image_url ?? "placeholder.jpg"}
                        width={48}
                      />
                    </div>
                    <div className="flex h-16 flex-grow flex-col items-start py-2">
                      <div className="font-medium text-gray-700 text-sm group-hover:underline">
                        {subcategory.name}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
