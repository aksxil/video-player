import React, { useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import VideoPlayer from "./VideoPlayer";
import MiniPlayer from "./MiniPlayer";
import InPlayerVideoList from "./InPlayerVideoList";

const DRAG_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 400;
const DRAG_FEEDBACK_RANGE = 300;
const DRAG_RESET_DELAY_MS = 250;
const FALLBACK_VIEWPORT_HEIGHT = 800;
const MINIMIZE_OFFSET = 100;
const MINI_PLAYER_SLIDE = 80;

const PlayerOverlay: React.FC = () => {
  const {
    currentVideo,
    status,
    isPlaying,
    togglePlay,
    closePlayer,
    minimizePlayer,
    expandPlayer,
  } = useVideoPlayer();

  const dragProgress = useMotionValue(0);
  const playerScale = useTransform(dragProgress, [0, DRAG_FEEDBACK_RANGE], [1, 0.92]);
  const playerOpacity = useTransform(dragProgress, [0, DRAG_FEEDBACK_RANGE], [1, 0.4]);

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      dragProgress.set(Math.max(0, info.offset.y));
    },
    [dragProgress],
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (
        info.offset.y > DRAG_THRESHOLD ||
        info.velocity.y > VELOCITY_THRESHOLD
      ) {
        minimizePlayer();
        setTimeout(() => dragProgress.set(0), DRAG_RESET_DELAY_MS);
      } else {
        dragProgress.set(0);
      }
    },
    [minimizePlayer, dragProgress],
  );

  const handleTogglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      togglePlay();
    },
    [togglePlay],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      closePlayer();
    },
    [closePlayer],
  );

  const isOpen = !!currentVideo && status !== "closed";
  const isFullScreen = status === "full";
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : FALLBACK_VIEWPORT_HEIGHT;

  return (
    <AnimatePresence>
      {isOpen && currentVideo && (
        <motion.div
          key="player-overlay"
          className="fixed inset-0 pointer-events-none z-1000"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}>
          <motion.div
            className={`absolute inset-0 bg-bg-primary flex flex-col pointer-events-auto overflow-hidden will-change-transform ${
              !isFullScreen ? "pointer-events-none" : ""
            }`}
            initial={{ y: viewportHeight }}
            animate={{
              y: isFullScreen ? 0 : viewportHeight + MINIMIZE_OFFSET,
            }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            drag={isFullScreen ? "y" : false}
            dragConstraints={{ top: 0, bottom: viewportHeight }}
            dragElastic={0.2}
            dragDirectionLock
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}>
            <motion.div
              className="flex-1 min-h-0 z-20 bg-black origin-top"
              style={{
                scale: playerScale,
                opacity: playerOpacity,
              }}>
              <VideoPlayer />
            </motion.div>

            <InPlayerVideoList />
          </motion.div>

          <AnimatePresence>
            {status === "minimized" && (
              <motion.div
                key="mini-player"
                className="absolute bottom-0 left-0 right-0 pointer-events-auto will-change-transform"
                initial={{ y: MINI_PLAYER_SLIDE, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: MINI_PLAYER_SLIDE, opacity: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 260 }}>
                <MiniPlayer
                  video={currentVideo}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onClose={handleClose}
                  onExpand={expandPlayer}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerOverlay;
