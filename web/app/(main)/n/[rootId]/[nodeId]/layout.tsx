import DocumentShell from "@/components/document-shell";
import { GuestNodeGen } from "@/components/guest-node-gen";
import { NewNode } from "@/components/new-node";
import type { ParsedContentNode } from "@/lib/db/types";
import { headers } from "next/headers";
import { SWRConfig } from "swr";

type Params = Promise<{ rootId: string; nodeId: string }>;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { rootId, nodeId } = await params;

  const reqHeaders = await headers();
  const cookie = reqHeaders.get("cookie") || "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/nodes/${rootId}/${nodeId}`,
    { headers: { cookie } },
  );

  if (res.status === 401) {
    return (
      <SWRConfig value={{ fallback: {} }}>
        <DocumentShell>
          <GuestNodeGen>{children}</GuestNodeGen>
        </DocumentShell>
      </SWRConfig>
    );
  }

  if (res.status === 404) {
    return (
      <DocumentShell>
        <NewNode />
      </DocumentShell>
    );
  }

  const data: ParsedContentNode = await res.json();

  return (
    <SWRConfig
      value={{
        fallback: {
          [`/api/nodes/${rootId}/${nodeId}`]: data,
        },
      }}
    >
      <DocumentShell>{children}</DocumentShell>
    </SWRConfig>
  );
}
