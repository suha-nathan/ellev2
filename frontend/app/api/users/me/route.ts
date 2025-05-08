import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models/user";
import { LearningPlan } from "@/lib/models/learningPlan";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, image } = await req.json();
  await connectDB();

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { name, image } },
    { new: true }
  );

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userId = user._id;

  // Delete learning plans (segments and tasks will be cascaded)
  const plans = await LearningPlan.find({ owner: userId });
  for (const plan of plans) {
    await LearningPlan.findOneAndDelete({ _id: plan._id });
  }

  //TODO Delete user created Resources

  // Delete the user
  await User.deleteOne({ _id: userId });

  return NextResponse.json({ message: "Account and related data deleted." });
}
