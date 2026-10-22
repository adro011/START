"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/format";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "cyan" | "gray" | "outline";
  size?: "micro" | "small" | "standard";
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "standard",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center font-ui font-medium",
      "rounded-[2px]",
      "transition-colors duration-fast easing-lamborghini"
    );

    const variantStyles = {
      default: "bg-[var(--color-steel)] text-[#FFFFFF]",
      gold: "bg-[var(--color-gold)] text-[var(--color-black)]",
      cyan: "bg-[#29ABE2] text-[#FFFFFF]",
      gray: "bg-[var(--color-graphite)] text-[var(--color-smoke)]",
      outline: "bg-transparent text-[#FFFFFF] border border-[#FFFFFF]/50",
    };

    const sizeStyles = {
      micro: "px-[8px] py-[2px] text-[clamp(8px,0.6vw,10px)] uppercase leading-[1] tracking-[0.0225em]",
      small: "px-[10px] py-[4px] text-[clamp(10px,0.8vw,12px)] uppercase leading-[1.83] tracking-[0.08em]",
      standard: "px-[12px] py-[6px] text-[clamp(11px,1vw,14px)] uppercase leading-[1.14] tracking-[-0.03em]",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";