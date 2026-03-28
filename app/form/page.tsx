import Link from "next/link";
import { StudentDataForm } from "@/app/components/StudentDataForm";
import { StudentRecordsList } from "@/app/components/StudentRecordsList";
import {
  getNextIssueNo,
  getStudentByIssueNo,
  listStudents,
} from "@/lib/students";

type PageProps = {
  searchParams: Promise<{ issue?: string; qr?: string }>;
};

export default async function FormPage({ searchParams }: PageProps) {
  const { issue, qr } = await searchParams;
  const issueNo = issue?.trim() ?? "";
  const student = issueNo ? await getStudentByIssueNo(issueNo) : null;
  const nextIssuePreview = await getNextIssueNo();
  const allStudents = await listStudents();
  const showQrBanner = qr === "1" && Boolean(student);

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start px-3 py-6 sm:px-4 sm:py-10">
      <div className="bg-white text-gray-900 w-full max-w-[900px] p-4 shadow-md sm:p-8 md:p-10">
        <div className="text-center">
          <div className="mb-4 flex justify-center sm:relative sm:mb-0 sm:min-h-[4rem]">
            <div className="sm:absolute sm:left-0 sm:top-0">
              <img
                src="/logo.png"
                alt="logo"
                className="h-auto w-12 sm:w-16"
              />
            </div>
          </div>

          <h1 className="font-semibold text-base leading-snug sm:text-lg">
            Council for Technical Education and Vocational Training
          </h1>
          <h2 className="mt-1 font-semibold text-base leading-snug sm:text-lg">
            Curriculum Development and Equivalence Division
          </h2>
          <p className="mt-1 text-sm">Sanothimi, Bhaktapur</p>

          <h3 className="mt-4 font-semibold text-base">
            Student record — add or update
          </h3>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href={issueNo ? `/?issue=${encodeURIComponent(issueNo)}` : "/"}
            className="font-medium text-gray-800 underline underline-offset-2 hover:text-gray-950"
          >
            ← Back to equivalency summary
          </Link>
        </p>

        <StudentRecordsList students={allStudents} />

        <StudentDataForm
          nextIssuePreview={nextIssuePreview}
          initialStudent={student}
          showQrBanner={showQrBanner}
        />
      </div>
    </div>
  );
}
