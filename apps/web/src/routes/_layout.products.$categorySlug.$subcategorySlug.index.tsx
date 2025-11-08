import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ProductLink } from '@/components/product-link';
import {
  productsForSubcategoryOptions,
  subcategoryProductCountOptions,
} from '@/lib/functions';

export const Route = createFileRoute(
  '/_layout/products/$categorySlug/$subcategorySlug/'
)({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const { subcategorySlug } = params;
    Promise.all([
      context.queryClient.ensureQueryData(
        productsForSubcategoryOptions(subcategorySlug)
      ),
      context.queryClient.ensureQueryData(
        subcategoryProductCountOptions(subcategorySlug)
      ),
    ]);
  },
});

function RouteComponent() {
  const { categorySlug, subcategorySlug } = Route.useParams();
  const { data: products } = useSuspenseQuery(
    productsForSubcategoryOptions(subcategorySlug)
  );
  const { data: countRes } = useSuspenseQuery(
    subcategoryProductCountOptions(subcategorySlug)
  );
  const finalCount = countRes[0]?.count;
  return (
    <div className="container mx-auto p-4">
      {finalCount > 0 ? (
        <h1 className="mb-2 border-b-2 font-bold text-sm">
          {finalCount} {finalCount === 1 ? 'Product' : 'Products'}
        </h1>
      ) : (
        <p>No products for this subcategory</p>
      )}
      <div className="flex flex-row flex-wrap gap-2">
        {products.map((product) => (
          <ProductLink
            category_slug={categorySlug}
            imageUrl={product.image_url}
            key={product.name}
            loading="eager"
            product={product}
            subcategory_slug={subcategorySlug}
          />
        ))}
      </div>
    </div>
  );
}
