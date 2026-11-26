import React, { useMemo } from 'react';
import { Plus, Play, Pause } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { Avatar } from '../common/Avatar';
import { getCoverImageUrl, getStreamingMediaUrl, getDirectMediaUrl } from '../../lib/mediaUtils';
import { getAuthorDisplay, resolvePostAuthor } from '../../lib/roleUtils';

export function FeaturedStories({ 
  posts = [], 
  onOpenUpload, 
  onViewProfile,
  onOpenVideo 
}) {
  const { currentUser, currentProfile, canUpload } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const featuredItems = useMemo(
    () => posts.filter(p => p.cover_url || p.mux_playback_id || p.type === 'audio' || p.type === 'video').slice(0, 6),
    [posts]
  );

  const myAvatar = currentProfile?.avatar_url;
  const myName = currentUser ? getAuthorDisplay(currentProfile).displayName : 'Tú';

  return (
    <section className="mb-6 select-none">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[16px] font-extrabold text-[#f2f4fc] flex items-center gap-2.5">
          <span className="w-[9px] h-[9px] rounded-full bg-[#34d399] animate-pulse" />
          <span>Destacados en Cabina</span>
        </h2>
        <small className="text-[11px] text-[#5b6180] flex items-center gap-1.5 font-medium">
          Desliza para explorar 🎧
        </small>
      </div>

      {/* Tarjetas Destacadas Estilo Estudio */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        
        {/* 1. Tarjeta "Subir Mix / Unirse al Live" */}
        <div
          onClick={() => onOpenUpload()}
          className="relative min-w-[200px] sm:min-w-[220px] flex-1 h-[190px] rounded-[20px] border border-dashed border-white/[0.17] overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-card-hover"
        >
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.55), transparent 60%), linear-gradient(160deg, #0c1e4a, #070b1e)',
            }}
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
            <div className="relative mb-2.5">
              <div className="w-[52px] h-[52px] rounded-full grid place-items-center bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] text-white shadow-[0_10px_26px_rgba(139,92,246,0.45)] group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 stroke-[2.8]" />
              </div>
              {currentUser && (
                <div className="absolute -bottom-1 -right-2 ring-2 ring-[#070b16] rounded-full">
                  <Avatar src={myAvatar} name={myName} size="xs" />
                </div>
              )}
            </div>
            <b className="text-[13.5px] font-bold text-[#f2f4fc]">
              {canUpload ? 'Subir Mix' : 'Unirse al Live'}
            </b>
            <small className="text-[11px] text-[#8f96b3] mt-0.5">
              {canUpload ? 'Comparte audio o video' : 'Crear cuenta'}
            </small>
          </div>
        </div>

        {/* 2. Tarjetas de Sets y DJs Destacados */}
        {featuredItems.map((post, idx) => {
          const author = resolvePostAuthor(post);
          const authorDisplay = getAuthorDisplay(author, post.id).displayName;
          const isThisPlaying = currentTrack?.id === post.id && isPlaying;
          const cover = getCoverImageUrl(post, 400);

          const ambientOverlay = idx % 2 === 0
            ? 'radial-gradient(circle at 70% 25%, rgba(251,113,133,0.45), transparent 55%), radial-gradient(circle at 15% 85%, rgba(251,191,36,0.35), transparent 55%)'
            : 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.5), transparent 55%), radial-gradient(circle at 80% 90%, rgba(34,211,238,0.4), transparent 55%)';

          return (
            <div
              key={post.id}
              onClick={() => {
                if (post.type === 'audio') {
                  playTrack({
                    id: post.id,
                    title: post.title,
                    artist: authorDisplay,
                    coverUrl: cover,
                    audioUrl: getStreamingMediaUrl(post),
                    fileUrl: getDirectMediaUrl(post)
                  });
                } else if (post.type === 'video') {
                  onOpenVideo?.(post);
                } else if (author.id) {
                  onViewProfile?.(author.id);
                }
              }}
              className={`relative min-w-[200px] sm:min-w-[220px] flex-1 h-[190px] rounded-[20px] border overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
                isThisPlaying
                  ? 'border-violet-400/70 shadow-glow-violet'
                  : 'border-white/[0.09] hover:border-white/[0.17]'
              }`}
            >
              <img
                src={cover}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 opacity-85" style={{ backgroundImage: ambientOverlay }} />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(7,11,22,0.18) 20%, rgba(5,7,14,0.88) 100%)' }}
              />

              {/* Badge Superior Izquierda */}
              <span className="absolute top-3 left-3 z-10 text-[9px] font-extrabold tracking-[1.3px] px-2.5 py-1 rounded-full uppercase bg-black/50 border border-white/25 backdrop-blur-md text-white">
                {idx === 0 ? `🔥 #1 · ${post.genre || 'Worship'}` : post.type === 'video' ? '🎬 VJ Set' : '🎵 Mix HD'}
              </span>

              {/* Botón Play Flotante Superior Derecha */}
              <button
                type="button"
                aria-label={isThisPlaying ? 'Pausar' : 'Reproducir'}
                className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full grid place-items-center text-white border backdrop-blur-md transition-all ${
                  isThisPlaying
                    ? 'bg-[#8b5cf6] border-violet-300 scale-110 shadow-glow-violet'
                    : 'bg-white/15 border-white/30 group-hover:bg-[#8b5cf6] group-hover:scale-110'
                }`}
              >
                {isThisPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Pie de la tarjeta: Avatar, Título y DJ */}
              <div className="relative z-10 h-full p-4 flex flex-col justify-end">
                <div className="flex items-center gap-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (author.id) onViewProfile?.(author.id);
                    }}
                    className="rounded-full ring-1 ring-white/40 hover:scale-110 transition-transform flex-shrink-0"
                    title={`Ver perfil de ${authorDisplay}`}
                  >
                    <Avatar src={author.avatar_url} name={authorDisplay} size="xs" />
                  </div>
                  <div className="min-w-0">
                    <b className="block text-[14px] font-bold text-[#f2f4fc] truncate group-hover:text-violet-200 transition-colors">
                      {post.title}
                    </b>
                    <small className="block text-[11px] text-[#8f96b3] truncate">
                      {authorDisplay}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
