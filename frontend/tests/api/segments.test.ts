import { POST } from "@/app/api/segments/route";
import { GET as GET_ONE, PUT, DELETE } from "@/app/api/segments/[id]/route";
import { DELETE as DELETE_LP } from "@/app/api/learning-plans/[id]/route";
import { segmentSchema } from "@/lib/validation/segmentSchema";
import Segment from "@/lib/models/segment";
import { seedSegments } from "../data/segments";
import { NextRequest } from "next/server";
import { Readable } from "stream";
import { z } from "zod";

type SegmentInput = z.infer<typeof segmentSchema>;

function buildRequest(
  body: SegmentInput,
  method: "POST" | "PUT" = "POST"
): NextRequest {
  const stream = Readable.from([JSON.stringify(body)]);
  const reader = stream as unknown as ReadableStream<Uint8Array>;
  return new NextRequest("http://localhost/api/segments", {
    method,
    headers: { "Content-Type": "application/json" },
    body: reader,
  });
}

describe("POST /api/segments", () => {
  let learningPlanId: string;

  beforeEach(async () => {
    const seeded = await seedSegments();
    learningPlanId = seeded.learningPlans[0]._id.toString();
  });

  it("creates a new segment", async () => {
    const validData = {
      title: "New Segment",
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      learningPlanId,
    };

    const req = buildRequest(validData);
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.title).toBe(validData.title);
  });

  it("fails if required segment fields are missing", async () => {
    const req = buildRequest({ learningPlanId } as SegmentInput);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("fails if learning plan is not input", async () => {
    const req = buildRequest({
      title: "Week 1 Program",
      start: new Date().toISOString(),
    } as SegmentInput);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("fails if learning plan doesnt exist in DB", async () => {
    const req = buildRequest({
      title: "Week 1 Program",
      start: new Date().toISOString(),
      learningPlanId: "507f1f77bcf86cd799439015",
    } as SegmentInput);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Learning plan does not exist");
  });
});

describe("GET /api/segments/:id", () => {
  let segmentId: string;

  beforeEach(async () => {
    const { segments } = await seedSegments();
    segmentId = segments[2]._id.toString();
  });

  it("returns a segment by ID", async () => {
    const req = new NextRequest(`http://localhost/api/segments/${segmentId}`);
    const res = await GET_ONE(req, { params: { id: segmentId } });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json._id).toBe(segmentId);
  });

  it("returns 404 if not found", async () => {
    const req = new NextRequest(
      "http://localhost/api/segments/507f1f77bcf86cd799439011"
    );
    const res = await GET_ONE(req, {
      params: { id: "507f1f77bcf86cd799439011" },
    });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid ID", async () => {
    const req = new NextRequest("http://localhost/api/segments/invalid");
    const res = await GET_ONE(req, { params: { id: "invalid" } });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/segments/:id", () => {
  let segmentId: string;
  let learningPlanId: string;

  beforeEach(async () => {
    const { segments, learningPlans } = await seedSegments();
    segmentId = segments[0]._id.toString();
    learningPlanId = learningPlans[0]._id.toString();
  });

  it("updates a segment", async () => {
    const updatedData = {
      title: "Updated Segment",
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      learningPlanId,
    };

    const req = buildRequest(updatedData, "PUT");
    const res = await PUT(req, { params: { id: segmentId } });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Updated Segment");
  });

  it("returns 404 if segment doesn't exist", async () => {
    const req = buildRequest(
      {
        title: "Fake",
        start: new Date().toISOString(),
        learningPlanId,
      },
      "PUT"
    );

    const res = await PUT(req, { params: { id: "507f1f77bcf86cd799439011" } });
    expect(res.status).toBe(404);
  });

  it("returns 400 if ID is invalid", async () => {
    const req = buildRequest(
      {
        title: "Fake",
        start: new Date().toISOString(),
        learningPlanId,
      },
      "PUT"
    );

    const res = await PUT(req, { params: { id: "invalid" } });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/segments/:id", () => {
  let segmentId: string;

  beforeEach(async () => {
    const { segments } = await seedSegments();
    segmentId = segments[0]._id.toString();
  });

  it("deletes a segment", async () => {
    const req = new NextRequest(`http://localhost/api/segments/${segmentId}`);
    const res = await DELETE(req, { params: { id: segmentId } });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const check = await Segment.findById(segmentId);
    expect(check).toBeNull();
  });

  it("returns 404 if segment doesn't exist", async () => {
    const req = new NextRequest(
      "http://localhost/api/segments/507f1f77bcf86cd799439011"
    );
    const res = await DELETE(req, {
      params: { id: "507f1f77bcf86cd799439011" },
    });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid ID", async () => {
    const req = new NextRequest("http://localhost/api/segments/invalid");
    const res = await DELETE(req, { params: { id: "invalid" } });

    expect(res.status).toBe(400);
  });
});

describe("Cascade delete segments when learning plan is deleted", () => {
  let learningPlanId: string;

  beforeEach(async () => {
    const { learningPlans } = await seedSegments();
    learningPlanId = learningPlans[0]._id.toString();
  });

  it("deletes all segments associated with a learning plan", async () => {
    // Confirm segments exist before deletion
    const segmentBeforeDeletion = await Segment.find({ learningPlanId });
    expect(segmentBeforeDeletion.length).toBeGreaterThan(0);

    // Trigger learning plan deletion
    const req = new NextRequest(
      `http://localhost/api/learning-plans/${learningPlanId}`
    );
    const res = await DELETE_LP(req, { params: { id: learningPlanId } });

    expect(res.status).toBe(200);

    // Confirm all related segments are gone
    const segmentAfterDeletion = await Segment.find({ learningPlanId });
    expect(segmentAfterDeletion).toHaveLength(0);
  });
});
