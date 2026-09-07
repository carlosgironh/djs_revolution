import React, { useState } from 'react';
import { 
  Play, Pause, Download, MessageSquare, Bookmark, Share2, 
  Heart, Send, Crown, Check, Sparkles, Trash2, Shield 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import { formatPanamaTimestamp } from '../../lib/panamaTime';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../common/Avatar';

export function PostCard({ 
  post, 
  isSaved, 
  onToggleSave, 
  onOpenVideo, 
  onViewProfile, 
  onOpenAuth, 
  onRefresh 
}) {
  const { currentUser, canModerate } = useAuth();
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const author = post.profiles || { dj_name: 'DJ Creador', role: 'DJ de Worship 🕊️' };
  const isAuthorAdmin = Boolean(
    author.is_super_admin || 
    (author.role && author.role.toLowerCase().includes('admin')) ||
    author.username === 'carlosgironh'
  );
  const isAuthorMod = Boolean(
    !isAuthorAdmin && (
      author.is_moderator || 
      (author.role && author.role.toLowerCase().includes('moderador'))
    )
  );

  const canDeletePost = currentUser && (
    canModerate || 
    post.author_id === currentUser.id
  );

  async function handleDeletePost() {
    if (!confirm("¿Deseas eliminar esta publicación del muro? Esta acción no se puede deshacer.")) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
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
        await supabase.from('reactions').insert({
          post_id: post.id,
          user_id: currentUser.id,
          reaction_type: type
        });
        if (type === 'amen' || type === 'bendicion') {
          confetti({
            particleCount: 25,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#8b5cf6', '#0ea5e9', '#fbbf24']
          });
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
    const fileUrl = post.mux_audio_url || post.file_url;
    if (!fileUrl) {
      alert("El archivo se está procesando en alta definición. Estará listo en un momento.");
      return;
    }

    try {
      await supabase
        .from('posts')
        .update({ downloads_count: (post.downloads_count || 0) + 1 })
        .eq('id', post.id);
      onRefresh();
    } catch (e) {
      console.warn(e);
    }

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = `${post.title || 'mix'}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
      alert("¡Enlace copiado al portapapeles! Comparte la bendición 🕊️");
    }
  }

  // Cover image fallback
  const coverUrl = post.cover_url || (post.mux_playback_id 
    ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg` 
    : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80');

  return (
    <article className="glass-panel rounded-2xl p-4 sm:p-5 mb-4 shadow-lg shadow-black/40 transition-all hover:border-white/15">
      
      {/* Cabecera del Post: Autor & Hora Oficial Panamá */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div 
          onClick={() => onViewProfile(author.id)}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <Avatar
            src={author.avatar_url}
            name={author.dj_name}
            size="md"
            isSuperAdmin={isAuthorAdmin}
            className="group-hover:ring-cyan-400 transition-all"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                {author.dj_name}
              </h4>
              {isAuthorAdmin ? (
                <span className="flex items-center gap-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                  <Crown className="w-2.5 h-2.5" /> ADMIN
                </span>
              ) : isAuthorMod ? (
                <span className="flex items-center gap-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30 flex-shrink-0">
                  <Shield className="w-2.5 h-2.5" /> MOD
                </span>
              ) : null}
            </div>
            <p className="text-xs text-zinc-400 truncate">
              {author.role || 'DJ de Worship 🕊️'}
            </p>
          </div>
        </div>

        {/* Lado Derecho: Hora Oficial Panamá & Botón Moderación / Eliminar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div 
            className="text-right cursor-help"
            title={timeInfo.fullTooltip}
          >
            <span className="text-[11px] font-medium text-zinc-400 block">
              {timeInfo.relative}
            </span>
            <span className="text-[10px] font-mono text-cyan-400/90 font-semibold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20 inline-block mt-0.5">
              {timeInfo.panamaTime} (PTY)
            </span>
          </div>

          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
              title={canModerate && post.author_id !== currentUser?.id ? "Eliminar publicación (Moderador)" : "Eliminar publicación"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido / Descripción */}
      <div className="mb-3.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
            {post.title}
          </h3>
          <span className="text-[11px] font-semibold text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/25 flex-shrink-0">
            #{post.genre || 'Worship'}
          </span>
        </div>
        {post.content && (
          <p className="text-xs sm:text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {/* Contenedor Multimedia */}
      <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-4">
        {post.type === 'audio' ? (
          <div className="relative aspect-video sm:aspect-[21/9] max-h-72 w-full overflow-hidden flex items-center justify-center group">
            <img 
              src={coverUrl} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/30 to-transparent" />
            
            {/* Botón Central de Play / Pause */}
            <button
              onClick={() => playTrack({
                id: post.id,
                title: post.title,
                artist: author.dj_name,
                coverUrl: coverUrl,
                audioUrl: post.mux_audio_url || post.file_url
              })}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                isThisAudioPlaying
                  ? 'bg-cyan-500 shadow-cyan-500/50 scale-110'
                  : 'bg-white/20 hover:bg-white text-white hover:text-dark-950 hover:scale-110 backdrop-blur-md border border-white/30'
              }`}
              aria-label={isThisAudioPlaying ? "Pausar" : "Reproducir"}
            >
              {isThisAudioPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            {/* Badge HD Stream Mux */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>HD Audio Stream</span>
            </div>
          </div>
        ) : (
          /* Video / Recurso */
          <div 
            onClick={() => onOpenVideo(post)}
            className="relative aspect-video w-full cursor-pointer group overflow-hidden flex items-center justify-center"
          >
            <img 
              src={coverUrl} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            <button
              className="w-16 h-16 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-110 transition-transform"
              aria-label="Reproducir video"
            >
              <Play className="w-7 h-7 fill-white ml-1" />
            </button>

            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-rose-300">
              <span>{post.type === 'video' ? 'VJ Video Set (Mux HD)' : 'Visual Loop'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Reacción (Amén, Bendición, Me Gusta) */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-1 sm:gap-2">
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Amén */}
          <button
            onClick={() => handleReaction('amen')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myAmen 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
            }`}
          >
            <span>🕊️ Amén</span>
            <span className="font-mono text-[11px] opacity-80">{amenCount}</span>
          </button>

          {/* Bendición */}
          <button
            onClick={() => handleReaction('bendicion')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myBendicion 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
            }`}
          >
            <span>🙌 Bendición</span>
            <span className="font-mono text-[11px] opacity-80">{bendicionCount}</span>
          </button>

          {/* Me Gusta */}
          <button
            onClick={() => handleReaction('like')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              myLike 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${myLike ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span className="font-mono text-[11px] opacity-80">{likeCount}</span>
          </button>
        </div>

        {/* Acciones Secundarias (Comentar, Guardar, Descargar, Compartir) */}
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Comentarios"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-mono text-[11px]">{comments.length}</span>
          </button>

          <button
            onClick={() => onToggleSave(post.id)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isSaved ? 'text-amber-400' : 'hover:text-white'
            }`}
            title={isSaved ? "Guardado en favoritos" : "Guardar mix"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-colors"
            title="Descargar archivo"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Copiar enlace"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Sección Desplegable de Comentarios */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
          {/* Formulario para comentar */}
          {currentUser ? (
            <form onSubmit={handleSendComment} className="flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe una palabra de bendición o feedback..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commenting}
                className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-1">
              <button onClick={() => onOpenAuth('login')} className="text-cyan-400 underline font-bold">
                Inicia sesión
              </button> para bendecir con un comentario.
            </p>
          )}

          {/* Lista de comentarios */}
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-2">Sé el primero en comentar este set.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 items-start p-2 rounded-xl bg-white/5">
                  <Avatar
                    src={c.profiles?.avatar_url}
                    name={c.profiles?.dj_name}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[11px] text-white truncate">
                        {c.profiles?.dj_name || 'Hermano en Cristo'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[9px] text-zinc-500">
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
