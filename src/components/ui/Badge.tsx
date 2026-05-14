import * as React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "destructive" }>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 text-slate-900",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      destructive: "bg-red-100 text-red-800",
    }
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
