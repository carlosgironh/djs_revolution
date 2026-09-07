import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext({});

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  function playTrack(track) {
    if (!audioRef.current || !track.audioUrl) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    setIsVisible(true);
    audioRef.current.src = track.audioUrl;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn("Autoplay bloqueado o error al reproducir:", err);
    });
  }

  function togglePlay() {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.warn);
    }
  }

  function seek(seconds) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  function setVolume(val) {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;
    const nextMuted = !muted;
    setMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  }

  function closePlayer() {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsVisible(false);
    setCurrentTrack(null);
  }

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      isVisible,
      playTrack,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      closePlayer
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
