import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  FastForward,
  Rewind,
  X,
  ChevronDown,
  PictureInPicture2,
} from "lucide-react";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import { useYouTubePlayer, YT_STATE } from "../hooks/useYouTubePlayer";
import type { Video } from "../types/video";
import SeekBar from "./SeekBar";
import CountdownOverlay from "./CountdownOverlay";
import SkipRippleOverlay from "./SkipRippleOverlay";
import type { SkipRipple } from "./SkipRippleOverlay";

const CONTROLS_HIDE_DELAY_MS = 3500;
const RIPPLE_TIMEOUT_MS = 700;
const DOUBLE_TAP_THRESHOLD_MS = 350;
const SKIP_SECONDS = 10;

function extractYouTubeId(video: Video): string | null {
  if (video.mediaType !== "YOUTUBE") return null;
  const clean = video.slug.split("?")[0];
  if (clean) return clean;
  const match = video.mediaUrl.match(/\/embed\/([^?/]+)/);
  return match?.[1] ?? null;
}

function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

const VideoPlayer: React.FC = () => {
  const {
    currentVideo,
    isPlaying,
    togglePlay,
    closePlayer,
    minimizePlayer,
    setIsPlaying,
    setCurrentTime: setGlobalTime,
    setDuration: setGlobalDuration,
    showCountdown,
    countdownSeconds,
    startCountdown,
    cancelCountdown,
    playNext,
    showControls,
    setShowControls,
  } = useVideoPlayer();

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [seekOverride, setSeekOverride] = useState<number | null>(null);
  const [skipRipples, setSkipRipples] = useState<SkipRipple[]>([]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [nativeTime, setNativeTime] = useState(0);
  const [nativeDuration, setNativeDuration] = useState(0);
  const rippleIdRef = useRef(0);

  const video = currentVideo;
  const isYouTube = video?.mediaType === "YOUTUBE";
  const ytVideoId = video ? extractYouTubeId(video) : null;

  const {
    currentTime: ytTime,
    duration: ytDuration,
    playerState,
    play: ytPlay,
    pause: ytPause,
    seekTo: ytSeekTo,
    skip: ytSkip,
  } = useYouTubePlayer(ytContainerRef, ytVideoId ?? "", {
    onEnded: () => startCountdown(),
    onStateChange: (state) => {
      if (state === YT_STATE.PLAYING) setIsPlaying(true);
      else if (state === YT_STATE.PAUSED) setIsPlaying(false);
    },
  });

  useEffect(() => {
    if (isYouTube) {
      setGlobalTime(ytTime);
    }
  }, [isYouTube, ytTime, setGlobalTime]);

  useEffect(() => {
    if (isYouTube && ytDuration > 0) {
      setGlobalDuration(ytDuration);
    }
  }, [isYouTube, ytDuration, setGlobalDuration]);

  const duration = isYouTube ? ytDuration : nativeDuration;
  const currentTime = isYouTube ? ytTime : nativeTime;

  const localProgress = useMemo(() => {
    if (isSeeking && seekOverride !== null) return seekOverride;
    if (duration > 0) return (currentTime / duration) * 100;
    return 0;
  }, [currentTime, duration, isSeeking, seekOverride]);

  useEffect(() => {
    if (!isYouTube) return;
    if (isPlaying && playerState !== YT_STATE.PLAYING) {
      ytPlay();
    } else if (!isPlaying && playerState === YT_STATE.PLAYING) {
      ytPause();
    }
  }, [isPlaying, isYouTube, playerState, ytPlay, ytPause]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || isYouTube) return;
    if (isPlaying) el.play().catch((err) => console.warn('[VideoPlayer] Native play failed:', err));
    else el.pause();
  }, [isPlaying, isYouTube, video]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(
      () => setShowControls(false),
      CONTROLS_HIDE_DELAY_MS,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleSkip = useCallback(
    (amount: number) => {
      if (isYouTube) {
        ytSkip(amount);
      } else if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          Math.min(
            videoRef.current.currentTime + amount,
            videoRef.current.duration,
          ),
        );
      }
      resetControlsTimer();

      const id = ++rippleIdRef.current;
      const ripple: SkipRipple = {
        id,
        side: amount > 0 ? "right" : "left",
        label: amount > 0 ? `+${amount}s` : `${amount}s`,
      };
      setSkipRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setSkipRipples((prev) => prev.filter((r) => r.id !== id));
      }, RIPPLE_TIMEOUT_MS);
    },
    [isYouTube, ytSkip, resetControlsTimer],
  );

  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekOverride(parseFloat(e.target.value));
  };
  const handleSeekEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const time = (pct / 100) * duration;
    if (isYouTube) {
      ytSeekTo(time);
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setIsSeeking(false);
    setSeekOverride(null);
    resetControlsTimer();
  };

  const handleNativeTimeUpdate = () => {
    if (videoRef.current && !isYouTube) {
      const t = videoRef.current.currentTime;
      setNativeTime(t);
      setGlobalTime(t);
    }
  };

  const handleNativeLoaded = () => {
    if (videoRef.current && !isYouTube) {
      const d = videoRef.current.duration;
      setNativeDuration(d);
      setGlobalDuration(d);
    }
  };

  const handleNativeEnded = () => {
    if (!isYouTube) startCountdown();
  };

  const handlePiP = useCallback(async () => {
    try {
      if (isYouTube) return;
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.warn('[VideoPlayer] PiP request failed:', err);
    }
  }, [isYouTube]);

  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const handlePlayerTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const now = Date.now();
      const clientX =
        "touches" in e
          ? (e.changedTouches[0]?.clientX ?? 0)
          : (e as React.MouseEvent).clientX;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const relX = clientX - rect.left;
      const isLeft = relX < rect.width / 3;
      const isRight = relX > (rect.width * 2) / 3;

      if (
        now - lastTapRef.current.time < DOUBLE_TAP_THRESHOLD_MS &&
        (isLeft || isRight)
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleSkip(isLeft ? -SKIP_SECONDS : SKIP_SECONDS);
      } else {
        resetControlsTimer();
      }
      lastTapRef.current = { time: now, x: clientX };
    },
    [handleSkip, resetControlsTimer],
  );

  if (!video) return null;

  const seekBarProgress = localProgress || 0;
  const bufferedPct = 0;

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden select-none"
      onClick={handlePlayerTap}
      onMouseMove={resetControlsTimer}>
      {isYouTube ? (
        <div
          ref={ytContainerRef}
          className="w-full h-full object-contain block pointer-events-none yt-frame"
        />
      ) : (
        <video
          ref={videoRef}
          src={video.mediaUrl}
          className="w-full h-full object-contain block"
          onTimeUpdate={handleNativeTimeUpdate}
          onLoadedMetadata={handleNativeLoaded}
          onEnded={handleNativeEnded}
          autoPlay
          playsInline
        />
      )}

      <SkipRippleOverlay ripples={skipRipples} />

      <CountdownOverlay
        visible={showCountdown}
        seconds={countdownSeconds}
        onCancel={cancelCountdown}
        onPlayNow={playNext}
      />

      <div
        className={`absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_30%,transparent_60%,rgba(0,0,0,0.7)_100%)] flex flex-col justify-between pt-3 px-4 pb-player-controls transition-opacity duration-300 z-10 ${
          showControls && !showCountdown
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}>
        <div className="flex items-center gap-2 text-white">
          <button
            className="flex flex-col items-center gap-0.5 text-white p-2 rounded-full transition-colors duration-200 hover:bg-white/10"
            aria-label="Minimize player"
            onClick={(e) => {
              e.stopPropagation();
              minimizePlayer();
            }}>
            <ChevronDown size={28} />
          </button>
          <div className="flex-1 mx-1 text-[15px] font-medium text-center line-clamp-1 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            {video.title}
          </div>
          <div className="flex items-center gap-1">
            {!isYouTube && document.pictureInPictureEnabled && (
              <button
                className="flex items-center justify-center text-white p-2 rounded-full transition-colors duration-200 hover:bg-white/10"
                aria-label="Picture in Picture"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePiP();
                }}>
                <PictureInPicture2 size={22} />
              </button>
            )}
            <button
              className="flex items-center justify-center text-white p-2 rounded-full transition-colors duration-200 hover:bg-white/10"
              aria-label="Close player"
              onClick={(e) => {
                e.stopPropagation();
                closePlayer();
              }}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 md:gap-16 text-white">
          <motion.button
            className="relative flex flex-col items-center gap-0.5 text-white p-2 rounded-full transition-colors duration-200 hover:bg-white/10"
            aria-label={`Rewind ${SKIP_SECONDS} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip(-SKIP_SECONDS);
            }}
            whileTap={{ scale: 0.75, rotate: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <Rewind size={32} fill="currentColor" />
            <span className="text-[11px] font-bold -tracking-wide">
              {SKIP_SECONDS}
            </span>
          </motion.button>

          <motion.button
            className="bg-white/15 backdrop-blur-sm rounded-full size-[72px] md:size-20 flex items-center justify-center text-white border-2 border-white/20 transition-colors duration-200 hover:bg-white/25"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              resetControlsTimer();
            }}
            whileTap={{ scale: 0.9 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {isPlaying ? (
                  <Pause size={40} fill="currentColor" />
                ) : (
                  <Play size={40} fill="currentColor" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <motion.button
            className="relative flex flex-col items-center gap-0.5 text-white p-2 rounded-full transition-colors duration-200 hover:bg-white/10"
            aria-label={`Forward ${SKIP_SECONDS} seconds`}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip(SKIP_SECONDS);
            }}
            whileTap={{ scale: 0.75, rotate: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <FastForward size={32} fill="currentColor" />
            <span className="text-[11px] font-bold -tracking-wide">
              {SKIP_SECONDS}
            </span>
          </motion.button>
        </div>

        <SeekBar
          progress={seekBarProgress}
          bufferedPct={bufferedPct}
          currentTime={formatTime(currentTime)}
          duration={formatTime(duration)}
          onSeekStart={handleSeekStart}
          onSeekChange={handleSeekChange}
          onSeekEnd={handleSeekEnd}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
