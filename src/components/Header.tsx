import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Cast, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = React.memo(
  ({ searchQuery, onSearchChange }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isSearchOpen) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }, [isSearchOpen]);

    const openSearch = useCallback(() => setIsSearchOpen(true), []);
    const closeSearch = useCallback(() => {
      setIsSearchOpen(false);
      onSearchChange("");
    }, [onSearchChange]);

    const handleClear = useCallback(() => {
      onSearchChange("");
      inputRef.current?.focus();
    }, [onSearchChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") closeSearch();
      },
      [closeSearch]
    );

    return (
      <header className="bg-[#0f0f0f] backdrop-blur-md h-[56px] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 border-b border-[#272727]">
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div
              key="search-bar"
              className="flex items-center gap-3 w-full"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Search size={18} className="text-gray-400 shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search videos..."
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-gray-500 outline-none caret-red-500"
                aria-label="Search videos"
              />

              {searchQuery.length > 0 && (
                <button
                  onClick={handleClear}
                  className="size-8 flex items-center justify-center rounded-full hover:bg-[#272727] transition"
                  aria-label="Clear search"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}

              <button
                onClick={closeSearch}
                className="text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="header-default"
              className="flex items-center justify-between w-full"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Logo */}
              <div className="flex items-center text-xl font-bold tracking-tight">
                <span className="text-blue-600">Dino</span>
                <span className="text-white ml-1">Ventures Videos</span>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={openSearch}
                  className="size-9 flex items-center justify-center text-white rounded-full hover:bg-[#272727] transition"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>

                <button
                  className="hidden md:flex size-9 items-center justify-center text-white rounded-full hover:bg-[#272727] transition"
                  aria-label="Cast"
                >
                  <Cast size={20} />
                </button>

                <button
                  className="size-9 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white shadow-md"
                  aria-label="Profile"
                >
                  <User size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }
);

Header.displayName = "Header";

export default Header;
