import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl mb-6">✦</p>
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-semibold hover:border-black transition-colors"
        >
          Discover looks
        </Link>
      </div>
    </div>
  );
}