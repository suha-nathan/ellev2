import { POST, GET } from "@/app/api/learning-plans/route";
import {
  PUT,
  DELETE,
  GET as GET_ONE,
} from "@/app/api/learning-plans/[id]/route";

import { LearningPlan } from "@/lib/models/learningPlan";

import { seedLearningPlans } from "../data/learningPlans";
import { learningPlanSchema } from "@/lib/validation/learningPlanSchema";

import { NextRequest } from "next/server";
import { Readable } from "stream";
import { z } from "zod";

type LearningPlanInput = z.infer<typeof learningPlanSchema>;

function buildRequest(
  body: LearningPlanInput,
  method: "POST" | "PUT" = "POST"
): NextRequest {
  const stream = Readable.from([JSON.stringify(body)]);
  const reader = stream as unknown as ReadableStream<Uint8Array>;
  return new NextRequest("http://localhost/api/learning-plans", {
    method,
    headers: { "Content-Type": "application/json" },
    body: reader,
  });
}

describe("POST /api/learning-plans", () => {
  it("creates a new learning plan with inline category", async () => {
    const validData = {
      title: "Test Plan",
      description: "Plan for test",
      owner: "507f191e810c19729de860ea",
      objectives: ["objective 1"],
      tags: ["test"],
      category: {
        name: "Programming",
        icon: "code",
      },
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
    const req = buildRequest({} as LearningPlanInput);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const result = await res.json();
    expect(result.error).toBe("Validation failed");
  });
});

describe("GET /api/learning-plans", () => {
  beforeEach(async () => {
    await LearningPlan.insertMany(seedLearningPlans);
  });

  it("returns all plans with no search query", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/learning-plans")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.length).toBe(5);
  });

  it("returns filtered plans with search query", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/learning-plans?q=python")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.length).toBe(2);
    expect(json[0].title).toMatch(/Python/);
  });

  it("prioritizes title/category matches over tags", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/learning-plans?q=business")
    );
    const json = await res.json();

    expect(json[0].title).toBe("Business Analytics");
    expect(json[0].category.name).toBe("Business");
  });

  it("returns empty list when no matches found", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/learning-plans?q=nonexistent")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });
});

describe("GET /api/learning-plans/:id", () => {
  let planId: string;

  beforeEach(async () => {
    const inserted = await LearningPlan.insertMany(seedLearningPlans);
    planId = inserted[3]._id.toString(); // use a real ObjectId
  });

  it("returns a plan by valid ID", async () => {
    const req = new NextRequest(
      `http://localhost/api/learning-plans/${planId}`
    );
    const res = await GET_ONE(req, { params: { id: planId } });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json._id).toBe(planId);
  });

  it("returns 404 for non-existent ID", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const req = new NextRequest(
      `http://localhost/api/learning-plans/${fakeId}`
    );
    const res = await GET_ONE(req, { params: { id: fakeId } });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid ID format", async () => {
    const req = new NextRequest(`http://localhost/api/learning-plans/invalid`);
    const res = await GET_ONE(req, { params: { id: "invalid" } });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/learning-plans/:id", () => {
  let planId: string;

  beforeEach(async () => {
    const inserted = await LearningPlan.insertMany(seedLearningPlans);
    planId = inserted[0]._id.toString();
  });

  it("updates an existing learning plan", async () => {
    const updatedData = {
      title: "Updated Title",
      description: "Updated Description",
      owner: "507f191e810c19729de860ea",
      objectives: ["new objective"],
      tags: ["updated", "tags"],
      category: { name: "Updated Category" },
      resources: [],
      isPublic: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    };

    const req = buildRequest(updatedData, "PUT");
    const res = await PUT(req, { params: { id: planId } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.title).toBe("Updated Title");
    expect(json.isPublic).toBe(false);
  });

  it("returns 404 if the plan does not exist", async () => {
    const req = buildRequest(seedLearningPlans[0], "PUT");
    const res = await PUT(req, { params: { id: "507f1f77bcf86cd799439011" } });

    expect(res.status).toBe(404);
  });

  it("returns 400 if the ID is invalid", async () => {
    const req = buildRequest(seedLearningPlans[0], "PUT");
    const res = await PUT(req, { params: { id: "invalid" } });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/learning-plans/:id", () => {
  let planId: string;

  beforeEach(async () => {
    const inserted = await LearningPlan.insertMany(seedLearningPlans);
    planId = inserted[2]._id.toString();
  });

  it("deletes a learning plan by ID", async () => {
    const req = new NextRequest(
      `http://localhost/api/learning-plans/${planId}`
    );
    const res = await DELETE(req, { params: { id: planId } });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const plan = await LearningPlan.findById(planId);
    expect(plan).toBeNull();
  });

  it("returns 404 if the plan does not exist", async () => {
    const fakeId = "507f1f77bcf86cd799439011";
    const req = new NextRequest(
      `http://localhost/api/learning-plans/${fakeId}`
    );

    const res = await DELETE(req, { params: { id: fakeId } });
    expect(res.status).toBe(404);
  });

  it("returns 400 if the ID is invalid", async () => {
    const req = new NextRequest("http://localhost/api/learning-plans/invalid");
    const res = await DELETE(req, { params: { id: "invalid" } });

    expect(res.status).toBe(400);
  });
});
