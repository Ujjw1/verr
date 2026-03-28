"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StudentEquivalency } from "@/lib/students";

type Props = {
  students: StudentEquivalency[];
};

export function StudentRecordsList({ students }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(issueNo: string) {
    if (!window.confirm(`Delete record for issue ${issueNo}? This cannot be undone.`)) {
      return;
    }
    setError(null);
    setDeleting(issueNo);
    const res = await fetch(
      `/api/students/${encodeURIComponent(issueNo)}`,
      { method: "DELETE" }
    );
    setDeleting(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete");
      return;
    }
    router.refresh();
  }

  if (students.length === 0) {
    return (
      <p className="mt-6 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-sm text-gray-600">
        No saved students yet. Add a record below.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-left text-sm font-semibold text-gray-800">
        Saved records
      </h4>
      <p className="mt-1 text-left text-xs text-gray-600">
        View opens the public summary with a QR code; edit here or delete a record.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-3 py-2 font-medium text-gray-700">Issue</th>
              <th className="px-3 py-2 font-medium text-gray-700">Name</th>
              <th className="px-3 py-2 font-medium text-gray-700">Program</th>
              <th className="w-px whitespace-nowrap px-3 py-2 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.issueNo} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2 font-mono text-xs sm:text-sm">
                  {s.issueNo}
                </td>
                <td className="max-w-[140px] truncate px-3 py-2 sm:max-w-none sm:whitespace-normal">
                  {s.studentName}
                </td>
                <td className="max-w-[120px] truncate px-3 py-2 text-gray-700 sm:max-w-none sm:whitespace-normal">
                  {s.programName}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    <Link
                      href={`/?issue=${encodeURIComponent(s.issueNo)}&qr=1`}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/form?issue=${encodeURIComponent(s.issueNo)}`}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deleting === s.issueNo}
                      onClick={() => onDelete(s.issueNo)}
                      className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === s.issueNo ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
