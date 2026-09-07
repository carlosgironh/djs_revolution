import React from 'react';
import { Home, Music, Plus, Video, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function BottomNav({ activeTab, onTabChange, onOpenUpload, onToggleDrawer }) {
  const { currentUser, currentProfile, isSuperAdmin } = useAuth();
  const djName = currentProfile?.dj_name || 'DJ';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-dark-950/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] select-none">
      
      {/* 1. Muro */}
      <button
        onClick={() => {
          onTabChange('inicio');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
          activeTab === 'inicio' ? 'text-cyan-400 font-bold scale-105' : 'text-zinc-400 font-medium hover:text-zinc-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'inicio' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px]">Muro</span>
      </button>

      {/* 2. Mixes */}
      <button
        onClick={() => onTabChange('audios')}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
          activeTab === 'audios' ? 'text-cyan-400 font-bold scale-105' : 'text-zinc-400 font-medium hover:text-zinc-200'
        }`}
      >
        <Music className={`w-5 h-5 ${activeTab === 'audios' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px]">Mixes</span>
      </button>

      {/* 3. Subir (+) Botón Central Elevado */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onOpenUpload}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/50 -translate-y-3.5 ring-4 ring-dark-950 active:scale-90 transition-transform"
          aria-label="Subir nuevo mix o video"
        >
          <Plus className="w-6 h-6 stroke-[2.8px]" />
        </button>
      </div>

      {/* 4. Videos */}
      <button
        onClick={() => onTabChange('videos')}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
          activeTab === 'videos' ? 'text-cyan-400 font-bold scale-105' : 'text-zinc-400 font-medium hover:text-zinc-200'
        }`}
      >
        <Video className={`w-5 h-5 ${activeTab === 'videos' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
        <span className="text-[10px]">Videos</span>
      </button>

      {/* 5. Menú / Perfil */}
      <button
        onClick={onToggleDrawer}
        className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
          activeTab === 'perfil' ? 'text-cyan-400 font-bold' : 'text-zinc-400 font-medium hover:text-zinc-200'
        }`}
      >
        {currentUser ? (
          <Avatar 
            src={currentProfile?.avatar_url} 
            name={djName} 
            size="xs" 
            isSuperAdmin={isSuperAdmin} 
            className="ring-1 ring-cyan-500/40"
          />
        ) : (
          <Menu className="w-5 h-5 stroke-2" />
        )}
        <span className="text-[10px]">{currentUser ? 'Perfil' : 'Menú'}</span>
      </button>

    </nav>
  );
}
