import { NextResponse } from "next/server";
import type { StudentEquivalency } from "@/lib/students";
import {
  getNextIssueNo,
  listStudents,
  StudentIssueNoConflictError,
  StudentStoreLimitError,
  StudentStoreWriteError,
  StudentUpdateNotFoundError,
  upsertStudent,
} from "@/lib/students";

export async function GET() {
  try {
    const students = await listStudents();
    return NextResponse.json(students);
  } catch (e) {
    const message =
      e instanceof Error && e.message ? e.message : "Could not load students";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function parseBody(body: unknown): Omit<StudentEquivalency, "issueNo"> & {
  issueNo?: string;
  previousIssueNo?: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const required = [
    "studentName",
    "recognizedEquivalency",
    "universityBoard",
    "programName",
    "programDuration",
  ] as const;
  const out: Partial<StudentEquivalency> & {
    issueNo?: string;
    previousIssueNo?: string;
  } = {};
  for (const key of required) {
    const v = o[key];
    if (typeof v !== "string" || !v.trim()) return null;
    out[key] = v.trim();
  }
  const rawIssue = o.issueNo;
  if (rawIssue !== undefined && rawIssue !== null) {
    if (typeof rawIssue !== "string") return null;
    const t = rawIssue.trim();
    if (t) out.issueNo = t;
  }
  const rawPrev = o.previousIssueNo;
  if (rawPrev !== undefined && rawPrev !== null) {
    if (typeof rawPrev !== "string") return null;
    const t = rawPrev.trim();
    if (t) out.previousIssueNo = t;
  }
  return out as Omit<StudentEquivalency, "issueNo"> & {
    issueNo?: string;
    previousIssueNo?: string;
  };
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseBody(json);
  if (!parsed) {
    return NextResponse.json(
      { error: "All fields are required as non-empty strings" },
      { status: 400 }
    );
  }
  const issueNo = parsed.issueNo?.trim() || (await getNextIssueNo());
  const record: StudentEquivalency = { ...parsed, issueNo };
  const previousIssueNo = parsed.previousIssueNo?.trim();
  try {
    const saved = await upsertStudent(
      record,
      previousIssueNo ? { previousIssueNo } : undefined
    );
    return NextResponse.json(saved);
  } catch (e) {
    if (e instanceof StudentStoreLimitError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    if (e instanceof StudentIssueNoConflictError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    if (e instanceof StudentUpdateNotFoundError) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    if (e instanceof StudentStoreWriteError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const message =
      e instanceof Error && e.message ? e.message : "Could not save student data";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
