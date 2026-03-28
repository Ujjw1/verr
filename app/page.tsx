import Link from "next/link";
import { getStudentByIssueNo } from "@/lib/students";

type PageProps = {
  searchParams: Promise<{ issue?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { issue } = await searchParams;
  const issueNo = issue?.trim() ?? "";
  const student = issueNo ? await getStudentByIssueNo(issueNo) : null;

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-start px-3 py-6 sm:px-4 sm:py-10">
      <div className="bg-white text-gray-900 w-full max-w-[900px] p-4 shadow-md sm:p-8 md:p-10">
        {/* Header */}
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
            Student Equivalency Summary
          </h3>
        </div>

        {/* Content */}
        <div className="mt-8 space-y-4 text-sm sm:mt-10">
          {issueNo ? (
            !student ? (
              <p className="text-center text-red-700">
                No record found for issue number{" "}
                <span className="font-mono break-all">{issueNo}</span>.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">Student Name:</p>
                  <p className="break-words">{student.studentName}</p>
                </div>

                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">Issue No.:</p>
                  <p className="break-words font-mono">{student.issueNo}</p>
                </div>

                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">
                    Recognized Equivalency:
                  </p>
                  <p className="break-words">{student.recognizedEquivalency}</p>
                </div>

                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">University/Board:</p>
                  <p className="break-words">{student.universityBoard}</p>
                </div>

                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">Program Name:</p>
                  <p className="break-words">{student.programName}</p>
                </div>

                <div className="grid grid-cols-1 gap-1 gap-x-6 sm:grid-cols-2 sm:gap-y-1">
                  <p className="font-medium text-gray-800">Program Duration:</p>
                  <p className="break-words">{student.programDuration}</p>
                </div>
              </>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
