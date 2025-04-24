import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { LearningPlan } from "@/lib/models/learningPlan";
import { learningPlanSchema } from "@/lib/validation/learningPlanSchema";

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    //connect to mongoose if not already connected.
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
};

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) {
    const plans = await LearningPlan.find().populate("category");
    return NextResponse.json(plans);
  }

  const plans = await LearningPlan.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" }, updatedAt: -1 });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const parsed = learningPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const newPlan = await LearningPlan.create(parsed.data);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
