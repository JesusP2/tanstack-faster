/**
 * Image Component - Next.js-style image optimization component
 *
 * This component provides automatic image optimization using your sharp server.
 * Set VITE_SHARP_SERVER_URL in your environment variables to enable optimization.
 *
 * @example
 * // Basic usage
 * <Image
 *   src="path/to/image.jpg"
 *   alt="Description"
 *   width={500}
 *   height={500}
 * />
 *
 * @example
 * // Responsive image with sizes
 * <Image
 *   src="path/to/image.jpg"
 *   alt="Description"
 *   width={1920}
 *   height={1080}
 *   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 * />
 *
 * @example
 * // Fill mode (requires parent with position: relative)
 * <div style={{ position: 'relative', width: '100%', height: '400px' }}>
 *   <Image
 *     src="path/to/image.jpg"
 *     alt="Description"
 *     fill
 *     objectFit="cover"
 *   />
 * </div>
 *
 * @example
 * // With format and quality
 * <Image
 *   src="path/to/image.jpg"
 *   alt="Description"
 *   width={500}
 *   height={500}
 *   format="webp"
 *   quality={90}
 * />
 */

import * as React from "react";

// Default device sizes for srcset generation (similar to Next.js)
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 384];

type ImageFormat = "webp" | "avif" | "jpeg" | "png" | "jpg";
type ImageFit = "cover" | "contain" | "fill" | "inside" | "outside";
type ImageLoading = "lazy" | "eager";
type ImagePlaceholder = "empty" | "blur" | `data:image/${string}`;

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
  format?: ImageFormat;
  fit?: ImageFit;
}

type ImageLoader = (props: ImageLoaderProps) => string;

interface ImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "width" | "height" | "loading"
  > {
  ref?: React.Ref<HTMLImageElement>;
  /**
   * The source of the image. Can be:
   * - An internal path string (R2 key)
   * - An absolute external URL
   * - A static import
   */
  src: string | { src: string; width?: number; height?: number };

  /**
   * The alt property is required for accessibility.
   */
  alt: string;

  /**
   * The width of the image in pixels.
   * Required unless using `fill` prop.
   */
  width?: number;

  /**
   * The height of the image in pixels.
   * Required unless using `fill` prop.
   */
  height?: number;

  /**
   * A boolean that causes the image to expand to the size of the parent element.
   * The parent element must assign `position: relative`, `fixed`, or `absolute`.
   */
  fill?: boolean;

  /**
   * Define the sizes of the image at different breakpoints.
   * Used by the browser to choose the most appropriate size from the generated `srcset`.
   */
  sizes?: string;

  /**
   * An integer between 1 and 100 that sets the quality of the optimized image.
   * Default: 75
   */
  quality?: number;

  /**
   * The format to convert the image to.
   * Options: webp, avif, jpeg, png, jpg
   */
  format?: ImageFormat;

  /**
   * Controls how the image is resized to fit its container.
   * Options: cover, contain, fill, inside, outside
   */
  fit?: ImageFit;

  /**
   * Controls when the image should start loading.
   * Default: lazy
   */
  loading?: ImageLoading;

  /**
   * Specifies a placeholder to use while the image is loading.
   * Options: empty, blur, or a data URL
   */
  placeholder?: ImagePlaceholder;

  /**
   * A Data URL to be used as a placeholder image before the image successfully loads.
   * Must be used with `placeholder="blur"`.
   */
  blurDataURL?: string;

  /**
   * A callback function that is invoked once the image is completely loaded.
   */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * A callback function that is invoked if the image fails to load.
   */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * A custom function used to generate the image URL.
   */
  loader?: ImageLoader;

  /**
   * A boolean that indicates if the image should be optimized.
   * If true, the source image will be served as-is.
   */
  unoptimized?: boolean;

  /**
   * CSS object-fit property (used with fill mode).
   */
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";

  /**
   * CSS object-position property (used with fill mode).
   */
  objectPosition?: string;

  /**
   * A boolean that indicates if the image should be preloaded.
   */
  preload?: boolean;

  /**
   * CSS fetchpriority hint.
   */
  fetchPriority?: "auto" | "high" | "low";
}

// Default loader function that generates URLs for the sharp server
const defaultLoader: ImageLoader = ({
  src,
  width,
  quality = 75,
  format,
  fit,
}) => {
  const sharpServerUrl = import.meta.env.VITE_SHARP_SERVER_URL;

  if (!sharpServerUrl) {
    // If no sharp server URL is configured, return the src as-is
    console.warn(
      "VITE_SHARP_SERVER_URL is not configured. Images will not be optimized.",
    );
    return src;
  }

  const url = new URL("/optimize", sharpServerUrl);
  url.searchParams.set("src", src);
  if (width) {
    url.searchParams.set("w", width.toString());
  }
  if (quality) {
    url.searchParams.set("q", quality.toString());
  }
  if (format) {
    url.searchParams.set("format", format);
  }
  if (fit) {
    url.searchParams.set("fit", fit);
  }

  return url.toString();
};

