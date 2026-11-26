import React, { useEffect, useRef, useState } from 'react';
import { Play, Sparkles, Maximize2, RefreshCw } from 'lucide-react';
import { attachMediaSource } from '../../lib/hlsHelper';
import { getCoverImageUrl } from '../../lib/mediaUtils';

export function InlineVideoPlayer({ 
  streamUrl, 
  playbackId, 
  directUrl,
  posterUrl, 
  title, 
  badge = 'Video HD',
  onExpand
}) {
  const videoRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const effectiveStreamUrl = playbackId
    ? `https://stream.mux.com/${playbackId}.m3u8`
    : streamUrl;

  const effectivePoster = posterUrl || (playbackId
    ? getCoverImageUrl({ mux_playback_id: playbackId })
    : '');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasStarted) return;

    return attachMediaSource({
      mediaEl: video,
      streamUrl: effectiveStreamUrl,
      directUrl,
      useFallback,
      lowLatency: true,
      onFallback: () => setUseFallback(true),
    });
  }, [hasStarted, effectiveStreamUrl, directUrl, useFallback]);

  function handleStartPlay(e) {
    e.stopPropagation();
    setHasStarted(true);
  }

  function handleVideoError() {
    if (!useFallback && directUrl) {
      console.warn("Inline player fallback a archivo directo:", directUrl);
      setUseFallback(true);
    }
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden group">
      {!hasStarted ? (
        // Portada interactiva inicial (Estilo Facebook)
        <div 
          onClick={handleStartPlay}
          className="relative w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
        >
          {effectivePoster ? (
            <img 
              src={effectivePoster} 
              alt={title || 'Video'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-dark-950 via-dark-900 to-blue-950/40" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Botón Central de Play */}
          <button
            type="button"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] hover:from-[#a78bfa] hover:to-[#22d3ee] text-white flex items-center justify-center shadow-glow-violet border border-white/25 group-hover:scale-110 active:scale-95 transition-all duration-300 z-10"
            aria-label="Reproducir video inline"
          >
            <Play className="w-7 h-7 fill-white ml-1" />
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#070b16]/80 backdrop-blur-md border border-violet-400/30 text-[10px] font-bold text-[#c4b5fd] z-10">
            <Sparkles className="w-3 h-3 text-[#22d3ee]" />
            <span>{badge}</span>
          </div>

          {/* Botón Abrir en pantalla grande */}
          {onExpand && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition-all z-10"
              title="Abrir en pantalla grande"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        // Reproductor de Video Inline
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            poster={effectivePoster}
            controls
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-contain bg-black"
          />

          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition-all z-10"
              title="Maximizar video"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {useFallback && (
            <div className="absolute bottom-12 left-3 px-2 py-0.5 rounded bg-black/80 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1 pointer-events-none">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
              <span>Directo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
