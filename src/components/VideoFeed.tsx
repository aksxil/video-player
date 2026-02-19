import React, { useMemo, useState, useRef, useEffect } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { Search } from "lucide-react";
import { mockData } from "../data/mockData";
import VideoCard from "./VideoCard";
import { useVideoPlayer } from "../hooks/useVideoPlayer";

const chipClassName = (isActive: boolean) =>
  `shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 border ${
    isActive
      ? "bg-white text-bg-primary border-transparent font-semibold"
      : "bg-white/8 text-text-primary border-white/4 hover:bg-white/14"
  }`;

interface VideoFeedProps {
  searchQuery: string;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ searchQuery }) => {
  const { playVideo, status } = useVideoPlayer();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollParent, setScrollParent] = useState<HTMLElement | undefined>();

  const allVideos = useMemo(() => {
    let videos = mockData.categories.flatMap((cat) =>
      cat.contents.map((video) => ({
        ...video,
        category: cat.category,
      })),
    );

    if (selectedCategory) {
      videos = videos.filter((v) => v.category?.slug === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.category?.name.toLowerCase().includes(query),
      );
    }

    return videos;
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    let el = containerRef.current?.parentElement;
    while (el) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll") {
        setScrollParent(el);
        break;
      }
      el = el.parentElement;
    }
  }, []);

  useEffect(() => {
    scrollParent?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, searchQuery, scrollParent]);

  const hasMiniPlayer = status === "minimized";
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className={`px-3 transition-[padding-bottom] duration-300 ${hasMiniPlayer ? "pb-[84px]" : "pb-6"}`}>
      <div className="flex gap-2 overflow-x-auto py-3 px-4 -mx-3 mb-3 scrollbar-none bg-bg-primary sticky top-0 z-40 [-webkit-overflow-scrolling:touch]">
        <button
          className={chipClassName(selectedCategory === null)}
          aria-pressed={selectedCategory === null}
          onClick={() => setSelectedCategory(null)}>
          All
        </button>
        {mockData.categories.map((cat) => {
          const isActive = selectedCategory === cat.category.slug;
          return (
            <button
              key={cat.category.slug}
              className={chipClassName(isActive)}
              aria-pressed={isActive}
              onClick={() => setSelectedCategory(cat.category.slug)}>
              <img
                src={cat.category.iconUrl}
                alt=""
                className={`size-[18px] rounded-full object-cover ${isActive ? "invert" : ""}`}
                decoding="async"
              />
              {cat.category.name}
            </button>
          );
        })}
      </div>

      {isSearching && (
        <div className="px-1 pb-3 text-[13px] text-text-secondary">
          {allVideos.length} {allVideos.length === 1 ? "result" : "results"} for
          &ldquo;{searchQuery.trim()}&rdquo;
        </div>
      )}

      {allVideos.length > 0 && scrollParent ? (
        <VirtuosoGrid
          key={`${selectedCategory ?? "__all"}_${searchQuery.trim()}`}
          customScrollParent={scrollParent}
          totalCount={allVideos.length}
          overscan={200}
          listClassName="virtuoso-feed-grid"
          itemClassName="virtuoso-feed-item"
          itemContent={(index) => (
            <VideoCard video={allVideos[index]} onClick={playVideo} />
          )}
        />
      ) : allVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-text-secondary text-center">
          <Search size={40} className="mb-4 opacity-30" />
          <p className="text-[15px] font-medium">
            {isSearching
              ? `No videos found for "${searchQuery.trim()}"`
              : "No videos found in this category."}
          </p>
          {isSearching && (
            <p className="text-[13px] mt-1 opacity-60">
              Try a different search term or category
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default VideoFeed;
