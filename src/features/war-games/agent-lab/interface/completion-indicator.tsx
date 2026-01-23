"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const completionVariants = cva(
  "mb-2 flex h-7 w-fit items-center gap-2 rounded-full border border-stone-900/80 bg-black/50 p-3 px-2.5 text-xs font-medium text-stone-200 transition-all duration-200",
  {
    variants: {
      variant: {
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
        error: "border-red-500/30 bg-red-500/10 text-red-200",
        warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
        pending: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
      },
      size: {
        sm: "p-2 text-xs",
        default: "p-3 text-sm",
        lg: "p-4 text-base",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "[&>svg]:animate-spin",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "default",
      animation: "none",
    },
  }
);

export interface CompletionIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof completionVariants> {
  status?: "success" | "error" | "warning" | "pending";
  message?: string;
  showIcon?: boolean;
  progress?: number;
  children?: React.ReactNode;
}

export function CompletionIndicator({
  className,
  variant,
  size,
  animation,
  status = "success",
  message,
  showIcon = true,
  progress,
  children,
  ...props
}: CompletionIndicatorProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />,
    error: <XCircle className="h-4 w-4 shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 shrink-0" />,
    pending: <Clock className="h-4 w-4 shrink-0" />,
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        completionVariants({
          variant: variant || status,
          size,
          animation: status === "pending" ? "spin" : animation,
        }),
        className
      )}
      {...props}
    >
      {showIcon && icons[status]}
      <div className="flex-1 truncate">
        {message || (
          <>
            {status === "success" && "Completed successfully"}
            {status === "error" && "Failed to complete"}
            {status === "warning" && "Completed with warnings"}
            {status === "pending" && "Processing..."}
          </>
        )}
      </div>
      {typeof progress === "number" && (
        <div className="ml-2 font-medium text-xs">{progress}%</div>
      )}
      {status === "pending" && typeof progress === "number" && (
        <div className="relative h-1 w-20 overflow-hidden rounded-full bg-stone-900">
          <div
            className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children && <Separator className="h-full" orientation="vertical" />}

      {children}
    </div>
  );
}

// Example usage:
// <CompletionIndicator status="success" message="Task completed!" />
// <CompletionIndicator status="pending" progress={75} />
// <CompletionIndicator status="error" message="Failed to process" size="lg" />
// <CompletionIndicator status="warning" animation="pulse" />
