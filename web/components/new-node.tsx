"use client";

import type { ParsedContentNode } from "@/lib/db/types";
import { GenerateNode } from "./generate-node";
import { getTitleHierarchy } from "@/lib/content-node-utils";
import { useParams } from "next/navigation";
import { useSmartSWR } from "@/hooks/use-smart-swr";

export function NewNode() {
  const { rootId, nodeId } = useParams<{ rootId: string; nodeId: string }>();
  const { data } = useSmartSWR<ParsedContentNode>(`/api/nodes/${rootId}`);

  const titleHierarchy = data
    ? getTitleHierarchy(data.metadata.children, nodeId)
    : [];

  return data ? (
    <GenerateNode
      rootId={rootId}
      nodeId={nodeId}
      titleArray={[data.title, ...titleHierarchy]}
    />
  ) : null;
}
