import React, { useState } from 'react';
import { Search, Heart, Menu, Upload, LogIn, UserPlus, LogOut, Clock, X, Crown, Shield, Disc, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePanamaClock } from '../../hooks/usePanamaClock';
import { Avatar } from '../common/Avatar';

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

  const userName = currentProfile?.dj_name || currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-dark-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LOGO: Garantizado en UNA SOLA LÍNEA sin partirse */}
        <div 
          onClick={() => onTabChange('inicio')} 
          className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0 min-w-max"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shadow-glow-violet flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center text-lg sm:text-xl">
              🕊️
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight whitespace-nowrap">
              DJ's <span className="text-gradient">Revolution</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-zinc-400">
              Worship Community
            </span>
          </div>
        </div>

        {/* Buscador de Escritorio */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar mixes, DJs o adoración..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all"
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

        {/* Reloj Oficial de Panamá (Desktop / Tablet) */}
        <div 
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 select-none cursor-help"
          title={localDiff}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono font-bold tracking-wider">{panamaTime}</span>
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
            PTY
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
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <span>🕊️</span>
                  <span className="max-w-[100px] truncate">{userName}</span>
                  <span className="text-[9px] text-zinc-400">(Oyente)</span>
                </div>
              )}

              {/* Botón Panel de Admin (Solo Administradores) */}
              {isSuperAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Mix</span>
                </button>
              )}

              {/* Avatar clicable */}
              <button 
                onClick={() => onTabChange('perfil')}
                className="hover:scale-105 transition-transform"
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
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-95 shadow-glow-violet transition-all"
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
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 active:scale-90 transition-transform"
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
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 active:scale-90 transition-transform"
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
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-white/5 bg-dark-950/95 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar mixes, DJs, alabanza..."
              className="w-full bg-white/10 border border-white/15 rounded-full pl-9 pr-8 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-cyan-500"
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
