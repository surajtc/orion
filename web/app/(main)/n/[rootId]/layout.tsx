import { headers } from "next/headers";
import type { ParsedContentNode } from "@/lib/db/types";
import Link from "next/link";
import { SWRConfig } from "swr";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RenderLinks } from "@/components/render-links";

type Params = Promise<{ rootId: string }>;

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { rootId } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/nodes/${rootId}`,
    { headers: await headers() },
  );
  const data: ParsedContentNode = await res.json();

  return (
    <SWRConfig
      value={{
        fallback: {
          [`/api/nodes/${rootId}`]: data,
        },
      }}
    >
      <ResizablePanelGroup direction="horizontal" className="border-t">
        <ResizablePanel
          defaultSize={15}
          maxSize={30}
          className="py-4 px-3 flex flex-col justify-between h-full"
        >
          <ScrollArea>
            <h3 className="font-semibold text-lg">{data.title}</h3>
            <RenderLinks
              childrenNodes={data.metadata.children}
              rootId={rootId}
            />
          </ScrollArea>
          <div className="space-y-2">
            <Link
              href="/"
              className={buttonVariants({
                className: "w-full",
                size: "sm",
              })}
            >
              Publish
            </Link>
            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
                className: "w-full",
                size: "sm",
              })}
            >
              New Search
            </Link>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80}>
          <ScrollArea className="h-full">{children}</ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SWRConfig>
  );
}
