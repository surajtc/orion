"use client";

import useSWR from "swr";
import type { ParsedContentNode } from "@/lib/db/types";
import { fetcher } from "@/lib/utils";
import Link from "next/link";
import {
  ClockCounterClockwise,
  ListChecks,
} from "@phosphor-icons/react/dist/ssr";
import { useSession } from "@/app/(auth)/auth-client";

export default function ContentNodeList() {
  const { data: session } = useSession();

  const { data, error, isLoading } = useSWR<{
    nodes: ParsedContentNode[];
  }>(session ? "/api/nodes" : null, fetcher);

  const nodes = data?.nodes ?? [];

  if (isLoading) {
    return <div className="p-4">Loading content nodes...</div>;
  }

  if (error) {
    return <div className="p-4">Error: {error.message}</div>;
  }

  if (nodes.length === 0) {
    return (
      <div className="p-4">
        <p>No content nodes found. Start by creating one!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground py-4">Recently Viewed</p>
        <p className="text-sm text-muted-foreground py-4">{"See all ->"}</p>
      </div>

      <div className="grid gap-4">
        {nodes.map((node) => (
          <Link
            href={`/n/${node.id}${node.metadata.children[0].children ? `/${node.metadata.children[0].children[0].id}` : ""}`}
            key={node.id}
            className="block border p-4 hover:border-primary rounded space-y-2 shadow-sm"
          >
            <h2 className="text-base font-medium tracking-tight">
              {node.title}
            </h2>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <ListChecks />
                <span className="text-sm text-muted-foreground">
                  3/10 Chapters
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <ClockCounterClockwise />
                <span className="text-sm text-muted-foreground">3min ago</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
