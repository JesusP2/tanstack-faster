import {
  detailedCartOptions,
  getCartOptions,
  removeFromCart,
} from "@/lib/cart";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Link } from "@/components/link";
import { X } from "lucide-react";
import { Suspense } from "react";
import { Image } from "@/components/image";

export const Route = createFileRoute("/order/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: cart } = useSuspenseQuery(detailedCartOptions);
  const totalCost = cart.reduce(
    (acc, item) => acc + item.quantity * Number(item.price),
    0,
  );
  return (
    <main className="min-h-screen sm:p-4">
      <div className="container mx-auto p-1 sm:p-3">
        <div className="flex items-center justify-between border-b border-gray-200">
          <h1 className="text-2xl text-accent1">Order</h1>
        </div>

        <div className="flex grid-cols-3 flex-col gap-8 pt-4 lg:grid">
          <div className="col-span-2">
            <Suspense>
              <>
                {cart.length > 0 && (
                  <div className="pb-4">
                    <p className="font-semibold text-accent1">
                      Delivers in 2-4 weeks
                    </p>
                    <p className="text-sm text-gray-500">Need this sooner?</p>
                  </div>
                )}
                {cart.length > 0 ? (
                  <div className="flex flex-col space-y-10">
                    {cart.map((item) => (
                      <CartItem key={item.slug} product={item} />
                    ))}
                  </div>
                ) : (
                  <p>No items in cart</p>
                )}
              </>
            </Suspense>
          </div>

          <div className="space-y-4">
            <div className="rounded bg-gray-100 p-4">
              <p className="font-semibold">
                Merchandise{" "}
                <Suspense>
                  <span> ${totalCost.toFixed(2)}</span>
                </Suspense>
              </p>
              <p className="text-sm text-gray-500">
                Applicable shipping and tax will be added.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function CartItem({ product }: { product: any }) {
  const { queryClient } = useRouteContext({
    from: "__root__",
  });
  const mutation = useMutation({
    mutationKey: ["remove-from-cart", product.slug],
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries(detailedCartOptions);
      queryClient.invalidateQueries(getCartOptions);
    },
  });
  if (!product) {
    return null;
  }

  const cost = (Number(product.price) * product.quantity).toFixed(2);

  function handleSubmit(formData: FormData) {
    mutation.mutate({
      data: formData,
    });
  }
  return (
    <div className="flex flex-row items-center justify-between border-t border-gray-200 pt-4">
      <Link
        to="/products/$categorySlug/$subcategorySlug/$productSlug"
        params={{
          categorySlug: product.subcategory.subcollection.category_slug,
          subcategorySlug: product.subcategory.slug,
          productSlug: product.slug,
        }}
      >
        <div className="flex flex-row space-x-2">
          <div className="flex h-24 w-24 items-center justify-center bg-gray-100">
            <Image
              loading="eager"
              decoding="sync"
              src={product.image_url ?? 'placeholder.jpg'}
              alt="Product"
              width={256}
              height={256}
            />
          </div>
          <div className="max-w-[100px] flex-grow sm:max-w-full">
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm md:text-base">{product.description}</p>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-center md:space-x-10">
        <div className="flex flex-col-reverse md:flex-row md:gap-4">
          <p>{product.quantity}</p>
          <div className="flex md:block">
            <div className="min-w-8 text-sm md:min-w-24 md:text-base">
              <p>${Number(product.price).toFixed(2)} each</p>
            </div>
          </div>
          <div className="min-w-24">
            <p className="font-semibold">${cost}</p>
          </div>
        </div>
        <form action={handleSubmit}>
          <button type="submit">
            <input type="hidden" name="productSlug" value={product.slug} />
            <X className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
