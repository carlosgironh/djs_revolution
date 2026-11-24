import React, { useState, useMemo } from 'react';
import { Users, Crown, Shield, Search, Music, Instagram, Facebook, Youtube } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { getUserRoleFlags } from '../../lib/roleUtils';

export function DJDirectory({ djs = [], loading = false, onViewProfile }) {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = useMemo(() => {
    if (!filterQuery.trim()) return djs;
    const q = filterQuery.toLowerCase();
    return djs.filter(dj =>
      (dj.dj_name || '').toLowerCase().includes(q) ||
      (dj.full_name || '').toLowerCase().includes(q) ||
      (dj.role || '').toLowerCase().includes(q) ||
      (dj.bio || '').toLowerCase().includes(q)
    );
  }, [djs, filterQuery]);

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-zinc-400 border-white/10">
        <Users className="w-9 h-9 mx-auto mb-3 animate-bounce text-cyan-400" />
        <p className="text-sm font-semibold">Cargando directorio de ministros y DJs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. Hero Editorial del Directorio */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7 border-cyan-500/20 bg-gradient-to-r from-blue-900/30 via-dark-900/80 to-cyan-950/30 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left mb-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Users className="w-5 h-5 text-cyan-400" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Directorio Oficial de DJs & VJs
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Descubre, conecta y apoya el ministerio de los creadores y mezcladores de adoración cristiana.
            </p>
          </div>

          <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-3.5 py-1.5 rounded-full border border-cyan-500/30 flex-shrink-0 shadow-sm">
            {djs.length} Ministros Registrados
          </span>
        </div>

        {/* Buscador dentro del Directorio */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Buscar por nombre, especialidad o ministerio..."
            className="w-full bg-dark-950/80 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>
      </div>

      {/* 2. Grid de DJs y Creadores */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center border-white/10">
          <Users className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
          <h3 className="font-bold text-base text-white mb-1">Sin resultados</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-3">
            No se encontraron creadores que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map((dj) => {
            const { isSuperAdmin, isModOnly: isModerator } = getUserRoleFlags(dj);

            const socials = dj.socials || {};

            return (
              <div
                key={dj.id}
                className="glass-panel rounded-3xl p-5 border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-cyan-950/30"
              >
                <div>
                  {/* Encabezado de la tarjeta */}
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative">
                      <Avatar
                        src={dj.avatar_url}
                        name={dj.dj_name || dj.full_name}
                        size="lg"
                        isSuperAdmin={isSuperAdmin}
                        className="group-hover:scale-105 transition-transform ring-2 ring-white/10"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors truncate">
                          {dj.dj_name || dj.full_name || 'DJ Oficial'}
                        </h4>
                        {isSuperAdmin ? (
                          <span className="flex items-center gap-0.5 bg-amber-500/20 text-amber-300 text-[9.5px] font-black px-1.5 py-0.5 rounded-md border border-amber-500/30 flex-shrink-0">
                            <Crown className="w-2.5 h-2.5" /> ADMIN
                          </span>
                        ) : isModerator ? (
                          <span className="flex items-center gap-0.5 bg-purple-500/20 text-purple-300 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border border-purple-500/30 flex-shrink-0">
                            <Shield className="w-2.5 h-2.5" /> MOD
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                            DJ
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-zinc-400 font-medium block truncate mt-0.5">
                        {dj.role || 'DJ de Worship 🕊️'}
                      </span>
                    </div>
                  </div>

                  {/* Biografía */}
                  {dj.bio && (
                    <p className="text-xs text-zinc-300 line-clamp-2 mb-3.5 leading-relaxed font-normal">
                      {dj.bio}
                    </p>
                  )}

                  {/* Redes Sociales si las tiene */}
                  {(socials.instagram || socials.facebook || socials.youtube || socials.tiktok) && (
                    <div className="flex items-center gap-2 mb-3.5 text-zinc-400 text-xs">
                      {socials.instagram && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-pink-300">
                          <Instagram className="w-3 h-3" /> Instagram
                        </span>
                      )}
                      {socials.facebook && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-blue-300">
                          <Facebook className="w-3 h-3" /> Facebook
                        </span>
                      )}
                      {socials.youtube && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-red-300">
                          <Youtube className="w-3 h-3" /> YouTube
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Botón Principal: Ver Perfil & Mixes */}
                <button
                  onClick={() => onViewProfile(dj.id)}
                  className="w-full mt-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600/30 to-cyan-500/30 hover:from-blue-600 hover:to-cyan-500 border border-cyan-500/40 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Music className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Ver Perfil & Mixes</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
