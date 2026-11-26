import React, { useState, useRef, useEffect } from 'react';
import { Search, Heart, Menu, Upload, LogIn, UserPlus, LogOut, X, Crown, Shield, Disc, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePanamaClock } from '../../hooks/usePanamaClock';
import { Avatar } from '../common/Avatar';
import { BRAND_LOGO_URL } from '../../lib/mediaUtils';
import { getAuthorDisplay } from '../../lib/roleUtils';

export function Navbar({ 
  onTabChange, 
  onOpenAuth, 
  onOpenUpload, 
  onOpenDonate, 
  onToggleDrawer, 
  onOpenAdmin,
  searchQuery, 
  onSearchChange 
}) {
  const { currentUser, currentProfile, isSuperAdmin, isModerator, isDJ, canUpload, signOut } = useAuth();
  const { time: panamaTime, localDiff } = usePanamaClock();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const desktopSearchRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (desktopSearchRef.current && desktopSearchRef.current.offsetParent !== null) {
          desktopSearchRef.current.focus();
        } else {
          setMobileSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const userName = currentProfile
    ? getAuthorDisplay(currentProfile).displayName
    : (currentUser?.email?.split('@')[0] || 'Usuario');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.09] bg-gradient-to-b from-[#070b16]/95 to-[#070b16]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* LOGO: Oficial de DJ's Revolution con halo sutil para nitidez sobre fondo oscuro */}
        <div 
          onClick={() => onTabChange('inicio')} 
          className="flex items-center gap-3 cursor-pointer select-none flex-shrink-0 group"
          title="DJ's Revolution - Inicio"
        >
          <div className="relative px-2 py-1 rounded-xl bg-white/[0.07] border border-white/[0.1] shadow-[0_6px_22px_rgba(139,92,246,0.22)] group-hover:border-violet-400/40 transition-all">
            <img 
              src={BRAND_LOGO_URL} 
              alt="DJ's Revolution Logo" 
              className="h-9 sm:h-10 w-auto max-w-[155px] sm:max-w-[190px] object-contain group-hover:scale-[1.03] transition-transform duration-300"
            />
          </div>
          <span className="hidden 2xl:block text-[9px] tracking-[2.2px] text-[#8f96b3] uppercase font-semibold">
            Worship · Remix · Community
          </span>
        </div>

        {/* Buscador de Escritorio */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2 relative items-center">
          <Search className="w-4 h-4 text-[#5b6180] absolute left-3.5 pointer-events-none" />
          <input
            ref={desktopSearchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar mixes, DJs o alabanzas..."
            className="w-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] hover:border-white/[0.17] rounded-[13px] pl-10 pr-12 py-2.5 text-[13px] text-[#f2f4fc] placeholder-[#5b6180] focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
          {searchQuery ? (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-[#8f96b3] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-block absolute right-2.5 text-[10.5px] font-medium text-[#8f96b3] px-2 py-0.5 rounded-[7px] border border-white/[0.17] bg-black/35 pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Acciones de Escritorio */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          {/* Reloj Oficial de Panamá */}
          <div 
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.09] text-[12.5px] text-[#8f96b3] select-none cursor-help tabular-nums"
            title={localDiff}
          >
            <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-semibold tracking-tight">{panamaTime}</span>
            <b className="text-[#f2f4fc] text-[11px] font-extrabold">PTY</b>
          </div>

          {currentUser ? (
            <>
              {/* Chip de Rol */}
              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold bg-amber-400/[0.08] text-[#fbbf24] border border-amber-400/40 hover:border-amber-400/70 transition-all hover:-translate-y-0.5"
                  title="Abrir consola de administración"
                >
                  <Crown className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span className="max-w-[115px] truncate">{userName}</span>
                  <span className="bg-[#fbbf24] text-[#241a02] text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">
                    ADMIN
                  </span>
                </button>
              ) : isModerator ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/35">
                  <Shield className="w-3.5 h-3.5 text-violet-400" />
                  <span className="max-w-[110px] truncate">{userName}</span>
                  <span className="bg-violet-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">MOD</span>
                </div>
              ) : isDJ ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold bg-cyan-400/10 text-[#22d3ee] border border-cyan-400/30">
                  <Disc className="w-3.5 h-3.5 animate-spin-slow" />
                  <span className="max-w-[110px] truncate">{userName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-medium bg-white/[0.04] text-[#f2f4fc] border border-white/[0.09]">
                  <span>🕊️</span>
                  <span className="max-w-[110px] truncate">{userName}</span>
                </div>
              )}

              {/* Botón Usuarios / Directorio */}
              {isSuperAdmin ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-[#8f96b3] hover:text-[#f2f4fc] bg-white/[0.04] border border-white/[0.09] hover:border-white/[0.17] transition-all hover:-translate-y-0.5"
                  title="Gestionar roles y usuarios"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Usuarios</span>
                </button>
              ) : (
                <button
                  onClick={() => onTabChange('djs')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-[#8f96b3] hover:text-[#f2f4fc] bg-white/[0.04] border border-white/[0.09] hover:border-white/[0.17] transition-all hover:-translate-y-0.5"
                  title="Directorio de DJs y VJs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">DJs</span>
                </button>
              )}

              {/* Botón Subir (CTA Shine Violeta → Azul) */}
              {canUpload && (
                <button
                  onClick={onOpenUpload}
                  className="btn-cta-shine flex items-center gap-2 px-4 py-2 rounded-[13px] text-[13px] font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] shadow-glow-violet hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Mix</span>
                </button>
              )}

              {/* Avatar clicable */}
              <button 
                onClick={() => onTabChange('perfil')}
                className="hover:scale-105 active:scale-95 transition-transform"
                title="Ver mi perfil"
              >
                <Avatar 
                  src={currentProfile?.avatar_url} 
                  name={userName} 
                  size="sm" 
                  isSuperAdmin={isSuperAdmin} 
                />
              </button>

              {/* Cerrar Sesión */}
              <button
                onClick={signOut}
                title="Cerrar sesión"
                className="w-9 h-9 rounded-xl border border-white/[0.09] bg-white/[0.04] text-[#8f96b3] hover:text-[#fb7185] hover:border-rose-400/40 flex items-center justify-center transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-[#8f96b3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] hover:border-white/[0.17] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="btn-cta-shine flex items-center gap-1.5 px-4 py-2 rounded-[13px] text-[13px] font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] shadow-glow-violet hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </>
          )}
        </div>

        {/* Acciones Móviles */}
        <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.09] flex items-center justify-center text-[#f2f4fc] active:scale-90 transition-transform"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDonate}
            className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/35 flex items-center justify-center text-[#fbbf24] active:scale-90 transition-transform"
            aria-label="Sembrar / Donar"
          >
            <Heart className="w-4 h-4 fill-amber-400/30" />
          </button>

          <button
            onClick={onToggleDrawer}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.09] flex items-center justify-center text-[#f2f4fc] active:scale-90 transition-transform"
            aria-label="Menú"
          >
            {currentUser ? (
              <Avatar 
                src={currentProfile?.avatar_url} 
                name={userName} 
                size="xs" 
                isSuperAdmin={isSuperAdmin} 
              />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>

      {/* Buscador Desplegable en Móvil */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 pb-3 pt-1.5 border-t border-white/[0.06] bg-[#070b16]/95 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-[#8f96b3] absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar mixes, DJs, alabanzas..."
              className="w-full bg-white/[0.06] border border-white/[0.15] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-[#f2f4fc] placeholder-[#5b6180] focus:outline-none focus:border-violet-500"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-[#8f96b3] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setMobileSearchOpen(false)}
            className="text-xs text-[#8f96b3] hover:text-white px-2 py-1"
          >
            Cerrar
          </button>
        </div>
      )}
    </header>
  );
}
