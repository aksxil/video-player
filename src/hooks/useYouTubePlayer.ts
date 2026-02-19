import { useEffect, useRef, useCallback, useState } from "react";

let apiReady = false;
let apiLoadingPromise: Promise<void> | null = null;
const readyCallbacks: Array<() => void> = [];

function ensureYouTubeApi(): Promise<void> {
  if (apiReady && window.YT?.Player) return Promise.resolve();
  if (apiLoadingPromise) return apiLoadingPromise;

  apiLoadingPromise = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      apiReady = true;
      resolve();
      return;
    }

    readyCallbacks.push(resolve);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      apiReady = true;
      prevCallback?.();
      readyCallbacks.forEach((cb) => cb());
      readyCallbacks.length = 0;
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return apiLoadingPromise;
}

const TIME_TRACKING_INTERVAL_MS = 250;

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

interface UseYouTubePlayerOptions {
  onEnded?: () => void;
  onReady?: () => void;
  onStateChange?: (state: number) => void;
}

export function useYouTubePlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  videoId: string,
  options: UseYouTubePlayerOptions = {},
) {
  const playerRef = useRef<YT.Player | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const destroyedRef = useRef(false);
  const initializedVideoRef = useRef<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<number>(YT_STATE.UNSTARTED);

  const onEndedRef = useRef(options.onEnded);
  const onReadyRef = useRef(options.onReady);
  const onStateChangeRef = useRef(options.onStateChange);
  onEndedRef.current = options.onEnded;
  onReadyRef.current = options.onReady;
  onStateChangeRef.current = options.onStateChange;

  const startTimeTracking = useCallback(() => {
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    timeIntervalRef.current = setInterval(() => {
      try {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      } catch (err) {
        console.warn("[YouTubePlayer] Time tracking failed:", err);
      }
    }, TIME_TRACKING_INTERVAL_MS);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    destroyedRef.current = false;
    let player: YT.Player | null = null;

    const init = async () => {
      await ensureYouTubeApi();
      if (destroyedRef.current || !containerRef.current) return;

      const playerDiv = document.createElement("div");
      playerDiv.id = `yt-player-${Date.now()}`;
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(playerDiv);

      player = new window.YT.Player(playerDiv.id, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          disablekb: 1,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (destroyedRef.current) return;
            const dur = event.target.getDuration();
            setDuration(dur);
            setIsReady(true);
            startTimeTracking();
            onReadyRef.current?.();
          },
          onStateChange: (event) => {
            if (destroyedRef.current) return;
            const state = event.data;
            setPlayerState(state);
            onStateChangeRef.current?.(state);

            if (state === YT_STATE.PLAYING) {
              startTimeTracking();
              setDuration(event.target.getDuration());
            } else if (state === YT_STATE.PAUSED) {
              stopTimeTracking();
            } else if (state === YT_STATE.ENDED) {
              stopTimeTracking();
              onEndedRef.current?.();
            }
          },
        },
      });

      playerRef.current = player;
      initializedVideoRef.current = videoId;
    };

    init();

    return () => {
      destroyedRef.current = true;
      stopTimeTracking();
      try {
        player?.destroy();
      } catch (err) {
        console.warn("[YouTubePlayer] Failed to destroy player:", err);
      }
      playerRef.current = null;
      initializedVideoRef.current = null;
      setIsReady(false);
      setPlayerState(YT_STATE.UNSTARTED);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      playerRef.current &&
      isReady &&
      initializedVideoRef.current &&
      videoId !== initializedVideoRef.current
    ) {
      playerRef.current.loadVideoById(videoId);
      initializedVideoRef.current = videoId;
      setCurrentTime(0);
      setDuration(0);
      startTimeTracking();
    }
  }, [videoId, isReady, startTimeTracking]);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch (err) {
      console.warn("[YouTubePlayer] Failed to play:", err);
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch (err) {
      console.warn("[YouTubePlayer] Failed to pause:", err);
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (err) {
      console.warn("[YouTubePlayer] Failed to seek:", err);
    }
  }, []);

  const skip = useCallback(
    (amount: number) => {
      try {
        if (playerRef.current?.getCurrentTime) {
          const now = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          const target = Math.max(0, Math.min(now + amount, dur));
          seekTo(target);
        }
      } catch (err) {
        console.warn("[YouTubePlayer] Failed to skip:", err);
      }
    },
    [seekTo],
  );

  return {
    player: playerRef,
    currentTime,
    duration,
    isReady,
    playerState,
    play,
    pause,
    seekTo,
    skip,
  };
}
