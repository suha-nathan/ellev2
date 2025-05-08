import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Task from "@/lib/models/task";
import Segment from "@/lib/models/segment";
import { taskSchema } from "@/lib/validation/taskSchema";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { segmentId } = parsed.data;

  const segment = await Segment.findById(segmentId);
  if (!segment) {
    return NextResponse.json(
      { error: "Segment does not exist" },
      { status: 400 }
    );
  }

  try {
    const task = await Task.create(parsed.data);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
