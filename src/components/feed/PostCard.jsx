import React, { useState } from 'react';
import { 
  Play, Pause, Download, MessageSquare, Bookmark, Share2, 
  Heart, Send, Crown, Check, Sparkles, Trash2, Shield, Camera, Maximize2, UserCog 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { useToast } from '../../context/ToastContext';
import { formatPanamaTimestamp } from '../../lib/panamaTime';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../common/Avatar';
import { InlineVideoPlayer } from '../common/InlineVideoPlayer';
import { downloadMediaFile, getCoverImageUrl, getDirectMediaUrl, getStreamingMediaUrl } from '../../lib/mediaUtils';
import { getAuthorDisplay, getUserRoleFlags, resolvePostAuthor } from '../../lib/roleUtils';

export function PostCard({ 
  post, 
  djs = [],
  isSaved, 
  onToggleSave, 
  onOpenVideo, 
  onViewProfile, 
  onOpenAuth, 
  onRefresh 
}) {
  const { currentUser, currentProfile, isSuperAdmin, canModerate, updateProfile } = useAuth();
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showIdentityMenu, setShowIdentityMenu] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  function handlePhotoDoubleClick() {
    handleReaction('amen');
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  }

  const author = post.profiles || { dj_name: 'DJ Creador', role: 'DJ de Worship 🕊️' };
  const isOwnPost = Boolean(currentUser && post.author_id === currentUser.id);
  const canEditIdentity = isOwnPost || isSuperAdmin;
  const effectiveAuthor = resolvePostAuthor(post, currentUser, currentProfile);
  const { isSuperAdmin: isAuthorAdmin, isModOnly: isAuthorMod } = getUserRoleFlags(effectiveAuthor);
  const { displayName: authorDisplayName, subtitle: authorSubtitle, mode: authorDisplayMode } = getAuthorDisplay(effectiveAuthor, post.id);

  const canDeletePost = currentUser && (
    canModerate || 
    isOwnPost
  );

  async function handleChangePostIdentity(mode) {
    if (!canEditIdentity || savingIdentity) return;
    setSavingIdentity(true);
    try {
      const baseSocials = (isOwnPost ? currentProfile?.socials : author?.socials) || currentProfile?.socials || {};
      const existingAuthorOverrides = baseSocials.post_author_overrides || {};
      const currentAuthorOverride = existingAuthorOverrides[post.id];

      if (currentAuthorOverride && isOwnPost) {
        await updateProfile({
          socials: {
            ...baseSocials,
            post_author_overrides: {
              ...existingAuthorOverrides,
              [post.id]: {
                ...currentAuthorOverride,
                display_as: mode,
              },
            },
          },
        });
      } else if (isOwnPost) {
        const existingModes = baseSocials.post_display_modes || {};
        await updateProfile({
          socials: {
            ...baseSocials,
            post_display_modes: {
              ...existingModes,
              [post.id]: mode,
            },
          },
        });
      }
      setShowIdentityMenu(false);
      onRefresh?.();
    } catch (err) {
      alert('Error al cambiar cómo se muestra el autor: ' + err.message);
    } finally {
      setSavingIdentity(false);
    }
  }

  async function handleAssignPostAuthor(targetId) {
    if (!isSuperAdmin || savingIdentity) return;
    setSavingIdentity(true);
    try {
      const baseSocials = currentProfile?.socials || {};
      const nextOverrides = { ...(baseSocials.post_author_overrides || {}) };

      if (!targetId || targetId === currentUser?.id) {
        // Restaurar a mi cuenta
        if (post.author_id !== currentUser?.id) {
          await supabase.from('posts').update({ author_id: currentUser.id }).eq('id', post.id);
        }
        delete nextOverrides[post.id];
        if (isOwnPost || currentProfile?.socials?.post_author_overrides?.[post.id]) {
          await updateProfile({
            socials: {
              ...baseSocials,
              post_author_overrides: nextOverrides,
            },
          });
        }
      } else {
        const targetDj = djs.find(d => d.id === targetId);
        if (targetDj) {
          const { error: updErr } = await supabase
            .from('posts')
            .update({ author_id: targetDj.id })
            .eq('id', post.id);

          if (!updErr) {
            delete nextOverrides[post.id];
            if (currentProfile?.socials?.post_author_overrides?.[post.id]) {
              await updateProfile({
                socials: {
                  ...baseSocials,
                  post_author_overrides: nextOverrides,
                },
              });
            }
          } else if (isOwnPost) {
            // Fallback por RLS usando atribución proxy en socials del Super Admin
            await updateProfile({
              socials: {
                ...baseSocials,
                post_author_overrides: {
                  ...nextOverrides,
                  [post.id]: {
                    id: targetDj.id,
                    username: targetDj.username || '',
                    full_name: targetDj.full_name || '',
                    dj_name: targetDj.dj_name || '',
                    role: targetDj.role || 'DJ de Worship 🕊️',
                    avatar_url: targetDj.avatar_url || '',
                    is_dj: Boolean(targetDj.is_dj),
                    is_moderator: Boolean(targetDj.is_moderator),
                    is_super_admin: Boolean(targetDj.is_super_admin),
                    display_as: targetDj.socials?.display_as || 'dj_name',
                  },
                },
              },
            });
          } else {
            throw updErr;
          }
        }
      }
      setShowIdentityMenu(false);
      onRefresh?.();
    } catch (err) {
      alert('No se pudo reasignar el DJ/VJ autor: ' + (err.message || err));
    } finally {
      setSavingIdentity(false);
    }
  }

  async function handleDeletePost() {
    if (!confirm("¿Deseas eliminar esta publicación del muro? Esta acción no se puede deshacer.")) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      if (isOwnPost && currentProfile?.socials?.post_display_modes?.[post.id]) {
        const nextModes = { ...currentProfile.socials.post_display_modes };
        delete nextModes[post.id];
        updateProfile({
          socials: {
            ...currentProfile.socials,
            post_display_modes: nextModes,
          },
        }).catch(() => {});
      }
      onRefresh();
    } catch (err) {
      alert('Error al eliminar publicación: ' + err.message);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("¿Deseas eliminar este comentario?")) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      onRefresh();
    } catch (err) {
      alert('Error al eliminar comentario: ' + err.message);
    }
  }

  const timeInfo = formatPanamaTimestamp(post.created_at);
  const isThisAudioPlaying = currentTrack?.id === post.id && isPlaying;

  const reactions = post.reactions || [];
  const amenCount = reactions.filter(r => r.reaction_type === 'amen').length;
  const bendicionCount = reactions.filter(r => r.reaction_type === 'bendicion').length;
  const likeCount = reactions.filter(r => r.reaction_type === 'like').length;

  const myAmen = currentUser && reactions.some(r => r.user_id === currentUser.id && r.reaction_type === 'amen');
  const myBendicion = currentUser && reactions.some(r => r.user_id === currentUser.id && r.reaction_type === 'bendicion');
  const myLike = currentUser && reactions.some(r => r.user_id === currentUser.id && r.reaction_type === 'like');

  const comments = post.comments || [];

  function triggerReactionBurst(type) {
    const emojiMap = { amen: '🙏', bendicion: '✨', like: '❤️' };
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingEmojis((prev) => [...prev, { id, type, emoji: emojiMap[type] || '✨' }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 950);
  }

  async function handleReaction(type) {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    try {
      const existing = reactions.find(r => r.user_id === currentUser.id && r.reaction_type === type);
      if (existing) {
        await supabase.from('reactions').delete().eq('id', existing.id);
      } else {
        triggerReactionBurst(type);
        await supabase.from('reactions').insert({
          post_id: post.id,
          user_id: currentUser.id,
          reaction_type: type
        });
        if (type === 'amen' || type === 'bendicion') {
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
              particleCount: 28,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#8b5cf6', '#22d3ee', '#fbbf24', '#ffffff']
            });
          }).catch(() => {});
        }
      }
      onRefresh();
    } catch (err) {
      console.error('Error al reaccionar:', err);
    }
  }

  async function handleSendComment(e) {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!commentText.trim() || commenting) return;

    setCommenting(true);
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        author_id: currentUser.id,
        text: commentText.trim()
      });
      if (error) throw error;
      setCommentText('');
      onRefresh();
    } catch (err) {
      alert('Error al comentar: ' + err.message);
    } finally {
      setCommenting(false);
    }
  }

  async function handleDownload() {
    await downloadMediaFile(post, onRefresh);
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
      setCopiedLink(true);
      showToast('Enlace copiado al portapapeles 🔗', 'Comparte esta bendición con tu comunidad');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  // Cover image fallback
  const coverUrl = getCoverImageUrl(post, 600);

  return (
    <article className="glass-card rounded-[20px] p-4 sm:p-[22px] mb-[18px] relative transition-all duration-300 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
      
      {/* 1. Cabecera del Post: Autor, Rol, Hora Oficial PTY */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div 
          onClick={() => effectiveAuthor?.id && onViewProfile(effectiveAuthor.id)}
          className={`flex items-center gap-3 group min-w-0 ${effectiveAuthor?.id ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="relative">
            <Avatar
              src={effectiveAuthor.avatar_url}
              name={authorDisplayName}
              size="md"
              isSuperAdmin={isAuthorAdmin}
              className="group-hover:ring-2 group-hover:ring-[#22d3ee] transition-all"
            />
            {isThisAudioPlaying && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#22d3ee] ring-2 ring-[#070b16]">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm sm:text-[15.5px] text-white group-hover:text-[#c4b5fd] transition-colors truncate">
                {authorDisplayName}
              </h4>
              {isAuthorAdmin ? (
                <span className="flex items-center gap-0.5 bg-amber-400/15 text-[#fde68a] text-[9.5px] font-black px-1.5 py-0.5 rounded-md border border-amber-400/35 flex-shrink-0">
                  <Crown className="w-2.5 h-2.5 text-[#fbbf24]" /> ADMIN
                </span>
              ) : isAuthorMod ? (
                <span className="flex items-center gap-0.5 bg-violet-500/20 text-[#c4b5fd] text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border border-violet-500/35 flex-shrink-0">
                  <Shield className="w-2.5 h-2.5" /> MOD
                </span>
              ) : null}
            </div>
            {authorSubtitle && (
              <p className="text-[11px] sm:text-xs text-[#94a3b8] truncate">
                {authorSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Lado Derecho: Hora Oficial Panamá & Opciones de Autor */}
        <div className="relative flex items-center gap-2 flex-shrink-0">
          <div 
            className="text-right cursor-help select-none"
            title={timeInfo.fullTooltip}
          >
            <span className="text-[11px] font-medium text-[#94a3b8] block leading-tight">
              {timeInfo.relative}
            </span>
            <span className="text-[9.5px] font-mono text-[#67e8f9] font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-400/20 inline-block mt-0.5">
              {timeInfo.panamaTime} PTY
            </span>
          </div>

          {canEditIdentity && (
            <button
              type="button"
              onClick={() => setShowIdentityMenu(!showIdentityMenu)}
              disabled={savingIdentity}
              className={`p-1.5 rounded-xl border transition-all ${
                showIdentityMenu
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 hover:bg-cyan-500/15 text-zinc-400 hover:text-cyan-300 border-white/5 hover:border-cyan-500/30'
              }`}
              title="Cambiar autor o cómo se muestra en esta publicación"
            >
              <UserCog className="w-3.5 h-3.5" />
            </button>
          )}

          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
              title={canModerate && post.author_id !== currentUser?.id ? "Eliminar publicación (Moderador)" : "Eliminar publicación"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Popover rápido de identidad y reasignación (Super Admin) */}
          {canEditIdentity && showIdentityMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-dark-900 border border-cyan-500/30 shadow-2xl p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-2">
              {isSuperAdmin && djs.length > 0 && (
                <div className="pb-2 border-b border-white/10">
                  <span className="block px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Publicar en nombre de (DJ / VJ):
                  </span>
                  <select
                    value={effectiveAuthor?.id || ''}
                    disabled={savingIdentity}
                    onChange={(e) => handleAssignPostAuthor(e.target.value)}
                    className="w-full mt-1 bg-dark-950 border border-amber-500/30 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={currentUser?.id || ''}>Mi Cuenta ({currentProfile?.full_name || 'Admin'})</option>
                    {djs
                      .filter(d => d.id !== currentUser?.id)
                      .map(dj => (
                        <option key={dj.id} value={dj.id}>
                          {getAuthorDisplay(dj).displayName} ({dj.role || 'DJ'})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {isOwnPost && (
                <div>
                  <span className="block px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Mostrar autor como:
                  </span>
                  {[
                    { id: 'full_name', label: 'Nombre', value: effectiveAuthor.full_name || effectiveAuthor.username || 'Nombre' },
                    { id: 'dj_name', label: 'Alias DJ', value: effectiveAuthor.dj_name || effectiveAuthor.full_name || 'Alias DJ' },
                    { id: 'role', label: 'Rol', value: effectiveAuthor.role || 'Rol' },
                  ].map((opt) => {
                    const isSelected = authorDisplayMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={savingIdentity}
                        onClick={() => handleChangePostIdentity(opt.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-200 font-bold'
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block font-bold">{opt.label}</span>
                          <span className="block text-[10px] text-zinc-400 truncate">{opt.value}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Título & Descripción */}
      <div className="mb-3.5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-extrabold text-base sm:text-[17.5px] text-white leading-snug tracking-tight">
            {post.title}
          </h3>
          <span className="text-[10.5px] font-bold text-[#c4b5fd] bg-violet-500/15 px-2.5 py-0.5 rounded-full border border-violet-400/25 flex-shrink-0">
            #{post.genre || 'Worship'}
          </span>
        </div>
        {post.content && (
          <p className="text-xs sm:text-sm text-[#cbd5e1] whitespace-pre-line leading-relaxed font-normal">
            {post.content}
          </p>
        )}
      </div>

      {/* 3. Contenedor Multimedia Principal */}
      <div className="relative rounded-[16px] overflow-hidden bg-[#070b16]/90 border border-white/[0.08] mb-3.5 shadow-inner">
        {post.type === 'audio' ? (
          /* Mix de Audio con Portada, Reproductor y Ecualizador */
          <div className="relative aspect-video sm:aspect-[21/9] max-h-72 w-full overflow-hidden flex items-center justify-center group">
            <img 
              src={coverUrl} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75"
              loading="lazy"
            />
            {/* Gradiente de atmósfera */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/95 via-dark-950/40 to-transparent" />
            
            {/* Disco de vinilo animado en reproducción */}
            {isThisAudioPlaying && (
              <div className="absolute -left-8 sm:left-4 top-1/2 -translate-y-1/2 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-black/80 border-2 border-white/20 shadow-2xl flex items-center justify-center animate-spin-slow pointer-events-none opacity-80 sm:opacity-95">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border border-white/30 flex items-center justify-center bg-cyan-900/60">
                  <div className="w-3 h-3 rounded-full bg-cyan-400" />
                </div>
              </div>
            )}

            {/* Botón Central de Reproducción */}
            <button
              onClick={() => playTrack({
                id: post.id,
                title: post.title,
                artist: authorDisplayName,
                coverUrl: coverUrl,
                audioUrl: getStreamingMediaUrl(post),
                fileUrl: getDirectMediaUrl(post)
              })}
              className={`relative z-10 w-14 sm:w-16 h-14 sm:h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 ${
                isThisAudioPlaying
                  ? 'bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] shadow-glow-violet scale-110 border border-white/30'
                  : 'bg-[#8b5cf6]/85 hover:bg-gradient-to-br hover:from-[#8b5cf6] hover:to-[#3b82f6] text-white hover:scale-110 backdrop-blur-md border border-white/25 shadow-glow-violet'
              }`}
              aria-label={isThisAudioPlaying ? "Pausar" : "Reproducir"}
            >
              {isThisAudioPlaying ? (
                <Pause className="w-6 sm:w-7 h-6 sm:h-7 fill-white" />
              ) : (
                <Play className="w-6 sm:w-7 h-6 sm:h-7 fill-current ml-1" />
              )}
            </button>

            {/* Ecualizador animado cuando se reproduce */}
            {isThisAudioPlaying && (
              <div className="absolute bottom-3 right-4 flex items-end gap-1 h-5 px-2.5 py-1 rounded-full bg-[#070b16]/75 backdrop-blur-md border border-violet-400/25">
                <span className="w-1 bg-gradient-to-t from-[#22d3ee] to-[#8b5cf6] rounded-full animate-equalizer-1" />
                <span className="w-1 bg-gradient-to-t from-[#22d3ee] to-[#8b5cf6] rounded-full animate-equalizer-2" />
                <span className="w-1 bg-gradient-to-t from-[#22d3ee] to-[#8b5cf6] rounded-full animate-equalizer-3" />
                <span className="w-1 bg-gradient-to-t from-[#22d3ee] to-[#8b5cf6] rounded-full animate-equalizer-4" />
              </div>
            )}

            {/* Badge HD Audio */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-cyan-300 shadow-md">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>HD Audio Stream</span>
            </div>
          </div>
        ) : post.type === 'foto' ? (
          /* Fotografía estilo Instagram con Doble Toque Amén */
          <div 
            className="relative w-full max-h-[560px] bg-dark-950/80 overflow-hidden flex items-center justify-center group cursor-pointer select-none"
            onDoubleClick={handlePhotoDoubleClick}
            onClick={() => onOpenVideo?.(post)}
          >
            <img 
              src={getDirectMediaUrl(post) || getStreamingMediaUrl(post) || post.media_url || post.cover_url} 
              alt={post.title} 
              className="w-full max-h-[560px] object-contain group-hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />

            {/* Badge Foto */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-300 shadow-md">
              <Camera className="w-3 h-3 text-amber-400" />
              <span>Foto / Galería</span>
            </div>

            {/* Hint Pantalla Completa */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-cyan-400" />
              <span>Ver Completo</span>
            </div>

            {/* Animación de Doble Toque (Amén 🕊️) */}
            {showHeartAnim && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                <div className="w-20 h-20 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/60 flex items-center justify-center text-4xl shadow-2xl">
                  🕊️
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Video Inline */
          <InlineVideoPlayer
            streamUrl={getStreamingMediaUrl(post)}
            playbackId={post.mux_playback_id}
            directUrl={getDirectMediaUrl(post)}
            posterUrl={coverUrl}
            title={post.title}
            badge={post.type === 'video' ? 'VJ Video Set (HD)' : 'Visual Loop'}
            onExpand={() => onOpenVideo?.(post)}
          />
        )}
      </div>

      {/* 4. Barra de Acciones Sociales (Reacciones + Interacciones) */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 gap-1 sm:gap-2">
        
        {/* Reacciones Ministeriales */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Amén */}
          <button
            onClick={() => handleReaction('amen')}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myAmen 
                ? 'bg-amber-400/20 text-[#fde68a] border border-amber-400/45 shadow-[0_0_16px_rgba(251,191,36,0.2)]' 
                : 'bg-white/[0.04] hover:bg-white/[0.09] text-[#cbd5e1] border border-white/[0.08]'
            }`}
          >
            {floatingEmojis.filter(f => f.type === 'amen').map(f => (
              <span key={f.id} className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg animate-float-emoji z-20">
                {f.emoji}
              </span>
            ))}
            <span>🙏 Amén</span>
            <span className="font-mono text-[11px] opacity-85">{amenCount}</span>
          </button>

          {/* Bendición */}
          <button
            onClick={() => handleReaction('bendicion')}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myBendicion 
                ? 'bg-emerald-400/20 text-[#6ee7b7] border border-emerald-400/45 shadow-[0_0_16px_rgba(52,211,153,0.2)]' 
                : 'bg-white/[0.04] hover:bg-white/[0.09] text-[#cbd5e1] border border-white/[0.08]'
            }`}
          >
            {floatingEmojis.filter(f => f.type === 'bendicion').map(f => (
              <span key={f.id} className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg animate-float-emoji z-20">
                {f.emoji}
              </span>
            ))}
            <span>✨ Bendición</span>
            <span className="font-mono text-[11px] opacity-85">{bendicionCount}</span>
          </button>

          {/* Me Gusta */}
          <button
            onClick={() => handleReaction('like')}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myLike 
                ? 'bg-rose-400/20 text-[#fda4af] border border-rose-400/45 shadow-[0_0_16px_rgba(251,113,133,0.2)]' 
                : 'bg-white/[0.04] hover:bg-white/[0.09] text-[#cbd5e1] border border-white/[0.08]'
            }`}
          >
            {floatingEmojis.filter(f => f.type === 'like').map(f => (
              <span key={f.id} className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg animate-float-emoji z-20">
                {f.emoji}
              </span>
            ))}
            <Heart className={`w-3.5 h-3.5 ${myLike ? 'fill-[#fb7185] text-[#fb7185]' : ''}`} />
            <span className="font-mono text-[11px] opacity-85">{likeCount}</span>
          </button>
        </div>

        {/* Acciones Secundarias (Comentarios, Descargar, Compartir, Guardar) */}
        <div className="flex items-center gap-1 text-[#94a3b8]">
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 text-xs active:scale-95"
            title="Comentarios"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono text-[11px]">{comments.length}</span>
          </button>

          <button
            onClick={() => onToggleSave(post.id)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 ${
              isSaved ? 'text-amber-400' : 'hover:text-white'
            }`}
            title={isSaved ? "Guardado en tus favoritos" : "Guardar en favoritos"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-colors active:scale-95"
            title="Descargar archivo en alta calidad"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 ${
              copiedLink ? 'text-emerald-400' : 'hover:text-white'
            }`}
            title="Copiar enlace directo"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Toast sutil de enlace copiado */}
      {copiedLink && (
        <div className="mt-2 text-center py-1 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold animate-in fade-in duration-200">
          ¡Enlace copiado al portapapeles! Comparte la bendición 🕊️
        </div>
      )}

      {/* 5. Sección Desplegable de Comentarios */}
      {showComments && (
        <div className="mt-4 pt-3.5 border-t border-white/[0.08] space-y-3 animate-in fade-in duration-200">
          {/* Formulario de Comentario */}
          {currentUser ? (
            <form onSubmit={handleSendComment} className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe una palabra de bendición o testimonio..."
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commenting}
                className="p-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:from-[#a78bfa] hover:to-[#22d3ee] text-white disabled:opacity-40 transition-all active:scale-95 shadow-glow-violet"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-1">
              <button onClick={() => onOpenAuth('login')} className="text-cyan-400 underline font-bold">
                Inicia sesión
              </button> para unirte a la conversación.
            </p>
          )}

          {/* Lista de Comentarios */}
          <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-2.5">
                Sé el primero en dejar un comentario o testimonio.
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 items-start p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.04]">
                  <Avatar
                    src={c.profiles?.avatar_url}
                    name={getAuthorDisplay(c.profiles).displayName}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] text-white truncate">
                        {c.profiles ? getAuthorDisplay(c.profiles).displayName : 'Hermano en Cristo'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[9.5px] text-zinc-500">
                          {formatPanamaTimestamp(c.created_at).relative}
                        </span>
                        {currentUser && (canModerate || c.author_id === currentUser.id) && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors"
                            title={canModerate && c.author_id !== currentUser.id ? "Eliminar comentario (Moderación)" : "Eliminar comentario"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-snug mt-0.5">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </article>
  );
}
