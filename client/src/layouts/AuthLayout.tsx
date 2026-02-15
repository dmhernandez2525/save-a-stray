import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  brandPanel: ReactNode;
  className?: string;
  contentClassName?: string;
  panelClassName?: string;
}

export default function AuthLayout({
  children,
  brandPanel,
  className,
  contentClassName,
  panelClassName,
}: AuthLayoutProps) {
  return (
    <section
      className={cn(
        "col-start-1 col-end-6 row-start-1 row-end-4 min-h-screen bg-background",
        "grid grid-cols-1 lg:grid-cols-2",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 xl:px-20",
          contentClassName
        )}
      >
        {children}
      </div>
      <aside className={cn("hidden lg:flex relative overflow-hidden", panelClassName)}>
        {brandPanel}
      </aside>
    </section>
  );
}
