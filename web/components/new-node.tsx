"use client";
import useSWR from "swr";
import type { ContentChild, ParsedContentNode } from "@/lib/db/types";
import { fetcher } from "@/lib/utils";
import { GenerateNode } from "./generate-node";

function getTitleHierarchy(
  nodes: ContentChild[],
  targetNodeId: string,
  path: string[] = [],
): string[] {
  for (const node of nodes) {
    path.push(node.title);

    if (node.id === targetNodeId) {
      return [...path];
    }

    if (node.children && Array.isArray(node.children)) {
      const result = getTitleHierarchy(node.children, targetNodeId, path);
      if (result.length > 0) {
        return result;
      }
    }
    path.pop();
  }

  return [];
}

export function NewNode({
  rootId,
  nodeId,
}: {
  rootId: string;
  nodeId: string;
}) {
  const { data } = useSWR<ParsedContentNode>(`/api/nodes/${rootId}`, fetcher);

  if (!data) {
    throw new Error("Data should be preloaded and must exist.");
  }

  const titleHierarchy = getTitleHierarchy(data.metadata.children, nodeId);

  return titleHierarchy.length > 0 ? (
    <GenerateNode
      rootId={rootId}
      nodeId={nodeId}
      titleArray={[data.title, ...titleHierarchy]}
    />
  ) : (
    <div>Not Found</div>
  );
}
