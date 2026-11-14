import React, { useState, useEffect, useRef } from 'react';
import { X, User, Settings, Heart, Save, Loader2, Instagram, Facebook, Youtube, Music, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { currentProfile, updateProfile, currentUser } = useAuth();

  const [djName, setDjName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [donationUrl, setDonationUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redes Sociales Oficiales
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');

  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (currentProfile) {
      setDjName(currentProfile.dj_name || '');
      setRole(currentProfile.role || '');
      setBio(currentProfile.bio || '');
      setDonationUrl(currentProfile.donation_url || '');
      setAvatarUrl(currentProfile.avatar_url || '');
      
      const socials = currentProfile.socials || {};
      setInstagram(socials.instagram || '');
      setFacebook(socials.facebook || '');
      setTiktok(socials.tiktok || '');
      setYoutube(socials.youtube || '');
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      alert("No se pudo subir la foto de perfil: " + (err.message || err));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        dj_name: djName.trim(),
        role: role.trim(),
        bio: bio.trim(),
        donation_url: donationUrl.trim() || null,
        avatar_url: avatarUrl || null,
        socials: {
          instagram: instagram.trim(),
          facebook: facebook.trim(),
          tiktok: tiktok.trim(),
          youtube: youtube.trim()
        }
      });
      alert("¡Perfil y redes actualizados con éxito! 🕊️");
      onProfileUpdated?.();
      onClose();
    } catch (err) {
      alert("Error al actualizar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[92vh] bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-y-auto no-scrollbar">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 border border-cyan-500/30">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Editar Perfil & Redes Sociales 🎧
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Personaliza tu presencia ministerial, foto y enlaces para la comunidad
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Foto de Perfil / Avatar */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-dark-800 border-2 border-cyan-500/40 flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <User className="w-8 h-8" />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-white mb-1">Foto de Perfil</span>
              <p className="text-[11px] text-zinc-400 mb-2">Formato cuadrado JPG o PNG recomendado</p>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingAvatar ? 'Subiendo...' : 'Cambiar Foto'}</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Datos Principales */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre Artístico / DJ</label>
            <input
              type="text"
              required
              value={djName}
              onChange={(e) => setDjName(e.target.value)}
              placeholder="Ej: DJ Worship Praise"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Rol o Ministerio</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: DJ de Worship, VJ de Proyección, Productor"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Biografía Ministerial</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a la congregación sobre tu ministerio y visión musical..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Enlace de Donación / Siembra */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Enlace de Siembra Personal (PayPal, Yappy, Link)</span>
            </label>
            <input
              type="url"
              value={donationUrl}
              onChange={(e) => setDonationUrl(e.target.value)}
              placeholder="https://paypal.me/tuusuario o enlace de soporte"
              className="w-full bg-white/5 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sección de Redes Sociales (Instagram, Facebook, TikTok, YouTube) */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-xs font-bold text-cyan-300 mb-3 uppercase tracking-wider">
              Redes Sociales Oficiales
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Instagram */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@tuusuario o URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                  <Facebook className="w-3.5 h-3.5 text-blue-400" />
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/tuusuario"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* TikTok */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-cyan-300" />
                  <span>TikTok</span>
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@tuusuario o URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400/50"
                />
              </div>

              {/* YouTube */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>YouTube</span>
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/@tucanal"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingAvatar}
            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando Cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Perfil y Redes</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
