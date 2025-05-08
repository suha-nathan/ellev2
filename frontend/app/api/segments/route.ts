import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Segment from "@/lib/models/segment";
import { LearningPlan } from "@/lib/models/learningPlan";
import { segmentSchema } from "@/lib/validation/segmentSchema";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = segmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { learningPlanId } = parsed.data;

  const plan = await LearningPlan.findById(learningPlanId);
  if (!plan) {
    return NextResponse.json(
      { error: "Learning plan does not exist" },
      { status: 400 }
    );
  }

  try {
    const segment = await Segment.create(parsed.data);
    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
