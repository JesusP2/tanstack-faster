import { db } from "@/db";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const cartSchema = z.array(
  z.object({
    productSlug: z.string(),
    quantity: z.number(),
  }),
);

export type CartItem = z.infer<typeof cartSchema>[number];

export const updateCart = createServerFn()
  .inputValidator(
    z.object({
      newItems: cartSchema,
    }),
  )
  .handler(async ({ data }) => {
    setCookie("cart", JSON.stringify(data.newItems), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  });

export const getCart = createServerFn().handler(async () => {
  const cart = getCookie("cart");
  if (!cart) {
    return [];
  }
  try {
    return cartSchema.parse(JSON.parse(cart));
  } catch {
    console.error("Failed to parse cart cookie");
    return [];
  }
});
export const getCartOptions = queryOptions({
  queryKey: ["cart"],
  queryFn: () => getCart(),
})

export const detailedCart = createServerFn().handler(async () => {
  const cart = await getCart();

  const products = await db.query.products.findMany({
    where: (products, { inArray }) =>
      inArray(
        products.slug,
        cart.map((item) => item.productSlug),
      ),
    with: {
      subcategory: {
        with: {
          subcollection: true,
        },
      },
    },
  });

  const withQuantity = products.map((product) => ({
    ...product,
    quantity:
      cart.find((item) => item.productSlug === product.slug)?.quantity ?? 0,
  }));
  return withQuantity;
});
export const detailedCartOptions = queryOptions({
  queryKey: ["detailed-cart"],
  queryFn: () => detailedCart(),
})

export const addToCart = createServerFn({
  method: "POST",
})
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data");
    }
    return {
      productSlug: data.get("productSlug"),
    };
  })
  .handler(async ({ data: { productSlug } }) => {
    const prevCart = await getCart();
    if (typeof productSlug !== "string") {
      return;
    }
    const itemAlreadyExists = prevCart.find(
      (item) => item.productSlug === productSlug,
    );
    if (itemAlreadyExists) {
      const newQuantity = itemAlreadyExists.quantity + 1;
      const newCart = prevCart.map((item) => {
        if (item.productSlug === productSlug) {
          return {
            ...item,
            quantity: newQuantity,
          };
        }
        return item;
      });
      await updateCart({
        data: {
          newItems: newCart,
        },
      });
    } else {
      const newCart = [
        ...prevCart,
        {
          productSlug,
          quantity: 1,
        },
      ];
      await updateCart({
        data: {
          newItems: newCart,
        },
      });
    }

    return "Item added to cart";
  });

export const removeFromCart = createServerFn({
  method: "POST",
})
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data");
    }
    return {
      productSlug: data.get("productSlug"),
    };
  })
  .handler(async ({ data: { productSlug } }) => {
    const prevCart = await getCart();
    if (typeof productSlug !== "string") {
      return;
    }
    const itemAlreadyExists = prevCart.find(
      (item) => item.productSlug === productSlug,
    );
    if (!itemAlreadyExists) {
      return;
    }
    const newCart = prevCart.filter((item) => item.productSlug !== productSlug);
    await updateCart({
      data: {
        newItems: newCart,
      },
    });
  });
