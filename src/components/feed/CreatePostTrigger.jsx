import React from 'react';
import { CloudUpload, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function CreatePostTrigger({ onOpenUpload, onOpenAuth }) {
  const { currentUser, currentProfile, isSuperAdmin } = useAuth();
  const djName = currentProfile?.dj_name || currentUser?.email?.split('@')[0] || 'DJ';

  if (!currentUser) {
    return (
      <div className="glass-panel rounded-2xl p-5 text-center border-violet-500/20 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-500/10 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-white mb-1">
          ¿Eres DJ o VJ Cristiano? 🎧🕊️
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mb-3">
          Sube tus sets de audio, loops de proyector y videos en alta definición a los servidores de DJ's Revolution.
        </p>
        <button
          onClick={() => onOpenAuth('signup')}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-glow-violet active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Crear Cuenta de DJ Gratis</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-4 flex items-center gap-3 mb-4 shadow-sm">
      <Avatar
        src={currentProfile?.avatar_url}
        name={djName}
        size="md"
        isSuperAdmin={isSuperAdmin}
      />
      
      <button
        onClick={onOpenUpload}
        className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition-all truncate min-w-0"
      >
        <span className="truncate block">
          ¿Qué nuevo mix vas a compartir hoy, <strong className="text-zinc-200">{djName}</strong>? 🎧
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
