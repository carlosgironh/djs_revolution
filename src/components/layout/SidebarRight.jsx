import React from 'react';
import { Download, Radio, Flame, Play, Sparkles } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { getStreamingMediaUrl, getDirectMediaUrl } from '../../lib/mediaUtils';
import { AdSenseBanner } from '../ads/AdSenseBanner';

export function SidebarRight({ topPosts = [], onOpenVideo }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  return (
    <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0 select-none">
      
      {/* 1. Mixes Más Descargados (Ranking Editorial) */}
      <div className="glass-panel rounded-3xl p-4 border-white/[0.08] shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Top Descargas
            </h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold">Worship Charts</span>
        </div>

        {topPosts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">
            Las pistas más bendecidas aparecerán aquí.
          </p>
        ) : (
          <div className="space-y-2">
            {topPosts.slice(0, 4).map((post, idx) => {
              const isThisPlaying = currentTrack?.id === post.id && isPlaying;
              const cover = post.cover_url || (post.mux_playback_id 
                ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg` 
                : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80');

              return (
                <div
                  key={post.id || idx}
                  onClick={() => {
                    if (post.type === 'audio') {
                      playTrack({
                        id: post.id,
                        title: post.title,
                        artist: post.profiles?.dj_name || 'DJ',
                        coverUrl: cover,
                        audioUrl: getStreamingMediaUrl(post),
                        fileUrl: getDirectMediaUrl(post)
                      });
                    } else {
                      onOpenVideo(post);
                    }
                  }}
                  className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-cyan-500/30 cursor-pointer transition-all group active:scale-95"
                >
                  {/* Número del Ranking */}
                  <span className={`w-5 text-center font-black text-xs ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-cyan-400' : 'text-zinc-500'
                  }`}>
                    #{idx + 1}
                  </span>

                  {/* Thumbnail de Portada */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-dark-900 border border-white/10">
                    <img
                      src={cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {post.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span className="truncate">{post.profiles?.dj_name || 'DJ'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-cyan-400 font-semibold">
                        <Download className="w-2.5 h-2.5" />
                        {post.downloads_count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Cabina de Transmisión en Vivo (Horario Oficial de Panamá) */}
      <div className="glass-panel rounded-3xl p-4 border-cyan-500/20 bg-gradient-to-b from-cyan-950/30 to-dark-900/60 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Cabina Global PTY
            </h4>
          </div>

          {/* Animación del Ecualizador */}
          <div className="flex items-end gap-0.5 h-4">
            <span className="w-0.5 bg-cyan-400 rounded-full animate-equalizer-1" />
            <span className="w-0.5 bg-cyan-400 rounded-full animate-equalizer-2" />
            <span className="w-0.5 bg-cyan-400 rounded-full animate-equalizer-3" />
            <span className="w-0.5 bg-cyan-400 rounded-full animate-equalizer-4" />
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-3 font-normal">
          Sesiones de adoración en vivo y ministración con sets de DJs internacionales.
        </p>

        <div className="p-2.5 rounded-2xl bg-dark-950/70 border border-white/10 text-center space-y-1 shadow-inner">
          <span className="text-[9.5px] uppercase font-bold text-zinc-400 block tracking-wider">
            Sincronización de Horario
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300">
            🇵🇦 Hora Oficial de Panamá (GMT-5)
          </span>
        </div>
      </div>

      {/* 3. Calidad de Sonido HD */}
      <div className="glass-panel rounded-3xl p-3.5 flex items-center gap-3 border-white/[0.08]">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-md flex-shrink-0">
          <div className="w-full h-full rounded-[14px] bg-dark-950 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-white">Streaming HD sin Pérdida</h5>
          <p className="text-[11px] text-zinc-400 leading-snug">Audio y video optimizados para iglesias y eventos.</p>
        </div>
      </div>

      {/* 4. Espacio Publicitario AdSense */}
      <AdSenseBanner />

    </aside>
  );
}
