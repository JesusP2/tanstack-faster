import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { ProductLink } from '@/components/product-link';
import {
  productDetailsOptions,
  productsForSubcategoryOptions,
} from '@/lib/functions';
import { Image } from '@/components/image';
import { prefetchImagesOptions } from '@/lib/prefetch-images';

export const Route = createFileRoute(
  '/_layout/products/$categorySlug/$subcategorySlug/$productSlug/'
)({
  component: RouteComponent,
  beforeLoad: async ({ context, params, preload, location }) => {
    if (preload) {
      Promise.all([
        context.queryClient.ensureQueryData(
          productDetailsOptions(params.productSlug),
        ),
        context.queryClient.ensureQueryData(
          productsForSubcategoryOptions(params.subcategorySlug),
        ),
        context.queryClient.ensureQueryData(
          prefetchImagesOptions(location.href),
        ),
      ]);
    } else {
      Promise.all([
        context.queryClient.ensureQueryData(
          productDetailsOptions(params.productSlug),
        ),
        context.queryClient.ensureQueryData(
          productsForSubcategoryOptions(params.subcategorySlug),
        ),
      ]);
    }
  }
});

function RouteComponent() {
  const { categorySlug, subcategorySlug, productSlug } = Route.useParams();
  const { data: productData } = useSuspenseQuery(
    productDetailsOptions(productSlug)
  );
  const { data: related } = useSuspenseQuery(
    productsForSubcategoryOptions(subcategorySlug)
  );
  return (
    <div className="container p-4">
      <h1 className="border-t-2 pt-1 font-bold text-xl text-accent1">
        {productData.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Image
            alt={`A small picture of ${productData.name}`}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
            decoding="sync"
            height={256}
            loading="eager"
            src={productData.image_url ?? 'placeholder.jpg'}
            width={256}
          />
          <p className="flex-grow text-base">{productData.description}</p>
        </div>
        <p className="font-bold text-xl">
          ${Number.parseFloat(productData.price).toFixed(2)}
        </p>
        <AddToCartForm productSlug={productData.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="font-bold text-accent1 text-lg">
            Explore more products
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related?.map((product) => (
            <ProductLink
              category_slug={categorySlug}
              imageUrl={product.image_url}
              key={product.name}
              loading="lazy"
              product={product}
              subcategory_slug={subcategorySlug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
