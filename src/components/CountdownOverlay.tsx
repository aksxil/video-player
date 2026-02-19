import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward } from "lucide-react";

const COUNTDOWN_TOTAL = 3;
const CIRCLE_CIRCUMFERENCE = 125.6;

interface CountdownOverlayProps {
  visible: boolean;
  seconds: number;
  onCancel: () => void;
  onPlayNow: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  visible,
  seconds,
  onCancel,
  onPlayNow,
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <div className="flex flex-col items-center gap-3">
          <SkipForward size={40} />
          <h3 className="text-xl font-semibold">Up Next</h3>
          <div className="relative size-16">
            <svg viewBox="0 0 48 48" className="w-full h-full">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeDasharray={`${(1 - seconds / COUNTDOWN_TOTAL) * CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                className="transition-[stroke-dasharray] duration-400 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              {seconds}
            </span>
          </div>
          <div className="flex gap-3 mt-1">
            <button
              className="px-5 py-2 rounded-[20px] font-semibold text-sm bg-white/15 text-white transition-colors duration-200 hover:bg-white/25 active:scale-95"
              aria-label="Cancel autoplay"
              onClick={onCancel}>
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-[20px] font-semibold text-sm bg-accent text-white transition-colors duration-200 hover:bg-accent-hover active:scale-95"
              aria-label="Play next video now"
              onClick={onPlayNow}>
              Play Now
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default React.memo(CountdownOverlay);
