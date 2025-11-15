import { useQueryClient } from "@tanstack/react-query";
import { Link as TanstackLink } from "@tanstack/react-router";
import { useRef } from "react";

export const Link: typeof TanstackLink = (props) => {
  const queryClient = useQueryClient();
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <TanstackLink
      ref={linkRef}
      onMouseEnter={(event) => {
        const images = (queryClient.getQueryData([
          "prefetch-images",
          event.currentTarget.pathname,
        ]) || []) as PrefetchImage[];
        images.forEach((image) => prefetchImage(image));
      }}
      {...props}
    />
  );
};

const seen = new Set<string>();
type PrefetchImage = {
  srcset: string | null;
  sizes: string | null;
  src: string | null;
  alt: string | null;
  loading: string | null;
};

export function prefetchImage(image: PrefetchImage) {
  if (image.loading === "lazy") {
    return;
  }
  const imageKey = image.srcset || image.src;
  if (!imageKey || seen.has(imageKey)) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";

  // Set the href to the src (fallback for browsers that don't support imagesrcset)
  if (image.src) {
    link.href = image.src;
  }
  if (image.srcset) {
    link.setAttribute("imagesrcset", image.srcset);
  }

  if (image.sizes) {
    link.setAttribute("imagesizes", image.sizes);
  }
  link.fetchPriority = "low";
  document.head.appendChild(link);
  seen.add(imageKey);
}
