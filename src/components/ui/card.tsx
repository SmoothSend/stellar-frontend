import * as React from "react"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`phantom-card rounded-3xl ${className}`}
      {...props}
    />
  )
)
Card.displayName = "Card"
