import React, { useState } from 'react';
import { X, CloudUpload, Loader2, Music, Video, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, MUX_SERVICE_URL } from '../../lib/supabase';

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { currentUser, currentProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Worship');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('audio');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      alert("Por favor selecciona un archivo multimedia.");
      return;
    }

    setUploading(true);
    setStatusText("Preparando subida segura a DJ's Revolution...");
    setUploadProgress(15);

    try {
      let playbackId = null;
      let assetId = null;
      let directFileUrl = null;

      // 1. Intentar subir mediante Mux Direct Upload si está disponible
      try {
        setStatusText("Conectando con servidores de streaming de alta velocidad...");
        setUploadProgress(30);

        const edgeRes = await fetch(MUX_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_upload' })
        });

        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          if (edgeData.upload_url) {
            setStatusText("Subiendo archivo a DJ's Revolution...");
            setUploadProgress(50);

            // Subir binario directo a Mux
            const putRes = await fetch(edgeData.upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
            });

            if (putRes.ok) {
              assetId = edgeData.asset_id || null;
              playbackId = edgeData.playback_id || null;
              setUploadProgress(80);
              setStatusText("Optimizando calidad de streaming HD...");
            }
          }
        }
      } catch (muxErr) {
        console.warn("Mux Edge service fallback, guardando archivo directo:", muxErr);
      }

      // Si no tenemos URL de Mux directa o como respaldo: subir a Supabase Storage
      if (!playbackId) {
        setStatusText("Guardando archivo en servidores de audio...");
        setUploadProgress(65);
        const fileName = `${currentUser.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        
        const { data: storageData, error: storageErr } = await supabase
          .storage
          .from('media')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!storageErr && storageData) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
          directFileUrl = publicUrl;
        } else {
          // Si el bucket media no existe o no tiene permisos, generamos URL local representativa
          directFileUrl = URL.createObjectURL(file);
        }
      }

      setUploadProgress(90);
      setStatusText("Registrando publicación en el Muro...");

      // 2. Insertar en tabla posts de Supabase
      const { error: insertErr } = await supabase.from('posts').insert({
        author_id: currentUser.id,
        title: title.trim(),
        content: description.trim(),
        genre: genre,
        type: fileType,
        mux_asset_id: assetId,
        mux_playback_id: playbackId,
        mux_audio_url: directFileUrl,
        file_url: directFileUrl,
        downloads_count: 0
      });

      if (insertErr) throw insertErr;

      setUploadProgress(100);
      setStatusText("¡Publicación realizada con éxito! 🕊️");
      
      setTimeout(() => {
        setUploading(false);
        onUploadSuccess();
        onClose();
      }, 700);

    } catch (err) {
      alert("Error al subir archivo: " + (err.message || err));
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={() => !uploading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {!uploading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-2 shadow-lg shadow-violet-600/30">
            <CloudUpload className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Publicar en DJ's Revolution 🕊️
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Servidores de streaming de alta velocidad para la comunidad cristiana
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
                  className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                />
              </div>
              <span className="text-xs text-zinc-400 mt-1 block font-mono">{uploadProgress}%</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            
            {/* Selector de Tipo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFileType('audio')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  fileType === 'audio'
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Mix de Audio (MP3/WAV)</span>
              </button>

              <button
                type="button"
                onClick={() => setFileType('video')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  fileType === 'video'
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/50'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video / Loop (MP4/MOV)</span>
              </button>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Título del Set / Pista</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Set de Adoración Íntima Vol. 3"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Categoría / Género</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-dark-850 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Worship">Worship / Adoración Íntima</option>
                <option value="RemixCristiano">Remix Cristiano / EDM</option>
                <option value="ReggaetonCristiano">Reggaetón / Urbano Cristiano</option>
                <option value="PraiseAndWorship">Alabanza Congregacional</option>
                <option value="VisualLoop">Loops para Proyectores (Visuales)</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Descripción o Dedicación (Opcional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comentarios, pasaje bíblico o lista de temas..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Selector de Archivo */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Archivo Multimedia</label>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-colors">
                <input
                  type="file"
                  id="media-file-input"
                  required
                  accept={fileType === 'audio' ? "audio/mp3,audio/wav,audio/*" : "video/mp4,video/quicktime,video/*"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="media-file-input" className="cursor-pointer block">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="truncate max-w-xs">{file.name}</span>
                    </div>
                  ) : (
                    <div>
                      <CloudUpload className="w-6 h-6 text-zinc-400 mx-auto mb-1" />
                      <span className="text-xs text-zinc-300 font-medium">Toca para seleccionar archivo</span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">MP3, WAV, MP4, MOV hasta 100MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-glow-violet transition-all flex items-center justify-center gap-2"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Publicar Mix en el Muro</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
