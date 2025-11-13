import { addToCart, detailedCartOptions, getCartOptions } from "@/lib/cart";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

export function AddToCartForm({ productSlug }: { productSlug: string }) {
  const { queryClient} = useRouteContext({
    from: '__root__'
  })
  const mutation = useMutation({
    mutationKey: ["add-to-cart", productSlug],
    mutationFn: addToCart,
    onSuccess: () => {
      queryClient.invalidateQueries(detailedCartOptions);
      queryClient.invalidateQueries(getCartOptions);
    }
  });

  function handleSubmit(formData: FormData) {
    mutation.mutate({
      data: formData,
    });
  }
  return (
    <form className="flex flex-col gap-2" action={handleSubmit}>
      <input type="hidden" name="productSlug" value={productSlug} />
      <div className="flex flex-row gap-2">
      <button
        type="submit"
        className="max-w-[150px] rounded-[2px] bg-accent1 px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {mutation.isPending && <p>Adding to cart...</p>}
      {!mutation.isPending && mutation.isSuccess && <p>Item added to cart</p>}
      </div>
    </form>
  );
}
