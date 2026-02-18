import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
  bodyClassName?: string;
  contentClassName?: string;
}

export default function DashboardLayout({
  children,
  header,
  sidebar,
  className,
  bodyClassName,
  contentClassName,
}: DashboardLayoutProps) {
  return (
    <section
      className={cn(
        "col-start-1 col-end-6 row-start-1 row-end-4 min-h-screen bg-background",
        className
      )}
    >
      {header}
      <div className={cn("mx-auto flex w-full max-w-[1600px] gap-0", bodyClassName)}>
        {sidebar}
        <main className={cn("flex-1 min-w-0", contentClassName)}>{children}</main>
      </div>
    </section>
  );
}
