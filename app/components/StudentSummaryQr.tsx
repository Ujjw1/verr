"use client";

import { useMemo } from "react";
import QRCode from "react-qr-code";

type Props = {
  issueNo: string;
};

export function StudentSummaryQr({ issueNo }: Props) {
  const summaryUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const id = issueNo.trim();
    if (!id) return null;
    const url = new URL("/", window.location.origin);
    url.searchParams.set("issue", id);
    return url.toString();
  }, [issueNo]);

  if (!summaryUrl) return null;

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center sm:mt-10 sm:p-6">
      <p className="text-sm font-medium text-gray-800">
        Scan to open this student&apos;s equivalency summary
      </p>
      <p className="mt-1 text-xs text-gray-600">
        Same link as after saving a record. Opens on any device with a camera.
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
    </div>
  );
}
