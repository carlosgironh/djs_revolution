import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

export function VideoLightboxModal({ post, isOpen, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const streamSrc = post.mux_playback_id
    ? `https://stream.mux.com/${post.mux_playback_id}.m3u8`
    : post.file_url;

  const posterSrc = post.cover_url || (post.mux_playback_id
    ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg`
    : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-dark-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 bg-dark-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {post.title}
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">
              {post.profiles?.dj_name || 'DJ'} • #{post.genre || 'Worship'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar reproductor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={streamSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-dark-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-rose-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Transmisión HD Mux Streaming
          </span>
          <span>{post.content || 'Sets de Adoración en Video'}</span>
        </div>

      </div>
    </div>
  );
}
