import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="text-8xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-sm px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Go home
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 border border-gray-700 text-gray-300 font-medium text-sm px-6 py-3 rounded-lg transition-colors hover:border-gray-500 hover:text-white"
          >
            Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
