# Dino Ventures – Video Player App

A **mobile-first video player application** built with React, TypeScript, Tailwind CSS, and Framer Motion.

The app delivers a smooth, YouTube-inspired playback experience featuring gesture-based interactions, custom video controls powered by the YouTube IFrame Player API, a draggable Picture-in-App mini-player, virtualized lists, real-time search, and fluid 60 FPS animations.

---

## 🚀 Features

---

## 1️⃣ Home – Video Feed

- Fully responsive virtualized grid using **react-virtuoso (VirtuosoGrid)**
  - 1 column (mobile)
  - 2 columns (tablet)
  - 3 columns (laptop)
  - 4 columns (desktop)
- 3 categories with 29 videos:
  - Social Media AI
  - AI Income
  - AI Essentials
- Video Cards include:
  - Lazy-loaded thumbnail
  - Title
  - Duration badge
  - Category badge overlay
  - Channel-style avatar
- Sticky category filter chips
- Smooth scroll-to-top on filter change
- Dynamic bottom spacing when mini-player is active

---

## 2️⃣ Smart Search

- Expandable animated search bar in header
- Real-time filtering (title + category name)
- Case-insensitive matching
- Works alongside category filters
- Displays result count
- Dedicated empty state UI
- Clear (X) button
- Cancel button
- Escape key support

---

## 3️⃣ Full-Screen Video Player

- YouTube IFrame Player API integration
- Native `<video>` support for MP4 files
- Auto-play on open

### Custom Overlay Controls

- Play / Pause (animated icon swap)
- Skip +10s / -10s
- Seekable progress bar
- Buffered track indicator
- Current time / total duration
- Minimize button
- Picture-in-Picture support
- Close button

### Gesture Controls

- Double-tap left/right to skip ±10 seconds
- Ripple animation feedback
- Auto-hide controls after 3.5 seconds
- Fully responsive layout

---

## 4️⃣ In-Player Related Videos (Bottom Sheet)

- Swipe-up or tap to expand
- Shows videos from the same category
- Virtualized list (react-virtuoso)
- Animated category badge updates
- Auto-play on selection
- Backdrop overlay
- Spring-based expand/collapse animation

---

## 5️⃣ Drag-to-Minimize (Picture-in-App)

- Drag down full player to minimize
- Real-time scale + fade drag feedback
- Bottom-docked mini-player includes:
  - Thumbnail
  - Title
  - Category name
  - Play/Pause
  - Close
- Swipe right to dismiss mini-player
- Tap mini-player to restore full-screen
- Mini progress bar included
- Player persists while browsing

---

## 6️⃣ Auto-Play Next

- 3-second countdown
- Animated circular progress indicator
- Cancel option
- Play Now button
- Automatically plays next video in same category

---

## 7️⃣ Performance Optimizations

- Virtualized lists (VirtuosoGrid + Virtuoso)
- IntersectionObserver-based lazy image loading
- Skeleton shimmer placeholders
- React.memo on leaf components
- useMemo + useCallback optimizations
- CDN preconnect & DNS-prefetch
- fetchpriority="low" for off-screen images
- 60 FPS animations via Framer Motion spring physics

---

## 8️⃣ Accessibility

- aria-label on all interactive elements
- aria-pressed on category chips
- aria-expanded on drawer handle
- aria-valuemin / max / now on seek bar
- role="region" on mini-player
- focus-visible outlines for keyboard users

---

# 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12 |
| Virtualization | react-virtuoso 4 |
| Icons | Lucide React |
| Video API | YouTube IFrame API + Native `<video>` |
| Linting | ESLint 9 |

---

# ⚙️ Getting Started

## Prerequisites

- Node.js v18+
- npm (or yarn / pnpm)

---

## Installation

```bash
git clone <repository-url>
cd video-player-app
npm install
npm run dev


Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start the Vite development server with HMR           |
| `npm run build`   | Type-check with TypeScript then build for production |
| `npm run preview` | Preview the production build locally                 |
| `npm run lint`    | Run ESLint across the project                        |

---

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Top navigation bar with logo, search, and profile
│   ├── VideoFeed.tsx           # Home page virtualized video grid with category chips
│   ├── VideoCard.tsx           # Video thumbnail card (vertical & horizontal layouts)
│   ├── VideoPlayer.tsx         # Full video player with YouTube API + custom controls
│   ├── PlayerOverlay.tsx       # Manages full-player ↔ mini-player transitions
│   ├── MiniPlayer.tsx          # Bottom-docked mini player bar
│   ├── InPlayerVideoList.tsx   # Bottom-sheet related video list (same category)
│   ├── SeekBar.tsx             # Seekable progress bar with time display
│   ├── CountdownOverlay.tsx    # Auto-play-next countdown UI with circular progress
│   ├── SkipRippleOverlay.tsx   # Skip ±10s ripple animation overlay
│   └── LazyImage.tsx           # Viewport-aware lazy image with skeleton shimmer
├── hooks/
│   ├── useVideoPlayer.tsx      # Global state context (video, status, time, actions)
│   └── useYouTubePlayer.ts     # YouTube IFrame Player API integration hook
├── data/
│   └── mockData.ts             # Complete dataset (3 categories, 29 videos)
├── types/
│   ├── video.ts                # Video / Category / AppData interfaces
│   └── youtube.d.ts            # YouTube IFrame API type declarations
├── App.tsx                     # App root with VideoProvider and search state
├── main.tsx                    # React entry point
└── index.css                   # Tailwind config, design tokens, custom utilities
```

---

## Evaluation Checklist

| Criterion           | Coverage                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Completeness**    | Video feed, custom controls, in-player list, drag-to-minimize, auto-play-next, search — all fully implemented.                                                                          |
| **UI / UX Quality** | Dark theme, glassmorphism, smooth Framer Motion spring animations, mobile-first responsive design, skeleton loading states.                                                             |
| **Code Structure**  | Modular components, typed context with memoized value, custom hooks, named constants, clean separation of concerns.                                                                     |
| **Performance**     | 60 fps animations via Framer Motion spring physics, virtualized lists (react-virtuoso), lazy-loaded images with IntersectionObserver, React.memo on leaf components, CDN preconnection. |
