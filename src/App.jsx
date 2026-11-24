import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { FeaturedStories } from './components/feed/FeaturedStories';
import { ChipsBar } from './components/feed/ChipsBar';
import { CreatePostTrigger } from './components/feed/CreatePostTrigger';
import { PostCard } from './components/feed/PostCard';
import { PersistentPlayer } from './components/player/PersistentPlayer';
import { AdSenseBanner } from './components/ads/AdSenseBanner';
import { Disc } from 'lucide-react';

// Code splitting: vistas secundarias y modales se cargan bajo demanda
const DJDirectory = lazy(() => import('./components/feed/DJDirectory').then(m => ({ default: m.DJDirectory })));
const MobileDrawer = lazy(() => import('./components/layout/MobileDrawer').then(m => ({ default: m.MobileDrawer })));
const AuthModal = lazy(() => import('./components/modals/AuthModal').then(m => ({ default: m.AuthModal })));
const UploadModal = lazy(() => import('./components/modals/UploadModal').then(m => ({ default: m.UploadModal })));
const DonationModal = lazy(() => import('./components/modals/DonationModal').then(m => ({ default: m.DonationModal })));
const EditProfileModal = lazy(() => import('./components/modals/EditProfileModal').then(m => ({ default: m.EditProfileModal })));
const DJProfileModal = lazy(() => import('./components/modals/DJProfileModal').then(m => ({ default: m.DJProfileModal })));
const VideoLightboxModal = lazy(() => import('./components/modals/VideoLightboxModal').then(m => ({ default: m.VideoLightboxModal })));
const AdminUsersModal = lazy(() => import('./components/modals/AdminUsersModal').then(m => ({ default: m.AdminUsersModal })));

