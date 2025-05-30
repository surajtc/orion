import { headers } from "next/headers";
import type { ParsedContentNode } from "@/lib/db/types";
import { SWRConfig } from "swr";

import { notFound } from "next/navigation";

type Params = Promise<{ rootId: string }>;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { rootId } = await params;

  const reqHeaders = await headers();
  const cookie = reqHeaders.get("cookie") || "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/nodes/${rootId}`,
    { headers: { cookie } },
  );

  if (res.status === 401) {
    return <SWRConfig value={{ fallback: {} }}>{children}</SWRConfig>;
  }

  if (res.status === 404 || !res.ok) {
    return notFound();
  }

  const data: ParsedContentNode = await res.json();

  return (
    <SWRConfig
      value={{
        fallback: {
          [`/api/nodes/${rootId}`]: data,
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
