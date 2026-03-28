import "server-only";
import fs from "fs/promises";
import path from "path";

export type StudentEquivalency = {
  studentName: string;
  issueNo: string;
  recognizedEquivalency: string;
  universityBoard: string;
  programName: string;
  programDuration: string;
};

/** At most this many distinct students are kept; stored as JSON on disk. */
export const MAX_STUDENTS = 5;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "students.json");

const seed: StudentEquivalency[] = [
  {
    studentName: "ASHIM BHATTARAI",
    issueNo: "20242460",
    recognizedEquivalency: "Diploma in Computer Engineering",
    universityBoard: "RK University, Gujarat, India",
    programName: "Diploma in Computer Engineering",
    programDuration: "6 Semester",
  },
];

function cloneSeed(): StudentEquivalency[] {
  return seed.map((s) => ({ ...s }));
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}

function parseStudent(x: unknown): StudentEquivalency | null {
  if (!isRecord(x)) return null;
  const keys = [
    "studentName",
    "issueNo",
    "recognizedEquivalency",
    "universityBoard",
    "programName",
    "programDuration",
  ] as const;
  for (const k of keys) {
    const v = x[k];
    if (typeof v !== "string" || !v.trim()) return null;
  }
  return {
    studentName: String(x.studentName).trim(),
    issueNo: String(x.issueNo).trim(),
    recognizedEquivalency: String(x.recognizedEquivalency).trim(),
    universityBoard: String(x.universityBoard).trim(),
    programName: String(x.programName).trim(),
    programDuration: String(x.programDuration).trim(),
  };
}

async function readStore(): Promise<StudentEquivalency[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return cloneSeed();
    const out: StudentEquivalency[] = [];
    for (const item of data) {
      const s = parseStudent(item);
      if (s) out.push(s);
    }
    return out.length > 0 ? out : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

async function writeStore(students: StudentEquivalency[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2), "utf8");
}

export class StudentStoreLimitError extends Error {
  constructor(readonly limit: number) {
    super(`Maximum ${limit} students can be saved. Remove or update an existing record.`);
    this.name = "StudentStoreLimitError";
  }
}

export async function getStudentByIssueNo(
  issueNo: string
): Promise<StudentEquivalency | null> {
  const students = await readStore();
  const normalized = issueNo.trim();
  const found = students.find((s) => s.issueNo === normalized);
  return found ? { ...found } : null;
}

/** Next issue number: max existing numeric id + 1, or `{year}0001` if none. */
export async function getNextIssueNo(): Promise<string> {
  const students = await readStore();
  let max = 0;
  for (const s of students) {
    if (/^\d+$/.test(s.issueNo)) {
      const n = Number(s.issueNo);
      if (Number.isSafeInteger(n) && n > max) max = n;
    }
  }
  if (max === 0) {
    const y = new Date().getFullYear();
    return `${y}0001`;
  }
  return String(max + 1);
}

export async function upsertStudent(
  record: StudentEquivalency
): Promise<StudentEquivalency> {
  const students = await readStore();
  const normalized: StudentEquivalency = {
    ...record,
    issueNo: record.issueNo.trim(),
    studentName: record.studentName.trim(),
    recognizedEquivalency: record.recognizedEquivalency.trim(),
    universityBoard: record.universityBoard.trim(),
    programName: record.programName.trim(),
    programDuration: record.programDuration.trim(),
  };
  const idx = students.findIndex((s) => s.issueNo === normalized.issueNo);
  if (idx >= 0) {
    students[idx] = normalized;
    await writeStore(students);
    return { ...normalized };
  }
  if (students.length >= MAX_STUDENTS) {
    throw new StudentStoreLimitError(MAX_STUDENTS);
  }
  students.push(normalized);
  await writeStore(students);
  return { ...normalized };
}
