import { POST } from "@/app/api/learning-plans/route";
import { learningPlanSchema } from "@/lib/validation/learningPlan";
import { Category } from "@/lib/models/category";
import { NextRequest } from "next/server";
import { Readable } from "stream";
import { z } from "zod";

type LearningPlanInput = z.infer<typeof learningPlanSchema>;

function buildRequest(body: LearningPlanInput): NextRequest {
  const stream = Readable.from([JSON.stringify(body)]);
  const reader = stream as unknown as ReadableStream<Uint8Array>;
  return new NextRequest(`http://localhost/api/learning-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: reader,
  });
}

describe("POST /api/learning-plans", () => {
  let categoryId: string;

  beforeAll(async () => {
    const category = await Category.create({ name: "Test Category" });
    categoryId = category._id.toString();
  });

  it("creates a new learning plan with valid data", async () => {
    const validData = {
      title: "Test Plan",
      description: "Plan for test",
      owner: "507f191e810c19729de860ea", // some valid ObjectId
      objectives: ["objective 1"],
      tags: ["test"],
      category: categoryId,
      segments: [],
      resources: [],
      isPublic: true,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    };

    const req = buildRequest(validData);
    const res = await POST(req);

    const result = await res.json();
    expect(res.status).toBe(201);
    expect(result.title).toBe("Test Plan");
  });

  it("fails with missing required fields", async () => {
    const req = buildRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    const result = await res.json();
    expect(result.error).toBe("Validation failed");
  });
});
