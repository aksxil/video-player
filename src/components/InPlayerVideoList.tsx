import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { ChevronUp } from "lucide-react";
import { mockData } from "../data/mockData";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import type { Video } from "../types/video";
import LazyImage from "./LazyImage";

const COLLAPSED_HEIGHT = 72;
const EXPANDED_RATIO = 0.68;
const FALLBACK_EXPANDED_HEIGHT = 520;
const DRAG_OFFSET_THRESHOLD = 30;
const DRAG_VELOCITY_THRESHOLD = 150;

const InPlayerVideoList: React.FC = () => {
  const { currentVideo, playVideo, showCountdown, showControls } =
    useVideoPlayer();
  const [isExpanded, setIsExpanded] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const related = useMemo(() => {
    if (!currentVideo) return [];
    const categoryData = mockData.categories.find(
      (cat) => cat.category.slug === currentVideo.category?.slug,
    );
    if (!categoryData) return [];
    return categoryData.contents
      .filter((v) => v.slug !== currentVideo.slug)
      .map((v) => ({ ...v, category: categoryData.category }));
  }, [currentVideo]);

  useEffect(() => {
    setIsExpanded(false);
    virtuosoRef.current?.scrollTo({ top: 0 });
  }, [currentVideo?.slug]);

  useEffect(() => {
    if (showCountdown) setIsExpanded(false);
  }, [showCountdown]);

  const handleVideoClick = useCallback(
    (video: Video) => {
      playVideo(video);
    },
    [playVideo],
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldExpand =
        info.offset.y < -DRAG_OFFSET_THRESHOLD ||
        info.velocity.y < -DRAG_VELOCITY_THRESHOLD;
      const shouldCollapse =
        info.offset.y > DRAG_OFFSET_THRESHOLD ||
        info.velocity.y > DRAG_VELOCITY_THRESHOLD;

      if (shouldExpand && !isExpanded) setIsExpanded(true);
      else if (shouldCollapse && isExpanded) setIsExpanded(false);
    },
    [isExpanded],
  );

  const expandedHeight =
    typeof window !== "undefined"
      ? window.innerHeight * EXPANDED_RATIO
      : FALLBACK_EXPANDED_HEIGHT;

  if (!currentVideo) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute inset-0 bg-black/40 z-25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute left-0 right-0 bottom-0 z-30"
        initial={false}
        animate={{
          height: isExpanded ? expandedHeight : COLLAPSED_HEIGHT,
          y: !showControls && !isExpanded ? COLLAPSED_HEIGHT + 8 : 0,
          opacity: !showControls && !isExpanded ? 0 : 1,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onPointerDown={(e) => e.stopPropagation()}>
        <div
          className={`
            h-full flex flex-col overflow-hidden rounded-t-2xl
            border-t border-white/10 transition-[background,box-shadow] duration-300
            ${
              isExpanded
                ? "bg-bg-primary/97 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
                : "bg-bg-primary/90 backdrop-blur-xl shadow-[0_-2px_15px_rgba(0,0,0,0.3)]"
            }
          `}>
          <motion.div
            className="flex flex-col items-center pt-1.5 pb-1.5 px-4 cursor-grab active:cursor-grabbing shrink-0 select-none touch-none"
            role="button"
            aria-label="Toggle video list"
            aria-expanded={isExpanded}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
            onClick={() => setIsExpanded((prev) => !prev)}>
            <div className="w-9 h-[3px] bg-white/25 rounded-full mb-1.5 transition-colors duration-200 hover:bg-white/40" />

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-text-primary">
                  Up Next
                </h3>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentVideo.category?.slug}
                    className="text-[11px] bg-white/8 px-2.5 py-1 rounded-xl text-text-secondary font-medium border border-white/6"
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.9 }}
                    transition={{ duration: 0.2 }}>
                    {currentVideo.category?.name}
                  </motion.span>
                </AnimatePresence>

                <span className="text-[11px] text-text-secondary/60 tabular-nums">
                  {related.length}
                </span>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}>
                <ChevronUp size={18} className="text-text-secondary" />
              </motion.div>
            </div>
          </motion.div>

          {related.length > 0 ? (
            <Virtuoso
              ref={virtuosoRef}
              data={related}
              overscan={200}
              className="flex-1 min-h-0 px-2.5 pb-safe overscroll-y-contain [-webkit-overflow-scrolling:touch]"
              itemContent={(_index, video) => (
                <div className="py-px">
                  <VideoListItem video={video} onClick={handleVideoClick} />
                </div>
              )}
            />
          ) : (
            <div className="flex-1 py-12 text-center text-text-secondary text-sm">
              No more videos in this category.
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

interface VideoListItemProps {
  video: Video;
  onClick: (video: Video) => void;
}

const VideoListItem: React.FC<VideoListItemProps> = React.memo(
  ({ video, onClick }) => (
    <motion.div
      className="flex flex-row gap-3 p-1.5 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-white/6 active:bg-white/10 group"
      onClick={() => onClick(video)}
      whileTap={{ scale: 0.98 }}>
      <div className="w-[120px] min-w-[120px] sm:w-[150px] sm:min-w-[150px] aspect-video rounded-lg overflow-hidden bg-bg-secondary relative">
        <LazyImage
          src={video.thumbnailUrl}
          alt={video.title}
          className="[&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.05]"
          draggable={false}
        />

        <span className="absolute bottom-1 right-1 bg-black/80 text-white px-1.5 py-px rounded text-[10px] font-semibold tabular-nums tracking-wide leading-snug">
          {video.duration}
        </span>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <div className="size-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0f0f0f">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center min-w-0 gap-0.5">
        <h4 className="text-[13px] sm:text-sm font-medium leading-snug text-text-primary line-clamp-2 group-hover:text-white transition-colors duration-150">
          {video.title}
        </h4>
        <p className="text-[11px] text-text-secondary/70 flex items-center mt-0.5">
          {video.category?.name}
          <span className="mx-1.5 opacity-40">·</span>
          {video.duration}
        </p>
      </div>
    </motion.div>
  ),
);

VideoListItem.displayName = "VideoListItem";

export default InPlayerVideoList;
