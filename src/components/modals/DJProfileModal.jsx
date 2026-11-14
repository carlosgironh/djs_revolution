import React, { useState } from 'react';
import { X, Heart, Play, Crown, ExternalLink, Music, Video, Camera, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { Avatar } from '../common/Avatar';
import { getStreamingMediaUrl, getDirectMediaUrl } from '../../lib/mediaUtils';

export function DJProfileModal({ profile, posts = [], isOpen, onClose, onEditOwnProfile, onOpenVideo }) {
  const { currentUser } = useAuth();
  const { playTrack } = usePlayer();
  const [mediaTab, setMediaTab] = useState('mixes');

  if (!isOpen || !profile) return null;

  const isOwner = currentUser && currentUser.id === profile.id;
  const isSuperAdmin = Boolean(
    profile.is_super_admin || 
    (profile.role && profile.role.includes('Super Admin')) ||
    profile.username === 'carlosgironh'
  );

  const djPosts = posts.filter(p => p.author_id === profile.id);
  const audioPosts = djPosts.filter(p => p.type === 'audio');
  const videoPosts = djPosts.filter(p => p.type === 'video' || p.type === 'recurso');
  const photoPosts = djPosts.filter(p => p.type === 'foto');
  
  let totalAmen = 0;
  djPosts.forEach(p => {
    totalAmen += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
  });

  const socials = profile.socials || {};

  function getSocialUrl(type, value) {
    if (!value) return '';
    const clean = value.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const username = clean.replace('@', '');
    switch (type) {
      case 'instagram': return `https://instagram.com/${username}`;
      case 'facebook': return `https://facebook.com/${username}`;
      case 'tiktok': return `https://tiktok.com/@${username}`;
      case 'youtube': return clean.includes('youtube.com') || clean.includes('youtu.be') ? clean : `https://youtube.com/@${username}`;
      default: return clean;
    }
  }

  const hasAnySocial = socials.instagram || socials.facebook || socials.tiktok || socials.youtube;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92vh] bg-dark-900 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-y-auto no-scrollbar flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors z-20"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info del DJ / Usuario */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mb-5">
          <Avatar
            src={profile.avatar_url}
            name={profile.dj_name}
            size="2xl"
            isSuperAdmin={isSuperAdmin}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
              <h3 className="text-xl font-black text-white truncate">
                {profile.dj_name}
              </h3>
              {isSuperAdmin && (
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-400" /> ADMIN
                </span>
              )}
            </div>

            <span className="text-xs text-cyan-400 font-semibold block mb-2">
              {profile.role || 'DJ de Worship 🕊️'}
            </span>

            {profile.bio && (
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                {profile.bio}
              </p>
            )}

            {/* Redes Sociales Oficiales */}
            {hasAnySocial && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {socials.instagram && (
                  <a
                    href={getSocialUrl('instagram', socials.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 border border-pink-500/30 transition-all hover:scale-105 active:scale-95"
                    title="Instagram del DJ"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instagram</span>
                  </a>
                )}

                {socials.facebook && (
                  <a
                    href={getSocialUrl('facebook', socials.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 transition-all hover:scale-105 active:scale-95"
                    title="Facebook del DJ"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-400" />
                    <span>Facebook</span>
                  </a>
                )}

                {socials.tiktok && (
                  <a
                    href={getSocialUrl('tiktok', socials.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                    title="TikTok del DJ"
                  >
                    <Music className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TikTok</span>
                  </a>
                )}

                {socials.youtube && (
                  <a
                    href={getSocialUrl('youtube', socials.youtube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-all hover:scale-105 active:scale-95"
                    title="Canal de YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-center mb-5">
          <div>
            <span className="block text-base font-black text-white">{djPosts.length}</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Publicaciones</span>
          </div>
          <div>
            <span className="block text-base font-black text-cyan-400">{photoPosts.length}</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Fotos 📸</span>
          </div>
          <div>
            <span className="block text-base font-black text-amber-400">{totalAmen}</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Amén Recibidos 🕊️</span>
          </div>
        </div>

        {/* Donación del DJ o Editar Mi Perfil */}
        <div className="mb-5">
          {isOwner ? (
            <button
              onClick={() => { onClose(); onEditOwnProfile(); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/30 active:scale-95"
            >
              Editar Mi Perfil, Foto & Redes
            </button>
          ) : profile.donation_url ? (
            <a
              href={profile.donation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Sembrar en el Ministerio de {profile.dj_name}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          ) : null}
        </div>

        {/* Pestañas de Contenido Estilo Instagram */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex border-b border-white/10 mb-4 select-none">
            <button
              onClick={() => setMediaTab('mixes')}
              className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                mediaTab === 'mixes'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Mixes ({audioPosts.length})</span>
            </button>

            <button
              onClick={() => setMediaTab('fotos')}
              className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                mediaTab === 'fotos'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Fotos ({photoPosts.length})</span>
            </button>

            <button
              onClick={() => setMediaTab('videos')}
              className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                mediaTab === 'videos'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({videoPosts.length})</span>
            </button>
          </div>

          {/* Vista 1: Mixes de Audio */}
          {mediaTab === 'mixes' && (
            <div className="space-y-2.5">
              {audioPosts.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  No hay mixes de audio publicados por este DJ.
                </p>
              ) : (
                audioPosts.map(p => {
                  const cover = p.cover_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80';
                  const amenCount = (p.reactions || []).filter(r => r.reaction_type === 'amen').length;

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:bg-white/10 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-dark-800 flex-shrink-0">
                        <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white truncate">{p.title}</h5>
                        <span className="text-[10px] text-zinc-400 block truncate">#{p.genre || 'Worship'}</span>
                        <span className="text-[10px] text-amber-400/80 font-semibold">{amenCount} Amén 🕊️</span>
                      </div>

                      <button
                        onClick={() => playTrack({
                          id: p.id,
                          title: p.title,
                          artist: profile.dj_name,
                          coverUrl: cover,
                          audioUrl: getStreamingMediaUrl(p),
                          fileUrl: getDirectMediaUrl(p)
                        })}
                        className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-dark-950 flex items-center justify-center transition-all flex-shrink-0"
                        title="Reproducir Mix"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Vista 2: Galería de Fotos Estilo Instagram (Grid de 3 columnas) */}
          {mediaTab === 'fotos' && (
            <div>
              {photoPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-zinc-500">
                    Este DJ aún no ha compartido fotos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {photoPosts.map(p => {
                    const photoSrc = getDirectMediaUrl(p) || getStreamingMediaUrl(p) || p.media_url || p.cover_url;
                    const amenCount = (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
                    const commentsCount = (p.comments || []).length;

                    return (
                      <div
                        key={p.id}
                        onClick={() => onOpenVideo?.(p)}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-dark-800 border border-white/5 cursor-pointer shadow-sm"
                      >
                        <img
                          src={photoSrc}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Overlay Hover estilo Instagram con Likes y Comentarios */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold p-1">
                          <span className="flex items-center gap-1">
                            🕊️ {amenCount}
                          </span>
                          {commentsCount > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" /> {commentsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Vista 3: Videos y Loops */}
          {mediaTab === 'videos' && (
            <div className="space-y-2.5">
              {videoPosts.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">
                  No hay videos o loops publicados por este DJ.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {videoPosts.map(p => {
                    const poster = p.cover_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80';
                    return (
                      <div
                        key={p.id}
                        onClick={() => onOpenVideo?.(p)}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-dark-800 border border-white/5 cursor-pointer"
                      >
                        <img src={poster} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                          <h6 className="text-[11px] font-bold text-white truncate">{p.title}</h6>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 text-dark-950 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
