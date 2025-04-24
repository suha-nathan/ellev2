import { POST } from "@/app/api/tasks/route";
import { GET as GET_ONE, PUT, DELETE } from "@/app/api/tasks/[id]/route";
import { DELETE as DELETE_SEGMENT } from "@/app/api/segments/[id]/route";
import { DELETE as DELETE_PLAN } from "@/app/api/learning-plans/[id]/route";
import { seedTasks } from "../data/tasks";
import Task from "@/lib/models/task";
import Segment from "@/lib/models/segment";
import { taskSchema } from "@/lib/validation/taskSchema";
import { NextRequest } from "next/server";
import { Readable } from "stream";
import { z } from "zod";

type TaskInput = z.infer<typeof taskSchema>;

function buildRequest(
  body: TaskInput,
  method: "POST" | "PUT" = "POST"
): NextRequest {
  const stream = Readable.from([JSON.stringify(body)]);
  const reader = stream as unknown as ReadableStream<Uint8Array>;
  return new NextRequest("http://localhost/api/tasks", {
    method,
    headers: { "Content-Type": "application/json" },
    body: reader,
  });
}

describe("Task API Routes", () => {
  let segmentId: string;
  let taskId: string;

  beforeEach(async () => {
    const { segments, tasks } = await seedTasks();
    segmentId = segments[0]._id.toString();
    taskId = tasks[0]._id.toString();
  });

  describe("POST /api/tasks", () => {
    it("creates a new task", async () => {
      const validData = {
        title: "New Task",
        type: "reading",
        isComplete: false,
        priority: "medium",
        segmentId,
      };

      const req = buildRequest(validData);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.title).toBe("New Task");
    });

    it("fails if required fields are missing", async () => {
      const req = buildRequest({} as TaskInput);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("Validation failed");
    });

    it("fails if segment does not exist", async () => {
      const req = buildRequest({
        title: "Bad Task",
        segmentId: "507f1f77bcf86cd799439011",
      } as TaskInput);
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns a task by ID", async () => {
      const req = new NextRequest(`http://localhost/api/tasks/${taskId}`);
      const res = await GET_ONE(req, { params: { id: taskId } });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json._id).toBe(taskId);
    });

    it("returns 404 for non-existent ID", async () => {
      const req = new NextRequest(
        "http://localhost/api/tasks/507f1f77bcf86cd799439011"
      );
      const res = await GET_ONE(req, {
        params: { id: "507f1f77bcf86cd799439011" },
      });

      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid ID", async () => {
      const req = new NextRequest("http://localhost/api/tasks/invalid");
      const res = await GET_ONE(req, { params: { id: "invalid" } });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("updates a task", async () => {
      const updated = {
        title: "Updated Task",
        segmentId,
        type: "quiz",
        priority: "high",
        isComplete: true,
      };

      const req = buildRequest(updated, "PUT");
      const res = await PUT(req, { params: { id: taskId } });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.title).toBe("Updated Task");
      expect(json.isComplete).toBe(true);
    });

    it("returns 404 if task doesn't exist", async () => {
      const req = buildRequest(
        {
          title: "Nonexistent",
          segmentId,
        } as TaskInput,
        "PUT"
      );

      const res = await PUT(req, {
        params: { id: "507f1f77bcf86cd799439011" },
      });
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid ID", async () => {
      const req = buildRequest(
        {
          title: "Invalid",
          segmentId,
        } as TaskInput,
        "PUT"
      );

      const res = await PUT(req, { params: { id: "invalid" } });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes a task", async () => {
      const req = new NextRequest(`http://localhost/api/tasks/${taskId}`);
      const res = await DELETE(req, { params: { id: taskId } });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const check = await Task.findById(taskId);
      expect(check).toBeNull();
    });

    it("returns 404 if task doesn't exist", async () => {
      const req = new NextRequest(
        "http://localhost/api/tasks/507f1f77bcf86cd799439011"
      );
      const res = await DELETE(req, {
        params: { id: "507f1f77bcf86cd799439011" },
      });

      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid ID", async () => {
      const req = new NextRequest("http://localhost/api/tasks/invalid");
      const res = await DELETE(req, { params: { id: "invalid" } });

      expect(res.status).toBe(400);
    });
  });
});

describe("Cascade Deletion", () => {
  let learningPlanId: string;
  let segmentId: string;

  beforeEach(async () => {
    const { learningPlans, segments } = await seedTasks();
    segmentId = segments[0]._id.toString();
    learningPlanId = learningPlans[1]._id.toString();
  });

  describe("Cascade delete tasks when segment is deleted", () => {
    it("deletes all tasks associated with a segment", async () => {
      const tasksBefore = await Task.find({ segmentId });
      expect(tasksBefore.length).toBeGreaterThan(0);

      const req = new NextRequest(`http://localhost/api/segments/${segmentId}`);
      const res = await DELETE_SEGMENT(req, { params: { id: segmentId } });

      expect(res.status).toBe(200);

      const tasksAfter = await Task.find({ segmentId });
      expect(tasksAfter).toHaveLength(0);
    });
  });

  describe("Cascade delete tasks via learning plan → segment → task", () => {
    it("deletes all segments and tasks associated with a learning plan", async () => {
      const segmentsBefore = await Segment.find({ learningPlanId });
      expect(segmentsBefore.length).toBeGreaterThan(0);

      const segmentIds = segmentsBefore.map((s) => s._id.toString());
      const tasksBefore = await Task.find({ segmentId: { $in: segmentIds } });
      expect(tasksBefore.length).toBeGreaterThan(0);

      const req = new NextRequest(
        `http://localhost/api/learning-plans/${learningPlanId}`
      );
      const res = await DELETE_PLAN(req, { params: { id: learningPlanId } });

      expect(res.status).toBe(200);

      const segmentsAfter = await Segment.find({ learningPlanId });
      const tasksAfter = await Task.find({ segmentId: { $in: segmentIds } });

      expect(segmentsAfter).toHaveLength(0);
      expect(tasksAfter).toHaveLength(0);
    });
  });
});
