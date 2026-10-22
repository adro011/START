"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/format";

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "3:2" | "1:1" | "21:9";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export const ResponsiveImage = forwardRef<HTMLDivElement, ResponsiveImageProps>(
  (
    {
      src,
      alt,
      fill = false,
      priority = false,
      sizes,
      className,
      aspectRatio = "16:9",
      objectFit = "cover",
      placeholder = "empty",
      blurDataURL,
      ...props
    },
    ref
  ) => {
    const aspectStyles = {
      "16:9": "aspect-video",
      "4:3": "aspect-[4/3]",
      "3:2": "aspect-[3/2]",
      "1:1": "aspect-square",
      "21:9": "aspect-[21/9]",
    };

    const objectFitStyles = {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      "scale-down": "object-scale-down",
    };

    if (fill) {
      return (
        <div
          ref={ref}
          className={cn("relative w-full", aspectStyles[aspectRatio], className)}
          {...props}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes || "100vw"}
            className={cn("w-full h-full", objectFitStyles[objectFit])}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("relative", aspectStyles[aspectRatio], className)}
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          priority={priority}
          sizes={sizes}
          className={cn("w-full h-full", objectFitStyles[objectFit])}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }
);

ResponsiveImage.displayName = "ResponsiveImage";

export interface HeroVideoProps {
  src: string;
  poster?: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
}

export const HeroVideo = ({
  src,
  poster,
  className,
  muted = true,
  loop = true,
  autoPlay = true,
  playsInline = true,
  ...props
}: HeroVideoProps) => {
  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)} {...props}>
      <video
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        playsInline={playsInline}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-black)]/60 via-transparent to-transparent" />
    </div>
  );
};

export interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; position?: number }>;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "3:2" | "1:1";
}

export const ImageGallery = ({
  images,
  className,
  aspectRatio = "16:9",
}: ImageGalleryProps) => {
  const aspectStyles = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "3:2": "aspect-[3/2]",
    "1:1": "aspect-square",
  };

  return (
    <div className={cn("relative", aspectStyles[aspectRatio], className)}>
      {images.map((image, index) => (
        <Image
          key={image.position ?? index}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 easing-lamborghini"
        />
      ))}
    </div>
  );
};