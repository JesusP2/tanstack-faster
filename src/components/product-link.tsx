import { Link } from "@/components/link";
import type { Product } from "@/db/schema";
import { Image } from "@/components/image";

export function ProductLink(props: {
  imageUrl?: string | null;
  category_slug: string;
  subcategory_slug: string;
  loading: "eager" | "lazy";
  product: Product;
}) {
  const { category_slug, subcategory_slug, product, imageUrl } = props;

  return (
    <Link
      className="group flex h-[130px] w-full flex-row border px-4 py-2 hover:bg-gray-100 sm:w-[250px]"
      params={{
        categorySlug: category_slug,
        subcategorySlug: subcategory_slug,
        productSlug: product.slug,
      }}
      to="/products/$categorySlug/$subcategorySlug/$productSlug"
    >
      <div className="py-2">
        <Image
          alt={`A small picture of ${product.name}`}
          className="h-auto w-12 flex-shrink-0 object-cover"
          decoding="sync"
          height={48}
          loading={props.loading}
          src={imageUrl ?? 'placeholder.jpg'}
          width={48}
        />
      </div>
      <div className="px-2" />
      <div className="flex h-26 flex-grow flex-col items-start py-2">
        <div className="font-medium text-gray-700 text-sm group-hover:underline">
          {product.name}
        </div>
        <p className="overflow-hidden text-xs">{product.description}</p>
      </div>
    </Link>
  );
}
