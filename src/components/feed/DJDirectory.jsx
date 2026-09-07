import React from 'react';
import { Users, Crown, Sparkles } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export function DJDirectory({ djs = [], loading = false, onViewProfile }) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-zinc-400">
        <Users className="w-8 h-8 mx-auto mb-2 animate-bounce text-cyan-400" />
        <p className="text-sm">Cargando directorio de DJs Cristianos...</p>
      </div>
    );
  }

  if (djs.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center">
        <Users className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
        <h3 className="font-bold text-base text-white mb-1">Directorio Listo</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
          Aún no hay otros DJs registrados. ¡Sé el primero en abrir tu perfil ministerial!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Directorio de DJs & Creadores
          </h2>
          <p className="text-xs text-zinc-400">
            Conéctate y apoya a los ministros y creadores de música cristiana.
          </p>
        </div>
        <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20">
          {djs.length} DJs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {djs.map((dj) => {
          const isSuperAdmin = Boolean(
            dj.is_super_admin || 
            (dj.role && dj.role.includes('Super Admin')) ||
            dj.username === 'carlosgironh'
          );

          return (
            <div
              key={dj.id}
              className="glass-card rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3.5 mb-3">
                <Avatar
                  src={dj.avatar_url}
                  name={dj.dj_name}
                  size="lg"
                  isSuperAdmin={isSuperAdmin}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white truncate">
                      {dj.dj_name}
                    </h4>
                    {isSuperAdmin && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-cyan-400 font-medium block truncate">
                    {dj.role || 'DJ de Worship 🕊️'}
                  </span>
                  {dj.bio && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                      {dj.bio}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onViewProfile(dj.id)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ver Perfil & Mixes</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
