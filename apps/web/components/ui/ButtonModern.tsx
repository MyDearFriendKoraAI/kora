import * as React from "react";
import { cn } from "@kora/shared/utils";
import { Loader2 } from "lucide-react";

export interface ButtonModernProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "destructive" | "outline" | "ghost" | "link" | "sport";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  gradient?: boolean;
}

const variants = {
  primary: cn(
    "bg-primary-500 text-white",
    "hover:bg-primary-600 active:bg-primary-700",
    "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
    "border-2 border-transparent"
  ),
  secondary: cn(
    "bg-secondary-500 text-white",
    "hover:bg-secondary-600 active:bg-secondary-700",
    "shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30",
    "border-2 border-transparent"
  ),
  accent: cn(
    "bg-accent-500 text-white",
    "hover:bg-accent-600 active:bg-accent-700",
    "shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30",
    "border-2 border-transparent"
  ),
  destructive: cn(
    "bg-error text-white",
    "hover:bg-error-dark active:bg-error-dark",
    "shadow-lg shadow-error/25 hover:shadow-xl hover:shadow-error/30",
    "border-2 border-transparent"
  ),
  outline: cn(
    "bg-transparent",
    "border-2 border-neutral-300 dark:border-neutral-600",
    "text-neutral-700 dark:text-neutral-300",
    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
    "hover:border-neutral-400 dark:hover:border-neutral-500"
  ),
  ghost: cn(
    "bg-transparent",
    "text-neutral-700 dark:text-neutral-300",
    "hover:bg-neutral-100 dark:hover:bg-neutral-800",
    "border-2 border-transparent"
  ),
  link: cn(
    "bg-transparent text-primary-500",
    "underline-offset-4 hover:underline",
    "border-2 border-transparent",
    "shadow-none"
  ),
  sport: cn(
    "bg-gradient-to-r from-primary-500 to-accent-500",
    "text-white font-bold",
    "shadow-lg hover:shadow-2xl",
    "border-2 border-transparent",
    "hover:from-primary-600 hover:to-accent-600"
  )
};

const gradientVariants = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",
  secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700",
  accent: "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700",
  destructive: "bg-gradient-to-r from-error to-error-dark hover:from-error-dark hover:to-error-dark",
  outline: "",
  ghost: "",
  link: "",
  sport: "bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500 hover:from-primary-600 hover:via-accent-600 hover:to-secondary-600"
};

const sizes = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl"
};

const roundedSizes = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full"
};

const ButtonModern = React.forwardRef<HTMLButtonElement, ButtonModernProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    rounded = "xl",
    gradient = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    
    const baseStyles = cn(
      "relative inline-flex items-center justify-center",
      "font-semibold tracking-wide",
      "transition-all duration-300 ease-out",
      "transform-gpu",
      "hover:scale-105 active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
      "touch-target"
    );

    const variantStyles = gradient && gradientVariants[variant] 
      ? gradientVariants[variant] 
      : variants[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variantStyles,
          sizes[size],
          roundedSizes[rounded],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 animate-spin" />
        )}
        
        {/* Button Content */}
        <span className={cn(
          "inline-flex items-center gap-2",
          isLoading && "opacity-0"
        )}>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </span>

        {/* Ripple Effect Container */}
        <span className="absolute inset-0 overflow-hidden rounded-inherit">
          <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
        </span>
      </button>
    );
  }
);

ButtonModern.displayName = "ButtonModern";

export { ButtonModern };