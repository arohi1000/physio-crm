"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavSection } from "@/app/(app)/navigation";

function isCurrentPath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * A scrolling strip on a phone so the page content stays above the fold, and a
 * grouped column with section headings once there is room for one.
 */
export function AppSidebar({ sections }: { sections: readonly NavSection[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:gap-6 lg:overflow-x-visible lg:p-4"
    >
      {sections.map((section) => (
        <div key={section.heading} className="flex gap-1 lg:flex-col">
          <h2 className="text-ink-soft hidden px-3 pb-1 text-xs font-semibold tracking-widest uppercase lg:block">
            {section.heading}
          </h2>
          {section.items.map((item) => {
            const isCurrent = isCurrentPath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`hover:bg-paper flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm whitespace-nowrap ${
                  isCurrent ? "bg-paper text-sage-deep font-semibold" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
