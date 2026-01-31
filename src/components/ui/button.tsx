import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'primary', ...props }, ref) => {
    let variantClass = "phantom-button"
    if (variant === 'secondary') variantClass = "phantom-button-secondary"
    if (variant === 'ghost') variantClass = "hover:bg-white/10 text-foreground"
    if (variant === 'outline') variantClass = "border border-border hover:bg-white/5 text-foreground"

    return (
      <button
        className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variantClass} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
