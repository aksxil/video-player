import React from "react";
import { Play, Pause, X } from "lucide-react";
import { motion, type PanInfo } from "framer-motion";
import type { Video } from "../types/video";
import { useVideoPlayer } from "../hooks/useVideoPlayer";

const SWIPE_OFFSET_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface MiniPlayerProps {
  video: Video;
  isPlaying: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent) => void;
  onExpand: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = React.memo(({
  video,
  isPlaying,
  onTogglePlay,
  onClose,
  onExpand,
}) => {
  const { currentTime, duration, closePlayer } = useVideoPlayer();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.offset.x > SWIPE_OFFSET_THRESHOLD ||
      info.velocity.x > SWIPE_VELOCITY_THRESHOLD
    ) {
      closePlayer();
    }
  };

  return (
    <motion.div
      role="region"
      aria-label="Mini player"
      className="glass relative bottom-[env(safe-area-inset-bottom,0px)] left-0 right-0 h-[68px] cursor-pointer overflow-hidden border-t border-white/6 transition-colors duration-200"
      onClick={onExpand}
      whileHover={{ backgroundColor: "rgba(40, 40, 40, 0.9)" }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.15}
      onDragEnd={handleDragEnd}
      dragDirectionLock>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/8">
        <div
          className="h-full bg-accent transition-[width] duration-300 linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center px-3 gap-3 h-full">
        <div className="w-28 min-w-28 h-14 rounded-md overflow-hidden bg-black shrink-0">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-[13px] font-medium text-white leading-snug line-clamp-1">
            {video.title}
          </div>
          <div className="text-[11px] text-text-secondary line-clamp-1">
            {video.category?.name}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            className="size-10 flex items-center justify-center text-white rounded-full transition-colors duration-150 hover:bg-white/10 active:bg-white/15 active:scale-[0.92]"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>
          <button
            className="size-10 flex items-center justify-center text-white rounded-full transition-colors duration-150 hover:bg-white/10 active:bg-white/15 active:scale-[0.92]"
            onClick={onClose}
            aria-label="Close">
            <X size={22} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

MiniPlayer.displayName = "MiniPlayer";

export default MiniPlayer;
