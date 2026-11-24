import React, { useMemo } from 'react';
import { Plus, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { Avatar } from '../common/Avatar';
import { getCoverImageUrl, getStreamingMediaUrl, getDirectMediaUrl } from '../../lib/mediaUtils';

export function FeaturedStories({ 
  posts = [], 
  onOpenUpload, 
  onViewProfile,
  onOpenVideo 
}) {
  const { currentUser, currentProfile, canUpload } = useAuth();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  // Tomamos los 6-8 mejores posts con portada para el carrusel de historias/descubrimiento
  const featuredItems = useMemo(
    () => posts.filter(p => p.cover_url || p.mux_playback_id || p.type === 'audio' || p.type === 'video').slice(0, 8),
    [posts]
  );

  const myAvatar = currentProfile?.avatar_url;
  const myName = currentProfile?.dj_name || currentUser?.email?.split('@')[0] || 'Tú';

  return (
    <section className="mb-5 select-none">
      {/* Encabezado discreto del carrusel */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            Destacados en Cabina
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-medium">
          Desliza para explorar 🎧
        </span>
      </div>

      {/* Carrusel Horizontal */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 -mx-1">
        
        {/* 1. Tarjeta "Subir Tu Mix / Transmitir" (Estilo Historias de Facebook) */}
        <div
          onClick={onOpenUpload}
          className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group bg-gradient-to-b from-dark-800 to-dark-900 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 shadow-lg flex flex-col justify-between p-2.5 hover:scale-[1.02] active:scale-95"
        >
          {/* Fondo sutil con resplandor */}
          <div className="absolute inset-0 bg-radial-at-t from-cyan-500/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex justify-center pt-2">
            <div className="relative">
              <Avatar
                src={myAvatar}
                name={myName}
                size="md"
                className="ring-2 ring-cyan-400/60 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center pb-1">
            <p className="text-[11px] font-bold text-white leading-tight">
              {canUpload ? 'Subir Mix' : 'Unirse al Live'}
            </p>
            <p className="text-[9px] text-cyan-300/80 mt-0.5">
              {canUpload ? 'Compartir audio' : 'Crear cuenta'}
            </p>
          </div>
        </div>

        {/* 2. Tarjetas de Pistas y DJs Destacados */}
        {featuredItems.map((post) => {
          const author = post.profiles || { dj_name: 'DJ Oficial' };
          const isThisPlaying = currentTrack?.id === post.id && isPlaying;
          const cover = getCoverImageUrl(post, 300);

          return (
            <div
              key={post.id}
              onClick={() => {
                if (post.type === 'audio') {
                  playTrack({
                    id: post.id,
                    title: post.title,
                    artist: author.dj_name,
                    coverUrl: cover,
                    audioUrl: getStreamingMediaUrl(post),
                    fileUrl: getDirectMediaUrl(post)
                  });
                } else if (post.type === 'video') {
                  onOpenVideo?.(post);
                } else {
                  onViewProfile?.(author.id);
                }
              }}
              className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer group border border-white/10 hover:border-cyan-400/60 transition-all duration-300 shadow-lg flex flex-col justify-between p-2.5 hover:scale-[1.02] active:scale-95"
            >
              {/* Imagen de Portada de Fondo con Zoom en Hover */}
              <img
                src={cover}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {/* Gradiente Oscuro para Legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-black/30" />

              {/* Header de la tarjeta: Avatar del DJ */}
              <div className="relative z-10 flex items-center justify-between">
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile?.(author.id);
                  }}
                  className="rounded-full ring-2 ring-cyan-400 shadow-md hover:scale-110 transition-transform"
                  title={`Ver perfil de ${author.dj_name}`}
                >
                  <Avatar
                    src={author.avatar_url}
                    name={author.dj_name}
                    size="xs"
                  />
                </div>

                {/* Badge de Tipo */}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-cyan-300 border border-white/10 uppercase">
                  {post.type === 'video' ? 'VJ' : 'MIX'}
                </span>
              </div>

              {/* Botón Central de Play Flotante */}
              <div className="relative z-10 self-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isThisPlaying
                    ? 'bg-cyan-500 text-white scale-110 shadow-glow-cyan'
                    : 'bg-black/50 text-white group-hover:bg-cyan-500 group-hover:scale-110 backdrop-blur-md border border-white/20'
                }`}>
                  {isThisPlaying ? (
                    <span className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
                      <span className="w-1 h-2 bg-white rounded-full animate-pulse" />
                    </span>
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </div>
              </div>

              {/* Pie de la tarjeta: Título & DJ */}
              <div className="relative z-10">
                <p className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors drop-shadow-sm">
                  {post.title}
                </p>
                <p className="text-[9.5px] text-zinc-300 truncate drop-shadow-sm">
                  {author.dj_name}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
