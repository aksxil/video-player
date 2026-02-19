import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SkipRipple {
  id: number;
  side: "left" | "right";
  label: string;
}

interface SkipRippleOverlayProps {
  ripples: SkipRipple[];
}

const SkipRippleOverlay: React.FC<SkipRippleOverlayProps> = ({ ripples }) => (
  <AnimatePresence>
    {ripples.map((r) => (
      <motion.div
        key={r.id}
        className={`absolute top-1/2 -translate-y-1/2 size-[100px] rounded-full bg-white/15 flex items-center justify-center pointer-events-none z-20 ${
          r.side === "left" ? "left-[15%]" : "right-[15%]"
        }`}
        initial={{ opacity: 0.8, scale: 0.5 }}
        animate={{ opacity: 0, scale: 2 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}>
        <span className="text-base font-bold text-white drop-shadow-md">
          {r.label}
        </span>
      </motion.div>
    ))}
  </AnimatePresence>
);

export default React.memo(SkipRippleOverlay);
