import { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { Search, X, FileText, Command } from "lucide-react";
import { DIFFICULTY_LABELS, DIFFICULTY_SHORT, DIFFICULTIES } from "../../config/difficulty";

interface SearchResult {
  title: string;
  description: string;
  category: string;
  aliases: string[];
  slug: string;
  difficulties: string[];
}

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchResult> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Expose global open function for the Navbar button
  useEffect(() => {
    (window as any).openSearchModal = () => setIsOpen(true);
    return () => {
      delete (window as any).openSearchModal;
    };
  }, []);

  // Fetch index exactly once when modal opens for the first time
  useEffect(() => {
    if (isOpen && !fuse && !isLoading) {
      setIsLoading(true);
      fetch("/KIWiki/api/search.json")
        .then((res) => res.json())
        .then((data: SearchResult[]) => {
          const fuseInstance = new Fuse(data, {
            keys: ["title", "aliases", "description", "category"],
            threshold: 0.3,
            ignoreLocation: true,
          });
          setFuse(fuseInstance);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch search index:", err);
          setIsLoading(false);
        });
    }

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, fuse, isLoading]);

  // Execute Search
  useEffect(() => {
    if (!fuse) return;

    if (query.trim() === "") {
      setResults([]);
    } else {
      const searchResults = fuse.search(query).map((result) => result.item);
      setResults(searchResults.slice(0, 8)); // Max 8 results to avoid overflow
    }
  }, [query, fuse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Palette */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">

        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 outline-none px-4 py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg w-full"
            placeholder="Artikel durchsuchen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <span className="text-xs text-slate-400 animate-pulse">Lade Index...</span>}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain pb-2">
          {query.trim() === "" ? (
            <div className="py-12 px-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <Command className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
              <p>Bereit etwas Neues zu lernen?</p>
              <p className="text-sm mt-1 opacity-70">Geben Sie einen Suchbegriff ein.</p>
            </div>
          ) : results.length > 0 ? (
            <ul className="px-2 pt-2">
              {results.map((result) => (
                <li key={result.slug}>
                  <a
                    href={`/KIWiki/articles/${result.slug}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 hover:text-blue-700 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 shadow-sm transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 overflow-hidden mb-0.5">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate">
                          {result.title}
                        </h4>

                        {result.difficulties && result.difficulties.length < 3 && (
                          <div className="flex gap-1 flex-shrink-0 scale-75 origin-right">
                            {DIFFICULTIES.map(
                              (level) =>
                                result.difficulties.includes(level) && (
                                  <span
                                    key={level}
                                    className={`badge badge-${level} w-5 h-5`}
                                    title={DIFFICULTY_LABELS[level]}
                                  >
                                    {DIFFICULTY_SHORT[level]}
                                  </span>
                                ),
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {result.category} • {result.description || "Keine Zusammenfassung"}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 px-6 text-center text-slate-500 dark:text-slate-400">
              <p>Keine Artikel gefunden für "<span className="font-medium text-slate-700 dark:text-slate-300">{query}</span>"</p>
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">Tab</kbd>
              <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">Enter</kbd>
              <span>auswählen</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-sans px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">Esc</kbd>
              <span>schließen</span>
            </span>
          </div>
          <div className="font-medium">KIWiki Search</div>
        </div>
      </div>
    </div>
  );
}
