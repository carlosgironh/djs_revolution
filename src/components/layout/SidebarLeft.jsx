import React from 'react';
import { Home, Music, Video, Users, FolderOpen, Bookmark, Heart, Settings, User, Crown, HandCoins, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { BRAND_LOGO_URL } from '../../lib/mediaUtils';
import { getAuthorDisplay } from '../../lib/roleUtils';

export function SidebarLeft({ activeTab, onTabChange, onOpenAuth, onOpenEditProfile, onOpenDonate, onOpenAdmin, mixesCount = 0, amenCount = 0 }) {
  const { currentUser, currentProfile, isSuperAdmin } = useAuth();
  const djName = currentProfile
    ? getAuthorDisplay(currentProfile).displayName
    : (currentUser?.email?.split('@')[0] || 'DJ');

  return (
    <aside className="hidden md:flex flex-col gap-4 w-60 xl:w-64 flex-shrink-0 select-none">
      
      {/* 1. Tarjeta de Usuario / Oyente */}
      <div className="glass-panel rounded-3xl p-4 border-white/[0.08] shadow-lg">
        {currentUser ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar 
                src={currentProfile?.avatar_url} 
                name={djName} 
                size="md" 
                isSuperAdmin={isSuperAdmin} 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white truncate">{djName}</h4>
                  {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" title="Super Administrador" />}
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {currentProfile?.role || 'DJ de Worship 🕊️'}
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/[0.08] text-center mb-3">
              <div>
                <span className="block font-black text-sm text-white">{mixesCount}</span>
                <span className="text-[9.5px] text-zinc-400 uppercase font-bold tracking-wider">Mixes</span>
              </div>
              <div>
                <span className="block font-black text-sm text-amber-400">{amenCount}</span>
                <span className="text-[9.5px] text-zinc-400 uppercase font-bold tracking-wider">Amén 🕊️</span>
              </div>
            </div>

            {/* Acciones de Perfil */}
            <div className="flex gap-2">
              <button
                onClick={() => onTabChange('perfil')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 transition-opacity active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Perfil</span>
              </button>
              <button
                onClick={onOpenEditProfile}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-300 transition-colors border border-white/[0.06] active:scale-95"
                title="Editar Perfil y Donaciones"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {isSuperAdmin && (
              <button
                onClick={onOpenAdmin}
                className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel de Administración 👑</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-2 px-1">
            <img 
              src={BRAND_LOGO_URL} 
              alt="DJ's Revolution" 
              className="h-12 w-auto max-w-[170px] object-contain mx-auto mb-2 drop-shadow-[0_0_15px_rgba(0,186,253,0.35)]"
            />
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">Comunidad Musical</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Música, mixes y sets de adoración en alta calidad sin interrupciones.
            </p>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 transition-opacity active:scale-95 shadow-glow-cyan"
            >
              Ingresar como DJ / VJ
            </button>
          </div>
        )}
      </div>

      {/* 2. Menú de Navegación Lateral */}
      <nav className="glass-panel rounded-3xl p-2.5 space-y-1 border-white/[0.08] shadow-lg">
        <button
          onClick={() => onTabChange('inicio')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'inicio' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Inicio / Muro</span>
        </button>

        <button
          onClick={() => onTabChange('audios')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'audios' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Music className="w-4 h-4 text-cyan-400" />
          <span>Mixes de Audio</span>
        </button>

        <button
          onClick={() => onTabChange('videos')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'videos' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Video className="w-4 h-4 text-rose-400" />
          <span>Sets de Video (VJ)</span>
        </button>

        <button
          onClick={() => onTabChange('fotos')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'fotos' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Fotos de Eventos</span>
        </button>

        <button
          onClick={() => onTabChange('djs')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'djs' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>DJs & VJs Cristianos</span>
        </button>

        <button
          onClick={() => onTabChange('recursos')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'recursos' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-sky-400" />
          <span>Recursos & Loops</span>
        </button>

        <button
          onClick={() => onTabChange('guardados')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
            activeTab === 'guardados' 
              ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/25 text-cyan-300 border border-cyan-500/30 shadow-sm' 
              : 'text-zinc-300 hover:bg-white/[0.04]'
          }`}
        >
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <span>Mis Favoritos</span>
        </button>

        <button
          onClick={onOpenDonate}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors active:scale-95"
        >
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400/30" />
          <span>Sembrar / Donar</span>
        </button>
      </nav>

      {/* 3. Versículo del Día */}
      <div className="glass-panel rounded-3xl p-4 text-center border-white/[0.08]">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
          Versículo del Día
        </h5>
        <p className="text-xs text-zinc-300 italic leading-relaxed mb-1.5 font-normal">
          "Alabadle con pandero y danza; alabadle con cuerdas y flautas. Alabadle con címbalos resonantes..."
        </p>
        <span className="text-[9.5px] text-zinc-400 font-bold tracking-wider">— Salmo 150:4-5</span>
      </div>

      {/* 4. Donaciones PayPal */}
      <div className="glass-panel rounded-3xl p-4 text-center border-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent shadow-lg">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
          <HandCoins className="w-4 h-4" />
        </div>
        <h5 className="text-xs font-bold text-amber-300 mb-1">Sembrar en el Ministerio</h5>
        <p className="text-[10.5px] text-zinc-400 leading-snug mb-3 font-normal">
          Tu ofrenda voluntaria apoya el mantenimiento de los servidores de streaming HD.
        </p>
        <button
          onClick={onOpenDonate}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-dark-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-950/40 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Heart className="w-3.5 h-3.5 fill-dark-950" />
          <span>Ofrendar con PayPal</span>
        </button>
      </div>

    </aside>
  );
}
