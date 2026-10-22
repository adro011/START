"use client";

import { forwardRef, type ReactNode, type AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/format";

export interface ButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled"> {
  variant?: "accent" | "ghost" | "white" | "black" | "gray";
  size?: "large" | "standard" | "small";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "accent",
      size = "standard",
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "relative inline-flex items-center justify-center font-ui font-regular",
      "transition-colors duration-standard easing-lamborghini",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "select-none",
      fullWidth && "w-full"
    );

    const variantStyles = {
      accent: cn(
        "bg-[var(--color-gold)] text-[var(--color-black)]",
        "hover:bg-[#917300]",
        "focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-[var(--color-black)]"
      ),
      ghost: cn(
        "bg-transparent text-[#FFFFFF] border border-[#FFFFFF]/50",
        "hover:bg-[#1EAEDB]/70 hover:border-transparent",
        "focus-visible:ring-[#1EAEDB] focus-visible:ring-offset-[var(--color-black)]"
      ),
      white: cn(
        "bg-[#FFFFFF] text-[var(--color-charcoal)]",
        "hover:bg-[var(--color-smoke)]",
        "focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[var(--color-charcoal)]"
      ),
      black: cn(
        "bg-[var(--color-black)] text-[#FFFFFF]",
        "hover:bg-[var(--color-dark-iron)]",
        "focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[var(--color-black)]"
      ),
      gray: cn(
        "bg-[var(--color-steel)] text-[var(--color-charcoal)]",
        "hover:bg-[var(--color-ash)]",
        "focus-visible:ring-[var(--color-steel)] focus-visible:ring-offset-[var(--color-charcoal)]"
      ),
    };

    const sizeStyles = {
      large: cn(
        "px-[24px] py-[24px]",
        "text-[clamp(14px,1.5vw,16px)]",
        "leading-[1.5]",
        "tracking-normal"
      ),
      standard: cn(
        "px-[16px] py-[16px]",
        "text-[clamp(12px,1.2vw,14.4px)] uppercase",
        "leading-[1]",
        "tracking-[0.014em]"
      ),
      small: cn(
        "px-[12px] py-[10px]",
        "text-[clamp(11px,1vw,13px)] uppercase",
        "leading-[1.2]",
        "tracking-[0.02em]"
      ),
    };

    const isDisabled = disabled || loading;

    return (
      <a
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className, isDisabled && "pointer-events-none")}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="absolute left-[24px] h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span className={cn("relative", loading && "opacity-0")}>
          {children}
        </span>
      </a>
    );
  }
);

Button.displayName = "Button";