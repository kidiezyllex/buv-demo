import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { RippleEffect } from "./ripple-effect";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 !margin-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-muted hover:bg-secondary font-semibold",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-primary bg-green-950 text-primary font-semibold hover:bg-green-900 hover:text-primary",
        blue:
          "border border-blue-500 bg-blue-950 text-blue-400 font-semibold hover:bg-blue-500/10",
        red:
          "border border-red-500 bg-red-950 text-red-400 font-semibold hover:bg-red-500/10",
        green:
          "border border-green-500 bg-green-950 text-green-400 font-semibold hover:bg-green-500/10",
        orange:
          "border border-orange-500 bg-orange-950 text-orange-400 font-semibold hover:bg-orange-500/10",
        gray:
          "border border-gray-500 bg-gray-950 text-gray-300 font-semibold hover:bg-gray-500/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-primary bg-gray-100 hover:bg-gray-200 text-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "!h-10 px-3",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-8",
        icon: "!h-10 !w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ripple?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      ripple = false,
      rippleColor,
      rippleDuration,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );

    if (ripple) {
      return (
        <RippleEffect
          rippleColor={rippleColor || "rgba(255, 255, 255, 0.4)"}
          duration={rippleDuration || 500}
          className="inline-flex"
        >
          {buttonElement}
        </RippleEffect>
      );
    }

    return buttonElement;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
