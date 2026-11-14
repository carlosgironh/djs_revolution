import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Sparkles, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { downloadMediaFile, getDirectMediaUrl, getStreamingMediaUrl } from '../../lib/mediaUtils';

export function VideoLightboxModal({ post, isOpen, onClose }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const streamSrc = getStreamingMediaUrl(post);
  const directSrc = getDirectMediaUrl(post);
  const posterSrc = post?.cover_url || (post?.mux_playback_id
    ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg`
    : '');

  // Reset fallback state when opening another post
  useEffect(() => {
    setUseFallback(false);
  }, [post?.id, isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isOpen || !post || !video) return;

    // Cleanup any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const currentSource = useFallback ? directSrc : (streamSrc || directSrc);

    if (currentSource && currentSource.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsRef.current = hls;

        hls.loadSource(currentSource);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.warn("HLS fatal error in lightbox:", data);
            hls.destroy();
            hlsRef.current = null;
            if (directSrc && !useFallback) {
              setUseFallback(true);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentSource;
        video.play().catch(() => {});
      } else if (directSrc) {
        video.src = directSrc;
        video.play().catch(() => {});
      }
    } else if (currentSource) {
      video.src = currentSource;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
      }
    };
  }, [isOpen, post?.id, streamSrc, directSrc, useFallback]);

  if (!isOpen || !post) return null;

  async function handleDownloadClick() {
    setDownloading(true);
    try {
      await downloadMediaFile(post);
    } finally {
      setDownloading(false);
    }
  }

  function handleVideoError() {
    console.warn("Error en reproducción de video, cambiando a archivo directo:", directSrc);
    if (!useFallback && directSrc) {
      setUseFallback(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-dark-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-dark-900/80 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {post.title}
            </h3>
            <span className="text-xs text-cyan-400 font-semibold truncate block">
              {post.profiles?.dj_name || 'DJ'} • #{post.genre || 'Worship'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Abrir enlace directo / descargar */}
            {directSrc && (
              <>
                <button
                  onClick={handleDownloadClick}
                  disabled={downloading}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-medium flex items-center gap-1.5 transition-colors"
                  title="Descargar archivo original"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{downloading ? 'Descargando...' : post.type === 'foto' ? 'Descargar Foto' : 'Descargar MP4'}</span>
                </button>

                <a
                  href={directSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                  title="Abrir archivo en nueva pestaña"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Cerrar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Container: Foto o Video */}
        {post.type === 'foto' ? (
          <div className="relative max-h-[75vh] bg-black flex items-center justify-center p-2 sm:p-4">
            <img 
              src={directSrc || post.media_url || post.cover_url} 
              alt={post.title} 
              className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        ) : (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              poster={posterSrc}
              controls
              autoPlay
              playsInline
              onError={handleVideoError}
              className="w-full h-full object-contain"
            />

            {useFallback && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1 backdrop-blur-md">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span>Modo Directo HD</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="p-3 sm:p-4 bg-dark-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {post.type === 'foto' ? 'Fotografía Oficial en Alta Calidad 📸' : useFallback ? 'Reproduciendo archivo directo HD' : 'Transmisión HD'}
          </span>
          <span className="truncate">{post.content || post.description || 'Publicación en DJ\'s Revolution'}</span>
        </div>

      </div>
    </div>
  );
}
