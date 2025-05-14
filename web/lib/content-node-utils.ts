import type { ContentChild } from "@/lib/db/types";

export function getTitleHierarchy(
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

type NodeInfo = { id: string; title: string };

type PrevNextMap = {
  [nodeId: string]: {
    prev?: NodeInfo;
    next?: NodeInfo;
  };
};

export function getPrevNextNodes(nodes: ContentChild[]): PrevNextMap {
  const flatNodes: NodeInfo[] = [];

  function flatten(nodeList: ContentChild[]) {
    for (const node of nodeList) {
      if (node.type === "node") {
        flatNodes.push({ id: node.id, title: node.title });
      }

      if (node.children && Array.isArray(node.children)) {
        flatten(node.children);
      }
    }
  }

  flatten(nodes);

  const map: PrevNextMap = {};

  flatNodes.forEach((node, index) => {
    const prev = index > 0 ? flatNodes[index - 1] : undefined;
    const next =
      index < flatNodes.length - 1 ? flatNodes[index + 1] : undefined;
    map[node.id] = { prev, next };
  });

  return map;
}

export function getCurrentNode(
  nodes: ContentChild[],
  targetNodeId: string,
): ContentChild | null {
  for (const node of nodes) {
    if (node.id === targetNodeId) {
      return node;
    }

    if (node.children && Array.isArray(node.children)) {
      const found = getCurrentNode(node.children, targetNodeId);
      if (found) return found;
    }
  }

  return null;
}
