import { NextResponse } from "next/server";
import {
  deleteStudent,
  getStudentByIssueNo,
  StudentStoreWriteError,
} from "@/lib/students";

export async function GET(
  _request: Request,
  context: { params: Promise<{ issueNo: string }> }
) {
  const { issueNo } = await context.params;
  const decoded = decodeURIComponent(issueNo);
  const student = await getStudentByIssueNo(decoded);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }
  return NextResponse.json(student);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ issueNo: string }> }
) {
  const { issueNo } = await context.params;
  const decoded = decodeURIComponent(issueNo);
  try {
    const removed = await deleteStudent(decoded);
    if (!removed) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof StudentStoreWriteError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const message =
      e instanceof Error && e.message ? e.message : "Could not delete student";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
