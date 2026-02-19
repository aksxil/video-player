import React from "react";

interface SeekBarProps {
  progress: number;
  bufferedPct: number;
  currentTime: string;
  duration: string;
  onSeekStart: () => void;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekEnd: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SeekBar: React.FC<SeekBarProps> = ({
  progress,
  bufferedPct,
  currentTime,
  duration,
  onSeekStart,
  onSeekChange,
  onSeekEnd,
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="relative w-full h-5 flex items-center cursor-pointer group">
      <div className="absolute w-full h-[3px] bg-white/20 rounded-sm overflow-hidden transition-[height] duration-150 group-hover:h-[5px]">
        <div
          className="absolute h-full bg-white/30 rounded-sm"
          style={{ width: `${bufferedPct}%` }}
        />
        <div
          className="absolute h-full bg-accent rounded-sm transition-[width] duration-100 linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        aria-label="Seek video position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        onMouseDown={onSeekStart}
        onTouchStart={onSeekStart}
        onChange={onSeekChange}
        onMouseUp={onSeekEnd as unknown as React.MouseEventHandler}
        onTouchEnd={onSeekEnd as unknown as React.TouchEventHandler}
        className="seek-input absolute w-full h-full opacity-0 cursor-pointer appearance-none m-0 z-2"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
    <div className="text-white/90 text-xs font-medium tabular-nums flex gap-0.5">
      <span>{currentTime}</span>
      <span className="opacity-50 mx-0.5">/</span>
      <span>{duration}</span>
    </div>
  </div>
);

export default React.memo(SeekBar);
