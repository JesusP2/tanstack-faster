import { Link as TanstackLink } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();

export const Link: typeof TanstackLink = (props) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  return (
    <TanstackLink
      ref={linkRef}
      {...props}
    />
  );
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
