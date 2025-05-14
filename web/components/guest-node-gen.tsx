"use client";

import { useSmartSWR } from "@/hooks/use-smart-swr";
import type { ParsedContentNode } from "@/lib/db/types";
import { useParams } from "next/navigation";
import { NewNode } from "./new-node";

export function GuestNodeGen({ children }: { children: React.ReactNode }) {
  const { rootId, nodeId } = useParams<{ rootId: string; nodeId: string }>();

  const { data: node, isLoading } = useSmartSWR<ParsedContentNode>(
    `/api/nodes/${rootId}/${nodeId}`,
  );

  if (isLoading) return <div>isLoading</div>;

  return node ? <div>{children}</div> : <NewNode />;
}