const TAB_TYPE_MAP = {
  audios: 'audio',
  videos: 'video',
  fotos: 'foto',
  recursos: 'recurso',
};

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
  const [adminUsersModalOpen, setAdminUsersModalOpen] = useState(false);

  // Cargar Posts de Supabase
  const fetchPosts = useCallback(async () => {
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
  }, []);

  // Cargar DJs
  const fetchDJs = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchDJs();
  }, [fetchPosts, fetchDJs]);

  const handleToggleSave = useCallback((postId) => {
    setSavedPostIds((prev) => {
      const exists = prev.includes(postId);
      const next = exists ? prev.filter(id => id !== postId) : [...prev, postId];
      localStorage.setItem('djs_revolution_saved', JSON.stringify(next));
      alert(exists ? "Eliminado de guardados." : "¡Guardado en tus favoritos! 🕊️");
      return next;
    });
  }, []);

  const handleViewProfile = useCallback(async (profileId) => {
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
  }, []);

  const handleTabChange = useCallback((tab) => {
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
  }, [currentProfile]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    const expectedType = TAB_TYPE_MAP[activeTab];
    if (expectedType) {
      result = result.filter(p => p.type === expectedType);
    } else if (activeTab === 'guardados') {
      result = result.filter(p => savedPostIds.includes(p.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.profiles?.dj_name || '').toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q) ||
        (p.genre || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, activeTab, savedPostIds, searchQuery]);

  // Estadísticas del usuario actual
  const { mixesCount: myMixesCount, amenCount: myAmenTotal } = useMemo(() => {
    if (!currentUser) return { mixesCount: 0, amenCount: 0 };
    const mine = posts.filter(p => p.author_id === currentUser.id);
    let amen = 0;
    for (const p of mine) {
      amen += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
    }
    return { mixesCount: mine.length, amenCount: amen };
  }, [posts, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Barra de Navegación Superior */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
        onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
        onOpenDonate={() => setDonateModalOpen(true)}
        onOpenAdmin={() => setAdminUsersModalOpen(true)}
        onToggleDrawer={() => setMobileDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Contenedor Principal con Disposición Fluida */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 flex gap-6 flex-1 pb-24 md:pb-12">
        
        {/* Sidebar Izquierda (Desktop) */}
        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
          onOpenEditProfile={() => setEditProfileModalOpen(true)}
          onOpenDonate={() => setDonateModalOpen(true)}
          onOpenAdmin={() => setAdminUsersModalOpen(true)}
          mixesCount={myMixesCount}
          amenCount={myAmenTotal}
        />

        {/* Feed Central */}
        <main className="flex-1 min-w-0">
          
          {/* Carrusel de Descubrimiento e Historias (Estilo Red Social Moderna) */}
          <FeaturedStories
            posts={posts}
            onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
            onViewProfile={handleViewProfile}
            onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
          />

          {/* Barra de Filtros Horizontales por Categoría */}
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
            <Suspense fallback={
              <div className="glass-panel rounded-3xl p-12 text-center text-zinc-400 border-white/10">
                <Disc className="w-9 h-9 mx-auto mb-3 animate-spin text-cyan-400" />
                <p className="text-sm font-semibold">Cargando directorio...</p>
              </div>
            }>
              <DJDirectory
                djs={djs}
                loading={loadingDjs}
                onViewProfile={handleViewProfile}
              />
            </Suspense>
          ) : (
            <div>
              {loadingPosts ? (
                <div className="glass-panel rounded-3xl p-12 text-center text-zinc-400 border-white/10">
                  <Disc className="w-9 h-9 mx-auto mb-3 animate-spin text-cyan-400" />
                  <p className="text-sm font-semibold">Sincronizando publicaciones del muro...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="glass-panel rounded-3xl p-10 text-center border-white/10">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
                    🕊️
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">
                    {searchQuery ? 'Sin resultados de búsqueda' : 'Cabina Lista • Muro en Espera'}
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4 leading-relaxed font-normal">
                    {searchQuery 
                      ? 'No encontramos ningún mix o DJ que coincida con tu búsqueda.' 
                      : 'Sé el primero en subir un mix de adoración o set de video a la comunidad.'}
                  </p>
                  <button
                    onClick={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
                    className="py-2.5 px-6 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-glow-cyan transition-all active:scale-95"
                  >
                    {currentUser ? 'Publicar el Primer Mix 🎧' : 'Crear Cuenta de DJ Gratis'}
                  </button>
                </div>
              ) : (
                filteredPosts.map((post, idx) => (
                  <React.Fragment key={post.id}>
                    <PostCard
                      post={post}
                      djs={djs}
                      isSaved={savedPostIds.includes(post.id)}
                      onToggleSave={handleToggleSave}
                      onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
                      onViewProfile={handleViewProfile}
                      onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
                      onRefresh={fetchPosts}
                    />
                    {idx === 1 && (
                      <AdSenseBanner key={`ad-feed-${post.id}`} slot="5572757736" />
                    )}
                  </React.Fragment>
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

      {/* 5 y 6. Cajón Lateral Móvil y Modales (Lazy-loaded bajo demanda) */}
      <Suspense fallback={null}>
        {mobileDrawerOpen && (
          <MobileDrawer
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenAuth={(t) => { setAuthModalTab(t); setAuthModalOpen(true); }}
            onOpenEditProfile={() => setEditProfileModalOpen(true)}
            onOpenUpload={() => currentUser ? setUploadModalOpen(true) : setAuthModalOpen(true)}
            onOpenDonate={() => setDonateModalOpen(true)}
            onOpenAdmin={() => setAdminUsersModalOpen(true)}
          />
        )}

        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            initialTab={authModalTab}
          />
        )}

        {uploadModalOpen && (
          <UploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onUploadSuccess={fetchPosts}
            djs={djs}
          />
        )}

        {donateModalOpen && (
          <DonationModal
            isOpen={donateModalOpen}
            onClose={() => setDonateModalOpen(false)}
          />
        )}

        {editProfileModalOpen && (
          <EditProfileModal
            isOpen={editProfileModalOpen}
            onClose={() => setEditProfileModalOpen(false)}
            onProfileUpdated={fetchPosts}
          />
        )}

        {djProfileModalOpen && (
          <DJProfileModal
            profile={selectedDJProfile}
            posts={posts}
            isOpen={djProfileModalOpen}
            onClose={() => setDjProfileModalOpen(false)}
            onEditOwnProfile={() => setEditProfileModalOpen(true)}
            onOpenVideo={(p) => { setSelectedVideoPost(p); setVideoLightboxOpen(true); }}
          />
        )}

        {videoLightboxOpen && (
          <VideoLightboxModal
            post={selectedVideoPost}
            isOpen={videoLightboxOpen}
            onClose={() => setVideoLightboxOpen(false)}
          />
        )}

        {adminUsersModalOpen && (
          <AdminUsersModal
            isOpen={adminUsersModalOpen}
            onClose={() => setAdminUsersModalOpen(false)}
            onUserRoleUpdated={() => {
              fetchPosts();
              fetchDJs();
            }}
          />
        )}
      </Suspense>

    </div>
  );
}
