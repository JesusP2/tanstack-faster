import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { parseHTML } from "linkedom";
import z from "zod";

export const prefetchImages = createServerFn()
  .inputValidator(
    z.object({
      pathname: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const url = new URL(data.pathname, import.meta.env.VITE_SERVER_URL);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    const body = await response.text();
    const { document } = parseHTML(body);
    const images = Array.from(document.querySelectorAll("main img"))
      .map((img) => ({
        srcset: img.getAttribute("srcset") || img.getAttribute("srcSet"), // Linkedom is case-sensitive
        sizes: img.getAttribute("sizes"),
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt"),
        loading: img.getAttribute("loading"),
      }))
      .filter((img) => img.src);
    setResponseHeader("Cache-Control", "public, max-age=3600");
    return {
      images,
    };
  });

const seen = new Set<string>();
type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};
export function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy" || seen.has(image.srcset)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = "low";
  if (image.sizes) {
    img.sizes = image.sizes;
  }
  seen.add(image.srcset);
  img.srcset = image.srcset;
  img.src = image.src;
  img.alt = image.alt;
}
