"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "mobile" | "tablet" | "desktop" | "desktopL" | "full" | "hero";
  children: ReactNode;
  asChild?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = "desktop",
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      mobile: "max-w-[425px]",
      tablet: "max-w-[768px]",
      desktop: "max-w-[1280px]",
      desktopL: "max-w-[1440px]",
      full: "max-w-full",
      hero: "max-w-full",
    };

    const baseStyles = cn(
      "mx-auto w-full px-[var(--space-8)]",
      "tablet:px-[var(--space-10)] desktop:px-[var(--space-12)]"
    );

    const Component = asChild ? "div" : "div";

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "dark" | "light" | "hero";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      variant = "dark",
      padding = "lg",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "bg-[#000000]",
      dark: "bg-[#000000]",
      light: "bg-[#F8F8F8] text-[#202020]",
      hero: "bg-[#000000] relative overflow-hidden",
    };

    const paddingStyles = {
      none: "",
      sm: "py-[24px]",
      md: "py-[40px]",
      lg: "py-[48px]",
      xl: "py-[56px]",
    };

    return (
      <section
        ref={ref}
        className={cn(variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  children: ReactNode;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 12,
      gap = "md",
      responsive = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const gapStyles = {
      none: "gap-0",
      sm: "gap-[8px]",
      md: "gap-[16px]",
      lg: "gap-[24px]",
      xl: "gap-[32px]",
    };

    const columnStyles = responsive
      ? cn(
          "grid grid-cols-1",
          "mobile:grid-cols-2",
          "tablet:grid-cols-3",
          "desktop:grid-cols-4",
          "desktopL:grid-cols-5"
        )
      : `grid grid-cols-${columns}`;

    return (
      <div
        ref={ref}
        className={cn(columnStyles, gapStyles[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  children: ReactNode;
}

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = "row",
      align = "stretch",
      justify = "start",
      gap = "md",
      wrap = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const directionStyles = {
      row: "flex-row",
      col: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    };

    const alignStyles = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    };

    const justifyStyles = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };

    const gapStyles = {
      none: "gap-0",
      sm: "gap-[8px]",
      md: "gap-[16px]",
      lg: "gap-[24px]",
      xl: "gap-[32px]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionStyles[direction],
          alignStyles[align],
          justifyStyles[justify],
          gapStyles[gap],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";