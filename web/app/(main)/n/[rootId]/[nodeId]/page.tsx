"use client";

import { Markdown } from "@/components/markdown";
import { useSmartSWR } from "@/hooks/use-smart-swr";
import type { ParsedContentNode } from "@/lib/db/types";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Page() {
  const { rootId, nodeId } = useParams<{ rootId: string; nodeId: string }>();

  const { data: node } = useSmartSWR<ParsedContentNode>(
    `/api/nodes/${rootId}/${nodeId}`,
  );

  // if (!node) throw new Error("Root node data must be preloaded.");

  return (
    <div className="space-y-6">
      {node && <Markdown markdown={node.markdown as string} />}
      {node && (
        <div>
          <p className="text-lg font-medium pb-3">Sources</p>
          <div className="space-y-3">
            {node.sources.map((r) => (
              <Link
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-muted-foreground rounded"
              >
                <div className="flex items-center gap-2 text-xs">
                  <img
                    src={r.favicon}
                    alt={r.hostname}
                    className="size-6 p-1 bg-muted/50 rounded"
                  />
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{r.title}</p>
                    <p className="text-border">{r.hostname}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
