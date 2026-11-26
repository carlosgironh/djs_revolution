import React, { useMemo } from 'react';
import { Radio, Flame, Play, Pause, ArrowUpRight, Check, Clock, Wifi } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { usePanamaClock } from '../../hooks/usePanamaClock';
import { getCoverImageUrl, getStreamingMediaUrl, getDirectMediaUrl } from '../../lib/mediaUtils';
import { getAuthorDisplay, resolvePostAuthor } from '../../lib/roleUtils';
import { AdSenseBanner } from '../ads/AdSenseBanner';

export function SidebarRight({ topPosts = [], onOpenVideo }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { showToast } = useToast();
  const { time: panamaTime } = usePanamaClock();

  const rankedPosts = useMemo(
    () => [...topPosts]
      .filter(p => p.type === 'audio' || p.type === 'video')
      .sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0))
      .slice(0, 4),
    [topPosts]
  );

  const firstAudioPost = useMemo(
    () => rankedPosts.find(p => p.type === 'audio') || topPosts.find(p => p.type === 'audio'),
    [rankedPosts, topPosts]
  );

  function handleListenLive() {
    if (firstAudioPost) {
      const cover = getCoverImageUrl(firstAudioPost, 150);
      const artistName = getAuthorDisplay(resolvePostAuthor(firstAudioPost), firstAudioPost.id).displayName;
      playTrack({
        id: firstAudioPost.id,
        title: firstAudioPost.title,
        artist: artistName,
        coverUrl: cover,
        audioUrl: getStreamingMediaUrl(firstAudioPost),
        fileUrl: getDirectMediaUrl(firstAudioPost),
      });
      showToast('Sintonizando Cabina Global 🎧', firstAudioPost.title);
    } else if (rankedPosts[0]) {
      onOpenVideo?.(rankedPosts[0]);
    } else {
      showToast('Cabina Global PTY', 'Sintoniza las sesiones en vivo de la comunidad.');
    }
  }

  return (
    <aside className="hidden xl:flex flex-col gap-[18px] w-[322px] flex-shrink-0 sticky top-[86px] select-none">
      
      {/* 1. Top Descargas (Worship Charts) */}
      <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-[18px]">
        <div className="flex items-center gap-2 mb-3.5">
          <Flame className="w-3.5 h-3.5 text-[#fbbf24]" />
          <h4 className="text-[10.5px] tracking-[2px] text-[#5b6180] uppercase font-bold">
            Top Descargas · <span className="text-[#8f96b3] tracking-normal normal-case font-semibold">Worship Charts</span>
          </h4>
        </div>

        {rankedPosts.length === 0 ? (
          <p className="text-xs text-[#8f96b3] py-4 text-center">
            Las pistas más bendecidas aparecerán aquí.
          </p>
        ) : (
          <div className="space-y-1">
            {rankedPosts.map((post, idx) => {
              const isThisPlaying = currentTrack?.id === post.id && isPlaying;
              const cover = getCoverImageUrl(post, 150);
              const artistName = getAuthorDisplay(resolvePostAuthor(post), post.id).displayName;

              const rankStyle = idx === 0
                ? 'bg-gradient-to-br from-[#fde68a] to-[#fbbf24] text-[#241a02]'
                : idx === 1
                ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-900'
                : idx === 2
                ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-[#2a1002]'
                : 'bg-white/[0.08] text-[#8f96b3]';

              return (
                <div
                  key={post.id || idx}
                  onClick={() => {
                    if (post.type === 'audio') {
                      playTrack({
                        id: post.id,
                        title: post.title,
                        artist: artistName,
                        coverUrl: cover,
                        audioUrl: getStreamingMediaUrl(post),
                        fileUrl: getDirectMediaUrl(post)
                      });
                    } else {
                      onOpenVideo(post);
                    }
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-[14px] cursor-pointer transition-all group ${
                    isThisPlaying
                      ? 'bg-violet-500/15 border border-violet-400/35'
                      : 'hover:bg-white/[0.07] border border-transparent'
                  }`}
                >
                  <div className={`w-[30px] h-[30px] flex-none rounded-[10px] grid place-items-center font-extrabold text-xs ${rankStyle}`}>
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : `#${idx + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <b className="block text-[12.5px] font-bold text-[#f2f4fc] truncate group-hover:text-white">
                      {post.title}
                    </b>
                    <small className="block text-[10.5px] text-[#5b6180] truncate">
                      {artistName} · ⬇ {post.downloads_count || 0}
                    </small>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-[#5b6180] group-hover:text-[#22d3ee] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Cabina Global PTY */}
      <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-[18px]">
        <h4 className="text-[10.5px] tracking-[2px] text-[#5b6180] uppercase font-bold flex items-center gap-2 mb-3">
          <Radio className="w-3.5 h-3.5 text-[#22d3ee]" />
          <span>Cabina Global PTY</span>
        </h4>

        <div className="flex items-end gap-1 h-[30px] mb-3">
          {[0, 0.12, 0.24, 0.06, 0.3, 0.18, 0.36, 0.09].map((delay, i) => (
            <span
              key={i}
              style={{ animation: `bar-bounce 1.1s ease-in-out infinite ${delay}s` }}
              className="flex-1 rounded-[3px] bg-gradient-to-b from-[#22d3ee] to-[#8b5cf6]"
            />
          ))}
        </div>

        <p className="text-xs text-[#8f96b3] leading-relaxed mb-3 font-normal">
          Sesiones de adoración en vivo y ministración con sets de DJs internacionales.
        </p>

        <button
          type="button"
          onClick={handleListenLive}
          className="w-full py-2.5 rounded-xl border border-cyan-400/45 bg-cyan-400/[0.08] hover:bg-cyan-400/[0.16] text-[#22d3ee] font-bold text-xs flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_20px_rgba(34,211,238,0.2)] active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Escuchar en vivo</span>
        </button>
      </div>

      {/* 3. Hora Oficial de Panamá */}
      <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-[18px] text-center">
        <h4 className="text-[10.5px] tracking-[2px] text-[#5b6180] uppercase font-bold flex items-center justify-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-[#c4b5fd]" />
          <span>Hora Oficial de Panamá</span>
        </h4>
        <div className="text-[28px] font-extrabold text-[#f2f4fc] tabular-nums tracking-tight my-1">
          {panamaTime}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[#34d399] border border-emerald-400/35 bg-emerald-400/[0.08] px-3 py-1 rounded-full font-bold">
          <Check className="w-3 h-3 stroke-[2.8]" />
          Sincronizado · GMT-5
        </span>
      </div>

      {/* 4. Streaming HD sin Pérdida */}
      <div className="rounded-[20px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl p-[18px] flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] flex-none rounded-[13px] grid place-items-center text-white bg-gradient-to-br from-[#22d3ee] to-[#3b82f6] shadow-glow-cyan">
          <Wifi className="w-5 h-5" />
        </div>
        <div>
          <b className="text-[13px] font-bold text-[#f2f4fc] block mb-0.5">Streaming HD sin Pérdida</b>
          <p className="text-[11.5px] text-[#8f96b3] leading-relaxed">
            Audio y video optimizados para iglesias y eventos.
          </p>
        </div>
      </div>

      {/* 5. Espacio Publicitario AdSense */}
      <AdSenseBanner />

    </aside>
  );
}
