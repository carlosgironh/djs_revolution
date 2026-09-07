import React from 'react';
import { CloudUpload, UserPlus, Headphones, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function CreatePostTrigger({ onOpenUpload, onOpenAuth }) {
  const { currentUser, currentProfile, isSuperAdmin, isModerator, canUpload } = useAuth();
  const userName = currentProfile?.dj_name || currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Usuario';

  // 1. Invitado no autenticado
  if (!currentUser) {
    return (
      <div className="glass-panel rounded-2xl p-5 text-center border-cyan-500/20 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-500/10 mb-4">
        <img 
          src="/logo_emblem.png" 
          alt="DJ's Revolution" 
          className="w-12 h-12 object-contain mx-auto mb-2 drop-shadow-[0_0_12px_rgba(14,165,233,0.4)]"
        />
        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
          Comunidad Global de Música y Adoración Cristiana 🕊️
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-3">
          Regístrate gratis para interactuar con los sets, dejar bendiciones, comentar y guardar tus favoritos.
        </p>
        <button
          onClick={() => onOpenAuth('signup')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-glow-violet active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Crear Cuenta Gratis</span>
        </button>
      </div>
    );
  }

  // 2. Usuario Normal (Oyente): No tiene permisos de subida
  if (!canUpload) {
    return (
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5 mb-4 border-white/10 bg-white/5">
        <Avatar
          src={currentProfile?.avatar_url}
          name={userName}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <span>¡Paz de Dios, {userName}! 🕊️</span>
            <span className="text-[10px] text-zinc-400 font-normal bg-zinc-800 px-2 py-0.5 rounded-full">
              Usuario Oyente
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
            Disfruta de las mezclas en vivo, descarga recursos y edifica tu vida espiritual con alabanza.
          </p>
        </div>
      </div>
    );
  }

  // 3. DJ Creador / Moderador / Administrador: Puede subir
  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-4 flex items-center gap-3 mb-4 shadow-sm border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5">
      <Avatar
        src={currentProfile?.avatar_url}
        name={userName}
        size="md"
        isSuperAdmin={isSuperAdmin}
      />
      
      <button
        onClick={onOpenUpload}
        className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-all truncate min-w-0"
      >
        <span className="truncate block">
          ¿Qué nuevo mix o video vas a compartir hoy, <strong className="text-zinc-200">{userName}</strong>? 🎧
        </span>
      </button>

      <button
        onClick={onOpenUpload}
        className="p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-violet-900/30 flex-shrink-0 active:scale-95 transition-all"
        title="Subir nuevo mix o video"
      >
        <CloudUpload className="w-4 h-4" />
        <span className="hidden sm:inline text-xs font-bold">Subir</span>
      </button>
    </div>
  );
}
