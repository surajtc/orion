"use client";

import type { ContentChild, ParsedContentNode } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { getCurrentNode, getPrevNextNodes } from "@/lib/content-node-utils";
import { Fragment, useMemo } from "react";
import { useSmartSWR } from "@/hooks/use-smart-swr";

function RenderNodeLinks({ nodes }: { nodes: ContentChild[] }) {
  const { rootId, nodeId } = useParams<{ rootId: string; nodeId: string }>();

  return (
    <>
      {nodes.map((node) => {
        const href = `/n/${rootId}/${node.id}`;
        const isActive = node.id === nodeId;

        return (
          <div key={node.id}>
            {node.type === "node" ? (
              <Link
                href={href}
                className={cn(
                  "block text-sm pl-2.5 py-1 border-l text-muted-foreground/80 hover:border-primary hover:text-primary",
                  isActive && "text-foreground border-foreground",
                )}
              >
                {node.title}
              </Link>
            ) : (
              <h3 className="text-xs tracking-wide text-border pt-4 pb-1">
                {node.title}
              </h3>
            )}
            {node.children && <RenderNodeLinks nodes={node.children} />}
          </div>
        );
      })}
    </>
  );
}

export default function DocumentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { rootId, nodeId } = useParams<{ rootId: string; nodeId: string }>();
  const { data: root } = useSmartSWR<ParsedContentNode>(`/api/nodes/${rootId}`);

  const currentNode = useMemo(() => {
    return root ? getCurrentNode(root.metadata.children, nodeId) : null;
  }, [root, nodeId]);

  const { prev, next } = useMemo(() => {
    if (!root) return {};
    const map = getPrevNextNodes(root.metadata.children);
    return map[nodeId] || {};
  }, [root, nodeId]);

  return (
    <ResizablePanelGroup direction="horizontal" className="border-t">
      <ResizablePanel
        defaultSize={18}
        maxSize={30}
        className="py-4 px-3 flex flex-col justify-between h-full"
      >
        <ScrollArea>
          {root && (
            <Fragment>
              <h3 className="font-semibold text-lg">{root.title}</h3>
              <RenderNodeLinks nodes={root.metadata.children} />
            </Fragment>
          )}
        </ScrollArea>
        <div className="space-y-2">
          <Link
            href="/"
            className={buttonVariants({ className: "w-full", size: "sm" })}
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
      <ResizablePanel defaultSize={82}>
        {!currentNode ? (
          <div>Not found</div>
        ) : (
          <ScrollArea className="flex flex-col h-full">
            {root && (
              <div className="flex items-center gap-2 p-4 text-sm">
                <Link
                  href={`/n/${root.id}`}
                  className="text-muted-foreground max-w-[30ch] truncate"
                >
                  {root.title}
                </Link>
                <span className="text-muted-foreground">{">"}</span>
                <span>{currentNode.title}</span>
              </div>
            )}

            <div className="flex-1 max-w-3xl mx-auto p-4 flex flex-col gap-4">
              <div className="flex-1">{children}</div>

              {(prev || next) && (
                <div className="flex justify-between mt-4 text-sm text-muted-foreground border-t py-4">
                  {prev && (
                    <div className="flex-1">
                      <p className="text-xs">Previous</p>
                      <Link
                        href={`/n/${rootId}/${prev.id}`}
                        className="text-foreground font-medium"
                      >
                        {prev.title}
                      </Link>
                    </div>
                  )}
                  {next && (
                    <div className="flex-1 text-right">
                      <p className="text-xs">Next</p>
                      <Link
                        href={`/n/${rootId}/${next.id}`}
                        className="text-foreground font-medium"
                      >
                        {next.title}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
