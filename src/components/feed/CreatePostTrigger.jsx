import React from 'react';
import { CloudUpload, UserPlus, Music, Video, Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function CreatePostTrigger({ onOpenUpload, onOpenAuth }) {
  const { currentUser, currentProfile, isSuperAdmin, canUpload } = useAuth();
  const userName = currentProfile?.dj_name || currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'DJ';

  // 1. Invitado no autenticado: Banner moderno y compacto
  if (!currentUser) {
    return (
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 bg-gradient-to-r from-blue-900/30 via-dark-900/70 to-cyan-950/30 mb-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-dark-950 flex items-center justify-center text-lg">
                🕊️
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <span>Comunidad Global de DJs y VJs de Adoración</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-snug">
                Escucha sets sin límites, descarga tracks en alta calidad y bendice a los ministros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan active:scale-95 transition-all"
            >
              Crear Cuenta Gratis
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="py-2 px-3.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Usuario Normal (Oyente): Mini tarjeta de bienvenida con estado espiritual
  if (!canUpload) {
    return (
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 mb-4 border-white/10 bg-white/[0.03]">
        <Avatar
          src={currentProfile?.avatar_url}
          name={userName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
            <span>¡Paz de Dios, {userName}! 🕊️</span>
            <span className="text-[10px] text-zinc-400 font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              Oyente Activo
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
            Explora las mezclas más recientes y bendice con tu Amén a los ministros.
          </p>
        </div>
      </div>
    );
  }

  // 3. DJ / Creador / Moderador / Admin: Barra de publicación estilo Facebook / Spotify
  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-4 mb-4 border-cyan-500/20 bg-dark-900/60 shadow-lg transition-all hover:border-cyan-500/40">
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={currentProfile?.avatar_url}
          name={userName}
          size="md"
          isSuperAdmin={isSuperAdmin}
        />
        <button
          onClick={onOpenUpload}
          className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-all truncate"
        >
          ¿Qué nuevo set o bendición vas a compartir hoy, <strong className="text-white">{userName}</strong>?
        </button>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex items-center justify-between border-t border-white/[0.07] pt-2.5 gap-1 sm:gap-2">
        <button
          onClick={onOpenUpload}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
        >
          <Music className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xs:inline">Mix Audio</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden xs:inline">Video VJ</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline">Foto</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan active:scale-95 transition-all"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>Publicar</span>
        </button>
      </div>
    </div>
  );
}
