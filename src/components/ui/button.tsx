import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'primary', size = 'default', ...props }, ref) => {
    let variantClass = "phantom-button"
    if (variant === 'secondary') variantClass = "phantom-button-secondary"
    if (variant === 'ghost') variantClass = "hover:bg-white/10 text-foreground"
    if (variant === 'outline') variantClass = "border border-border hover:bg-white/5 text-foreground"

    let sizeClass = "h-10 px-4 py-2"
    if (size === 'sm') sizeClass = "h-9 rounded-md px-3"
    if (size === 'lg') sizeClass = "h-11 rounded-md px-8"
    if (size === 'icon') sizeClass = "h-10 w-10"

    return (
      <button
        className={`inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variantClass} ${sizeClass} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
