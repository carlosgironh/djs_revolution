import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Sparkles } from 'lucide-react';

export function InlineVideoPlayer({ 
  streamUrl, 
  playbackId, 
  posterUrl, 
  title, 
  badge = 'Mux Video HD' 
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const effectiveStreamUrl = playbackId
    ? `https://stream.mux.com/${playbackId}.m3u8`
    : streamUrl;

  const effectivePoster = posterUrl || (playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
    : '');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasStarted || !effectiveStreamUrl) return;

    if (effectiveStreamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(effectiveStreamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Soporte nativo de HLS (Safari iOS / macOS)
        video.src = effectiveStreamUrl;
        video.play().catch(() => {});
      }
    } else {
      // Archivo MP4 / WebM directo
      video.src = effectiveStreamUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hasStarted, effectiveStreamUrl]);

  function handleStartPlay(e) {
    e.stopPropagation();
    setHasStarted(true);
    setIsPlaying(true);
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
            <div className="w-full h-full bg-gradient-to-tr from-dark-950 via-dark-900 to-violet-950/40" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Botón Central de Play */}
          <button
            type="button"
            className="w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 group-hover:scale-110 active:scale-95 transition-all duration-300 z-10"
            aria-label="Reproducir video inline"
          >
            <Play className="w-7 h-7 fill-white ml-1" />
          </button>

          {/* Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-rose-300 z-10">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{badge}</span>
          </div>
        </div>
      ) : (
        // Reproductor de Video Inline
        <video
          ref={videoRef}
          poster={effectivePoster}
          controls
          playsInline
          className="w-full h-full object-contain bg-black"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}

