import { forwardRef } from "react";

type BadgeVariant = "primary" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary:
    "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary-2",
  neutral:
    "bg-surface2 text-muted dark:bg-surface2 dark:text-muted",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "neutral", className = "", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
