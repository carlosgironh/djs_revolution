import React from 'react';
import { Play, Pause, Volume2, VolumeX, X, Disc } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatSecondsToTime } from '../../lib/panamaTime';

export function PersistentPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    isVisible,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    closePlayer
  } = usePlayer();

  if (!isVisible || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  }

  return (
    <div className="fixed bottom-[74px] md:bottom-5 left-3 right-3 sm:left-6 sm:right-6 md:left-1/2 md:-translate-x-1/2 md:max-w-3xl z-40 animate-in slide-in-from-bottom-5 duration-300 select-none">
      <div className="glass-panel rounded-[20px] p-2.5 sm:p-3 border-violet-500/35 bg-[#0b0e1a]/90 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.65)] flex items-center gap-3">
        
        {/* Cover + Info + Spinning Vinyl */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial sm:w-56">
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-dark-900 border border-white/10 shadow-md">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-violet-950/60 text-[#c4b5fd]">
                <Disc className="w-6 h-6 animate-spin-slow" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22d3ee] animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-[#f2f4fc] truncate">
              {currentTrack.title}
            </h5>
            <p className="text-[10px] text-[#c4b5fd] truncate font-medium">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Play/Pause + Progress Slider */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-white flex items-center justify-center shadow-glow-violet active:scale-90 transition-transform"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] text-[#8f96b3] tabular-nums font-mono">
            <span className="min-w-[30px] text-right">{formatSecondsToTime(currentTime)}</span>
            <div
              onClick={handleSeek}
              className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#22d3ee] rounded-full transition-all"
              />
            </div>
            <span className="min-w-[30px]">{formatSecondsToTime(duration)}</span>
          </div>
        </div>

        {/* Volume (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-white/10 rounded-lg accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Close button */}
        <button
          onClick={closePlayer}
          className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 active:scale-95"
          title="Cerrar reproductor"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
