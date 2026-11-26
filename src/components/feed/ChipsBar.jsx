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
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 my-5 select-none -mx-1 px-1 flex-wrap sm:flex-nowrap">
      {chips.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 active:scale-95 ${
              isActive
                ? 'bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-white shadow-[0_8px_20px_rgba(139,92,246,0.35)] border border-transparent'
                : 'bg-white/[0.04] hover:bg-white/[0.07] text-[#8f96b3] hover:text-[#f2f4fc] border border-white/[0.09] hover:border-white/[0.17]'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#8f96b3]'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
