import { getCartOptions } from "@/lib/cart";
import { useSuspenseQuery } from "@tanstack/react-query";

export function Cart() {
  const { data: cart } = useSuspenseQuery(getCartOptions)
  if (cart.length == 0) {
    return null;
  }
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  return (
    <div className="absolute -right-3 -top-1 rounded-full bg-accent2 px-1 text-xs text-accent1">
      {totalQuantity}
    </div>
  );
}
