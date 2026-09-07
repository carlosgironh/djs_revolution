import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId, email = '') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setCurrentProfile(data);
      } else {
        // Crear perfil inicial como Usuario Normal (Oyente)
        const name = email ? email.split('@')[0] : 'Usuario';
        const isCarlos = email === 'carlosgironh@gmail.com';

        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username: name,
            dj_name: isCarlos ? 'Carlos Girón (Super Admin)' : name,
            full_name: isCarlos ? 'Carlos Girón (Super Admin)' : name,
            role: isCarlos ? 'Super Admin 👑' : 'Usuario',
            is_super_admin: isCarlos,
            is_moderator: isCarlos,
            is_dj: isCarlos,
            avatar_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'
          })
          .select()
          .maybeSingle();
        if (newProfile) setCurrentProfile(newProfile);
      }
    } catch (err) {
      console.warn('Error al obtener perfil:', err);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        fetchProfile(user.id, user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.id, user.email);
      } else {
        setCurrentProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Jerarquía de Roles
  const isSuperAdmin = Boolean(
    currentProfile?.is_super_admin || 
    (currentProfile?.role && currentProfile.role.toLowerCase().includes('admin')) ||
    currentUser?.email === 'carlosgironh@gmail.com'
  );

  const isModerator = Boolean(
    isSuperAdmin || 
    currentProfile?.is_moderator || 
    (currentProfile?.role && currentProfile.role.toLowerCase().includes('moderador'))
  );

  const isDJ = Boolean(
    isSuperAdmin || 
    isModerator || 
    currentProfile?.is_dj || 
    (currentProfile?.role && (
      currentProfile.role.toLowerCase().includes('dj') || 
      currentProfile.role.toLowerCase().includes('creador') ||
      currentProfile.role.toLowerCase().includes('vj')
    ))
  );

  // Permisos derivados
  const canUpload = isDJ || isModerator || isSuperAdmin;
  const canModerate = isModerator || isSuperAdmin;
  const canManageUsers = isSuperAdmin;

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  // Registro público: siempre crea cuenta de Usuario Normal
  async function signUp(email, password, fullName) {
    const isCarlos = email.trim().toLowerCase() === 'carlosgironh@gmail.com';
    const initialRole = isCarlos ? 'Super Admin 👑' : 'Usuario';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName, 
          dj_name: fullName,
          role: initialRole
        }
      }
    });
    if (error) throw error;

    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: email.split('@')[0],
        full_name: fullName,
        dj_name: fullName,
        role: initialRole,
        is_super_admin: isCarlos,
        is_moderator: isCarlos,
        is_dj: isCarlos
      });
    }

    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentProfile(null);
  }

  async function updateProfile(fields) {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...fields,
        updated_at: new Date()
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    setCurrentProfile(data);
    return data;
  }

  // Administradores asignan y cambian roles de otros usuarios
  async function updateUserRole(targetUserId, newRole) {
    if (!isSuperAdmin) throw new Error('Solo los administradores pueden gestionar roles.');
    
    let is_super_admin = false;
    let is_moderator = false;
    let is_dj = false;

    if (newRole === 'Administrador' || newRole === 'Super Admin 👑') {
      is_super_admin = true;
      is_moderator = true;
      is_dj = true;
    } else if (newRole === 'Moderador' || newRole === 'Moderador 🛡️') {
      is_moderator = true;
      is_dj = true;
    } else if (newRole === 'DJ Creador' || newRole === 'DJ de Worship 🕊️') {
      is_dj = true;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        is_super_admin,
        is_moderator,
        is_dj,
        updated_at: new Date()
      })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentProfile,
      loading,
      isSuperAdmin,
      isModerator,
      isDJ,
      canUpload,
      canModerate,
      canManageUsers,
      signIn,
      signUp,
      signOut,
      updateProfile,
      updateUserRole,
      refreshProfile: () => currentUser && fetchProfile(currentUser.id, currentUser.email)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
