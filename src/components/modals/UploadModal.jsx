import React, { useState, useRef, useEffect } from 'react';
import { X, CloudUpload, Loader2, Music, Video, Sparkles, CheckCircle2, FolderOpen, FileAudio, Camera, Image as ImageIcon, User, Disc, Crown, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MUX_SERVICE_URL } from '../../lib/supabase';
import { getAuthorDisplay } from '../../lib/roleUtils';

function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

export function UploadModal({ isOpen, onClose, onUploadSuccess, djs = [] }) {
  const { currentUser, currentProfile, isSuperAdmin, updateProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Worship');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('audio'); // 'audio' | 'video' | 'foto'
  const [postDisplayMode, setPostDisplayMode] = useState(currentProfile?.socials?.display_as || 'dj_name');
  // Super Admin: 'self' | 'registered' | 'guest'
  const [publishAsType, setPublishAsType] = useState('self');
  const [targetDjId, setTargetDjId] = useState('');
  const [guestDjName, setGuestDjName] = useState('');
  const [guestDjRole, setGuestDjRole] = useState('DJ / VJ Invitado 🎧');
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const fileInputRef = useRef(null);
  const allFilesInputRef = useRef(null);
  const previewUrlRef = useRef('');
  const closeTimerRef = useRef(null);

  const selectedTargetDj = publishAsType === 'registered'
    ? djs.find(d => d.id === targetDjId) || null
    : null;

  const activeAuthorProfile = publishAsType === 'registered' && selectedTargetDj
    ? selectedTargetDj
    : publishAsType === 'guest'
    ? { dj_name: guestDjName.trim() || 'DJ Invitado', full_name: guestDjName.trim() || 'DJ Invitado', role: guestDjRole.trim() || 'DJ / VJ Invitado 🎧' }
    : currentProfile;

  useEffect(() => {
    if (isOpen) {
      setPublishAsType('self');
      setTargetDjId('');
      setGuestDjName('');
      setGuestDjRole('DJ / VJ Invitado 🎧');
      setPostDisplayMode(currentProfile?.socials?.display_as || 'dj_name');
    }
  }, [currentProfile?.socials?.display_as, isOpen]);

  useEffect(() => {
    if (publishAsType === 'registered' && selectedTargetDj) {
      setPostDisplayMode(selectedTargetDj.socials?.display_as || 'dj_name');
    } else if (publishAsType === 'self') {
      setPostDisplayMode(currentProfile?.socials?.display_as || 'dj_name');
    } else if (publishAsType === 'guest') {
      setPostDisplayMode('dj_name');
    }
  }, [publishAsType, targetDjId]);

  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  };

  useEffect(() => {
    return () => {
      revokePreview();
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  /**
   * Inserta el post intentando atribuir `author_id` directamente cuando el Super Admin
   * elige un DJ/VJ registrado. Si RLS exige `auth.uid() = author_id` o es un invitado,
   * inserta con `currentUser.id` y guarda la atribución en `profiles.socials.post_author_overrides`.
   */
  async function insertPostWithAttribution(payload) {
    const wantsRegisteredProxy = isSuperAdmin && publishAsType === 'registered' && selectedTargetDj && selectedTargetDj.id !== currentUser.id;
    const wantsGuestProxy = isSuperAdmin && publishAsType === 'guest' && guestDjName.trim();

    if (wantsRegisteredProxy) {
      const { data, error } = await supabase
        .from('posts')
        .insert({ ...payload, author_id: selectedTargetDj.id })
        .select('id')
        .single();

      if (!error && data?.id) {
        return { postId: data.id, usedProxyFallback: false };
      }
      console.warn('RLS no permite author_id directo para Super Admin, usando atribución proxy:', error?.message);
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ ...payload, author_id: currentUser.id })
      .select('id')
      .single();

    if (error) throw error;

    const newPostId = data?.id;
    if (!newPostId) return { postId: null, usedProxyFallback: false };

    const existingSocials = currentProfile?.socials || {};
    const updates = { ...existingSocials };
    let needsProfileUpdate = false;

    if (wantsRegisteredProxy) {
      updates.post_author_overrides = {
        ...(existingSocials.post_author_overrides || {}),
        [newPostId]: {
          id: selectedTargetDj.id,
          username: selectedTargetDj.username || '',
          full_name: selectedTargetDj.full_name || '',
          dj_name: selectedTargetDj.dj_name || '',
          role: selectedTargetDj.role || 'DJ de Worship 🕊️',
          avatar_url: selectedTargetDj.avatar_url || '',
          is_dj: Boolean(selectedTargetDj.is_dj),
          is_moderator: Boolean(selectedTargetDj.is_moderator),
          is_super_admin: Boolean(selectedTargetDj.is_super_admin),
          display_as: postDisplayMode,
        },
      };
      needsProfileUpdate = true;
    } else if (wantsGuestProxy) {
      const gName = guestDjName.trim();
      const gRole = guestDjRole.trim() || 'DJ / VJ Invitado 🎧';
      updates.post_author_overrides = {
        ...(existingSocials.post_author_overrides || {}),
        [newPostId]: {
          id: null,
          username: '',
          full_name: gName,
          dj_name: gName,
          role: gRole,
          avatar_url: '',
          is_dj: true,
          display_as: postDisplayMode,
        },
      };
      needsProfileUpdate = true;
    } else {
      const profileDefaultMode = existingSocials.display_as || 'dj_name';
      if (postDisplayMode !== profileDefaultMode) {
        updates.post_display_modes = {
          ...(existingSocials.post_display_modes || {}),
          [newPostId]: postDisplayMode,
        };
        needsProfileUpdate = true;
      }
    }

    if (needsProfileUpdate) {
      try {
        await updateProfile({ socials: updates });
      } catch (e) {
        console.warn('No se pudo guardar atribución/visualización del post:', e);
      }
    }

    return { postId: newPostId, usedProxyFallback: wantsRegisteredProxy || wantsGuestProxy };
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      alert("Por favor selecciona un archivo multimedia o foto.");
      return;
    }

    setUploading(true);
    setStatusText("Preparando subida a DJ's Revolution...");
    setUploadProgress(15);

    try {
      let directFileUrl = null;

      // 📸 FLUJO RÁPIDO PARA FOTOS ESTILO INSTAGRAM
      if (fileType === 'foto') {
        setStatusText("Subiendo foto en alta definición...");
        setUploadProgress(40);
        const safeName = file.name.replace(/\s+/g, '_');
        const fileName = `${currentUser.id}/photos/${Date.now()}_${safeName}`;

        const { data: storageData, error: storageErr } = await supabase
          .storage
          .from('media')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (storageErr) throw storageErr;

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
        directFileUrl = publicUrl;

        setUploadProgress(85);
        setStatusText("Registrando publicación en el Muro...");

        await insertPostWithAttribution({
          title: title.trim(),
          content: description.trim(),
          description: description.trim(),
          genre: genre || 'Comunidad',
          type: 'foto',
          media_url: directFileUrl,
          cover_url: directFileUrl,
          file_url: directFileUrl,
          status: 'ready',
          downloads_count: 0
        });

        setUploadProgress(100);
        setStatusText("¡Foto publicada con éxito! 📸");

        closeTimerRef.current = setTimeout(() => {
          setUploading(false);
          onUploadSuccess();
          onClose();
        }, 700);
        return;
      }

      // 🎵 🎬 FLUJO PARA AUDIO Y VIDEO CON STREAMING
      let uploadId = null;
      let playbackId = null;
      let assetId = null;

      // 1. Intentar subir mediante Mux Direct Upload si está disponible
      try {
        setStatusText("Conectando con servidores de streaming de alta velocidad...");
        setUploadProgress(30);

        const edgeRes = await fetchWithTimeout(MUX_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_upload' })
        }, 15000);

        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          if (edgeData.upload_url) {
            uploadId = edgeData.upload_id;
            setStatusText("Subiendo archivo a DJ's Revolution...");
            setUploadProgress(50);

            // Subir binario directo a Mux (timeout amplio de 5 min para archivos pesados)
            const putRes = await fetchWithTimeout(edgeData.upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            }, 300000);

            if (putRes.ok) {
              setUploadProgress(70);
              setStatusText("Optimizando streaming HD...");

              // Consultar estado de Mux para obtener playback_id y asset_id
              if (uploadId) {
                for (let attempt = 0; attempt < 4; attempt++) {
                  await new Promise(r => setTimeout(r, 1500));
                  try {
                    const statusRes = await fetchWithTimeout(`${MUX_SERVICE_URL}?action=status&upload_id=${uploadId}`, {}, 10000);
                    if (statusRes.ok) {
                      const statusData = await statusRes.json();
                      if (statusData.asset_id) assetId = statusData.asset_id;
                      if (statusData.playback_id) {
                        playbackId = statusData.playback_id;
                        break;
                      }
                    }
                  } catch (_) {}
                }
              }
            }
          }
        }
      } catch (muxErr) {
        console.warn("Mux Edge service fallback, guardando archivo directo:", muxErr);
      }

      // 2. Subir también a Supabase Storage (bucket 'media') como copia permanente y respaldo
      try {
        setStatusText("Asegurando almacenamiento permanente...");
        setUploadProgress(85);
        const safeName = file.name.replace(/\s+/g, '_');
        const fileName = `${currentUser.id}/${Date.now()}_${safeName}`;
        
        const { data: storageData, error: storageErr } = await supabase
          .storage
          .from('media')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!storageErr && storageData) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
          directFileUrl = publicUrl;
        }
      } catch (stErr) {
        console.warn("Supabase Storage warning:", stErr);
      }

      setUploadProgress(92);
      setStatusText("Registrando publicación en el Muro...");

      // Determinar la URL final de reproducción (nunca persistir blob: URL local en BD)
      const streamUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;
      const finalMediaUrl = streamUrl || directFileUrl || '';
      if (!finalMediaUrl) {
        throw new Error('No se pudo subir el archivo ni generar una URL de almacenamiento.');
      }

      // 3. Insertar en tabla posts de Supabase con atribución del autor
      const isVideo = fileType === 'video';
      await insertPostWithAttribution({
        title: title.trim(),
        content: description.trim(),
        description: description.trim(),
        genre: genre,
        type: fileType,
        mux_upload_id: uploadId,
        mux_asset_id: assetId,
        mux_playback_id: playbackId,
        media_url: finalMediaUrl,
        audio_url: isVideo ? null : finalMediaUrl,
        video_url: isVideo ? finalMediaUrl : null,
        file_url: directFileUrl || finalMediaUrl,
        mux_audio_url: isVideo ? null : (directFileUrl || finalMediaUrl),
        status: 'ready',
        downloads_count: 0
      });

      setUploadProgress(100);
      setStatusText("¡Publicación realizada con éxito! 🕊️");
      
      closeTimerRef.current = setTimeout(() => {
        setUploading(false);
        onUploadSuccess();
        onClose();
      }, 700);

    } catch (err) {
      alert("Error al subir archivo: " + (err.message || err));
      setUploading(false);
    }
  }

  function handleFileSelected(e) {
    const selected = e.target.files?.[0];
    if (selected) {
      revokePreview();
      setFile(selected);
      if (!title.trim()) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, "");
        setTitle(cleanName);
      }
      if (selected.type.startsWith('image/')) {
        const objUrl = URL.createObjectURL(selected);
        previewUrlRef.current = objUrl;
        setImagePreview(objUrl);
      } else {
        setImagePreview('');
      }
    }
  }

  function switchFileType(nextType) {
    revokePreview();
    setFileType(nextType);
    setFile(null);
    setImagePreview('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => !uploading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {!uploading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-cyan-600/30">
            <CloudUpload className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Publicar en DJ's Revolution 🕊️
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Comparte tus mixes, fotos de eventos y videos con la comunidad
          </p>
        </div>

        {uploading ? (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-white mb-2">{statusText}</p>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div 
                  style={{ width: `${uploadProgress}%` }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                />
              </div>
              <span className="text-xs text-zinc-400 mt-1 block font-mono">{uploadProgress}%</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            
            {/* Selector de Tipo (3 Pestañas: Audio, Foto, Video) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => switchFileType('audio')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  fileType === 'audio'
                    ? 'bg-blue-600/25 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span className="truncate">Mix Audio</span>
              </button>

              <button
                type="button"
                onClick={() => switchFileType('foto')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  fileType === 'foto'
                    ? 'bg-amber-600/25 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="truncate">Foto 📸</span>
              </button>

              <button
                type="button"
                onClick={() => switchFileType('video')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  fileType === 'video'
                    ? 'bg-rose-600/25 text-rose-300 border-rose-500/50 shadow-sm'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span className="truncate">Video Set</span>
              </button>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                {fileType === 'foto' ? 'Título / Pie de Foto' : fileType === 'video' ? 'Título del Video / Set' : 'Título del Set / Pista'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={fileType === 'foto' ? "Ej: Ministrando en el Congreso Juvenil 2026" : "Ej: Set de Adoración Íntima Vol. 3"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Género / Categoría */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Categoría</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {fileType === 'foto' ? (
                  <>
                    <option value="Evento / Concierto">Evento / Concierto</option>
                    <option value="En la Cabina">En la Cabina de DJ / VJ</option>
                    <option value="Adoración">Momento de Adoración</option>
                    <option value="Comunidad">Comunidad & Amigos</option>
                    <option value="Equipos / Setup">Equipos / Setup DJ</option>
                  </>
                ) : (
                  <>
                    <option value="Worship">Worship / Adoración Íntima</option>
                    <option value="RemixCristiano">Remix Cristiano / EDM</option>
                    <option value="ReggaetonCristiano">Reggaetón / Urbano Cristiano</option>
                    <option value="PraiseAndWorship">Alabanza Congregacional</option>
                    <option value="VisualLoop">Loops para Proyectores (Visuales)</option>
                  </>
                )}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                {fileType === 'foto' ? 'Mensaje o Versículo (Opcional)' : 'Descripción o Dedicación (Opcional)'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={fileType === 'foto' ? "Escribe un mensaje de edificación, testimonio o agradecimiento..." : "Comentarios, pasaje bíblico o lista de temas..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Selector exclusivo de Super Admin: publicar en nombre de un DJ o VJ */}
            {isSuperAdmin && (
              <div className="p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Super Admin: Publicar en nombre de</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'self', label: 'Mi Cuenta' },
                    { id: 'registered', label: 'DJ / VJ del Sitio' },
                    { id: 'guest', label: 'DJ Invitado' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPublishAsType(opt.id)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                        publishAsType === opt.id
                          ? 'bg-amber-500/25 text-amber-200 border-amber-400/60'
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {publishAsType === 'registered' && (
                  <select
                    value={targetDjId}
                    onChange={(e) => setTargetDjId(e.target.value)}
                    required
                    className="w-full bg-dark-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Selecciona un DJ o VJ registrado --</option>
                    {djs.map((dj) => (
                      <option key={dj.id} value={dj.id}>
                        {getAuthorDisplay(dj).displayName} ({dj.role || 'DJ'})
                      </option>
                    ))}
                  </select>
                )}

                {publishAsType === 'guest' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={guestDjName}
                      onChange={(e) => setGuestDjName(e.target.value)}
                      placeholder="Nombre o Alias del DJ/VJ"
                      className="w-full bg-dark-950/70 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={guestDjRole}
                      onChange={(e) => setGuestDjRole(e.target.value)}
                      placeholder="Rol (ej: VJ Invitado)"
                      className="w-full bg-dark-950/70 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Cómo mostrar autor en esta publicación */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Publicar mostrando como:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full_name', label: 'Nombre', icon: User, preview: activeAuthorProfile?.full_name || activeAuthorProfile?.username || 'Nombre' },
                  { id: 'dj_name', label: 'Alias DJ', icon: Disc, preview: activeAuthorProfile?.dj_name || 'Alias DJ' },
                  { id: 'role', label: 'Rol', icon: Crown, preview: activeAuthorProfile?.role || 'Rol' },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = postDisplayMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPostDisplayMode(opt.id)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-cyan-500/20 border-cyan-400/60 text-white'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className={`w-3 h-3 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                        <span className="text-[11px] font-bold">{opt.label}</span>
                      </div>
                      <span className="block text-[10px] text-zinc-400 truncate mt-0.5">
                        {opt.preview}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Archivo Multimedia */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                {fileType === 'foto' ? 'Fotografía' : 'Archivo Multimedia'}
              </label>
              
              {/* Inputs ocultos */}
              <input
                ref={fileInputRef}
                type="file"
                id="media-file-input"
                accept={
                  fileType === 'foto'
                    ? "image/*,.jpg,.jpeg,.png,.webp,.gif"
                    : fileType === 'audio'
                    ? "audio/*,audio/mpeg,audio/wav,audio/aac,audio/x-m4a,audio/mp4,.mp3,.wav,.aac,.m4a,.ogg,.flac"
                    : "video/*,video/mp4,video/quicktime,.mp4,.mov,.mkv"
                }
                onChange={handleFileSelected}
                className="hidden"
              />

              <input
                ref={allFilesInputRef}
                type="file"
                id="all-files-input"
                accept="*/*"
                onChange={handleFileSelected}
                className="hidden"
              />

              <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-colors bg-white/[0.02]">
                {file ? (
                  <div className="py-2">
                    {imagePreview && fileType === 'foto' ? (
                      <div className="relative max-h-48 max-w-xs mx-auto mb-3 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain max-h-48" />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-cyan-400 mb-1">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate max-w-xs">{file.name}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block">
                      Tamaño: {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-zinc-300 hover:text-white px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-all"
                      >
                        Cambiar {fileType === 'foto' ? 'foto' : 'archivo'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {fileType === 'foto' ? (
                      <Camera className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                    ) : (
                      <CloudUpload className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                    )}

                    <span className="text-xs text-zinc-300 font-semibold block mb-1">
                      {fileType === 'foto' ? 'Selecciona tu fotografía' : 'Selecciona tu archivo de música o video'}
                    </span>
                    <span className="block text-[11px] text-zinc-500 mb-3">
                      {fileType === 'foto' ? 'JPG, PNG, WebP en alta calidad' : 'MP3, WAV, MP4, MOV hasta 250MB'}
                    </span>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        {fileType === 'foto' ? <ImageIcon className="w-4 h-4 text-amber-400" /> : <FileAudio className="w-4 h-4 text-cyan-400" />}
                        <span>{fileType === 'foto' ? 'Elegir Foto' : 'Elegir Archivo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => allFilesInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                        title="Explorar todos los archivos del dispositivo"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Explorador</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Publicar */}
            <button
              type="submit"
              disabled={!file}
              className={`w-full py-3 rounded-2xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                file
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 cursor-pointer shadow-glow-cyan active:scale-95' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{fileType === 'foto' ? 'Publicar Foto en el Muro' : 'Subir y Publicar en el Muro'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
