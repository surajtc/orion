"use client";

import { useSmartSWR } from "@/hooks/use-smart-swr";
import type { ParsedContentNode } from "@/lib/db/types";
import { useParams } from "next/navigation";

export default function Page() {
  const { rootId } = useParams<{ rootId: string }>();

  const { data: root } = useSmartSWR<ParsedContentNode>(`/api/nodes/${rootId}`);

  return <div>Page:{root?.title}</div>;
}
