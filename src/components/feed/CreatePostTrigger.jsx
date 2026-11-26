import React, { useState } from 'react';
import { CloudUpload, Music, Video, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { getAuthorDisplay } from '../../lib/roleUtils';

export function CreatePostTrigger({ onOpenUpload, onOpenAuth }) {
  const { currentUser, currentProfile, isSuperAdmin, canUpload } = useAuth();
  const [draftText, setDraftText] = useState('');

  const userName = currentProfile
    ? getAuthorDisplay(currentProfile).displayName
    : (currentUser?.email?.split('@')[0] || 'DJ');

  function launchComposer(type = 'audio') {
    const desc = draftText.trim();
    onOpenUpload(type, desc);
    setDraftText('');
  }

  // 1. Invitado no autenticado
  if (!currentUser) {
    return (
      <div className="rounded-[20px] border border-violet-500/25 bg-gradient-to-r from-violet-950/35 via-white/[0.04] to-blue-950/30 backdrop-blur-xl p-4 sm:p-5 mb-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] p-0.5 shadow-glow-violet flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#070b16] flex items-center justify-center text-lg">
                🕊️
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#f2f4fc]">
                Comunidad Global de DJs y VJs de Adoración
              </h3>
              <p className="text-xs text-[#8f96b3] leading-snug">
                Escucha sets sin límites, descarga tracks en alta calidad y bendice a los ministros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth('signup')}
              className="btn-cta-shine flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] shadow-glow-violet active:scale-95 transition-all"
            >
              Crear Cuenta Gratis
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold text-[#8f96b3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] active:scale-95 transition-all"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Usuario Normal (Oyente)
  if (!canUpload) {
    return (
      <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-4 flex items-center gap-3 mb-4">
        <Avatar src={currentProfile?.avatar_url} name={userName} size="md" />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-[#f2f4fc] flex items-center gap-1.5 truncate">
            <span>¡Paz de Dios, {userName}! 🕊️</span>
            <span className="text-[10px] text-[#8f96b3] font-medium bg-white/[0.04] border border-white/[0.09] px-2 py-0.5 rounded-full">
              Oyente Activo
            </span>
          </h4>
          <p className="text-[11px] text-[#8f96b3] mt-0.5 truncate">
            Explora las mezclas más recientes y bendice con tu Amén a los ministros.
          </p>
        </div>
      </div>
    );
  }

  // 3. Composer Interactivo Estilo Estudio (DJ / Moderador / Super Admin)
  return (
    <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-4 sm:px-[18px] mb-4 transition-all duration-300 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10">
      <div className="flex gap-3">
        <Avatar
          src={currentProfile?.avatar_url}
          name={userName}
          size="md"
          isSuperAdmin={isSuperAdmin}
        />
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder={`¿Qué nuevo set o bendición vas a compartir hoy, ${userName}?`}
          className="flex-1 resize-none border border-white/[0.09] bg-black/30 rounded-[14px] px-4 py-3 text-[13.5px] text-[#f2f4fc] placeholder-[#5b6180] h-[52px] focus:h-[86px] focus:outline-none focus:border-violet-500/50 transition-all duration-300"
        />
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => launchComposer('audio')}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-[11px] text-xs font-semibold text-[#8f96b3] hover:text-[#f2f4fc] hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all"
          title="Subir Mix de Audio"
        >
          <Music className="w-4 h-4 text-[#22d3ee]" />
          <span className="hidden sm:inline">Audio</span>
        </button>

        <button
          type="button"
          onClick={() => launchComposer('video')}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-[11px] text-xs font-semibold text-[#8f96b3] hover:text-[#f2f4fc] hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all"
          title="Subir Set de Video VJ"
        >
          <Video className="w-4 h-4 text-[#fb7185]" />
          <span className="hidden sm:inline">Video</span>
        </button>

        <button
          type="button"
          onClick={() => launchComposer('foto')}
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-[11px] text-xs font-semibold text-[#8f96b3] hover:text-[#f2f4fc] hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all"
          title="Subir Fotografía"
        >
          <Camera className="w-4 h-4 text-[#fbbf24]" />
          <span className="hidden sm:inline">Foto</span>
        </button>

        <button
          type="button"
          onClick={() => launchComposer('audio')}
          className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-[12.5px] text-white bg-gradient-to-br from-[#22d3ee] to-[#3b82f6] shadow-[0_8px_20px_rgba(34,211,238,0.28)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(34,211,238,0.42)] active:scale-95 transition-all"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>Publicar</span>
        </button>
      </div>
    </div>
  );
}
