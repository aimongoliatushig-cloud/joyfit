import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-surface border border-border shadow-card p-6 transition-shadow ${
          hover ? "hover:shadow-card-hover" : ""
        } ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
