import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-muted text-muted-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive",
        outline: "text-foreground border-border",
        // Status variants
        signed:
          "border-transparent bg-chart-2/15 text-chart-2",
        rejected:
          "border-transparent bg-destructive/10 text-destructive",
        created:
          "border-transparent bg-chart-3/15 text-chart-3",
        expired:
          "border-transparent bg-muted text-muted-foreground",
        abandoned:
          "border-transparent bg-muted text-muted-foreground",
        // Environment variants
        live:
          "border-transparent bg-chart-2/15 text-chart-2",
        test:
          "border-transparent bg-chart-3/15 text-chart-3",
        // User status variants
        active:
          "border-transparent bg-chart-2/15 text-chart-2",
        invited:
          "border-transparent bg-primary/10 text-primary",
        disabled:
          "border-transparent bg-muted text-muted-foreground",
        revoked:
          "border-transparent bg-destructive/10 text-destructive",
        // Invoice status variants
        paid:
          "border-transparent bg-chart-2/15 text-chart-2",
        pending:
          "border-transparent bg-chart-3/15 text-chart-3",
        overdue:
          "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
