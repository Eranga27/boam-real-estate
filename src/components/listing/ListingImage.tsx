'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { optimizedImage, optimizedSrcSet, type ImageWidth } from '@/lib/listingImages';

interface ListingImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'onError'> {
  src: string;
  /** Widths offered to the browser; it picks one using `sizes` */
  widths: ImageWidth[];
  sizes: string;
  eager?: boolean;
  /** Called when neither the optimized nor the original photo loads */
  onFail?: () => void;
}

/**
 * Listing photo served resized and re-encoded (AVIF/WebP) by the image optimizer, falling
 * back to the original file if optimization fails. Marks itself `data-loaded` once decoded
 * so CSS can fade it in rather than letting it paint in strips.
 */
export const ListingImage = forwardRef<HTMLImageElement, ListingImageProps>(function ListingImage(
  { src, widths, sizes, eager = false, onFail, alt = '', onLoad, ...rest },
  ref
) {
  const imgRef = useRef<HTMLImageElement>(null);
  useImperativeHandle(ref, () => imgRef.current as HTMLImageElement);
  const [original, setOriginal] = useState(false);

  useEffect(() => setOriginal(false), [src]);

  // Photos that finished loading before hydration never fire React's onLoad
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) img.dataset.loaded = 'true';
  }, [src, original]);

  const largest = widths[widths.length - 1];
  const optimizedSrc = original ? src : optimizedImage(src, largest);
  const srcSet = original ? undefined : optimizedSrcSet(src, widths);

  return (
    <img
      ref={imgRef}
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      onLoad={(e) => {
        e.currentTarget.dataset.loaded = 'true';
        onLoad?.(e);
      }}
      onError={() => {
        if (!original && optimizedSrc !== src) setOriginal(true);
        else onFail?.();
      }}
      {...rest}
    />
  );
});
