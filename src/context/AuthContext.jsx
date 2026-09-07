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
        // Crear perfil inicial si no existía
        const name = email ? email.split('@')[0] : 'DJ';
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            username: name,
            dj_name: `DJ ${name}`,
            full_name: `DJ ${name}`,
            role: 'DJ de Worship 🕊️',
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

  const isSuperAdmin = Boolean(
    currentProfile?.is_super_admin || 
    (currentProfile?.role && currentProfile.role.includes('Super Admin')) ||
    currentUser?.email === 'carlosgironh@gmail.com'
  );

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, djName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { dj_name: djName, full_name: djName }
      }
    });
    if (error) throw error;
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

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentProfile,
      loading,
      isSuperAdmin,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile: () => currentUser && fetchProfile(currentUser.id, currentUser.email)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
