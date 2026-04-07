import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_32px_rgba(0,82,255,0.24)]",
        destructive:
          "bg-destructive text-white shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-lg",
        outline:
          "border border-border bg-white/80 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/5",
        secondary:
          "bg-muted text-foreground shadow-sm hover:-translate-y-0.5 hover:bg-muted/80",
        ghost:
          "text-muted-foreground hover:-translate-y-0.5 hover:bg-accent/5 hover:text-foreground",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5 has-[>svg]:px-4",
        sm: "h-10 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-14 rounded-xl px-7 has-[>svg]:px-5",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
