import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Task from "@/lib/models/task";
import Segment from "@/lib/models/segment";
import { taskSchema } from "@/lib/validation/taskSchema";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

// GET /api/tasks/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    const task = await Task.findById(params.id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}

// PUT /api/tasks/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updated = await Task.findByIdAndUpdate(params.id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    const deleted = await Task.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
}
