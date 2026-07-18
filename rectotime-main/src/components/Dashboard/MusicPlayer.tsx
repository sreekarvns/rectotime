import React, { useState, useRef, useEffect } from 'react';
import { Play, Link as LinkIcon, Music, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPlayerProps {
  onClose?: () => void;
  onTrackChange?: (videoId: string | null, title: string) => void;
  hideUI?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose, onTrackChange, hideUI }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullscreenVideo, setShowFullscreenVideo] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Study Music YouTube Videos (Lo-fi, ambient, study music)
  const studyMusicLibrary = [
    { id: 'jfKfPfyJRdk', title: 'Lo-fi Hip Hop Radio - Beats to Relax/Study' },
    { id: 'MvZ7YW7IJHY', title: 'Deep Focus Music (8 Hours)' },
    { id: 'MRYY4yC7uFc', title: 'Ambient Music for Studying' },
    { id: 'lTRiuFIWV54', title: 'Coffee Shop Ambience & Jazz' },
    { id: 'rPjez8z61rI', title: 'Rain Sounds for Sleep' },
    { id: 'eKFTSSKCzWA', title: 'Fireplace & Rain Sounds' },
    { id: 'HuFYqnbVbzY', title: 'Piano Music for Studying' },
    { id: 'mMKxnJfCzZE', title: 'Lo-fi Beats Study Mix' },
  ];

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePlayTrack = (videoId: string, title: string) => {
    setCurrentVideoId(videoId);
    setCurrentTitle(title);
    setErrorMessage(null);
    onTrackChange?.(videoId, title);
  };

  const handleAddYouTubeUrl = () => {
    if (youtubeUrl.trim()) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        setCurrentVideoId(videoId);
        setCurrentTitle('Custom YouTube Track');
        setYoutubeUrl('');
        setErrorMessage(null);
        onTrackChange?.(videoId, 'Custom YouTube Track');
      } else {
        setErrorMessage('Invalid YouTube URL');
      }
    }
  };

  // Handle Escape key to close fullscreen video
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFullscreenVideo) {
        setShowFullscreenVideo(false);
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [showFullscreenVideo]);

  // If hideUI is true and music is playing, render nothing but keep the iframe
  if (hideUI && currentVideoId) {
    return (
      <div className="hidden">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 space-y-4 border border-purple-500/30 dark:border-purple-600/30 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-300" />
          <h4 className="font-semibold text-white text-sm">Study Music</h4>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition duration-200"
            title="Hide music player (music continues playing)"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* YouTube Player Embed */}
      {currentVideoId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-purple-900/40 rounded-lg border border-purple-500/20">
            <div>
              <p className="text-xs text-purple-200">Now Playing</p>
              <p className="text-sm text-white font-medium truncate">{currentTitle}</p>
            </div>
            <button
              onClick={() => setShowFullscreenVideo(true)}
              className="text-purple-300 hover:text-white transition duration-200 p-1"
              title="Show video in full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={iframeRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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

      {/* Full-screen Video Modal */}
      <AnimatePresence>
        {showFullscreenVideo && currentVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setShowFullscreenVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex flex-col"
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowFullscreenVideo(false)}
                className="absolute top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200"
                title="Exit full screen"
              >
                <Minimize2 className="w-6 h-6" />
              </motion.button>

              {/* Video Info Overlay */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg max-w-sm"
              >
                <p className="text-xs text-purple-300 mb-1">Now Playing</p>
                <p className="text-sm text-white font-semibold line-clamp-2">{currentTitle}</p>
              </motion.div>

              {/* YouTube Video - Full Screen */}
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&fs=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Info Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-white/60 text-xs"
              >
                Click anywhere or press Escape to exit
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
