import React, { useState, useRef, useEffect } from 'react';
import { Search, Heart, Menu, Upload, LogIn, UserPlus, LogOut, X, Crown, Shield, Disc, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePanamaClock } from '../../hooks/usePanamaClock';
import { Avatar } from '../common/Avatar';
import { BRAND_LOGO_URL } from '../../lib/mediaUtils';

export function Navbar({ 
  activeTab, 
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

  const userName = currentProfile?.dj_name || currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-dark-950/85 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* LOGO: Oficial Transparente de DJ's Revolution */}
        <div 
          onClick={() => onTabChange('inicio')} 
          className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 group"
          title="DJ's Revolution - Inicio"
        >
          <img 
            src={BRAND_LOGO_URL} 
            alt="DJ's Revolution Logo" 
            className="h-10 sm:h-11 w-auto max-w-[170px] sm:max-w-[210px] object-contain drop-shadow-[0_0_20px_rgba(0,186,253,0.35)] group-hover:scale-105 transition-all duration-300"
          />
        </div>

        {/* Buscador de Escritorio con Hint de Teclado */}
        <div className="hidden md:flex flex-1 max-w-md mx-2 relative items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={desktopSearchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar mixes, DJs o alabanza..."
            className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          {searchQuery ? (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 text-[10px] font-mono text-zinc-500 pointer-events-none hidden lg:inline">
              ⌘K
            </span>
          )}
        </div>

        {/* Reloj Oficial de Panamá (Desktop / Tablet) */}
        <div 
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 select-none cursor-help shadow-inner"
          title={localDiff}
        >
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </div>
          <span className="font-mono font-bold tracking-wider">{panamaTime}</span>
          <span className="bg-cyan-500/20 text-cyan-300 text-[9.5px] font-black px-1.5 py-0.5 rounded border border-cyan-500/30">
            PTY 🇵🇦
          </span>
        </div>

        {/* Acciones de Escritorio */}
        <div className="hidden md:flex items-center gap-2.5">
          {currentUser ? (
            <>
              {/* Badge de Rol */}
              {isSuperAdmin ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <span className="bg-amber-500 text-black text-[9px] px-1 rounded font-black">ADMIN</span>
                </div>
              ) : isModerator ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <span className="bg-purple-500 text-white text-[9px] px-1 rounded font-bold">MOD</span>
                </div>
              ) : isDJ ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Disc className="w-3.5 h-3.5 animate-spin-slow text-cyan-400" />
                  <span className="max-w-[100px] truncate">{userName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-zinc-300 border border-white/10">
                  <span>🕊️</span>
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold">(Oyente)</span>
                </div>
              )}

              {/* Botón Panel de Admin (Solo Administradores) */}
              {isSuperAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all active:scale-95"
                  title="Gestionar roles y usuarios"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Usuarios</span>
                </button>
              )}

              {/* Botón Subir (Solo DJs, Moderadores y Admins) */}
              {canUpload && (
                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan active:scale-95 transition-all"
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
                className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-white/5 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan active:scale-95 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </>
          )}
        </div>

        {/* Acciones Móviles (Top App Header) */}
        <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-200 active:scale-90 transition-transform"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDonate}
            className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 active:scale-90 transition-transform"
            aria-label="Sembrar / Donar"
          >
            <Heart className="w-4 h-4 fill-amber-400/30" />
          </button>

          <button
            onClick={onToggleDrawer}
            className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-200 active:scale-90 transition-transform"
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
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-white/[0.06] bg-dark-950/95 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar mixes, DJs, alabanza..."
              className="w-full bg-white/[0.08] border border-white/15 rounded-full pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setMobileSearchOpen(false)}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1"
          >
            Cerrar
          </button>
        </div>
      )}
    </header>
  );
}
