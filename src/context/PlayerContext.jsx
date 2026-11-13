import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

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
  const hlsAudioRef = useRef(null);

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
      if (hlsAudioRef.current) {
        hlsAudioRef.current.destroy();
        hlsAudioRef.current = null;
      }
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  function playTrack(track) {
    if (!audioRef.current || (!track.audioUrl && !track.fileUrl)) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    if (hlsAudioRef.current) {
      hlsAudioRef.current.destroy();
      hlsAudioRef.current = null;
    }

    setCurrentTrack(track);
    setIsVisible(true);

    const audio = audioRef.current;
    audio.volume = volume;
    audio.muted = muted;

    const streamUrl = track.audioUrl || track.fileUrl;
    const directUrl = track.fileUrl || (track.audioUrl && !track.audioUrl.includes('.m3u8') ? track.audioUrl : null);

    if (streamUrl && streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hlsAudioRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().then(() => setIsPlaying(true)).catch(console.warn);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn("Audio HLS fatal error, cambiando a directo:", data);
            hls.destroy();
            hlsAudioRef.current = null;
            if (directUrl) {
              audio.src = directUrl;
              audio.play().then(() => setIsPlaying(true)).catch(console.warn);
            }
          }
        });
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = streamUrl;
        audio.play().then(() => setIsPlaying(true)).catch(console.warn);
      } else if (directUrl) {
        audio.src = directUrl;
        audio.play().then(() => setIsPlaying(true)).catch(console.warn);
      }
    } else {
      audio.src = directUrl || streamUrl;
      audio.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
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
    if (hlsAudioRef.current) {
      hlsAudioRef.current.destroy();
      hlsAudioRef.current = null;
    }
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
