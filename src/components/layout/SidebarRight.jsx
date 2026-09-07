import React from 'react';
import { Download, Radio, Flame, Play, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export function SidebarRight({ topPosts = [], onOpenVideo }) {
  const { playTrack } = usePlayer();

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-72 flex-shrink-0">
      
      {/* Mixes Más Descargados */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Top Descargas
          </h4>
        </div>

        {topPosts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-3 text-center">
            Las pistas más bendecidas aparecerán aquí.
          </p>
        ) : (
          <div className="space-y-2.5">
            {topPosts.slice(0, 4).map((post, idx) => (
              <div
                key={post.id || idx}
                onClick={() => {
                  if (post.type === 'audio') {
                    playTrack({
                      id: post.id,
                      title: post.title,
                      artist: post.profiles?.dj_name || 'DJ',
                      coverUrl: post.cover_url,
                      audioUrl: post.mux_audio_url || post.file_url
                    });
                  } else {
                    onOpenVideo(post);
                  }
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group"
              >
                <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={post.cover_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="truncate">{post.profiles?.dj_name || 'DJ'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-cyan-400">
                      <Download className="w-2.5 h-2.5" />
                      {post.downloads_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cabina de Transmisión en Vivo (Horario Oficial de Panamá) */}
      <div className="glass-panel rounded-2xl p-4 border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Cabina Global PTY
          </h4>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          Próximas sesiones de adoración en vivo y ministración con sets de DJs invitados.
        </p>
        <div className="p-2.5 rounded-xl bg-dark-950/60 border border-white/10 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Sincronización de Horario</span>
          <span className="text-xs font-mono font-bold text-cyan-300">🇵🇦 Hora Oficial de Panamá (GMT-5)</span>
        </div>
      </div>

      {/* Calidad de Sonido Mux */}
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-white">Streaming HD sin Pérdida</h5>
          <p className="text-[11px] text-zinc-400">Audio y video optimizados para iglesias y eventos.</p>
        </div>
      </div>

    </aside>
  );
}
