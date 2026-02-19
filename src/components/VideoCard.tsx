import React from "react";
import { motion } from "framer-motion";
import type { Video } from "../types/video";
import LazyImage from "./LazyImage";

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  horizontal?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = React.memo(
  ({ video, onClick, horizontal }) => {
    if (horizontal) {
      return (
        <motion.div
          className="flex flex-row gap-3 mb-3 p-1.5 rounded-[10px] cursor-pointer transition-colors duration-150 hover:bg-white/4"
          onClick={() => onClick(video)}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}>
          <div className="w-40 min-w-40 sm:w-[180px] sm:min-w-[180px] aspect-video rounded-lg overflow-hidden bg-bg-secondary relative">
            <LazyImage
              src={video.thumbnailUrl}
              alt={video.title}
              className="[&_img]:transition-transform [&_img]:duration-300"
              draggable={false}
            />
            <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums tracking-wide leading-snug">
              {video.duration}
            </span>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <h3 className="text-[13px] sm:text-sm font-medium leading-snug mb-0.5 text-text-primary line-clamp-2">
              {video.title}
            </h3>
            <p className="text-xs text-text-secondary flex items-center flex-wrap mt-1">
              {video.category?.name}
              <span className="mx-[5px] opacity-50">·</span>
              {video.duration}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="flex flex-col rounded-xl overflow-hidden cursor-pointer transition-transform duration-150 group"
        onClick={() => onClick(video)}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-bg-secondary relative">
          <LazyImage
            src={video.thumbnailUrl}
            alt={video.title}
            className="[&_img]:transition-[transform,opacity] [&_img]:duration-300 group-hover:[&_img]:scale-[1.03]"
            draggable={false}
          />
          <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums tracking-wide leading-snug">
            {video.duration}
          </span>
          {video.category && (
            <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-[3px] rounded text-[10px] font-semibold uppercase tracking-wider border border-white/8">
              {video.category.name}
            </span>
          )}
        </div>

        <div className="flex py-2.5 px-0.5 gap-3 h-[68px]">
          <div className="size-9 min-w-9 rounded-full overflow-hidden bg-bg-tertiary shrink-0">
            <LazyImage
              src={video.category?.iconUrl ?? ""}
              alt={video.category?.name ?? ""}
              className="[&_img]:object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-medium leading-snug mb-0.5 text-text-primary line-clamp-2">
              {video.title}
            </h3>
            <p className="text-[13px] text-text-secondary flex items-center flex-wrap">
              {video.category?.name}
              <span className="mx-[5px] opacity-50">·</span>
              {video.duration}
            </p>
          </div>
        </div>
      </motion.div>
    );
  },
);

VideoCard.displayName = "VideoCard";

export default VideoCard;
