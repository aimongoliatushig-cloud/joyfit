import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl bg-surface border border-border px-4 py-2.5 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
