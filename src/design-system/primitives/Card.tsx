"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  children: ReactNode;
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      hover = false,
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "relative overflow-hidden",
      "bg-[#202020]",
      "transition-all duration-standard easing-lamborghini"
    );

    const variantStyles = {
      default: "",
      elevated: "hover:shadow-elevation2",
      outlined: "border border-[#202020] hover:border-[#494949]",
    };

    const paddingStyles = {
      none: "",
      sm: "p-[16px]",
      md: "p-[24px]",
      lg: "p-[32px]",
    };

    const hoverStyles = hover
      ? "hover:shadow-gold-glow hover:border-[#FFC000]/30 cursor-pointer"
      : "";

    const Component = asChild ? "div" : "div";

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-[16px]", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  size?: "feature" | "card" | "body";
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, size = "card", ...props }, ref) => {
    const sizeStyles = {
      feature: "text-[clamp(20px,3vw,27px)] uppercase leading-[1.37] tracking-normal",
      card: "text-[clamp(18px,2.5vw,24px)] leading-tight tracking-normal",
      body: "text-[clamp(16px,2vw,18px)] leading-[1.56] tracking-normal",
    };
    return (
      <h3
        ref={ref}
        className={cn("font-ui font-regular text-[#FFFFFF]", sizeStyles[size], className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-[#7D7D7D] font-ui font-regular leading-[1.5]", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-[24px] flex items-center gap-[16px]", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";