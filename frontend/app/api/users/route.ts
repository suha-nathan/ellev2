import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models/user";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await User.find({}).select("name image _id");

  return NextResponse.json({ users });
}
