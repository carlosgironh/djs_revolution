import React from 'react';
import { Home, Music, Video, Users, FolderOpen, Bookmark } from 'lucide-react';

export function ChipsBar({ activeTab, onTabChange }) {
  const chips = [
    { id: 'inicio', label: 'Muro Público', icon: Home },
    { id: 'audios', label: 'Mixes Audio', icon: Music },
    { id: 'videos', label: 'Sets Video', icon: Video },
    { id: 'djs', label: 'DJs & VJs', icon: Users },
    { id: 'recursos', label: 'Loops', icon: FolderOpen },
    { id: 'guardados', label: 'Guardados', icon: Bookmark },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 select-none -mx-1 px-1">
      {chips.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
              isActive
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
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
