"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "hero" | "display2" | "display3" | "display4" | "feature" | "card" | "body";
  uppercase?: boolean;
  children: ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level = 1,
      variant = "hero",
      uppercase = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      hero: cn(
        "text-[clamp(54px,12vw,120px)]",
        "leading-[0.92]",
        "tracking-normal",
        "font-ui font-regular"
      ),
      display2: cn(
        "text-[clamp(40px,8vw,80px)]",
        "leading-[1.13]",
        "tracking-normal",
        "font-ui font-regular"
      ),
      display3: cn(
        "text-[clamp(32px,6vw,54px)]",
        "leading-[1.19]",
        "tracking-normal",
        "font-ui font-regular"
      ),
      display4: cn(
        "text-[clamp(28px,5vw,40px)]",
        "leading-[1.15]",
        "tracking-normal",
        "font-ui font-regular"
      ),
      feature: cn(
        "text-[clamp(20px,3vw,27px)]",
        "leading-[1.37]",
        "tracking-normal",
        "font-ui font-regular"
      ),
      card: cn(
        "text-[clamp(18px,2.5vw,24px)]",
        "leading-tight",
        "tracking-normal",
        "font-ui font-regular"
      ),
      body: cn(
        "text-[clamp(16px,2vw,18px)]",
        "leading-[1.56]",
        "tracking-normal",
        "font-ui font-regular"
      ),
    };

    const baseClassName = cn(
      "text-[#FFFFFF]",
      uppercase && "uppercase",
      variantStyles[variant],
      className
    );

    const renderHeading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => (
      <Tag
        ref={ref}
        className={baseClassName}
        {...props}
      >
        {children}
      </Tag>
    );

    switch (level) {
      case 1:
        return renderHeading("h1");
      case 2:
        return renderHeading("h2");
      case 3:
        return renderHeading("h3");
      case 4:
        return renderHeading("h4");
      case 5:
        return renderHeading("h5");
      case 6:
        return renderHeading("h6");
      default:
        return renderHeading("h1");
    }
  }
);

Heading.displayName = "Heading";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: "bodyLarge" | "body" | "bodySmall" | "caption" | "label" | "micro";
  uppercase?: boolean;
  color?: "primary" | "secondary" | "muted" | "inverse" | "accent" | "cyan";
  children: ReactNode;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      variant = "body",
      uppercase = false,
      color = "primary",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      bodyLarge: cn(
        "text-[clamp(16px,2vw,18px)]",
        "leading-[1.56]",
        "tracking-normal"
      ),
      body: cn(
        "text-[clamp(14px,1.5vw,16px)]",
        "leading-[1.5]",
        "tracking-normal"
      ),
      bodySmall: cn(
        "text-[clamp(12px,1vw,14px)]",
        "leading-[1.5]",
        "tracking-normal"
      ),
      caption: cn(
        "text-[clamp(11px,1vw,14px)]",
        "leading-[1.14]",
        "tracking-[-0.03em]",
        "font-ui font-semibold"
      ),
      label: cn(
        "text-[clamp(10px,0.8vw,12px)]",
        "leading-[1.83]",
        "tracking-[0.08em]",
        "font-ui font-medium"
      ),
      micro: cn(
        "text-[clamp(8px,0.6vw,10px)]",
        "leading-[1]",
        "tracking-[0.0225em]",
        "font-ui font-regular"
      ),
    };

    const colorStyles = {
      primary: "text-[#FFFFFF]",
      secondary: "text-[#F5F5F5]",
      muted: "text-[#7D7D7D]",
      inverse: "text-[#202020]",
      accent: "text-[#FFCE3E]",
      cyan: "text-[#29ABE2]",
    };

    return (
      <p
        ref={ref}
        className={cn(
          "font-ui font-regular",
          variantStyles[variant],
          colorStyles[color],
          uppercase && "uppercase",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Text.displayName = "Text";

export interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "underline" | "arrow";
  children: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = "underline",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: cn(
        "text-[#FFFFFF]",
        "hover:text-[#3860BE]",
        "transition-colors duration-fast easing-lamborghini"
      ),
      underline: cn(
        "relative text-[#FFFFFF] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-[#3860BE] after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-standard after:easing-lamborghini hover:after:scale-x-100 hover:after:origin-bottom-left"
      ),
      arrow: cn(
        "inline-flex items-center gap-[8px] text-[#FFFFFF]",
        "hover:text-[#3860BE]",
        "transition-colors duration-fast easing-lamborghini"
      ),
    };

    return (
      <a
        ref={ref}
        className={cn(variantStyles[variant], className)}
        {...props}
      >
        {children}
        {variant === "arrow" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = "Link";