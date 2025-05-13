"use client";

import Link from "next/link";
import type { ContentChild, ParsedContentNode } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function RenderLinks({
  childrenNodes,
  rootId,
}: {
  childrenNodes: ContentChild[];
  rootId: string;
}) {
  const pathname = usePathname();

  return (
    <div>
      {childrenNodes.map((child) => {
        const linkHref = `/n/${rootId}/${child.id}`;
        const isActive = pathname === linkHref;

        return (
          <div key={child.id}>
            {child.type === "node" ? (
              <Link
                href={linkHref}
                className={cn(
                  "block text-sm pl-2.5 py-1 border-l text-muted-foreground/80 hover:border-primary hover:text-primary",
                  isActive ? "text-foreground border-foreground" : "",
                )}
              >
                {child.title}
              </Link>
            ) : (
              <h3 className="text-xs tracking-wide text-border pt-4 pb-1">
                {child.title}
              </h3>
            )}
            {child.children && (
              <RenderLinks
                key={child.id}
                childrenNodes={child.children}
                rootId={rootId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
