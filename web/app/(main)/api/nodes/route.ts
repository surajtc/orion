import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getRootContentNodesByUserId } from "@/lib/db/queries";
import { ParsedContentNodeSchema } from "@/lib/db/types";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ nodes: [], guest: true });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const count = Number.parseInt(searchParams.get("count") ?? "5", 10);
    const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);

    const contentNodes = await getRootContentNodesByUserId(
      userId,
      count,
      offset,
    );

    const parsedNodes = contentNodes
      .map((node) => ParsedContentNodeSchema.safeParse(node))
      .filter((result) => result.success)
      .map((result) => result.data);

    return NextResponse.json({ nodes: parsedNodes, guest: false });
  } catch (err) {
    console.error("Error fetching content nodes:", err);
    return NextResponse.json(
      { error: "Failed to fetch content nodes" },
      { status: 500 },
    );
  }
}
