import React from 'react';
import { Home, Music, Video, Users, FolderOpen, Bookmark, Heart, Settings, User, Crown, HandCoins, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function SidebarLeft({ activeTab, onTabChange, onOpenAuth, onOpenEditProfile, onOpenDonate, onOpenAdmin, mixesCount = 0, amenCount = 0 }) {
  const { currentUser, currentProfile, isSuperAdmin } = useAuth();
  const djName = currentProfile?.dj_name || currentUser?.email?.split('@')[0] || 'DJ';

  return (
    <aside className="hidden md:flex flex-col gap-5 w-64 flex-shrink-0">
      
      {/* Tarjeta de Usuario / Oyente */}
      <div className="glass-panel rounded-2xl p-4">
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
                <p className="text-xs text-zinc-400 truncate">
                  {currentProfile?.role || 'DJ de Worship 🕊️'}
                </p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/10 text-center mb-3">
              <div>
                <span className="block font-bold text-sm text-white">{mixesCount}</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Mixes</span>
              </div>
              <div>
                <span className="block font-bold text-sm text-amber-400">{amenCount}</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Amén 🕊️</span>
              </div>
            </div>

            {/* Acciones de Perfil */}
            <div className="flex gap-2">
              <button
                onClick={() => onTabChange('perfil')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Perfil</span>
              </button>
              <button
                onClick={onOpenEditProfile}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                title="Editar Perfil y Donaciones"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {isSuperAdmin && (
              <button
                onClick={onOpenAdmin}
                className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel de Administración 👑</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-2">
            <img 
              src="/logo_emblem.png" 
              alt="DJ's Revolution" 
              className="w-16 h-16 object-contain mx-auto mb-2 drop-shadow-[0_0_15px_rgba(14,165,233,0.45)] hover:scale-105 transition-transform"
            />
            <h4 className="font-bold text-sm text-white mb-1">¡Bienvenido a la Cabina!</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Música, mixes y sets de adoración en alta calidad sin interrupciones.
            </p>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 transition-opacity"
            >
              Ingresar como DJ / VJ
            </button>
          </div>
        )}
      </div>

      {/* Menú de Navegación Lateral */}
      <nav className="glass-panel rounded-2xl p-2.5 space-y-1">
        <button
          onClick={() => onTabChange('inicio')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'inicio' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Inicio / Muro</span>
        </button>

        <button
          onClick={() => onTabChange('audios')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'audios' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4 text-violet-400" />
          <span>Mixes de Audio</span>
        </button>

        <button
          onClick={() => onTabChange('videos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'videos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <Video className="w-4 h-4 text-rose-400" />
          <span>Sets de Video (VJ)</span>
        </button>

        <button
          onClick={() => onTabChange('djs')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'djs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 text-amber-400" />
          <span>DJs & VJs Cristianos</span>
        </button>

        <button
          onClick={() => onTabChange('recursos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'recursos' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-400" />
          <span>Recursos & Loops</span>
        </button>

        <button
          onClick={() => onTabChange('guardados')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'guardados' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
          }`}
        >
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <span>Mis Favoritos</span>
        </button>

        <button
          onClick={onOpenDonate}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 transition-colors"
        >
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400/40" />
          <span>Sembrar / Donar</span>
        </button>
      </nav>

      {/* Versículo del Día */}
      <div className="glass-panel rounded-2xl p-4 text-center">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
          Versículo del Día
        </h5>
        <p className="text-xs text-zinc-300 italic leading-relaxed mb-1">
          "Alabadle con pandero y danza; alabadle con cuerdas y flautas. Alabadle con címbalos resonantes..."
        </p>
        <span className="text-[10px] text-zinc-500 font-semibold">— Salmo 150:4-5</span>
      </div>

      {/* Widget Oficial de Donación PayPal */}
      <div className="glass-panel rounded-2xl p-4 text-center border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
          <HandCoins className="w-4 h-4" />
        </div>
        <h5 className="text-xs font-bold text-amber-300 mb-1">Sembrar en el Ministerio</h5>
        <p className="text-[11px] text-zinc-400 leading-snug mb-3">
          Tu ofrenda voluntaria apoya el mantenimiento de los servidores de streaming en alta velocidad.
        </p>
        <button
          onClick={onOpenDonate}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-dark-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-md shadow-amber-900/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Heart className="w-3.5 h-3.5 fill-dark-950" />
          <span>Ofrendar con PayPal</span>
        </button>
      </div>

    </aside>
  );
}
