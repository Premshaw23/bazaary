"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Search, X, Loader2, ShoppingBag, ArrowRight, CornerDownLeft, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProducts, SearchResult } from '@/lib/api/search';
import Image from 'next/image';

const RECENT_SEARCHES_KEY = 'bazaary_recent_searches';

export default function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            } catch (e) {
                console.error('Failed to parse recent searches', e);
            }
        }
    }, []);

    const addToRecent = (term: string) => {
        const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                try {
                    const res = await searchProducts(query);
                    setResults(res.hits);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectProduct = (productId: string) => {
        router.push(`/products/${productId}`);
        onClose();
        setQuery('');
        addToRecent(query || 'Product View'); // Fallback or current query
    };

    const handleSearchTerm = (term: string) => {
        setQuery(term);
        // The effect will trigger the search
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-20">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">

                            {/* Input Field */}
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-4 h-6 w-6 text-slate-400" />
                                <input
                                    type="text"
                                    className="h-16 w-full border-0 bg-transparent pl-14 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-0 text-lg font-medium"
                                    placeholder="Search for anything..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                                {query.length > 0 && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="absolute right-14 top-5 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                                <div className="absolute right-4 top-5">
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                                    ) : (
                                        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                            ESC
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results Area */}
                            {(query === '' && recentSearches.length === 0) && (
                                <div className="px-6 py-14 text-center">
                                    <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-center gap-2 mb-4">
                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                        Trending Now
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Wireless Earbuds', 'Smart Watch', 'Gaming Laptop', 'Sneakers', 'Home Decor'].map(term => (
                                            <button
                                                key={term}
                                                onClick={() => handleSearchTerm(term)}
                                                className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query === '' && recentSearches.length > 0 && (
                                <div className="p-2">
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Recent Searches
                                        </h3>
                                        <button
                                            onClick={clearRecent}
                                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    <ul className="space-y-1">
                                        {recentSearches.map((term, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSearchTerm(term)}
                                                className="group flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                                            >
                                                <Clock className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                                <span className="flex-auto text-sm font-medium">{term}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                    <div className="p-2">
                                        <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Products ({results.length})
                                        </h3>
                                        <ul className="space-y-1">
                                            {results.map((product) => (
                                                <li
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product.id)}
                                                    className="group flex items-center gap-4 cursor-pointer rounded-xl p-3 hover:bg-blue-50/50 hover:shadow-sm border border-transparent hover:border-blue-100 transition-all duration-200"
                                                >
                                                    <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-white border border-slate-100 shadow-sm">
                                                        {product.images?.[0]?.url ? (
                                                            <Image
                                                                src={product.images[0].url}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <ShoppingBag className="h-6 w-6 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                        )}
                                                    </div>
                                                    <div className="flex-auto min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                                                                {product.name}
                                                            </h4>
                                                            <span className="shrink-0 text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                                ₹{product.price}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                                            {product.brand && <span className="font-medium text-slate-700">{product.brand}</span>}
                                                            {product.brand ? ' • ' : ''}
                                                            {product.category || product.categoryId || 'Product'}
                                                        </p>
                                                    </div>
                                                    <div className="flex-none opacity-0 group-hover:opacity-100 transition-opacity -ml-2">
                                                        <CornerDownLeft className="h-4 w-4 text-blue-400" />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-center">
                                        <Link
                                            href={`/products/search?q=${query}`}
                                            onClick={onClose}
                                            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View all {results.length}+ results
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {query !== '' && results.length === 0 && !loading && (
                                <div className="px-6 py-16 text-center">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                                        <Search className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900">No results found</h3>
                                    <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                                        We couldn't find anything matching "{query}". Try checking for typos or using different keywords.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setQuery('')}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 px-1 bg-white font-sans text-[10px]">↵</kbd>
                                        <span>to select</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <kbd className="hidden sm:inline-flex items-center rounded border border-slate-300 px-1 bg-white font-sans text-[10px]">↑↓</kbd>
                                        <span>to navigate</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                    <span className="text-brand-600">Bazaary</span>
                                    <span>Search</span>
                                </div>
                            </div>

                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
