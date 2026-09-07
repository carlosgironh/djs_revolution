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
    <div className="fixed bottom-[72px] md:bottom-4 left-3 right-3 sm:left-6 sm:right-6 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-40 animate-in slide-in-from-bottom-5 duration-300 select-none">
      <div className="glass-panel rounded-2xl p-2.5 sm:p-3.5 border-violet-500/30 bg-dark-950/90 shadow-2xl shadow-black/80 flex items-center gap-3">
        
        {/* Cover + Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-initial sm:w-60">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-dark-900 border border-white/10">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-violet-900/40 text-violet-300">
                <Disc className="w-6 h-6 animate-spin-slow" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-white truncate">
              {currentTrack.title}
            </h5>
            <p className="text-[10px] text-zinc-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Play/Pause + Progress Slider */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30 active:scale-90 transition-transform"
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
          <div className="w-full flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
            <span className="min-w-[32px] text-right">{formatSecondsToTime(currentTime)}</span>
            <div
              onClick={handleSeek}
              className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all"
              />
            </div>
            <span className="min-w-[32px]">{formatSecondsToTime(duration)}</span>
          </div>
        </div>

        {/* Volume (hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white p-1"
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
          className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          title="Cerrar reproductor"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
