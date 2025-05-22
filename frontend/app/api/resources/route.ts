// app/api/resources/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getResourceModel } from "@/lib/models/resource";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType");
  const source = searchParams.get("source");
  const query = searchParams.get("q");

  const limit = 50;
  const filter: any = {};

  if (contentType) filter.contentType = contentType;
  if (source) filter.source = source;

  if (query) {
    filter.$text = { $search: query };
  }

  const Resource = await getResourceModel();

  const resources = await Resource.find(
    filter,
    query ? { score: { $meta: "textScore" } } : {}
  )
    .sort(
      query
        ? { score: { $meta: "textScore" }, updatedAt: -1 }
        : { updatedAt: -1 }
    )
    .limit(limit);

  return NextResponse.json(resources);
}
