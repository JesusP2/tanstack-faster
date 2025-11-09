import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { count, eq, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  categories,
  products,
  subcategories,
  subcollections,
} from "@/db/schema";
import { setResponseHeader } from "@tanstack/react-start/server";

export const getCollections = createServerFn().handler(async () =>
  db.query.collections.findMany({
    with: {
      categories: true,
    },
    orderBy: (collections, { asc }) => asc(collections.name),
  }),
);
export const collectionsOptions = queryOptions({
  queryKey: ["collections"],
  queryFn: () => getCollections(),
});

export const getProductsForSubcategory = createServerFn()
  .inputValidator(
    z.object({
      subcategorySlug: z.string(),
    }),
  )
  .handler(async ({ data }) =>
    db.query.products.findMany({
      where: (products, { eq, and }) =>
        and(eq(products.subcategory_slug, data.subcategorySlug)),
      orderBy: (products, { asc }) => asc(products.slug),
    }),
  );
export const productsForSubcategoryOptions = (subcategorySlug: string) =>
  queryOptions({
    queryKey: ["products-for-subcategory", subcategorySlug],
    queryFn: () =>
      getProductsForSubcategory({
        data: { subcategorySlug },
      }),
  });

export const getProductDetails = createServerFn()
  .inputValidator(
    z.object({
      productSlug: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, data.productSlug),
    });
    if (!product) {
      throw notFound();
    }
    return product;
  });
export const productDetailsOptions = (productSlug: string) =>
  queryOptions({
    queryKey: ["product-details", productSlug],
    queryFn: () =>
      getProductDetails({
        data: { productSlug },
      }),
  });

export const getSubcategory = createServerFn()
  .inputValidator(
    z.object({
      subcategorySlug: z.string(),
    }),
  )
  .handler(async ({ data }) =>
    db.query.subcategories.findFirst({
      where: (subcategories, { eq }) =>
        eq(subcategories.slug, data.subcategorySlug),
    }),
  );
export const subcategoryOptions = (subcategorySlug: string) =>
  queryOptions({
    queryKey: ["subcategory", subcategorySlug],
    queryFn: () =>
      getSubcategory({
        data: { subcategorySlug },
      }),
  });

export const getCategory = createServerFn()
  .inputValidator(
    z.object({
      categorySlug: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const category = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.slug, data.categorySlug),
      with: {
        subcollections: {
          with: {
            subcategories: true,
          },
        },
      },
    });
    if (!category) {
      throw notFound();
    }
    return category;
  });
export const categoryOptions = (categorySlug: string) =>
  queryOptions({
    queryKey: ["category", categorySlug],
    queryFn: () =>
      getCategory({
        data: { categorySlug },
      }),
  });

export const getCollectionDetails = createServerFn()
  .inputValidator(
    z.object({
      collectionSlug: z.string(),
    }),
  )
  .handler(async ({ data }) =>
    db.query.collections.findMany({
      with: {
        categories: true,
      },
      where: (collections, { eq }) => eq(collections.slug, data.collectionSlug),
      orderBy: (collections, { asc }) => asc(collections.slug),
    }),
  );
export const collectionDetailsOptions = (collectionSlug: string) =>
  queryOptions({
    queryKey: ["collection-details", collectionSlug],
    queryFn: () =>
      getCollectionDetails({
        data: { collectionSlug },
      }),
  });

export const getProductCount = createServerFn().handler(async () =>
  db.select({ count: count() }).from(products),
);
export const productCountOptions = queryOptions({
  queryKey: ["product-count"],
  queryFn: () => getProductCount(),
});

// could be optimized by storing category slug on the products table
export const getCategoryProductCount = createServerFn()
  .inputValidator(
    z.object({
      categorySlug: z.string(),
    }),
  )
  .handler(async ({ data }) =>
    db
      .select({ count: count() })
      .from(categories)
      .leftJoin(
        subcollections,
        eq(categories.slug, subcollections.category_slug),
      )
      .leftJoin(
        subcategories,
        eq(subcollections.id, subcategories.subcollection_id),
      )
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .where(eq(categories.slug, data.categorySlug)),
  );
export const categoryProductCountOptions = (categorySlug: string) =>
  queryOptions({
    queryKey: ["category-product-count", categorySlug],
    queryFn: () =>
      getCategoryProductCount({
        data: { categorySlug },
      }),
  });

export const getSubcategoryProductCount = createServerFn()
  .inputValidator(
    z.object({
      subcategorySlug: z.string(),
    }),
  )
  .handler(async ({ data }) =>
    db
      .select({ count: count() })
      .from(products)
      .where(eq(products.subcategory_slug, data.subcategorySlug)),
  );
export const subcategoryProductCountOptions = (subcategorySlug: string) =>
  queryOptions({
    queryKey: ["subcategory-product-count", subcategorySlug],
    queryFn: () =>
      getSubcategoryProductCount({
        data: { subcategorySlug },
      }),
  });

export const getSearchResults = createServerFn()
  .inputValidator(
    z.object({
      searchTerm: z.string(),
    }),
  )
  .handler(async ({ data: { searchTerm } }) => {
    let results;

    // do we really need to do this hybrid search pattern?

    if (searchTerm.length <= 2) {
      // If the search term is short (e.g., "W"), use ILIKE for prefix matching
      results = await db
        .select()
        .from(products)
        .where(sql`${products.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    } else {
      // For longer search terms, use full-text search with tsquery
      const formattedSearchTerm = searchTerm
        .split(" ")
        .filter((term) => term.trim() !== "") // Filter out empty terms
        .map((term) => `${term}:*`)
        .join(" & ");

      results = await db
        .select()
        .from(products)
        .where(
          sql`to_tsvector('english', ${products.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    }

    const searchResults = results.map((item) => {
      const to = `/products/${item.categories.slug}/${item.subcategories.slug}/${item.products.slug}`;
      return {
        ...item.products,
        to,
      };
    });
    setResponseHeader("Cache-Control", "max-age=600");
    return searchResults;
  });
export const searchOptions = (searchTerm: string) =>
  queryOptions({
    queryKey: ["search", searchTerm],
    queryFn: () =>
      getSearchResults({
        data: { searchTerm },
      }),
  });
