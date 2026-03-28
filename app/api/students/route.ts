import { NextResponse } from "next/server";
import type { StudentEquivalency } from "@/lib/students";
import {
  getNextIssueNo,
  StudentStoreLimitError,
  StudentStoreWriteError,
  upsertStudent,
} from "@/lib/students";

function parseBody(body: unknown): Omit<StudentEquivalency, "issueNo"> & {
  issueNo?: string;
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
  const out: Partial<StudentEquivalency> & { issueNo?: string } = {};
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
  return out as Omit<StudentEquivalency, "issueNo"> & { issueNo?: string };
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
  try {
    const saved = await upsertStudent(record);
    return NextResponse.json(saved);
  } catch (e) {
    if (e instanceof StudentStoreLimitError) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    if (e instanceof StudentStoreWriteError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const message =
      e instanceof Error && e.message ? e.message : "Could not save student data";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
