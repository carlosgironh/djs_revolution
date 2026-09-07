import React from 'react';
import { X, Heart, Play, Crown, ExternalLink, Music, Disc } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { Avatar } from '../common/Avatar';

export function DJProfileModal({ profile, posts = [], isOpen, onClose, onEditOwnProfile, onOpenVideo }) {
  const { currentUser } = useAuth();
  const { playTrack } = usePlayer();

  if (!isOpen || !profile) return null;

  const isOwner = currentUser && currentUser.id === profile.id;
  const isSuperAdmin = Boolean(
    profile.is_super_admin || 
    (profile.role && profile.role.includes('Super Admin')) ||
    profile.username === 'carlosgironh'
  );

  const djPosts = posts.filter(p => p.author_id === profile.id);
  
  let totalAmen = 0;
  djPosts.forEach(p => {
    totalAmen += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-y-auto no-scrollbar flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info del DJ */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mb-5">
          <Avatar
            src={profile.avatar_url}
            name={profile.dj_name}
            size="2xl"
            isSuperAdmin={isSuperAdmin}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h3 className="text-lg font-bold text-white truncate">
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
              <p className="text-xs text-zinc-300 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Redes Sociales */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-zinc-400">
              {profile.socials?.instagram && (
                <a
                  href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors flex items-center gap-1"
                >
                  Instagram
                </a>
              )}
              {profile.socials?.youtube && (
                <a
                  href={profile.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-center mb-5">
          <div>
            <span className="block text-base font-black text-white">{djPosts.length}</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Mixes Publicados</span>
          </div>
          <div>
            <span className="block text-base font-black text-amber-400">{totalAmen}</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Amén Recibidos 🕊️</span>
          </div>
        </div>

        {/* Donación del DJ o Editar Mi Perfil */}
        <div className="mb-6">
          {isOwner ? (
            <button
              onClick={() => { onClose(); onEditOwnProfile(); }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            >
              Editar Mi Perfil & Donaciones
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

        {/* Publicaciones del DJ */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            Mixes & Videos de {profile.dj_name}
          </h4>

          <div className="space-y-2.5">
            {djPosts.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">
                Este DJ aún no ha publicado ningún set.
              </p>
            ) : (
              djPosts.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <h5 className="text-xs font-bold text-white truncate">{p.title}</h5>
                    <span className="text-[10px] text-cyan-400 font-semibold">#{p.genre || 'Worship'}</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (p.type === 'audio') {
                        playTrack({
                          id: p.id,
                          title: p.title,
                          artist: profile.dj_name,
                          coverUrl: p.cover_url,
                          audioUrl: p.mux_audio_url || p.file_url
                        });
                      } else {
                        onOpenVideo(p);
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Reproducir</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
