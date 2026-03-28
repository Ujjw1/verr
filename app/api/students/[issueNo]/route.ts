import { NextResponse } from "next/server";
import { getStudentByIssueNo } from "@/lib/students";

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
