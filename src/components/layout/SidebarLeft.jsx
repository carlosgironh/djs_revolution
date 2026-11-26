import React from 'react';
import { Home, Music, Video, Users, FolderOpen, Bookmark, Heart, Settings, User, Crown, HandCoins, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { BRAND_LOGO_URL } from '../../lib/mediaUtils';
import { getAuthorDisplay } from '../../lib/roleUtils';

export function SidebarLeft({ activeTab, onTabChange, onOpenAuth, onOpenEditProfile, onOpenDonate, onOpenAdmin, mixesCount = 0, amenCount = 0, savedCount = 0 }) {
  const { currentUser, currentProfile, isSuperAdmin } = useAuth();
  const djName = currentProfile
    ? getAuthorDisplay(currentProfile).displayName
    : (currentUser?.email?.split('@')[0] || 'DJ');

  const navItems = [
    { id: 'inicio', label: 'Inicio / Muro', icon: Home, color: 'text-violet-400' },
    { id: 'audios', label: 'Mixes de Audio', icon: Music, color: 'text-[#22d3ee]' },
    { id: 'videos', label: 'Sets de Video (VJ)', icon: Video, color: 'text-[#fb7185]' },
    { id: 'fotos', label: 'Fotos de Eventos', icon: Camera, color: 'text-[#fbbf24]' },
    { id: 'djs', label: 'DJs & VJs Cristianos', icon: Users, color: 'text-[#34d399]' },
    { id: 'recursos', label: 'Recursos & Loops', icon: FolderOpen, color: 'text-sky-400' },
    { id: 'guardados', label: 'Mis Favoritos', icon: Bookmark, color: 'text-indigo-400' },
  ];

  return (
    <aside className="hidden md:flex flex-col gap-[18px] w-[245px] xl:w-[262px] flex-shrink-0 sticky top-[86px] select-none">
      
      {/* 1. Tarjeta de Perfil (pcard) */}
      <div className="relative overflow-hidden rounded-[20px] border border-white/[0.09] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-[18px] shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-br from-violet-500/50 to-cyan-400/30 opacity-50 pointer-events-none" />

        {currentUser ? (
          <div className="relative">
            <div className="flex items-center gap-3">
              <Avatar 
                src={currentProfile?.avatar_url} 
                name={djName} 
                size="lg" 
                isSuperAdmin={isSuperAdmin}
                className="ring-2 ring-amber-400/50 border-[3px] border-[#101527]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[13.5px] text-[#f2f4fc] truncate">{djName}</h4>
                  {isSuperAdmin && <Crown className="w-3.5 h-3.5 text-[#fbbf24] flex-shrink-0" title="Super Administrador" />}
                </div>
                <p className="text-[11px] text-[#8f96b3] truncate">
                  {currentProfile?.role || 'DJ de Worship 🕊️'}
                </p>
              </div>
            </div>

            {/* Estadísticas en barra 3 columnas */}
            <div className="flex mt-4 rounded-[14px] border border-white/[0.09] bg-black/30 overflow-hidden tabular-nums">
              <div className="flex-1 text-center py-2.5 px-1">
                <b className="block text-[17px] font-extrabold text-[#f2f4fc]">{mixesCount}</b>
                <span className="text-[9px] tracking-[1.4px] text-[#5b6180] uppercase font-bold">Mixes</span>
              </div>
              <div className="flex-1 text-center py-2.5 px-1 border-l border-white/[0.09]">
                <b className="block text-[17px] font-extrabold text-[#f2f4fc]">{amenCount}</b>
                <span className="text-[9px] tracking-[1.4px] text-[#5b6180] uppercase font-bold">Amén</span>
              </div>
              <div className="flex-1 text-center py-2.5 px-1 border-l border-white/[0.09]">
                <b className="block text-[17px] font-extrabold text-[#fbbf24]">{savedCount}</b>
                <span className="text-[9px] tracking-[1.4px] text-[#5b6180] uppercase font-bold">Favs</span>
              </div>
            </div>

            {/* Acciones de Perfil */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onTabChange('perfil')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[11px] text-xs font-semibold text-[#8f96b3] hover:text-[#f2f4fc] bg-white/[0.04] border border-white/[0.09] hover:border-white/[0.17] transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Perfil</span>
              </button>

              {isSuperAdmin ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[11px] text-xs font-semibold text-[#fbbf24] bg-amber-400/10 border border-amber-400/40 hover:bg-amber-400/20 hover:shadow-[0_6px_16px_rgba(251,191,36,0.2)] transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>
              ) : (
                <button
                  onClick={onOpenEditProfile}
                  className="px-2.5 py-2 rounded-[11px] bg-white/[0.04] hover:bg-white/[0.08] text-[#8f96b3] hover:text-white border border-white/[0.09] transition-all"
                  title="Editar Perfil y Redes"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative text-center py-2 px-1">
            <div className="inline-block px-3 py-1.5 rounded-xl bg-white/[0.07] border border-white/[0.1] mb-3">
              <img 
                src={BRAND_LOGO_URL} 
                alt="DJ's Revolution" 
                className="h-10 w-auto max-w-[160px] object-contain mx-auto"
              />
            </div>
            <h4 className="font-bold text-[13.5px] text-[#f2f4fc] mb-1">Comunidad Musical</h4>
            <p className="text-[11.5px] text-[#8f96b3] leading-relaxed mb-3.5">
              Música, mixes y sets de adoración en alta calidad sin interrupciones.
            </p>
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-cta-shine w-full py-2.5 px-3 rounded-[13px] text-xs font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] shadow-glow-violet hover:-translate-y-0.5 transition-all"
            >
              Ingresar como DJ / VJ
            </button>
          </div>
        )}
      </div>

      {/* 2. Menú de Navegación Lateral */}
      <nav className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-2.5">
        <div className="text-[9.5px] tracking-[2px] text-[#5b6180] px-2.5 pt-2 pb-1.5 uppercase font-bold">
          Menú
        </div>
        <div className="space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, color }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'nav-indicator-active font-semibold'
                    : 'text-[#8f96b3] hover:text-[#f2f4fc] hover:bg-white/[0.07]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#22d3ee]' : color}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenDonate}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#fbbf24] hover:bg-amber-400/10 transition-all"
          >
            <Heart className="w-4 h-4 text-[#fbbf24] fill-[#fbbf24]/30" />
            <span>Sembrar / Donar</span>
          </button>
        </div>
      </nav>

      {/* 3. Versículo del Día */}
      <div className="rounded-[20px] border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-cyan-400/5 p-[18px] text-center">
        <div className="text-[10px] tracking-[2.4px] text-[#c4b5fd] font-extrabold uppercase">
          ✦ Versículo del día
        </div>
        <p className="text-[12.5px] italic text-[#d8dcf0] leading-[1.7] my-2.5 font-normal">
          "Alabadle con pandero y danzas; alabadle con cuerdas y flautas. Alabadle con címbalos resonantes."
        </p>
        <cite className="not-italic text-[10.5px] text-[#8f96b3] font-bold">
          — Salmo 150:4-5
        </cite>
      </div>

      {/* 4. Sembrar en el Ministerio (Seed Card) */}
      <div className="rounded-[20px] border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-white/[0.02] p-[18px] text-center">
        <div className="w-9 h-9 rounded-full bg-amber-400/15 text-[#fbbf24] flex items-center justify-center mx-auto">
          <HandCoins className="w-4 h-4" />
        </div>
        <b className="text-[12.5px] block mt-2 mb-1 text-[#fbbf24] font-bold">Sembrar en el Ministerio</b>
        <p className="text-[11.5px] text-[#8f96b3] leading-relaxed mb-3 font-normal">
          Tu ofrenda voluntaria apoya el mantenimiento de los servidores de streaming HD.
        </p>
        <button
          onClick={onOpenDonate}
          className="btn-cta-shine w-full py-2.5 px-3 rounded-[13px] font-extrabold text-[12.5px] text-[#241a02] bg-gradient-to-br from-[#fde68a] via-[#fbbf24] to-[#f59e0b] shadow-glow-gold hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Heart className="w-3.5 h-3.5 fill-[#241a02]" />
          <span>Ofrendar con PayPal</span>
        </button>
      </div>

    </aside>
  );
}
