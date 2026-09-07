import React, { useState } from 'react';
import { X, LogIn, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await signIn(email.trim(), password);
        onClose();
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Por favor ingresa tu Nombre o Usuario');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, fullName.trim());
        alert(`¡Cuenta creada con éxito! Bienvenido a DJ's Revolution, ${fullName}. Ahora puedes interactuar en el muro. 🕊️`);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al autenticar. Verifica tus credenciales.');
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
      <div className="relative w-full max-w-md bg-dark-900 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo de DJ's Revolution */}
        <div className="flex flex-col items-center justify-center mb-4">
          <img 
            src="/logo_emblem.png" 
            alt="DJ's Revolution" 
            className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.45)]"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-white/5 p-1 mb-6 border border-white/5">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-white">
            {tab === 'login' ? 'Acceso a la Cabina 🕊️' : 'Registro de Usuario 🎧'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {tab === 'login'
              ? 'Ingresa tus credenciales para interactuar en el muro'
              : 'Crea tu cuenta de oyente para escuchar, comentar y bendecir las publicaciones.'}
          </p>
        </div>

        {tab === 'signup' && (
          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] leading-snug mb-4 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-cyan-400 mt-0.5" />
            <span>
              Los nuevos registros inician como <strong>Usuarios Oyentes</strong>. Los permisos de <strong>DJ Creador</strong> y <strong>Moderador</strong> son asignados por los administradores.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Nombre Completo o de Usuario</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Daniel Gómez"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-glow-violet disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <span>{tab === 'login' ? 'Ingresar a la Plataforma 🎧' : 'Registrarme Gratis 🕊️'}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
