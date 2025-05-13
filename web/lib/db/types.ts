import type { InferModel } from "drizzle-orm";
import type { contentNode } from "./schema";
import { z } from "zod";

export type ContentNode = InferModel<typeof contentNode>;

export type ContentChild = {
  id: string;
  title: string;
  type: "group" | "node" | "root";
  children?: ContentChild[];
};

export const ChildSchema: z.ZodType<ContentChild> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["group", "node", "root"]),
    children: z.array(ChildSchema).optional(),
  }),
);

export const MetadataSchema = z.object({
  children: z.array(ChildSchema),
});

export const SourceSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  hostname: z.string(),
  favicon: z.string().url(),
  extraSnippets: z.array(z.string().optional()),
});

const ContentNodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  path: z.string(),
  markdown: z.string().nullable(),
  metadata: z.string(),
  sources: z.string(),
  type: z.enum(["group", "node", "root"]),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const ParsedContentNodeSchema = ContentNodeSchema.transform((node) => ({
  ...node,
  metadata: MetadataSchema.parse(JSON.parse(node.metadata)),
  sources: z.array(SourceSchema).parse(JSON.parse(node.sources)),
}));

export type ContentMetadata = z.infer<typeof MetadataSchema>;
export type ContentSource = z.infer<typeof SourceSchema>;
export type ParsedContentNode = z.infer<typeof ParsedContentNodeSchema>;
