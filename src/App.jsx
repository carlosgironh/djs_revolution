import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { ChipsBar } from './components/feed/ChipsBar';
import { CreatePostTrigger } from './components/feed/CreatePostTrigger';
import { PostCard } from './components/feed/PostCard';
import { DJDirectory } from './components/feed/DJDirectory';
import { PersistentPlayer } from './components/player/PersistentPlayer';
import { AuthModal } from './components/modals/AuthModal';
import { UploadModal } from './components/modals/UploadModal';
import { DonationModal } from './components/modals/DonationModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { DJProfileModal } from './components/modals/DJProfileModal';
import { VideoLightboxModal } from './components/modals/VideoLightboxModal';
import { Disc, Sparkles } from 'lucide-react';

export function App() {
  const { currentUser, currentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [djs, setDjs] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingDjs, setLoadingDjs] = useState(false);

  // Favoritos guardados localmente
  const [savedPostIds, setSavedPostIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('djs_revolution_saved') || '[]');
    } catch {
      return [];
    }
  });

  // Estados de modales
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [selectedDJProfile, setSelectedDJProfile] = useState(null);
  const [djProfileModalOpen, setDjProfileModalOpen] = useState(false);
  const [selectedVideoPost, setSelectedVideoPost] = useState(null);
  const [videoLightboxOpen, setVideoLightboxOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Cargar Posts de Supabase
  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (*),
          reactions (*),
          comments (*, profiles:author_id (*))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error cargando posts:", error);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error("Error al consultar posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }

  // Cargar DJs
  async function fetchDJs() {
    setLoadingDjs(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setDjs(data || []);
    } catch (err) {
      console.error("Error cargando DJs:", err);
    } finally {
      setLoadingDjs(false);
    }
  }

  useEffect(() => {
    fetchPosts();
    fetchDJs();
  }, []);

  function handleToggleSave(postId) {
    let next;
    if (savedPostIds.includes(postId)) {
      next = savedPostIds.filter(id => id !== postId);
      alert("Eliminado de guardados.");
    } else {
      next = [...savedPostIds, postId];
      alert("¡Guardado en tus favoritos! 🕊️");
    }
    setSavedPostIds(next);
    localStorage.setItem('djs_revolution_saved', JSON.stringify(next));
  }

  async function handleViewProfile(profileId) {
    if (!profileId) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      if (data) {
        setSelectedDJProfile(data);
        setDjProfileModalOpen(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'perfil') {
      if (currentProfile) {
        setSelectedDJProfile(currentProfile);
        setDjProfileModalOpen(true);
      } else {
        setAuthModalTab('login');
        setAuthModalOpen(true);
      }
    }
  }

  // Filtrado de posts
  let filteredPosts = posts;

  if (activeTab === 'audios') {
    filteredPosts = filteredPosts.filter(p => p.type === 'audio');
  } else if (activeTab === 'videos') {
    filteredPosts = filteredPosts.filter(p => p.type === 'video');
  } else if (activeTab === 'recursos') {
    filteredPosts = filteredPosts.filter(p => p.type === 'recurso');
  } else if (activeTab === 'guardados') {
    filteredPosts = filteredPosts.filter(p => savedPostIds.includes(p.id));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(p => 
      (p.title || '').toLowerCase().includes(q) ||
      (p.profiles?.dj_name || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q) ||
      (p.genre || '').toLowerCase().includes(q)
    );
  }

  // Estadísticas del usuario actual
  const myPosts = currentUser ? posts.filter(p => p.author_id === currentUser.id) : [];
  let myAmenTotal = 0;
  myPosts.forEach(p => {
    myAmenTotal += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
  });

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-zinc-100">
      
      {/* 1. Barra de Navegación Superior */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
        onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
        onOpenDonate={() => setDonateModalOpen(true)}
        onToggleDrawer={() => setMobileDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Contenedor Principal */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex gap-6 flex-1 pb-24 md:pb-12">
        
        {/* Sidebar Izquierda (Desktop) */}
        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
          onOpenEditProfile={() => setEditProfileModalOpen(true)}
          onOpenDonate={() => setDonateModalOpen(true)}
          mixesCount={myPosts.length}
          amenCount={myAmenTotal}
        />

        {/* Feed Central */}
        <main className="flex-1 min-w-0">
          
          {/* Barra de Filtros Horizontales (Mobile & Desktop) */}
          <ChipsBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Cuadro de Publicar */}
          <CreatePostTrigger
            onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
            onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
          />

          {/* Vistas según pestaña */}
          {activeTab === 'djs' ? (
            <DJDirectory
              djs={djs}
              loading={loadingDjs}
              onViewProfile={handleViewProfile}
            />
          ) : (
            <div>
              {loadingPosts ? (
                <div className="glass-panel rounded-2xl p-12 text-center text-zinc-400">
                  <Disc className="w-8 h-8 mx-auto mb-2 animate-spin text-cyan-400" />
                  <p className="text-sm">Cargando publicaciones del muro...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="glass-panel rounded-2xl p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mx-auto mb-3">
                    🕊️
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">
                    {searchQuery ? 'Sin resultados de búsqueda' : 'Cabina Lista • Muro en Espera'}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4 leading-relaxed">
                    {searchQuery 
                      ? 'No encontramos ningún mix o DJ que coincida con tu búsqueda.' 
                      : 'Sé el primero en subir un mix de adoración o set de video a la comunidad.'}
                  </p>
                  <button
                    onClick={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
                    className="py-2 px-5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 shadow-glow-violet transition-all"
                  >
                    {currentUser ? 'Publicar el Primer Mix 🎧' : 'Crear Cuenta de DJ Gratis'}
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={handleToggleSave}
                    onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
                    onViewProfile={handleViewProfile}
                    onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
                    onRefresh={fetchPosts}
                  />
                ))
              )}
            </div>
          )}

        </main>

        {/* Sidebar Derecha (Desktop) */}
        <SidebarRight
          topPosts={posts}
          onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
        />

      </div>

      {/* 3. Barra de Navegación Inferior (Móvil Fija) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
        onToggleDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* 4. Reproductor Global Persistente */}
      <PersistentPlayer />

      {/* 5. Cajón Lateral Móvil */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
        onOpenEditProfile={() => setEditProfileModalOpen(true)}
        onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
        onOpenDonate={() => setDonateModalOpen(true)}
      />

      {/* 6. Modales */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={fetchPosts}
      />

      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
      />

      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        onProfileUpdated={fetchPosts}
      />

      <DJProfileModal
        profile={selectedDJProfile}
        posts={posts}
        isOpen={djProfileModalOpen}
        onClose={() => setDjProfileModalOpen(false)}
        onEditOwnProfile={() => setEditProfileModalOpen(true)}
        onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
      />

      <VideoLightboxModal
        post={selectedVideoPost}
        isOpen={videoLightboxOpen}
        onClose={() => setVideoLightboxOpen(false)}
      />

    </div>
  );
}
