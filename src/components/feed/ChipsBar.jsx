import React from 'react';
import { Sparkles, Music, Video, Users, FolderOpen, Bookmark, Camera } from 'lucide-react';

export function ChipsBar({ activeTab, onTabChange }) {
  const chips = [
    { id: 'inicio', label: 'Todos', icon: Sparkles },
    { id: 'audios', label: 'Mixes Audio', icon: Music },
    { id: 'videos', label: 'Sets Video VJ', icon: Video },
    { id: 'fotos', label: 'Fotos', icon: Camera },
    { id: 'djs', label: 'Directorio DJs', icon: Users },
    { id: 'recursos', label: 'Loops & FX', icon: FolderOpen },
    { id: 'guardados', label: 'Favoritos', icon: Bookmark },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 select-none -mx-1 px-1">
      {chips.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-900/40 border border-cyan-400/40 scale-[1.02]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
