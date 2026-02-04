import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-black text-white",
        secondary:
          "border-transparent bg-gray-100 text-black",
        destructive:
          "border-transparent bg-red-100 text-red-700",
        outline: "text-black border-gray-300",
        // Status variants
        signed:
          "border-transparent bg-green-100 text-green-700",
        rejected:
          "border-transparent bg-red-100 text-red-700",
        created:
          "border-transparent bg-amber-100 text-amber-700",
        expired:
          "border-transparent bg-gray-100 text-gray-600",
        abandoned:
          "border-transparent bg-gray-100 text-gray-600",
        // Environment variants
        live:
          "border-transparent bg-green-100 text-green-700",
        test:
          "border-transparent bg-amber-100 text-amber-700",
        // User status variants
        active:
          "border-transparent bg-green-100 text-green-700",
        invited:
          "border-transparent bg-blue-100 text-blue-700",
        disabled:
          "border-transparent bg-gray-100 text-gray-600",
        revoked:
          "border-transparent bg-red-100 text-red-700",
        // Invoice status variants
        paid:
          "border-transparent bg-green-100 text-green-700",
        pending:
          "border-transparent bg-amber-100 text-amber-700",
        overdue:
          "border-transparent bg-red-100 text-red-700",
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
