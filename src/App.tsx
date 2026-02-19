import { useState, useCallback } from "react";
import { VideoProvider } from "./hooks/useVideoPlayer";
import Header from "./components/Header";
import VideoFeed from "./components/VideoFeed";
import PlayerOverlay from "./components/PlayerOverlay";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <VideoProvider>
      <div className="flex flex-col h-dvh relative overflow-hidden">
        <Header searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <main className="flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <VideoFeed searchQuery={searchQuery} />
        </main>
        <PlayerOverlay />
      </div>
    </VideoProvider>
  );
}

export default App;
