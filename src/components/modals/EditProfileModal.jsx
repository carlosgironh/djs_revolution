import React, { useState, useEffect } from 'react';
import { X, User, Settings, Heart, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { currentProfile, updateProfile } = useAuth();

  const [djName, setDjName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [donationUrl, setDonationUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setDjName(currentProfile.dj_name || '');
      setRole(currentProfile.role || '');
      setBio(currentProfile.bio || '');
      setDonationUrl(currentProfile.donation_url || '');
      setInstagram(currentProfile.socials?.instagram || '');
      setYoutube(currentProfile.socials?.youtube || '');
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        dj_name: djName.trim(),
        role: role.trim(),
        bio: bio.trim(),
        donation_url: donationUrl.trim() || null,
        socials: {
          instagram: instagram.trim(),
          youtube: youtube.trim()
        }
      });
      alert("¡Perfil actualizado con éxito! 🕊️");
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
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">
            Editar Perfil y Donaciones 🎧
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Personaliza tus datos ministeriales y enlace de ofrenda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre Artístico</label>
            <input
              type="text"
              required
              value={djName}
              onChange={(e) => setDjName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Rol Ministerial</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: DJ de Worship, VJ de Proyección, etc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Biografía</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a la congregación sobre tu ministerio musical..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span>Tu Enlace de Siembra Personal (PayPal / Yappy)</span>
            </label>
            <input
              type="url"
              value={donationUrl}
              onChange={(e) => setDonationUrl(e.target.value)}
              placeholder="https://paypal.me/tuusuario o enlace de donación"
              className="w-full bg-white/5 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@tucuenta"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Canal de YouTube</label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-glow-violet disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
