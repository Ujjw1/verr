import { getStudentByIssueNo } from "@/lib/students";

type PageProps = {
  searchParams: Promise<{ issue?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { issue } = await searchParams;
  const issueNo = issue?.trim() ?? "";
  const student = issueNo ? await getStudentByIssueNo(issueNo) : null;

  return (
    <div className="min-h-screen w-full bg-white  text-gray-900 px-3 py-6 sm:px-4 sm:py-10 md:px-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex flex-row items-start gap-3 sm:items-center sm:gap-4">
          <img
            src="/logo.png"
            alt="logo"
            className="h-auto w-12 shrink-0 sm:w-16"
          />
          <div className="min-w-0 flex-1 text-center">
            <h1 className="font-semibold text-base leading-snug sm:text-lg">
              Council for Technical Education and Vocational Training
            </h1>
            <h2 className="mt-1 font-semibold text-base leading-snug sm:text-lg">
              Curriculum Development and Equivalence Division
            </h2>
            <p className="mt-1 text-sm">Sanothimi, Bhaktapur</p>
          </div>
        </div>

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
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">
                  Student Name:
                </p>
                <p className="min-w-0 flex-1 break-words sm:min-w-0 sm:flex-none">
                  {student.studentName}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">Issue No.:</p>
                <p className="min-w-0 flex-1 break-words font-mono sm:min-w-0 sm:flex-none">
                  {student.issueNo}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">
                  Recognized Equivalency:
                </p>
                <p className="min-w-0 flex-1 break-words sm:min-w-0 sm:flex-none">
                  {student.recognizedEquivalency}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">
                  University/Board:
                </p>
                <p className="min-w-0 flex-1 break-words sm:min-w-0 sm:flex-none">
                  {student.universityBoard}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">
                  Program Name:
                </p>
                <p className="min-w-0 flex-1 break-words sm:min-w-0 sm:flex-none">
                  {student.programName}
                </p>
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1">
                <p className="shrink-0 font-medium text-gray-800">
                  Program Duration:
                </p>
                <p className="min-w-0 flex-1 break-words sm:min-w-0 sm:flex-none">
                  {student.programDuration}
                </p>
              </div>
            </>
          )
        ) : null}
      </div>
    </div>
  );
}
