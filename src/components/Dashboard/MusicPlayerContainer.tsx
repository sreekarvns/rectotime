import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Music, X, Play, Pause, Link as LinkIcon, Maximize2, Minimize2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../../contexts/MusicContext';

/**
 * Independent Music Player Container
 * Manages music player state separately from other widgets
 * Keeps the iframe alive even when UI is hidden
 */
export const MusicPlayerContainer: React.FC = () => {
  const [showPlayerUI, setShowPlayerUI] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hiddenIframeRef = useRef<HTMLIFrameElement>(null);

  // Use music context for shared state
  const {
    currentVideoId,
    currentTitle,
    isVideoBackground,
    isPaused,
    setCurrentTrack,
    setVideoBackground,
    togglePause,
    stopMusic,
  } = useMusic();

  // Study Music YouTube Videos (Lo-fi, ambient, study music)
  const studyMusicLibrary = [
    { id: 'jfKfPfyJRdk', title: 'Lofi Girl - Beats to Relax/Study' },
    { id: '5qap5aO4i9A', title: 'Lofi Hip Hop Mix' },
    { id: 'n61ULEU7CO0', title: 'Calm Piano Music 24/7' },
    { id: 'lTRiuFIWV54', title: 'Coffee Shop Ambience & Jazz' },
    { id: 'f02mOEt11OQ', title: 'Rain on Window Sleep Sounds' },
    { id: '3sL0omwElxw', title: 'Chillhop Essentials' },
    { id: '-FlxM_0S2lA', title: 'Relaxing Piano Music' },
    { id: 'kgx4WGK0oNU', title: 'Chillhop Radio - Jazzy Beats' },
  ];

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePlayTrack = useCallback((videoId: string, title: string) => {
    setCurrentTrack(videoId, title);
    setErrorMessage(null);
  }, [setCurrentTrack]);

  const handleAddYouTubeUrl = useCallback(() => {
    if (youtubeUrl.trim()) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        setCurrentTrack(videoId, 'Custom YouTube Track');
        setYoutubeUrl('');
        setErrorMessage(null);
      } else {
        setErrorMessage('Invalid YouTube URL');
      }
    }
  }, [youtubeUrl, setCurrentTrack]);

  const handleStop = useCallback(() => {
    stopMusic();
  }, [stopMusic]);

  const handleTogglePause = useCallback(() => {
    const iframe = iframeRef.current || hiddenIframeRef.current;
    if (iframe && iframe.contentWindow) {
      if (isPaused) {
        // Resume
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        // Pause
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
    togglePause();
  }, [isPaused, togglePause]);

  // Handle Escape key to close fullscreen video
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoBackground) {
        setVideoBackground(false);
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isVideoBackground, setVideoBackground]);

  const isPlaying = currentVideoId !== null;

  return (
    <>
      {/* Hidden YouTube Player - Always rendered when playing to keep music going */}
      {currentVideoId && !showPlayerUI && !isVideoBackground && (
        <div className="fixed -left-[9999px] -top-[9999px]" style={{ width: 1, height: 1, overflow: 'hidden' }}>
          <iframe
            ref={hiddenIframeRef}
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&enablejsapi=1&playlist=${currentVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Full Music Player UI */}
      <AnimatePresence>
        {showPlayerUI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-40 w-80"
          >
            <div className="bg-gradient-to-br from-purple-900/95 to-purple-800/95 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 space-y-4 border border-purple-500/30 dark:border-purple-600/30 backdrop-blur-sm shadow-2xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-300" />
                  <h4 className="font-semibold text-white text-sm">Study Music</h4>
                </div>
                <button
                  onClick={() => setShowPlayerUI(false)}
                  className="text-gray-400 hover:text-white transition duration-200"
                  title="Hide music player (music continues playing)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Now Playing with Video */}
              {currentVideoId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-purple-900/40 rounded-lg border border-purple-500/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-200">Now Playing</p>
                      <p className="text-sm text-white font-medium truncate">{currentTitle}</p>
                    </div>
                    <button
                      onClick={() => setVideoBackground(true)}
                      className="text-purple-300 hover:text-white transition duration-200 p-1 ml-2"
                      title="Show video in full screen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Embedded Video Player */}
                  <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      ref={iframeRef}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&enablejsapi=1&playlist=${currentVideoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleTogglePause}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm ${
                        isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={handleStop}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </motion.button>
                  </div>
                </div>
              )}

              {/* YouTube URL Input */}
              <div className="space-y-2">
                <label className="text-xs text-purple-200 flex items-center gap-2 font-medium">
                  <LinkIcon className="w-3.5 h-3.5" />
                  YouTube Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="youtube.com/watch?v=..."
                    className="flex-1 px-3 py-2 bg-purple-900/30 border border-purple-500/30 text-white rounded-lg text-xs placeholder-purple-300/50 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddYouTubeUrl();
                      }
                    }}
                  />
                  <motion.button
                    onClick={handleAddYouTubeUrl}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    Load
                  </motion.button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                  <p className="text-xs text-red-200">{errorMessage}</p>
                </div>
              )}

              {/* Library Toggle */}
              <motion.button
                onClick={() => setShowLibrary(!showLibrary)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-3 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-white rounded-lg text-xs font-medium transition-all duration-200"
              >
                {showLibrary ? '−' : '+'} Study Music Library
              </motion.button>

              {/* Music Library */}
              <AnimatePresence>
                {showLibrary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5 max-h-48 overflow-y-auto"
                  >
                    {studyMusicLibrary.map((track) => (
                      <motion.button
                        key={track.id}
                        onClick={() => handlePlayTrack(track.id, track.title)}
                        whileHover={{ x: 2 }}
                        className={`w-full p-2 rounded-lg text-left text-xs font-medium transition-all duration-200 ${
                          currentVideoId === track.id
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                            : 'bg-purple-900/20 text-purple-100 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {currentVideoId === track.id ? (
                            <Play className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <Music className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className="truncate">{track.title}</span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info */}
              <p className="text-xs text-purple-300/60 text-center">🎵 Paste any YouTube link or use library tracks</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Video Background - Plays behind dashboard */}
      <AnimatePresence>
        {isVideoBackground && currentVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0"
          >
            {/* YouTube Video - Full Screen Background */}
            <iframe
              className="w-full h-full object-cover"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&enablejsapi=1&playlist=${currentVideoId}&controls=0&showinfo=0&modestbranding=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Semi-transparent overlay for readability */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Close Button - Fixed position */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setVideoBackground(false)}
              className="fixed top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 shadow-lg"
              title="Exit background video"
            >
              <Minimize2 className="w-6 h-6" />
            </motion.button>

            {/* Now Playing Info - Top left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="fixed top-4 left-72 z-50 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg max-w-sm shadow-lg"
            >
              <p className="text-xs text-purple-300 mb-1">🎵 Now Playing</p>
              <p className="text-sm text-white font-semibold line-clamp-1">{currentTitle}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controls - Shows when music is playing but UI is hidden */}
      <AnimatePresence>
        {isPlaying && !showPlayerUI && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-20 right-4 z-50 flex gap-2"
          >
            {/* Show Music Button */}
            <motion.button
              onClick={() => setShowPlayerUI(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
              title="Show music player"
            >
              <Music className="w-6 h-6" />
            </motion.button>

            {/* Fullscreen Video Button */}
            <motion.button
              onClick={() => setVideoBackground(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
              title="Play video fullscreen"
            >
              <Maximize2 className="w-6 h-6" />
            </motion.button>

            {/* Pause/Resume Button */}
            <motion.button
              onClick={handleTogglePause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white ${
                isPaused 
                  ? 'bg-gradient-to-br from-green-600 to-green-700' 
                  : 'bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600'
              }`}
              title={isPaused ? 'Resume music' : 'Pause music'}
            >
              {isPaused ? (
                <Play className="w-6 h-6" />
              ) : (
                <Pause className="w-6 h-6" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Button - Always visible when not playing */}
      {!isPlaying && !showPlayerUI && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowPlayerUI(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
          title="Open music player"
        >
          <Music className="w-6 h-6" />
        </motion.button>
      )}
    </>
  );
};