// Generate srcset for responsive images
function generateSrcSet(
  src: string,
  width: number,
  sizes: number[],
  loader: ImageLoader,
  quality?: number,
  format?: ImageFormat,
  fit?: ImageFit,
): string {
  return sizes
    .filter((size) => size <= width)
    .map((size) => {
      const url = loader({ src, width: size, quality, format, fit });
      return `${url} ${size}w`;
    })
    .join(", ");
}

// Get the appropriate sizes array based on whether sizes prop is provided
function getSizesArray(width: number, sizes?: string): number[] {
  if (sizes) {
    // When sizes is provided, use device sizes
    return DEVICE_SIZES.filter((size) => size <= width);
  }
  // Otherwise, use image sizes (1x, 2x)
  return IMAGE_SIZES.filter((size) => size <= width);
}

export const Image = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  quality = 75,
  format,
  fit,
  loading = "lazy",
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  loader = defaultLoader,
  unoptimized = false,
  objectFit,
  objectPosition,
  preload = false,
  fetchPriority,
  style,
  className,
  ref,
  ...rest
}: ImageProps) => {
  // Validate required props
  if (!fill && (!width || !height)) {
    throw new Error(
      "Image component requires both `width` and `height` props unless using `fill` prop.",
    );
  }

  // Handle static imports (objects with src property)
  const imageSrc = typeof src === "object" ? src.src : src;
  const imageWidth = width || (typeof src === "object" ? src.width : undefined);
  const imageHeight =
    height || (typeof src === "object" ? src.height : undefined);

  // Generate image URL
  let imageUrl: string;
  let srcSet: string | undefined;
  let imageStyle: React.CSSProperties = { ...style };

  if (unoptimized) {
    // Serve image as-is without optimization
    imageUrl = imageSrc;
  } else {
    // Use loader to generate optimized URL
    if (fill) {
      // For fill mode, we still need a width for the loader
      // Use a reasonable default or the parent container width
      const defaultWidth = imageWidth || 1920;
      imageUrl = loader({
        src: imageSrc,
        width: defaultWidth,
        quality,
        format,
        fit,
      });

      // Generate srcset if sizes is provided
      if (sizes) {
        const sizesArray = getSizesArray(defaultWidth, sizes);
        srcSet = generateSrcSet(
          imageSrc,
          defaultWidth,
          sizesArray,
          loader,
          quality,
          format,
          fit,
        );
      }
    } else {
      // For fixed size images
      imageUrl = loader({
        src: imageSrc,
        width: imageWidth!,
        quality,
        format,
        fit,
      });

      // Generate srcset for responsive images
      if (sizes) {
        const sizesArray = getSizesArray(imageWidth!, sizes);
        srcSet = generateSrcSet(
          imageSrc,
          imageWidth!,
          sizesArray,
          loader,
          quality,
          format,
          fit,
        );
      } else {
        // Generate 1x and 2x srcset
        const sizesArray = [imageWidth!, imageWidth! * 2].filter(
          (w) => w <= 3840,
        );
        srcSet = generateSrcSet(
          imageSrc,
          imageWidth!,
          sizesArray,
          loader,
          quality,
          format,
          fit,
        );
      }
    }
  }

  // Format and fit are already handled by the loader, so no need to add them again

  // Handle fill mode styles
  if (fill) {
    imageStyle = {
      ...imageStyle,
      position: "absolute",
      height: "100%",
      width: "100%",
      inset: 0,
      objectFit: objectFit || "cover",
      objectPosition: objectPosition || "center",
    };
  }

  // Handle placeholder
  let placeholderStyle: React.CSSProperties | undefined;
  if (placeholder === "blur" && blurDataURL) {
    placeholderStyle = {
      backgroundImage: `url(${blurDataURL})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else if (placeholder?.startsWith("data:image/")) {
    placeholderStyle = {
      backgroundImage: `url(${placeholder})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  // Handle preload
  React.useEffect(() => {
    if (preload && imageUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageUrl;
      if (srcSet) {
        link.setAttribute("imagesrcset", srcSet);
      }
      if (sizes) {
        link.setAttribute("imagesizes", sizes);
      }
      if (fetchPriority === "high") {
        link.fetchPriority = "high";
      }
      document.head.appendChild(link);
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [preload, imageUrl, srcSet, sizes, fetchPriority]);

  // Build props for img element
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & {
    ref?: React.Ref<HTMLImageElement>;
  } = {
    ...rest,
    alt,
    loading,
    fetchPriority,
    src: imageUrl,
    srcSet,
    sizes,
    width: fill ? undefined : imageWidth,
    height: fill ? undefined : imageHeight,
    style: placeholderStyle
      ? { ...imageStyle, ...placeholderStyle }
      : imageStyle,
    className,
    onLoad,
    onError,
    ref,
  };

  // Wrap in container if fill mode
  if (fill) {
    return (
      <span
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        className={className}
      >
        <img {...imgProps} className={undefined} />
      </span>
    );
  }

  return <img {...imgProps} />;
};

Image.displayName = "Image";
