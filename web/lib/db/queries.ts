import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { contentNode } from "./schema";
import type { ContentNode } from "./types";

export async function getRootContentNodesByUserId(
  userId: string,
  count = 5,
  offset = 0,
): Promise<ContentNode[]> {
  return await db
    .select()
    .from(contentNode)
    .where(and(eq(contentNode.userId, userId), eq(contentNode.type, "root")))
    .orderBy(desc(contentNode.updatedAt))
    .limit(count)
    .offset(offset);
}

export async function getContentNodeById(
  id: string,
): Promise<ContentNode | undefined> {
  const result = await db
    .select()
    .from(contentNode)
    .where(eq(contentNode.id, id))
    .limit(1);
  return result[0];
}

export async function getContentNodeByPath(
  userId: string,
  path: string,
): Promise<ContentNode | undefined> {
  const result = await db
    .select()
    .from(contentNode)
    .where(and(eq(contentNode.userId, userId), eq(contentNode.path, path)))
    .limit(1);
  return result[0];
}

export async function createContentNode(params: {
  id: string;
  userId: string;
  title: string;
  parentPath?: string;
  markdown?: string;
  sources?: string;
  type?: "group" | "node" | "root";
  metadata?: string;
}): Promise<void> {
  const now = new Date();
  const path = params.parentPath
    ? `${params.parentPath}/${params.id}`
    : params.id;

  await db.insert(contentNode).values({
    id: params.id,
    userId: params.userId,
    title: params.title,
    path,
    markdown: params.markdown ?? null,
    metadata: params.metadata ?? "{}",
    sources: params.sources ?? "[]",
    type: params.type ?? "node",
    createdAt: now,
    updatedAt: now,
  });
}

export async function createOrUpdateContentNode(params: {
  id: string;
  userId: string;
  title: string;
  parentPath?: string;
  markdown?: string;
  sources?: string;
  type?: "group" | "node" | "root";
  metadata?: string;
}): Promise<void> {
  const now = new Date();
  const path = params.parentPath
    ? `${params.parentPath}/${params.id}`
    : params.id;

  await db
    .insert(contentNode)
    .values({
      id: params.id,
      userId: params.userId,
      title: params.title,
      path,
      markdown: params.markdown ?? null,
      metadata: params.metadata ?? "{}",
      sources: params.sources ?? "[]",
      type: params.type ?? "node",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: contentNode.id,
      set: {
        userId: params.userId,
        title: params.title,
        path,
        markdown: params.markdown ?? null,
        metadata: params.metadata ?? "{}",
        sources: params.sources ?? "[]",
        type: params.type ?? "node",
        updatedAt: now,
      },
    });
}

export async function updateContentNodeMetadata(
  id: string,
  metadata: string,
): Promise<void> {
  const now = new Date();
  await db
    .update(contentNode)
    .set({ metadata, updatedAt: now })
    .where(eq(contentNode.id, id));
}

export async function updateContentNodeById(
  id: string,
  params: {
    markdown?: string;
    metadata?: string;
    sources?: string;
  },
): Promise<void> {
  const now = new Date();
  await db
    .update(contentNode)
    .set({
      markdown: params.markdown,
      metadata: params.metadata,
      sources: params.sources,
      updatedAt: now,
    })
    .where(eq(contentNode.id, id));
}

export async function deleteContentNodeById(id: string): Promise<void> {
  await db.delete(contentNode).where(eq(contentNode.id, id));
}
