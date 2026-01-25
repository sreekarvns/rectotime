import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MusicContextType {
  currentVideoId: string | null;
  currentTitle: string;
  isVideoBackground: boolean;
  isPaused: boolean;
  setCurrentTrack: (videoId: string | null, title: string) => void;
  setVideoBackground: (value: boolean) => void;
  togglePause: () => void;
  stopMusic: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [isVideoBackground, setIsVideoBackground] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const setCurrentTrack = useCallback((videoId: string | null, title: string) => {
    setCurrentVideoId(videoId);
    setCurrentTitle(title);
    if (videoId) {
      setIsPaused(false);
    }
  }, []);

  const setVideoBackground = useCallback((value: boolean) => {
    setIsVideoBackground(value);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const stopMusic = useCallback(() => {
    setCurrentVideoId(null);
    setCurrentTitle('');
    setIsPaused(false);
    setIsVideoBackground(false);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        currentVideoId,
        currentTitle,
        isVideoBackground,
        isPaused,
        setCurrentTrack,
        setVideoBackground,
        togglePause,
        stopMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
