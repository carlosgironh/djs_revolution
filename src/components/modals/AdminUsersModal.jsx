import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Users, Search, Crown, Shield, Disc, UserCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

export function AdminUsersModal({ isOpen, onClose, onUserRoleUpdated }) {
  const { isSuperAdmin, updateUserRole, currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
    } catch (e) {
      console.warn("Error cargando usuarios:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      loadUsers();
    }
  }, [isOpen, isSuperAdmin]);

  if (!isOpen || !isSuperAdmin) return null;

  async function handleChangeRole(user, newRole) {
    if (user.id === currentUser?.id && newRole !== 'Super Admin 👑' && newRole !== 'Administrador') {
      if (!confirm("¿Estás seguro de quitarte a ti mismo los permisos de Administrador?")) {
        return;
      }
    }

    setUpdatingId(user.id);
    try {
      await updateUserRole(user.id, newRole);
      alert(`¡Rol de ${user.dj_name || user.full_name || 'usuario'} actualizado a "${newRole}" con éxito!`);
      await loadUsers();
      onUserRoleUpdated?.();
    } catch (err) {
      alert("Error al actualizar rol: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.dj_name || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-dark-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Panel de Administración y Moderación 👑
            </h3>
            <p className="text-xs text-zinc-400">
              Crea moderadores, promueve DJs y gestiona los permisos de los usuarios.
            </p>
          </div>
        </div>

        {/* Barra de Búsqueda y Conteo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, usuario o rol..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-2 rounded-xl flex-shrink-0">
            {users.length} Usuarios Registrados
          </span>
        </div>

        {/* Lista de Usuarios */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1">
          {loading ? (
            <div className="py-12 text-center text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
              <p className="text-xs">Cargando directorio de usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-10">
              No se encontraron usuarios que coincidan con la búsqueda.
            </p>
          ) : (
            filteredUsers.map((u) => {
              const isUserAdmin = Boolean(
                u.is_super_admin || 
                (u.role && u.role.toLowerCase().includes('admin')) ||
                u.username === 'carlosgironh'
              );
              const isUserMod = Boolean(
                u.is_moderator || 
                (u.role && u.role.toLowerCase().includes('moderador'))
              );
              const isUserDJ = Boolean(
                u.is_dj || 
                (u.role && (u.role.toLowerCase().includes('dj') || u.role.toLowerCase().includes('creador')))
              );

              return (
                <div
                  key={u.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
                >
                  {/* Info Usuario */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={u.avatar_url}
                      name={u.dj_name || u.full_name || u.username}
                      size="md"
                      isSuperAdmin={isUserAdmin}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {u.dj_name || u.full_name || u.username}
                        </h4>
                        
                        {/* Badge de Rol Actual */}
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                            <Crown className="w-2.5 h-2.5" /> Administrador
                          </span>
                        ) : isUserMod ? (
                          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                            <Shield className="w-2.5 h-2.5" /> Moderador
                          </span>
                        ) : isUserDJ ? (
                          <span className="inline-flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/40">
                            <Disc className="w-2.5 h-2.5" /> DJ Creador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-zinc-700/40 text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-zinc-600/30">
                            Usuario Oyente
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        @{u.username || 'usuario'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones para Cambiar Rol */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto">
                    {updatingId === u.id ? (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin mr-2" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChangeRole(u, 'Usuario')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            !isUserAdmin && !isUserMod && !isUserDJ
                              ? 'bg-zinc-700 text-white'
                              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                          title="Asignar como Usuario Oyente"
                        >
                          Oyente
                        </button>

                        <button
                          onClick={() => handleChangeRole(u, 'DJ Creador')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isUserDJ && !isUserMod && !isUserAdmin
                              ? 'bg-cyan-600 text-white'
                              : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                          }`}
                          title="Promover a DJ Creador (puede subir pistas)"
                        >
                          DJ
                        </button>

                        <button
                          onClick={() => handleChangeRole(u, 'Moderador')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isUserMod && !isUserAdmin
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                          }`}
                          title="Promover a Moderador (puede moderar contenido)"
                        >
                          Moderador
                        </button>

                        <button
                          onClick={() => handleChangeRole(u, 'Administrador')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            isUserAdmin
                              ? 'bg-amber-500 text-dark-950 font-black'
                              : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                          }`}
                          title="Promover a Administrador (control total)"
                        >
                          Admin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Los cambios de rol toman efecto de inmediato.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
