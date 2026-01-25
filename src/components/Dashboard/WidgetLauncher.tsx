import React, { useState, memo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Cloud, Music, X, Play, Pause, Square, 
  Maximize2, Minimize2, Link as LinkIcon 
} from 'lucide-react';
import { useMusic } from '../../contexts/MusicContext';

type WidgetType = 'weather' | 'music' | null;

interface WidgetOption {
  id: WidgetType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * WidgetLauncher - Unified floating widget manager
 * Shows a menu on hover with available widgets
 * Only one widget can be open at a time
 * Music player has full functionality with YouTube playback
 */
export const WidgetLauncher: React.FC = memo(() => {
  const [activeWidget, setActiveWidget] = useState<WidgetType>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Music context for real playback
  const { currentVideoId, isVideoBackground, setVideoBackground } = useMusic();

  const widgets: WidgetOption[] = [
    {
      id: 'weather',
      label: 'Weather & Time',
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'music',
      label: 'Music Player',
      icon: <Music className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const handleWidgetSelect = (widgetId: WidgetType) => {
    if (activeWidget === widgetId) {
      setActiveWidget(null);
    } else {
      setActiveWidget(widgetId);
    }
    setShowMenu(false);
  };

  const closeWidget = () => {
    setActiveWidget(null);
  };

  // Handle escape key for fullscreen video
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoBackground) {
        setVideoBackground(false);
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isVideoBackground, setVideoBackground]);

  return (
    <>
      {/* Hidden YouTube Player - Keeps playing when widget is closed */}
      <HiddenAudioPlayer musicWidgetOpen={activeWidget === 'music'} />

      {/* Fullscreen Video Background */}
      <FullscreenVideoBackground />

      {/* Active Widget Display */}
      <AnimatePresence mode="wait">
        {activeWidget === 'weather' && (
          <motion.div
            key="weather"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <div className="relative">
              <button
                onClick={closeWidget}
                className="absolute -top-2 -right-2 z-50 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                title="Close widget"
              >
                <X className="w-3 h-3" />
              </button>
              <WeatherWidgetInline />
            </div>
          </motion.div>
        )}

        {activeWidget === 'music' && (
          <motion.div
            key="music"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <div className="relative">
              <button
                onClick={closeWidget}
                className="absolute -top-2 -right-2 z-50 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                title="Close widget"
              >
                <X className="w-3 h-3" />
              </button>
              <MusicPlayerInline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <div
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Widget Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[180px]"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 mb-1">
                Widgets
              </div>
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => handleWidgetSelect(widget.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeWidget === widget.id
                      ? 'bg-gradient-to-r ' + widget.color + ' text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    activeWidget === widget.id
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br ' + widget.color + ' text-white'
                  }`}>
                    {widget.icon}
                  </div>
                  <span className="text-sm font-medium">{widget.label}</span>
                  {activeWidget === widget.id && (
                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Launcher Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            activeWidget || currentVideoId
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              : 'bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 text-white'
          }`}
          title="Open widgets"
        >
          {activeWidget ? (
            widgets.find(w => w.id === activeWidget)?.icon
          ) : currentVideoId ? (
            <Music className="w-6 h-6" />
          ) : (
            <LayoutGrid className="w-6 h-6" />
          )}
        </motion.button>

        {/* Active indicator dot */}
        {(activeWidget || currentVideoId) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
          />
        )}
      </div>
    </>
  );
});

/**
 * Fullscreen Video Background Component
 */
const FullscreenVideoBackground: React.FC = () => {
  const { currentVideoId, currentTitle, isVideoBackground, setVideoBackground } = useMusic();

  if (!isVideoBackground || !currentVideoId) return null;

  return (
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

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setVideoBackground(false)}
        className="fixed top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 shadow-lg"
        title="Exit background video (Press ESC)"
      >
        <Minimize2 className="w-6 h-6" />
      </motion.button>

      {/* Now Playing Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed top-4 left-4 lg:left-72 z-50 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg max-w-sm shadow-lg"
      >
        <p className="text-xs text-purple-300 mb-1">🎵 Now Playing</p>
        <p className="text-sm text-white font-semibold line-clamp-1">{currentTitle}</p>
      </motion.div>
    </motion.div>
  );
};

/**
 * Hidden Audio Player - Keeps music playing when widget is closed
 * This iframe is always rendered when music is playing, even if the UI is hidden
 */
const HiddenAudioPlayer: React.FC<{ musicWidgetOpen: boolean }> = ({ musicWidgetOpen }) => {
  const { currentVideoId, isVideoBackground } = useMusic();

  // Don't render if:
  // - No video is playing
  // - Fullscreen is active (it has its own iframe)
  // - Music widget is open (it has its own visible iframe)
  if (!currentVideoId || isVideoBackground || musicWidgetOpen) return null;

  return (
    <div 
      className="fixed pointer-events-none" 
      style={{ 
        left: '-9999px', 
        top: '-9999px', 
        width: '1px', 
        height: '1px', 
        overflow: 'hidden' 
      }}
      aria-hidden="true"
    >
      <iframe
        width="1"
        height="1"
        src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&enablejsapi=1&playlist=${currentVideoId}`}
        title="Background audio player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

/**
 * Inline Weather Widget (non-fixed positioning)
 */
const WeatherWidgetInline: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [weather, setWeather] = useState<any>(null);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load saved weather
  React.useEffect(() => {
    const savedWeather = localStorage.getItem('weather_data');
    if (savedWeather) {
      try {
        setWeather(JSON.parse(savedWeather));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-xl p-4 w-72 shadow-2xl border border-gray-700">
      {/* Current Time */}
      <div className="text-center mb-4">
        <p className="text-gray-400 text-sm">Current Time</p>
        <p className="text-3xl font-bold text-white tracking-wider">{currentTime}</p>
      </div>

      <div className="border-t border-gray-700 pt-3">
        {weather ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weather.icon}</span>
              <div>
                <p className="text-white font-medium">{weather.temperature}°C</p>
                <p className="text-gray-400 text-xs">{weather.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">{weather.location}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-2">
            No location set
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Inline Music Player with REAL YouTube playback
 */
const MusicPlayerInline: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Use music context for REAL playback
  const {
    currentVideoId,
    currentTitle,
    isPaused,
    setCurrentTrack,
    setVideoBackground,
    togglePause,
    stopMusic,
  } = useMusic();

  // Study Music YouTube Videos
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
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      if (isPaused) {
        iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } else {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
    togglePause();
  }, [isPaused, togglePause]);

  return (
    <div className="bg-gradient-to-br from-purple-900 to-purple-800 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 w-80 shadow-2xl border border-purple-700/50 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-purple-300" />
        <span className="text-white font-medium">Study Music</span>
      </div>

      {/* Now Playing with Embedded Video */}
      {currentVideoId && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-2 bg-purple-900/40 rounded-lg border border-purple-500/20">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-purple-200">Now Playing</p>
              <p className="text-sm text-white font-medium truncate">{currentTitle}</p>
            </div>
            <button
              onClick={() => setVideoBackground(true)}
              className="text-purple-300 hover:text-white transition duration-200 p-1 ml-2"
              title="Show video in full screen background"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Embedded YouTube Player - This plays the actual audio! */}
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
      <div className="space-y-2 mb-4">
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
        <div className="p-2 bg-red-900/30 border border-red-500/30 rounded-lg mb-4">
          <p className="text-xs text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Library Toggle */}
      <motion.button
        onClick={() => setShowLibrary(!showLibrary)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-3 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-white rounded-lg text-xs font-medium transition-all duration-200 mb-3"
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
      <p className="text-xs text-purple-300/60 text-center mt-3">
        🎵 Paste any YouTube link or use library tracks
      </p>
    </div>
  );
};

WidgetLauncher.displayName = 'WidgetLauncher';
