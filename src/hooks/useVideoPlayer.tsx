import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { Video } from "../types/video";
import { mockData } from "../data/mockData";

const COUNTDOWN_TOTAL_SECONDS = 3;
const COUNTDOWN_INTERVAL_MS = 1000;

export type PlayerStatus = "closed" | "full" | "minimized";

interface VideoContextType {
  currentVideo: Video | null;
  status: PlayerStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  showCountdown: boolean;
  countdownSeconds: number;
  showControls: boolean;

  playVideo: (video: Video) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  expandPlayer: () => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setShowControls: (show: boolean) => void;
  playNext: () => void;
  startCountdown: () => void;
  cancelCountdown: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("closed");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdownTimer = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const getNextVideo = useCallback((video: Video): Video | null => {
    const categoryData = mockData.categories.find(
      (cat) => cat.category.slug === video.category?.slug,
    );
    if (!categoryData) return null;

    const idx = categoryData.contents.findIndex((v) => v.slug === video.slug);
    const next = categoryData.contents[idx + 1] ?? categoryData.contents[0];
    if (!next || next.slug === video.slug) return null;
    return { ...next, category: categoryData.category };
  }, []);

  const playVideo = useCallback(
    (video: Video) => {
      clearCountdownTimer();
      setShowCountdown(false);
      setCurrentVideo(video);
      setStatus("full");
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
    },
    [clearCountdownTimer],
  );

  const closePlayer = useCallback(() => {
    clearCountdownTimer();
    setShowCountdown(false);
    setCurrentVideo(null);
    setStatus("closed");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [clearCountdownTimer]);

  const minimizePlayer = useCallback(() => {
    setStatus("minimized");
  }, []);

  const expandPlayer = useCallback(() => {
    setStatus((prev) => (prev === "minimized" ? "full" : prev));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (!currentVideo) return;
    const next = getNextVideo(currentVideo);
    if (next) {
      playVideo(next);
    }
  }, [currentVideo, getNextVideo, playVideo]);

  const startCountdown = useCallback(() => {
    clearCountdownTimer();
    setShowCountdown(true);
    setCountdownSeconds(COUNTDOWN_TOTAL_SECONDS);

    countdownRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearCountdownTimer();
          setShowCountdown(false);
          if (currentVideo) {
            const next = getNextVideo(currentVideo);
            if (next) {
              setTimeout(() => playVideo(next), 0);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, COUNTDOWN_INTERVAL_MS);
  }, [clearCountdownTimer, currentVideo, getNextVideo, playVideo]);

  const cancelCountdown = useCallback(() => {
    clearCountdownTimer();
    setShowCountdown(false);
    setCountdownSeconds(0);
  }, [clearCountdownTimer]);

  useEffect(() => {
    return () => clearCountdownTimer();
  }, [clearCountdownTimer]);

  const value = useMemo<VideoContextType>(
    () => ({
      currentVideo,
      status,
      isPlaying,
      currentTime,
      duration,
      showCountdown,
      countdownSeconds,
      showControls,
      playVideo,
      closePlayer,
      minimizePlayer,
      expandPlayer,
      togglePlay,
      setIsPlaying,
      setCurrentTime,
      setDuration,
      setShowControls,
      playNext,
      startCountdown,
      cancelCountdown,
    }),
    [
      currentVideo,
      status,
      isPlaying,
      currentTime,
      duration,
      showCountdown,
      countdownSeconds,
      showControls,
      playVideo,
      closePlayer,
      minimizePlayer,
      expandPlayer,
      togglePlay,
      setIsPlaying,
      setCurrentTime,
      setDuration,
      setShowControls,
      playNext,
      startCountdown,
      cancelCountdown,
    ],
  );

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVideoPlayer = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideoPlayer must be used within a VideoProvider");
  }
  return context;
};
