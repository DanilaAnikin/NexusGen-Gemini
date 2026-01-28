import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="space-y-6">
        {/* 404 Display */}
        <div className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          404
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Project Not Found
          </h1>
          <p className="max-w-md text-gray-400">
            The project you&apos;re looking for doesn&apos;t exist, has been deleted,
            or you don&apos;t have permission to access it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 text-sm font-medium text-white shadow transition-all hover:from-cyan-400 hover:to-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800/50 px-6 text-sm font-medium text-gray-300 shadow-sm transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
