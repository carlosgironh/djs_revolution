import React from 'react';
import { 
  X, Home, Music, Video, Users, FolderOpen, Bookmark, 
  Heart, Clock, User, Settings, Upload, LogOut, LogIn, UserPlus, Crown, Shield, ShieldCheck, Disc 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePanamaClock } from '../../hooks/usePanamaClock';
import { Avatar } from '../common/Avatar';

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange, 
  onOpenAuth, 
  onOpenEditProfile, 
  onOpenUpload, 
  onOpenDonate,
  onOpenAdmin 
}) {
  const { currentUser, currentProfile, isSuperAdmin, isModerator, isDJ, canUpload, signOut } = useAuth();
  const { time: panamaTime } = usePanamaClock();

  if (!isOpen) return null;

  const userName = currentProfile?.dj_name || currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'Usuario';

  function handleNav(tab) {
    onTabChange(tab);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative w-full max-w-xs h-full bg-dark-950 border-l border-white/10 flex flex-col z-10 shadow-2xl overflow-y-auto">
        
        {/* Header con Perfil / Invitado */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {currentUser ? (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar 
                src={currentProfile?.avatar_url} 
                name={userName} 
                size="md" 
                isSuperAdmin={isSuperAdmin} 
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-white truncate">{userName}</h4>
                  {isSuperAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  ) : isModerator ? (
                    <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  ) : null}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  {isSuperAdmin ? 'Super Administrador 👑' : isModerator ? 'Moderador de Cabina 🛡️' : isDJ ? 'DJ Creador 🎧' : 'Usuario Oyente 🕊️'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">
                🕊️
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Oyente Público</h4>
                <p className="text-xs text-zinc-400">Muro libre de adoración</p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 p-4 space-y-6">
          
          {/* Navegación del Muro */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2 px-2">
              Navegación del Muro
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('inicio')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'inicio' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span>Muro Público Global</span>
              </button>

              <button
                onClick={() => handleNav('audios')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'audios' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Music className="w-4 h-4 text-violet-400" />
                <span>Mixes de Audio</span>
              </button>

              <button
                onClick={() => handleNav('videos')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'videos' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Video className="w-4 h-4 text-rose-400" />
                <span>Sets de Video (VJ)</span>
              </button>

              <button
                onClick={() => handleNav('djs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'djs' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Directorio de DJs Cristianos</span>
              </button>

              <button
                onClick={() => handleNav('recursos')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'recursos' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-emerald-400" />
                <span>Loops y Proyección</span>
              </button>

              <button
                onClick={() => handleNav('guardados')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'guardados' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span>Mis Guardados</span>
              </button>
            </div>
          </div>

          {/* Gestión de Cuenta */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2 px-2">
              Mi Cuenta & Rol
            </span>
            <div className="space-y-1">
              {currentUser ? (
                <>
                  {/* Panel de Admin (Solo Super Administradores) */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => { onClose(); onOpenAdmin(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all mb-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Panel de Administración 👑</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleNav('perfil')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 transition-all"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Ver Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onOpenEditProfile(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Editar Perfil & Donaciones</span>
                  </button>

                  {/* Subir mix solo si tiene permisos de DJ/Mod/Admin */}
                  {canUpload && (
                    <button
                      onClick={() => { onClose(); onOpenUpload(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-300 hover:bg-violet-500/10 transition-all"
                    >
                      <Upload className="w-4 h-4 text-violet-400" />
                      <span>Subir Mix o Video</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onClose(); signOut(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onClose(); onOpenAuth('login'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-white/5 transition-all"
                  >
                    <LogIn className="w-4 h-4 text-cyan-400" />
                    <span>Iniciar Sesión</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onOpenAuth('signup'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-violet-400" />
                    <span>Crear Cuenta Gratis</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Ministerio & Donación PayPal */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2 px-2">
              Ministerio & Siembra
            </span>
            <button
              onClick={() => { onClose(); onOpenDonate(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Heart className="w-4 h-4 text-amber-400 fill-amber-400/40" />
              <span>Sembrar Ofrenda (PayPal)</span>
            </button>
          </div>

          {/* Reloj y Versículo Footer */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hora de Cabina:</span>
              <span className="font-mono font-bold text-white">{panamaTime}</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1 rounded">PTY</span>
            </div>
            <p className="text-[11px] italic text-zinc-400 leading-snug">
              "Alabadle con címbalos de júbilo; alabadle con címbalos resonantes..." — Salmo 150:5
            </p>
          </div>

        </div>
      </aside>
    </div>
  );
}
