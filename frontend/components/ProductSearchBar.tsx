"use client"
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { searchProducts } from "@/lib/api/search";
import { useRouter } from "next/navigation";

interface ProductSearchBarProps {
  onResults?: (results: any[]) => void;
  initialQuery?: string;
  compact?: boolean;
  redirectOnSubmit?: boolean;
}

export default function ProductSearchBar({
  onResults,
  initialQuery = "",
  compact = false,
  redirectOnSubmit = false
}: ProductSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Use a ref to track if it's the initial load to avoid double fetching if page does it
  const isFirstRun = useRef(true);

  // Track previous initialQuery to only update state when prop changes
  const prevInitialQuery = useRef(initialQuery);

  // Sync internal state if initialQuery changes from parent (e.g. URL param change)
  useEffect(() => {
    if (prevInitialQuery.current !== initialQuery) {
      setQuery(initialQuery);
      prevInitialQuery.current = initialQuery;
    }
  }, [initialQuery]);

  // Debounced search effect (only if NOT redirect mode)
  useEffect(() => {
    if (redirectOnSubmit) return; // Don't auto-search if we stand alone just for redirect

    // Skip the first run
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (!query.trim()) return;

      setLoading(true);
      setError("");
      try {
        const data = await searchProducts(query);
        if (onResults) onResults(data.hits || []);
      } catch (err: any) {
        setError(err.message || "Search error");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, redirectOnSubmit]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // If redirect mode is enabled (e.g. on Marketplace home), just go to search page
    if (redirectOnSubmit) {
      router.push(`/products/search?q=${encodeURIComponent(query)}`);
      return;
    }

    // Immediate search on submit
    setLoading(true);
    setError("");
    try {
      const data = await searchProducts(query);
      if (onResults) onResults(data.hits || []);
    } catch (err: any) {
      setError(err.message || "Search error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full px-0">
      <div className="relative group">
        {/* Added pointer-events-none so it doesn't block clicks */}
        <div className={`absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 pointer-events-none ${compact ? 'hidden' : ''}`}></div>
        <form onSubmit={handleSearch} className={`relative z-10 flex items-center bg-white rounded-xl ring-1 ring-slate-900/5 ${compact ? 'shadow-sm border border-slate-200' : 'shadow-xl'}`}>
          <div className="pl-4 text-slate-400">
            {loading ? <Loader2 className={`animate-spin text-blue-600 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`} /> : <Search className={`${compact ? 'w-5 h-5' : 'w-6 h-6'}`} />}
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search..."
            className={`w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 font-medium pl-3 pr-24 md:pr-32 ${compact ? 'h-10 text-base' : 'h-14 text-lg md:text-xl'}`}
            autoFocus={!compact && !redirectOnSubmit}
          />
          <div className="absolute right-1.5 md:right-2">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`bg-slate-900 hover:bg-black text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ${compact ? 'h-8 px-4 text-xs' : 'h-10 px-6 text-sm'}`}
            >
              Search
            </button>
          </div>
        </form>
      </div>
      {error && <p className="mt-3 text-center text-sm font-medium text-red-500 bg-red-50 py-1 px-3 rounded-full inline-block mx-auto">{error}</p>}
    </div>
  );
}
