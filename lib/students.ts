import "server-only";
import { Redis } from "@upstash/redis";
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

/** Redis key for serverless / read-only filesystem hosts (Vercel, etc.). */
const REDIS_KEY = "students:equivalency";

function redisRestUrl(): string | undefined {
  return (
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim() ||
    undefined
  );
}

function redisRestToken(): string | undefined {
  return (
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim() ||
    undefined
  );
}

let redisSingleton: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const url = redisRestUrl();
  const token = redisRestToken();
  if (!url || !token) {
    redisSingleton = null;
    return null;
  }
  try {
    redisSingleton = new Redis({ url, token });
  } catch {
    redisSingleton = null;
  }
  return redisSingleton;
}

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

function normalizeList(data: unknown): StudentEquivalency[] {
  if (!Array.isArray(data)) return cloneSeed();
  const out: StudentEquivalency[] = [];
  for (const item of data) {
    const s = parseStudent(item);
    if (s) out.push(s);
  }
  return out.length > 0 ? out : cloneSeed();
}

async function readStore(): Promise<StudentEquivalency[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(REDIS_KEY);
      if (raw == null || raw === "") return cloneSeed();
      const parsed =
        typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
      return normalizeList(parsed);
    } catch {
      return cloneSeed();
    }
  }

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as unknown;
    return normalizeList(data);
  } catch {
    return cloneSeed();
  }
}

export class StudentStoreWriteError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "StudentStoreWriteError";
  }
}

function isVercelServerlessDeploy(): boolean {
  const env = process.env.VERCEL_ENV;
  return env === "production" || env === "preview";
}

async function writeStore(students: StudentEquivalency[]): Promise<void> {
  const payload = JSON.stringify(students, null, 2);
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, payload);
    } catch (e) {
      throw new StudentStoreWriteError(
        "Could not save to Redis. Check UPSTASH / KV environment variables.",
        e
      );
    }
    return;
  }

  if (isVercelServerlessDeploy()) {
    throw new StudentStoreWriteError(
      "Redis is not configured on the server. In Vercel: Project → Settings → Environment Variables, add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (copy from Upstash or .env.local), enable them for Production and Preview, then redeploy. .env.local is not uploaded with your git push."
    );
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, payload, "utf8");
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as NodeJS.ErrnoException).code)
        : "";
    const hint =
      code === "EROFS" || code === "EACCES" || code === "EPERM"
        ? " The server filesystem is read-only (typical on Vercel). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or Vercel KV: KV_REST_API_URL and KV_REST_API_TOKEN)."
        : " For production, configure Upstash Redis or Vercel KV.";
    throw new StudentStoreWriteError(
      `Could not write student data to disk.${hint}`,
      e
    );
  }
}

export class StudentStoreLimitError extends Error {
  constructor(readonly limit: number) {
    super(`Maximum ${limit} students can be saved. Remove or update an existing record.`);
    this.name = "StudentStoreLimitError";
  }
}

export async function listStudents(): Promise<StudentEquivalency[]> {
  const students = await readStore();
  return students.map((s) => ({ ...s })).sort((a, b) => {
    const na = /^\d+$/.test(a.issueNo) ? Number(a.issueNo) : 0;
    const nb = /^\d+$/.test(b.issueNo) ? Number(b.issueNo) : 0;
    if (na !== nb) return nb - na;
    return a.issueNo.localeCompare(b.issueNo);
  });
}

export async function getStudentByIssueNo(
  issueNo: string
): Promise<StudentEquivalency | null> {
  const students = await readStore();
  const normalized = issueNo.trim();
  const found = students.find((s) => s.issueNo === normalized);
  return found ? { ...found } : null;
}

export async function deleteStudent(issueNo: string): Promise<boolean> {
  const students = await readStore();
  const normalized = issueNo.trim();
  const next = students.filter((s) => s.issueNo !== normalized);
  if (next.length === students.length) return false;
  await writeStore(next);
  return true;
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
