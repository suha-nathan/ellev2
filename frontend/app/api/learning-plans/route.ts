import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

import { LearningPlan } from "@/lib/models/learningPlan";
import { Segment } from "@/lib/models/segment";
import { Task } from "@/lib/models/task";
import { learningPlanSchema } from "@/lib/validation/learningPlanSchema";
import { segmentSchema } from "@/lib/validation/segmentSchema";
import { taskSchema } from "@/lib/validation/taskSchema";

export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  // only public plans for anonymous users; public + own plans for authenticated
  const baseFilter = session
    ? { $or: [{ isPublic: true }, { owner: session.user.id }] }
    : { isPublic: true };

  if (query) {
    const filter = {
      $and: [baseFilter, { $text: { $search: query } }],
    };
    const plans = await LearningPlan.find(filter, {
      score: { $meta: "textScore" },
    }).sort({ score: { $meta: "textScore" }, updatedAt: -1 });
    return NextResponse.json(plans);
  }

  const plans = await LearningPlan.find(baseFilter);
  return NextResponse.json({ plans: plans });
}

export async function POST(req: NextRequest) {
  await connectDB();

  //validate session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { segments, ...planData } = body;

  const planParsed = learningPlanSchema.safeParse({
    ...planData,
    owner: session.user.id,
  });

  if (!planParsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: planParsed.error.flatten() },
      { status: 400 }
    );
  }

  const segmentErrors: Record<number, any> = {};

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    console.log("SEGMENT: ", seg);
    const segValidation = segmentSchema
      .omit({ learningPlanId: true })
      .safeParse(seg);
    if (!segValidation.success) {
      segmentErrors[i] = segValidation.error.flatten();
      continue;
    }
    for (let j = 0; j < seg.tasks.length; j++) {
      const taskValidation = taskSchema
        .omit({ segmentId: true })
        .safeParse({ title: seg.tasks[j] });
      if (!taskValidation.success) {
        segmentErrors[i] = segmentErrors[i] || { tasks: {} };
        segmentErrors[i].tasks[j] = taskValidation.error.flatten();
      }
    }
  }

  if (Object.keys(segmentErrors).length > 0) {
    return NextResponse.json(
      { error: "Segment or task validation failed", issues: segmentErrors },
      { status: 400 }
    );
  }

  //Start mongodb transaction, commits only if all Learning Plan, Segment, Task created successfully
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();

  try {
    //create learning plan
    const newPlan = await LearningPlan.create(
      [
        {
          ...planParsed.data,
          owner: session.user.id,
        },
      ],
      { session: sessionDB }
    );
    const planId = newPlan[0]._id;

    //create segments
    for (const seg of segments) {
      const createdSegment = await Segment.create(
        [{ ...seg, learningPlanId: planId }],
        { session: sessionDB }
      );
      const segmentId = createdSegment[0]._id;
      for (const taskTitle of seg.tasks) {
        await Task.create([{ title: taskTitle, segmentId }], {
          session: sessionDB,
        });
      }
    }
    await sessionDB.commitTransaction();
    sessionDB.endSession();

    return NextResponse.json(
      { planId, message: "Learning Plan created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
