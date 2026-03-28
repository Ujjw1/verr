"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import type { StudentEquivalency } from "@/lib/students";

type Props = {
  /** Shown for new records; final number is assigned on save. */
  nextIssuePreview: string;
  initialStudent: StudentEquivalency | null;
};

export function StudentDataForm({
  nextIssuePreview,
  initialStudent,
}: Props) {
  const router = useRouter();
  const isEdit = Boolean(initialStudent);
  const issueNo = initialStudent?.issueNo ?? "";
  const [studentName, setStudentName] = useState(
    () => initialStudent?.studentName ?? ""
  );
  const [recognizedEquivalency, setRecognizedEquivalency] = useState(
    () => initialStudent?.recognizedEquivalency ?? ""
  );
  const [universityBoard, setUniversityBoard] = useState(
    () => initialStudent?.universityBoard ?? ""
  );
  const [programName, setProgramName] = useState(
    () => initialStudent?.programName ?? ""
  );
  const [programDuration, setProgramDuration] = useState(
    () => initialStudent?.programDuration ?? ""
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Full URL for the equivalency summary page (for QR + scan-to-open). */
  const [summaryUrl, setSummaryUrl] = useState<string | null>(null);

  useEffect(() => {
    setStudentName(initialStudent?.studentName ?? "");
    setRecognizedEquivalency(initialStudent?.recognizedEquivalency ?? "");
    setUniversityBoard(initialStudent?.universityBoard ?? "");
    setProgramName(initialStudent?.programName ?? "");
    setProgramDuration(initialStudent?.programDuration ?? "");
  }, [initialStudent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage(null);
    setSummaryUrl(null);
    const body: Record<string, string> = {
      studentName,
      recognizedEquivalency,
      universityBoard,
      programName,
      programDuration,
    };
    if (isEdit && issueNo.trim()) {
      body.issueNo = issueNo.trim();
    }
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setStatus("error");
      setErrorMessage(data.error ?? "Could not save");
      return;
    }
    const data = (await res.json()) as StudentEquivalency;
    const issue = data.issueNo?.trim() ?? issueNo.trim();
    if (typeof window !== "undefined" && issue) {
      const url = new URL("/", window.location.origin);
      url.searchParams.set("issue", issue);
      setSummaryUrl(url.toString());
    } else {
      setSummaryUrl(null);
    }
    setStatus("saved");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:mt-8 sm:p-4"
    >
      <h4 className="text-left text-sm font-semibold text-gray-800">
        Add or update student record
      </h4>
      <p className="text-left text-xs text-gray-600">
        {isEdit
          ? "Updating this issue number’s record."
          : "A new issue number is assigned automatically when you save (next available is shown below)."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="block text-left text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Issue number
          </span>
          {isEdit ? (
            <input
              name="issueNo"
              value={issueNo}
              readOnly
              aria-readonly="true"
              className="w-full cursor-default rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-800"
            />
          ) : (
            <p className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-sm text-gray-800">
              <span className="text-gray-600">Next (after save):</span>{" "}
              <span className="font-mono font-medium">{nextIssuePreview}</span>
            </p>
          )}
        </div>
        <label className="block text-left text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Student name
          </span>
          <input
            name="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            type="text"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
          />
        </label>
        <label className="block text-left text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700">
            Recognized equivalency
          </span>
          <input
            name="recognizedEquivalency"
            value={recognizedEquivalency}
            onChange={(e) => setRecognizedEquivalency(e.target.value)}
            type="text"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
          />
        </label>
        <label className="block text-left text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-gray-700">
            University / board
          </span>
          <input
            name="universityBoard"
            value={universityBoard}
            onChange={(e) => setUniversityBoard(e.target.value)}
            type="text"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
          />
        </label>
        <label className="block text-left text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Program name
          </span>
          <input
            name="programName"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            type="text"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
          />
        </label>
        <label className="block text-left text-sm">
          <span className="mb-1 block font-medium text-gray-700">
            Program duration
          </span>
          <input
            name="programDuration"
            value={programDuration}
            onChange={(e) => setProgramDuration(e.target.value)}
            type="text"
            required
            placeholder="e.g. 6 Semester"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300"
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === "saved" ? (
        <p className="text-sm text-green-800">Saved.</p>
      ) : null}

      {status === "saved" && summaryUrl ? (
        <div className="rounded-lg border border-gray-200 bg-white p-3 text-center sm:p-4">
          <p className="text-sm font-medium text-gray-800">
            Scan to open this student&apos;s equivalency summary
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Opens the summary page on any phone or device with a camera.
          </p>
          <div className="mt-4 flex justify-center bg-white p-2 sm:p-3">
            <div className="w-full max-w-[min(200px,100%)]">
              <QRCode
                value={summaryUrl}
                size={256}
                level="M"
                className="h-auto w-full max-w-full"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const u = new URL(summaryUrl);
              router.push(`${u.pathname}${u.search}${u.hash}`);
            }}
            className="mt-4 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 sm:w-auto"
          >
            Open equivalency summary
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-md bg-gray-800 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
        >
          {status === "saving" ? "Saving…" : "Save record"}
        </button>
      </div>
    </form>
  );
}
