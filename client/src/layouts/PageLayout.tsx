import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MAX_WIDTH_CLASS = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

type MaxWidth = keyof typeof MAX_WIDTH_CLASS;

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: MaxWidth;
  withMobileNavPadding?: boolean;
}

export default function PageLayout({
  children,
  className,
  contentClassName,
  maxWidth = "default",
  withMobileNavPadding = true,
}: PageLayoutProps) {
  return (
    <section
      className={cn(
        "col-start-1 col-end-6 row-start-1 row-end-4 min-h-screen bg-background",
        withMobileNavPadding && "pb-20 md:pb-0",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          MAX_WIDTH_CLASS[maxWidth],
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
