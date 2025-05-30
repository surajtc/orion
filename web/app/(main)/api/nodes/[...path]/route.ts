import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getContentNodeByPath } from "@/lib/db/queries";
import { ParsedContentNodeSchema } from "@/lib/db/types";

type RouteParams = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;

  if (!path) {
    return NextResponse.json({ error: "Missing node ID" }, { status: 400 });
  }

  const node = await getContentNodeByPath(userId, path.join("/"));

  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const parsedResult = ParsedContentNodeSchema.safeParse(node);

  if (!parsedResult.success) {
    console.error("Node validation failed:", parsedResult.error);
    return NextResponse.json({ error: "Invalid node data" }, { status: 500 });
  }

  return NextResponse.json(parsedResult.data);
}
