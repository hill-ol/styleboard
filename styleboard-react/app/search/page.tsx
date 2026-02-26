"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchPhotos } from "../../services/unsplash.service";

const AESTHETICS = [
  "Y2K", "Dark Academia", "Cottagecore", "Streetwear",
  "Minimalist", "Vintage", "Grunge", "Boho", "Clean Girl", "Old Money",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Run search when URL param changes
  useEffect(() => {
    if (qParam) {
      setQuery(qParam);
      runSearch(qParam, 1);
    }
  }, [qParam]);

  const runSearch = async (term: string, pageNum: number) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const data = await searchPhotos(term, pageNum, 20);
      if (pageNum === 1) {
        setResults(data.results);
      } else {
        setResults((prev) => [...prev, ...data.results]);
      }
      setHasMore(data.results.length === 20);
      setPage(pageNum);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    runSearch(query.trim(), 1);
  };

  const handleAesthetic = (tag: string) => {
    setQuery(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
    runSearch(tag, 1);
  };

  const loadMore = () => runSearch(qParam || query, page + 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Search header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSubmit} className="flex gap-2 w-full md:max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search styles, aesthetics, outfits..."
              className="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Aesthetic quick filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
            {AESTHETICS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAesthetic(tag)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  qParam === tag
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Empty state — no search yet */}
        {!searched && !loading && (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">✦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Discover your aesthetic
            </h2>
            <p className="text-gray-500 mb-8">
              Search for styles, outfits, and fashion inspiration
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {AESTHETICS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAesthetic(tag)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && results.length === 0 && (
          <div className="columns-2 md:columns-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 break-inside-avoid rounded-2xl bg-gray-100 animate-pulse"
                style={{ height: `${180 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <p className="text-sm text-gray-400 mb-6">
              Showing results for <span className="font-medium text-gray-700">"{qParam}"</span>
            </p>

            <div className="columns-2 md:columns-4 gap-4">
              {results.map((photo: any) => (
                <Link
                  key={photo.id}
                  href={`/details/${photo.id}`}
                  className="block mb-4 break-inside-avoid group"
                >
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={photo.urls?.small}
                      alt={photo.alt_description || "fashion"}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {photo.alt_description || "Fashion inspiration"}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {photo.user?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-24">
            <p className="text-2xl mb-3">🔍</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-500">Try a different search term or browse an aesthetic below</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}