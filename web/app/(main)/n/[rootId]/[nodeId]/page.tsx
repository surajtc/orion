import { Markdown } from "@/components/markdown";
import { NewNode } from "@/components/new-node";
import type { ParsedContentNode } from "@/lib/db/types";
import { headers } from "next/headers";

type PageProps = {
  params: Promise<{ rootId: string; nodeId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { rootId, nodeId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/nodes/${rootId}/${nodeId}`,
    {
      headers: await headers(),
    },
  );

  if (res.status === 404) {
    return <NewNode rootId={rootId} nodeId={nodeId} />;
  }

  const data: ParsedContentNode = await res.json();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Markdown markdown={data.markdown as string} />
    </div>
  );
}
