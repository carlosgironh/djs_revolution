// DJ's Revolution - Lógica de Frontend conectada a Supabase & Mux Video Streaming

document.addEventListener('DOMContentLoaded', async () => {
    // ==========================================
    // 1. CONFIGURACIÓN DE SUPABASE & MUX
    // ==========================================
    const SUPABASE_URL = "https://szptdgmdktxowgokpeye.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cHRkZ21ka3R4b3dnb2twZXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDUwNjAsImV4cCI6MjEwNDM4MTA2MH0.tSbLM2tCgWxfpnNRMg0qCVgQm63psYlD3_cbLW6qKyo";
    const MUX_ENV_KEY = "kk0c2blkv34tchrb68f41uar5";
    const MUX_SERVICE_URL = "https://szptdgmdktxowgokpeye.supabase.co/functions/v1/mux-service";

    // Inicializar cliente Supabase
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==========================================
    // 2. ESTADO GLOBAL DE LA APLICACIÓN
    // ==========================================
    let currentUser = null;
    let currentProfile = null;
    let posts = [];
    let djsList = [];
    let currentTab = 'inicio';
    let searchQuery = '';
    let savedPostIds = JSON.parse(localStorage.getItem('djs_revolution_saved') || '[]');
    let currentLightboxPost = null;

    // Reproductor Global Inferior
    let currentPlayingPostId = null;
    const globalAudio = document.getElementById('global-audio-element');
    const persistentPlayer = document.getElementById('persistent-player');
    const playerCover = document.getElementById('player-cover');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const playerProgressBar = document.getElementById('player-progress-bar');
    const playerProgress = document.getElementById('player-progress');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerDuration = document.getElementById('player-duration');
    const playerVolumeSlider = document.getElementById('player-volume-slider');
    const playerMuteBtn = document.getElementById('player-mute-btn');
    const playerDownloadBtn = document.getElementById('player-download-btn');

    // ==========================================
    // 3. GESTIÓN DE SESIÓN Y PERFIL (SUPABASE AUTH)
    // ==========================================
    async function initAuth() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                currentUser = session.user;
                await fetchCurrentProfile();
            }
        } catch (e) {
            console.warn("Error al inicializar sesión:", e);
        }

        updateAuthUI();

        // Escuchar cambios de sesión en tiempo real
        supabase.auth.onAuthStateChange(async (event, session) => {
            currentUser = session?.user || null;
            if (currentUser) {
                await fetchCurrentProfile();
            } else {
                currentProfile = null;
            }
            updateAuthUI();
            fetchPosts();
        });
    }

    async function fetchCurrentProfile() {
        if (!currentUser) return;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (data) {
            currentProfile = data;
        } else if (error) {
            // Crear perfil inicial si no existía
            const djName = currentUser.user_metadata?.dj_name || 'DJ ' + (currentUser.email?.split('@')[0] || 'Nuevo');
            const { data: newProf } = await supabase
                .from('profiles')
                .upsert({
                    id: currentUser.id,
                    username: currentUser.email?.split('@')[0],
                    dj_name: djName,
                    full_name: djName,
                    role: 'DJ de Worship 🕊️',
                    avatar_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'
                })
                .select()
                .single();
            currentProfile = newProf;
        }
    }

    function updateAuthUI() {
        const navContainer = document.getElementById('navbar-actions-container');
        const sidebarContainer = document.getElementById('sidebar-user-card');
        const createPostContainer = document.getElementById('create-post-container');

        if (currentUser && currentProfile) {
            const djName = currentProfile.dj_name || 'Mi Perfil';
            const avatar = currentProfile.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80';
            const isSuperAdmin = currentProfile.is_super_admin || (currentProfile.role && currentProfile.role.includes('Super Admin'));

            // Navbar para DJ conectado
            if (navContainer) {
                navContainer.innerHTML = `
                    <span class="user-status-badge dj-status" style="background: ${isSuperAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)'}; color: ${isSuperAdmin ? '#fbbf24' : 'var(--accent-primary)'}; padding: 6px 14px; border-radius: 100px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; border: 1px solid ${isSuperAdmin ? 'rgba(245, 158, 11, 0.3)' : 'transparent'};">
                        <i class="fa-solid ${isSuperAdmin ? 'fa-crown' : 'fa-compact-disc fa-spin'}"></i> ${escapeHTML(djName)} ${isSuperAdmin ? '<span style="background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 6px; font-weight: 800;">ADMIN</span>' : ''}
                    </span>
                    <button class="btn btn-primary" onclick="toggleModal('upload-modal', true)"><i class="fa-solid fa-upload"></i> <span class="nav-btn-text">Subir Mix</span></button>
                    <div class="user-profile" onclick="openCurrentUserProfile()" title="Ver mi perfil" style="cursor: pointer;">
                        <img src="${avatar}" alt="${escapeHTML(djName)}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid ${isSuperAdmin ? '#f59e0b' : 'var(--accent-primary)'};">
                    </div>
                    <button class="btn btn-danger-link" onclick="handleRealLogout()" title="Cerrar Sesión" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; padding: 5px; transition: color 0.3s;"><i class="fa-solid fa-right-from-bracket"></i></button>
                `;
            }

            // Sidebar para DJ conectado
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <div class="user-info">
                        <img src="${avatar}" alt="${escapeHTML(djName)}" class="avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid ${isSuperAdmin ? '#f59e0b' : 'transparent'};">
                        <div>
                            <h4>${escapeHTML(djName)} ${isSuperAdmin ? '<i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 0.85rem;" title="Super Administrador"></i>' : ''}</h4>
                            <span style="${isSuperAdmin ? 'color: #fbbf24; font-weight: 600;' : ''}">${escapeHTML(currentProfile.role || 'DJ de Worship 🕊️')}</span>
                        </div>
                    </div>
                    <div class="user-stats">
                        <div class="stat">
                            <span class="count" id="sidebar-mixes-count">0</span>
                            <span class="label">Mixes</span>
                        </div>
                        <div class="stat">
                            <span class="count" id="sidebar-amen-count">0</span>
                            <span class="label">Amén</span>
                        </div>
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn btn-primary" onclick="openCurrentUserProfile()" style="flex: 1; font-size: 0.8rem; padding: 8px;"><i class="fa-solid fa-user"></i> Mi Perfil</button>
                        <button class="btn" onclick="openEditProfileModal()" style="background: rgba(255,255,255,0.08); font-size: 0.8rem; padding: 8px;" title="Editar Perfil y Donaciones"><i class="fa-solid fa-gear"></i></button>
                    </div>
                `;
                updateSidebarStats();
            }

            // Feed header para crear post
            if (createPostContainer) {
                createPostContainer.innerHTML = `
                    <div class="create-post glass-panel" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-radius: 16px;">
                        <img src="${avatar}" alt="${escapeHTML(djName)}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover;">
                        <button class="create-post-trigger" onclick="toggleModal('upload-modal', true)" style="flex: 1; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid var(--surface-border); border-radius: 100px; padding: 12px 20px; color: var(--text-secondary); cursor: pointer; font-family: 'Outfit'; font-size: 0.95rem;">
                            ¿Qué nuevo mix de adoración o loop vas a compartir hoy, ${escapeHTML(djName)}? 🎧🕊️
                        </button>
                        <button class="btn btn-primary" onclick="toggleModal('upload-modal', true)" style="padding: 10px 16px; border-radius: 100px;">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                        </button>
                    </div>
                `;
            }
        } else {
            // Navbar para Invitado / Oyente
            if (navContainer) {
                navContainer.innerHTML = `
                    <button class="btn btn-primary" onclick="openAuthModal('login')"><i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión</button>
                    <button class="btn" onclick="openAuthModal('signup')" style="background: rgba(255,255,255,0.08);"><i class="fa-solid fa-user-plus"></i> Registrarme</button>
                `;
            }

            // Sidebar para Oyente
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <div style="text-align: center; padding: 10px 5px;">
                        <i class="fa-solid fa-dove" style="font-size: 2rem; color: var(--accent-secondary); margin-bottom: 12px; display: block;"></i>
                        <h4 style="margin-bottom: 6px;">¡Bienvenido, Oyente! 🕊️</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 15px;">Explora y descarga mixes de video y audio en alta velocidad para bendecir tu congregación.</p>
                        <button class="btn btn-primary" onclick="openAuthModal('login')" style="width: 100%; font-size: 0.85rem; padding: 10px 12px; border-radius: 10px;"><i class="fa-solid fa-compact-disc"></i> Ingresar como DJ / VJ</button>
                    </div>
                `;
            }

            // Feed banner de invitación para Oyente
            if (createPostContainer) {
                createPostContainer.innerHTML = `
                    <div class="create-post glass-panel" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(14, 165, 233, 0.05)); border-color: rgba(139, 92, 246, 0.2); padding: 25px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; border-radius: 20px;">
                        <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 4px;">¿Eres DJ o VJ Cristiano? 🎧🕊️</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 500px; line-height: 1.4; margin-bottom: 4px;">Crea tu cuenta para publicar tus propios sets de audio, video y loops con la mejor calidad.</p>
                        <button class="btn btn-primary" onclick="openAuthModal('signup')"><i class="fa-solid fa-user-plus"></i> Crear Cuenta de DJ Gratis</button>
                    </div>
                `;
            }
        }
    }

    function updateSidebarStats() {
        if (!currentUser) return;
        const myPosts = posts.filter(p => p.author_id === currentUser.id);
        const myMixesCountEl = document.getElementById('sidebar-mixes-count');
        const myAmenCountEl = document.getElementById('sidebar-amen-count');

        if (myMixesCountEl) myMixesCountEl.textContent = myPosts.length;
        if (myAmenCountEl) {
            let amenTotal = 0;
            myPosts.forEach(p => {
                amenTotal += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
            });
            myAmenCountEl.textContent = amenTotal;
        }
    }

    // Modal de Autenticación (Login / Signup)
    window.openAuthModal = function(tab = 'login') {
        switchAuthTab(tab);
        toggleModal('auth-modal', true);
    };

    window.switchAuthTab = function(tab) {
        const loginBtn = document.getElementById('tab-login-btn');
        const signupBtn = document.getElementById('tab-signup-btn');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        const title = document.getElementById('auth-modal-title');

        if (tab === 'login') {
            loginBtn.classList.add('active');
            signupBtn.classList.remove('active');
            loginForm.style.display = 'flex';
            signupForm.style.display = 'none';
            title.textContent = 'Acceso a la Cabina 🕊️';
        } else {
            loginBtn.classList.remove('active');
            signupBtn.classList.add('active');
            loginForm.style.display = 'none';
            signupForm.style.display = 'flex';
            title.textContent = 'Registro de Creador DJ / VJ 🎧';
        }
    };

    window.handleRealLogin = async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error-msg');
        const btn = document.getElementById('login-submit-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando credenciales...';
        errorMsg.style.display = 'none';

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            currentUser = data.user;
            await fetchCurrentProfile();
            toggleModal('auth-modal', false);
            document.getElementById('login-form').reset();
            alert(`¡Bienvenido de vuelta, ${currentProfile?.dj_name || 'hermano DJ'}! 🕊️`);
        } catch (err) {
            errorMsg.textContent = err.message || "Error al iniciar sesión. Verifica tu correo y contraseña.";
            errorMsg.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Ingresar a la Plataforma 🎧';
        }
    };

    window.handleRealSignUp = async function(e) {
        e.preventDefault();
        const djName = document.getElementById('signup-dj-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const errorMsg = document.getElementById('signup-error-msg');
        const btn = document.getElementById('signup-submit-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registrando DJ...';
        errorMsg.style.display = 'none';

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { dj_name: djName, full_name: djName }
                }
            });
            if (error) throw error;

            currentUser = data.user;
            await fetchCurrentProfile();
            toggleModal('auth-modal', false);
            document.getElementById('signup-form').reset();
            alert(`¡Cuenta creada con éxito! Bienvenido a DJ's Revolution, ${djName}. 🕊️`);
        } catch (err) {
            errorMsg.textContent = err.message || "Error al registrarte. Verifica los datos ingresados.";
            errorMsg.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Registrarme como DJ 🕊️';
        }
    };

    window.handleRealLogout = async function() {
        await supabase.auth.signOut();
        currentUser = null;
        currentProfile = null;
        updateAuthUI();
        renderFeed(getFilteredPosts());
        alert("Sesión cerrada. Ahora estás en Modo Oyente Público.");
    };

    // Modal de Edición de Perfil & Donaciones
    window.openEditProfileModal = function() {
        if (!currentProfile) return;
        document.getElementById('edit-dj-name').value = currentProfile.dj_name || '';
        document.getElementById('edit-dj-role').value = currentProfile.role || '';
        document.getElementById('edit-dj-bio').value = currentProfile.bio || '';
        document.getElementById('edit-donation-url').value = currentProfile.donation_url || '';
        
        const socials = currentProfile.socials || {};
        document.getElementById('edit-social-instagram').value = socials.instagram || '';
        document.getElementById('edit-social-youtube').value = socials.youtube || '';

        toggleModal('edit-profile-modal', true);
    };

    window.handleSaveProfile = async function(e) {
        e.preventDefault();
        if (!currentUser) return;

        const djName = document.getElementById('edit-dj-name').value.trim();
        const role = document.getElementById('edit-dj-role').value.trim();
        const bio = document.getElementById('edit-dj-bio').value.trim();
        const donationUrl = document.getElementById('edit-donation-url').value.trim();
        const instagram = document.getElementById('edit-social-instagram').value.trim();
        const youtube = document.getElementById('edit-social-youtube').value.trim();

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    dj_name: djName,
                    role: role,
                    bio: bio,
                    donation_url: donationUrl || null,
                    socials: { instagram, youtube },
                    updated_at: new Date()
                })
                .eq('id', currentUser.id)
                .select()
                .single();

            if (error) throw error;
            currentProfile = data;
            updateAuthUI();
            toggleModal('edit-profile-modal', false);
            alert("¡Perfil actualizado con éxito! 🕊️");
            await fetchPosts();
        } catch (err) {
            alert("Error al actualizar perfil: " + err.message);
        }
    };

    // ==========================================
    // 4. CARGA DE POSTS Y FEED DESDE SUPABASE
    // ==========================================
    async function fetchPosts() {
        const feedContainer = document.getElementById('feed-posts');
        if (!feedContainer) return;

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
                console.error("Error cargando posts de Supabase:", error);
            } else {
                posts = data || [];
            }
        } catch (e) {
            console.error("Fallo de red al consultar posts:", e);
        }

        renderFeed(getFilteredPosts());
        renderTopDownloaded();
        updateSidebarStats();
    }

    function renderFeed(feedPosts = posts) {
        const feedContainer = document.getElementById('feed-posts');
        if (!feedContainer) return;
        feedContainer.innerHTML = '';

        // Si no hay posts (base de datos limpia y sin datos falsos)
        if (feedPosts.length === 0) {
            feedContainer.innerHTML = `
                <div class="feed-empty-state glass-panel">
                    <div class="feed-empty-icon"><i class="fa-solid fa-compact-disc"></i></div>
                    <h2 class="feed-empty-title">Cabina Lista • Sin Publicaciones Aún</h2>
                    <p class="feed-empty-desc">
                        La cabina está lista para ti. ¡Sé el primer DJ o VJ en publicar un mix de adoración o loop de video en alta definición!
                    </p>
                    <button class="btn btn-primary" onclick="${currentUser ? "toggleModal('upload-modal', true)" : "openAuthModal('signup')"}">
                        <i class="fa-solid fa-cloud-arrow-up"></i> ${currentUser ? "Publicar el Primer Mix" : "Crear Cuenta de DJ"}
                    </button>
                </div>
            `;
            return;
        }

        feedPosts.forEach(post => {
            const author = post.profiles || { dj_name: "DJ Creador", avatar_url: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80" };
            const isAuthorAdmin = author.is_super_admin || (author.role && author.role.includes('Super Admin'));
            const timeInfo = formatPanamaTimestamp(post.created_at);
            const isSaved = savedPostIds.includes(post.id);

            // Contar reacciones por tipo
            const reactionsList = post.reactions || [];
            const amenCount = reactionsList.filter(r => r.reaction_type === 'amen').length;
            const bendicionCount = reactionsList.filter(r => r.reaction_type === 'bendicion').length;
            const likeCount = reactionsList.filter(r => r.reaction_type === 'like').length;

            const commentsList = post.comments || [];

            // Miniatura y Medios
            let mediaHTML = '';
            const coverImage = post.cover_url || (post.mux_playback_id ? `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg` : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80');

            if (post.type === 'audio') {
                const isThisPlaying = (currentPlayingPostId === post.id && !globalAudio.paused);
                mediaHTML = `
                    <div class="media-container audio-container">
                        <img src="${coverImage}" alt="Cover" class="audio-cover">
                        <div class="audio-player">
                            <button class="play-btn post-play-btn" data-post-id="${post.id}">
                                <i class="fa-solid ${isThisPlaying ? 'fa-pause' : 'fa-play'}"></i>
                            </button>
                            <div class="progress-bar post-progress-bar" data-post-id="${post.id}">
                                <div class="progress" style="width: ${currentPlayingPostId === post.id ? (globalAudio.currentTime / globalAudio.duration * 100 || 0) : 0}%;"></div>
                            </div>
                            <span class="time post-time" data-post-id="${post.id}">
                                ${currentPlayingPostId === post.id ? formatTime(globalAudio.currentTime) + ' / ' + formatTime(globalAudio.duration || 0) : 'Escuchar mix'}
                            </span>
                        </div>
                    </div>
                `;
            } else {
                const badge = post.type === 'recurso' ? '<span class="post-tag recurso-tag" style="position:absolute; top:12px; right:12px; z-index:2;"><i class="fa-solid fa-folder-open"></i> VJ Loop</span>' : '';
                mediaHTML = `
                    <div class="media-container video-container" onclick="openVideoLightbox('${post.id}')">
                        ${badge}
                        <div class="video-placeholder">
                            <i class="fa-solid fa-play play-icon"></i>
                            <img src="${coverImage}" alt="Video Cover">
                        </div>
                    </div>
                `;
            }

            // Botón de Donación para el autor si lo tiene configurado
            let donateBtnHTML = '';
            if (author.donation_url) {
                donateBtnHTML = `
                    <a href="${author.donation_url}" target="_blank" rel="noopener noreferrer" class="btn-donate-post" title="Sembrar ofrenda / apoyar ministerio">
                        <i class="fa-solid fa-hand-holding-dollar"></i> Sembrar
                    </a>
                `;
            }

            const tagHTML = `<div class="post-tags"><span class="post-tag ${post.type === 'audio' ? 'audio-tag' : post.type === 'video' ? 'vj-tag' : 'recurso-tag'}">#${escapeHTML(post.genre || 'Worship')}</span></div>`;

            const article = document.createElement('article');
            article.className = 'post glass-panel';
            article.id = `post-${post.id}`;
            article.innerHTML = `
                <div class="post-header">
                    <div class="post-author" onclick="openDJProfileById('${author.id}')" style="cursor: pointer;">
                        <img src="${author.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'}" alt="${escapeHTML(author.dj_name)}">
                        <div>
                            <h3>${escapeHTML(author.dj_name)} ${isAuthorAdmin ? '<i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 0.85rem;" title="Super Administrador"></i>' : ''}</h3>
                            <span title="${timeInfo.fullTooltip}">${timeInfo.displayBadge} • <i class="fa-solid fa-globe"></i> HD Stream</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${donateBtnHTML}
                        <button class="post-options" onclick="toggleSavePost('${post.id}')" title="Guardar">
                            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="color: ${isSaved ? 'var(--accent-secondary)' : ''}"></i>
                        </button>
                    </div>
                </div>
                <div class="post-content">
                    <h4 style="font-size: 1.15rem; margin-bottom: 6px;">${escapeHTML(post.title)}</h4>
                    ${post.content ? `<p style="margin-bottom: 12px;">${escapeHTML(post.content)}</p>` : ''}
                    ${mediaHTML}
                    ${tagHTML}
                </div>
                
                <div class="post-stats">
                    <div style="display: flex; gap: 8px;">
                        <span class="faith-count" style="color: var(--accent-secondary);"><i class="fa-solid fa-dove"></i> ${amenCount} Amén</span>
                        <span class="faith-count" style="color: var(--success);"><i class="fa-solid fa-hands-praying"></i> ${bendicionCount} Bendiciones</span>
                        <span class="faith-count" style="color: var(--danger);"><i class="fa-solid fa-heart"></i> ${likeCount}</span>
                    </div>
                    <span>${commentsList.length} Comentarios • ${post.downloads_count || 0} Descargas</span>
                </div>
                
                <div class="post-actions">
                    <div class="reactions-wrapper">
                        <button class="action-btn"><i class="fa-regular fa-hands-praying"></i> Reaccionar</button>
                        <div class="reactions-popover">
                            <span class="reaction-option" onclick="handleReaction('${post.id}', 'amen')" title="Amén 🕊️">🕊️</span>
                            <span class="reaction-option" onclick="handleReaction('${post.id}', 'bendicion')" title="Bendición 🙌">🙌</span>
                            <span class="reaction-option" onclick="handleReaction('${post.id}', 'like')" title="Me encanta ❤️">❤️</span>
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="toggleComments('${post.id}')"><i class="fa-regular fa-comment"></i> Comentar</button>
                    
                    <button class="action-btn" onclick="sharePost('${post.id}')"><i class="fa-solid fa-share"></i> Compartir</button>
                    
                    <button class="action-btn download-btn" onclick="triggerDirectDownload('${escapeHTML(post.title)}', '${post.media_url || ''}', '${post.id}')">
                        <i class="fa-solid fa-download"></i> Descargar
                    </button>
                </div>

                <!-- Sección de Comentarios -->
                <div class="post-comments-section hidden" id="comments-section-${post.id}">
                    <div class="comments-list" id="comments-list-${post.id}">
                        ${commentsList.map(c => {
                            const cTime = formatPanamaTimestamp(c.created_at);
                            const isCAdmin = c.profiles?.is_super_admin || (c.profiles?.role && c.profiles.role.includes('Super Admin'));
                            return `
                            <div class="comment-item">
                                <img src="${c.profiles?.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'}" alt="Avatar">
                                <div class="comment-bubble">
                                    <h5>${escapeHTML(c.profiles?.dj_name || 'Hermano')} ${isCAdmin ? '<i class="fa-solid fa-crown" style="color: #fbbf24; font-size: 0.75rem;" title="Super Administrador"></i>' : ''}</h5>
                                    <p>${escapeHTML(c.text)}</p>
                                    <span title="${cTime.fullTooltip}">${cTime.relative} • ${cTime.panamaTime} (PTY)</span>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="comment-input-box">
                        <img src="${currentProfile?.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'}" alt="Avatar">
                        <input type="text" id="comment-input-${post.id}" placeholder="Escribe un mensaje de bendición..." onkeypress="handleCommentKeyPress(event, '${post.id}')">
                    </div>
                </div>
            `;
            feedContainer.appendChild(article);
        });

        setupPostAudioTriggers();
    }

    // ==========================================
    // 5. SUBIDA DIRECTA A MUX (DIRECT UPLOAD CON UPCHUNK)
    // ==========================================
    window.handleFileSelected = function(input) {
        const file = input.files[0];
        const badge = document.getElementById('file-selected-badge');
        const fileNameEl = document.getElementById('file-selected-name');
        const uploadText = document.getElementById('file-upload-text');
        const coverGroup = document.getElementById('custom-cover-group');

        if (file) {
            badge.style.display = 'inline-flex';
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            fileNameEl.textContent = `${file.name} (${sizeMB} MB)`;
            uploadText.textContent = 'Archivo preparado para subir';

            // Si es audio, sugerir portada personalizada opcional
            if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
                coverGroup.style.display = 'block';
            } else {
                coverGroup.style.display = 'none';
            }
        }
    };

    window.handleFormTypeChange = function() {
        const type = document.getElementById('mix-type').value;
        const coverGroup = document.getElementById('custom-cover-group');
        if (type === 'audio') {
            coverGroup.style.display = 'block';
        } else {
            coverGroup.style.display = 'none';
        }
    };

    window.handleRealUploadSubmit = async function(e) {
        e.preventDefault();
        if (!currentUser) {
            alert("Debes iniciar sesión para publicar en la comunidad.");
            openAuthModal('login');
            return;
        }

        const fileInput = document.getElementById('mix-file-input');
        const file = fileInput.files[0];
        if (!file) {
            alert("Por favor selecciona un archivo multimedia (audio o video).");
            return;
        }

        const title = document.getElementById('mix-title').value.trim();
        const description = document.getElementById('mix-description').value.trim();
        const type = document.getElementById('mix-type').value;
        const genre = document.getElementById('mix-genre').value;
        const coverFileInput = document.getElementById('mix-cover-file');
        
        const submitBtn = document.getElementById('btn-submit-upload');
        const progressContainer = document.getElementById('upload-progress-container');
        const progressFill = document.getElementById('upload-progress-fill');
        const percentText = document.getElementById('upload-percent-text');
        const statusText = document.getElementById('upload-status-text');

        submitBtn.disabled = true;
        progressContainer.style.display = 'block';
        statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando con el servidor...';
        progressFill.style.width = '5%';
        percentText.textContent = '5%';

        try {
            // 1. Pedir Direct Upload a la Edge Function
            const res = await fetch(`${MUX_SERVICE_URL}?action=create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const muxData = await res.json();
            if (!res.ok || !muxData.upload_url) {
                throw new Error(muxData.error || "No se pudo iniciar la subida");
            }

            const { upload_url, upload_id } = muxData;
            statusText.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Subiendo a DJ\'s Revolution...';

            // 2. Subida en chunks mediante Mux UpChunk con progreso en tiempo real
            await new Promise((resolve, reject) => {
                const upload = window.UpChunk.createUpload({
                    endpoint: upload_url,
                    file: file,
                    chunkSize: 5120 // 5MB chunks
                });

                upload.on('progress', (progressDetail) => {
                    const percent = Math.round(progressDetail.detail);
                    progressFill.style.width = `${percent}%`;
                    percentText.textContent = `${percent}%`;
                });

                upload.on('success', () => {
                    resolve();
                });

                upload.on('error', (err) => {
                    reject(new Error(err.detail?.message || "Error durante la subida"));
                });
            });

            // 3. Subida finalizada, optimizar procesamiento
            statusText.innerHTML = '<i class="fa-solid fa-compact-disc fa-spin"></i> Optimizando calidad de transmisión HD...';
            percentText.textContent = '100%';

            let playbackId = null;
            let assetId = null;
            let attempts = 0;

            // Consultar durante unos segundos para obtener el playback_id
            while (attempts < 10 && !playbackId) {
                await new Promise(r => setTimeout(r, 2500));
                attempts++;
                try {
                    const statusRes = await fetch(`${MUX_SERVICE_URL}?action=status&upload_id=${upload_id}`);
                    if (statusRes.ok) {
                        const sData = await statusRes.json();
                        if (sData.playback_id) {
                            playbackId = sData.playback_id;
                            assetId = sData.asset_id;
                            break;
                        }
                    }
                } catch (e) {
                    console.warn("Verificando Mux...", e);
                }
            }

            // 4. Si es audio y subió portada, subir imagen a Supabase Storage
            let coverUrl = null;
            if (type === 'audio') {
                if (coverFileInput && coverFileInput.files[0]) {
                    const coverFile = coverFileInput.files[0];
                    const ext = coverFile.name.split('.').pop();
                    const path = `${currentUser.id}/${Date.now()}.${ext}`;
                    const { error: sErr } = await supabase.storage.from('covers').upload(path, coverFile);
                    if (!sErr) {
                        const { data: pData } = supabase.storage.from('covers').getPublicUrl(path);
                        coverUrl = pData.publicUrl;
                    }
                }
                if (!coverUrl) {
                    coverUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80';
                }
            } else {
                // Para videos, usar miniatura automática de Mux
                if (playbackId) {
                    coverUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
                } else {
                    coverUrl = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                }
            }

            const mediaUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;

            // 5. Guardar post en Supabase
            const { error: insErr } = await supabase.from('posts').insert({
                author_id: currentUser.id,
                title: title,
                content: description,
                type: type,
                genre: genre,
                mux_upload_id: upload_id,
                mux_playback_id: playbackId,
                mux_asset_id: assetId,
                media_url: mediaUrl,
                cover_url: coverUrl,
                status: 'ready'
            });

            if (insErr) throw insErr;

            alert("¡Mix subido con éxito y publicado en el muro! 🕊️🎧");
            toggleModal('upload-modal', false);
            document.getElementById('upload-mix-form').reset();
            document.getElementById('file-selected-badge').style.display = 'none';
            document.getElementById('file-upload-text').textContent = 'Haz clic o arrastra tu archivo aquí';
            await fetchPosts();
        } catch (err) {
            console.error("Error al publicar:", err);
            alert("Error: " + (err.message || "Fallo en la subida"));
        } finally {
            submitBtn.disabled = false;
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
        }
    };

    // ==========================================
    // 6. REPRODUCTOR DE VIDEO LIGHTBOX CON MUX PLAYER
    // ==========================================
    window.openVideoLightbox = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        currentLightboxPost = post;

        const mount = document.getElementById('lightbox-video-mount');
        mount.innerHTML = '';

        // Si tiene playback_id de Mux, montar <mux-player>
        if (post.mux_playback_id) {
            const player = document.createElement('mux-player');
            player.setAttribute('playback-id', post.mux_playback_id);
            player.setAttribute('env-key', MUX_ENV_KEY);
            player.setAttribute('stream-type', 'on-demand');
            player.setAttribute('controls', '');
            player.setAttribute('autoplay', '');
            player.style.width = '100%';
            player.style.height = '100%';
            mount.appendChild(player);
        } else if (post.media_url) {
            const video = document.createElement('video');
            video.src = post.media_url;
            video.controls = true;
            video.autoplay = true;
            video.style.width = '100%';
            video.style.height = '100%';
            mount.appendChild(video);
        }

        const author = post.profiles || {};
        document.getElementById('lightbox-author-img').src = author.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80';
        document.getElementById('lightbox-author-name').textContent = author.dj_name || 'DJ';
        document.getElementById('lightbox-author-box').onclick = () => { closeVideoLightbox(); openDJProfileById(author.id); };
        document.getElementById('lightbox-post-time').textContent = formatRelativeTime(post.created_at);
        document.getElementById('lightbox-video-title').textContent = post.title;
        document.getElementById('lightbox-video-desc').textContent = post.content || '';

        // Botón de donación en Lightbox si aplica
        const donateSlot = document.getElementById('lightbox-author-donate-slot');
        if (author.donation_url) {
            donateSlot.innerHTML = `
                <a href="${author.donation_url}" target="_blank" rel="noopener noreferrer" class="btn-donate-post">
                    <i class="fa-solid fa-heart-circle-bolt"></i> Sembrar Ofrenda
                </a>
            `;
        } else {
            donateSlot.innerHTML = '';
        }

        // Tags
        document.getElementById('lightbox-video-tags').innerHTML = `
            <span class="post-tag ${post.type === 'recurso' ? 'recurso-tag' : 'vj-tag'}">#${escapeHTML(post.genre || 'Worship')}</span>
        `;

        updateLightboxStats(post);
        renderLightboxComments(post);

        toggleModal('video-lightbox', true);
    };

    window.closeVideoLightbox = function() {
        const mount = document.getElementById('lightbox-video-mount');
        if (mount) mount.innerHTML = '';
        currentLightboxPost = null;
        toggleModal('video-lightbox', false);
    };

    function updateLightboxStats(post) {
        const reactionsList = post.reactions || [];
        document.getElementById('lightbox-likes-stat').innerHTML = `<i class="fa-solid fa-heart"></i> ${reactionsList.length} reacciones`;
        document.getElementById('lightbox-comments-stat').textContent = `${(post.comments || []).length} Comentarios`;
    }

    function renderLightboxComments(post) {
        const list = document.getElementById('lightbox-comments-list');
        list.innerHTML = '';
        const comments = post.comments || [];

        if (comments.length === 0) {
            list.innerHTML = `<p style="color: var(--text-secondary); text-align: center; font-size: 0.85rem;">Ningún comentario aún. ¡Sé el primero en bendecir!</p>`;
            return;
        }

        comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <img src="${c.profiles?.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'}" alt="Avatar">
                <div class="comment-bubble">
                    <h5>${escapeHTML(c.profiles?.dj_name || 'Hermano')}</h5>
                    <p>${escapeHTML(c.text)}</p>
                    <span>${formatRelativeTime(c.created_at)}</span>
                </div>
            `;
            list.appendChild(div);
        });
    }

    window.submitLightboxComment = async function() {
        if (!currentUser) {
            alert("Debes iniciar sesión para comentar.");
            openAuthModal('login');
            return;
        }
        if (!currentLightboxPost) return;

        const field = document.getElementById('lightbox-comment-field');
        const text = field.value.trim();
        if (!text) return;

        try {
            const { data, error } = await supabase.from('comments').insert({
                post_id: currentLightboxPost.id,
                author_id: currentUser.id,
                text: text
            }).select('*, profiles:author_id(*)').single();

            if (error) throw error;
            field.value = '';

            if (!currentLightboxPost.comments) currentLightboxPost.comments = [];
            currentLightboxPost.comments.push(data);

            renderLightboxComments(currentLightboxPost);
            updateLightboxStats(currentLightboxPost);
            renderFeed(getFilteredPosts());
        } catch (err) {
            alert("Error al comentar: " + err.message);
        }
    };

    // ==========================================
    // 7. REPRODUCTOR DE AUDIO INFERIOR PERSISTENTE
    // ==========================================
    function setupPostAudioTriggers() {
        const playButtons = document.querySelectorAll('.post-play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.getAttribute('data-post-id');
                const post = posts.find(p => p.id === id);
                if (post) {
                    playAudioFromMetadata(post);
                }
            });
        });

        const progressBars = document.querySelectorAll('.post-progress-bar');
        progressBars.forEach(bar => {
            bar.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.getAttribute('data-post-id');
                if (id === currentPlayingPostId && globalAudio.duration) {
                    const rect = this.getBoundingClientRect();
                    const percentage = (e.clientX - rect.left) / rect.width;
                    globalAudio.currentTime = percentage * globalAudio.duration;
                }
            });
        });
    }

    function playAudioFromMetadata(post) {
        persistentPlayer.classList.remove('persistent-player-hidden');
        const author = post.profiles?.dj_name || 'DJ';
        const cover = post.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80';

        playerCover.src = cover;
        playerTitle.textContent = post.title;
        playerArtist.textContent = author;
        playerDownloadBtn.onclick = () => triggerDirectDownload(post.title, post.media_url, post.id);

        if (currentPlayingPostId !== post.id) {
            currentPlayingPostId = post.id;
            globalAudio.src = post.media_url || '';
            globalAudio.load();
        }

        toggleGlobalAudioPlay();
    }

    function toggleGlobalAudioPlay() {
        if (!globalAudio.src || globalAudio.src.endsWith('#')) return;

        if (globalAudio.paused) {
            globalAudio.play().then(() => {
                playerPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                updateFeedPlayButtons(true);
            }).catch(err => console.error("Error reproduciendo audio:", err));
        } else {
            globalAudio.pause();
            playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            updateFeedPlayButtons(false);
        }
    }

    function updateFeedPlayButtons(isPlaying) {
        const playButtons = document.querySelectorAll('.post-play-btn');
        playButtons.forEach(btn => {
            const id = btn.getAttribute('data-post-id');
            const icon = btn.querySelector('i');
            if (id === currentPlayingPostId) {
                if (isPlaying) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                } else {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                }
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        });
    }

    globalAudio.addEventListener('timeupdate', () => {
        if (!globalAudio.duration) return;
        const percentage = (globalAudio.currentTime / globalAudio.duration) * 100;
        playerProgress.style.width = percentage + '%';
        playerCurrentTime.textContent = formatTime(globalAudio.currentTime);
        playerDuration.textContent = formatTime(globalAudio.duration);

        if (currentPlayingPostId !== null) {
            const bar = document.querySelector(`.post-progress-bar[data-post-id="${currentPlayingPostId}"] .progress`);
            const timeSpan = document.querySelector(`.post-time[data-post-id="${currentPlayingPostId}"]`);
            if (bar) bar.style.width = percentage + '%';
            if (timeSpan) timeSpan.textContent = formatTime(globalAudio.currentTime) + ' / ' + formatTime(globalAudio.duration);
        }
    });

    globalAudio.addEventListener('ended', () => {
        playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        updateFeedPlayButtons(false);
        playerProgress.style.width = '0%';
        playerCurrentTime.textContent = "00:00";
    });

    playerProgressBar.addEventListener('click', (e) => {
        if (!globalAudio.duration) return;
        const rect = playerProgressBar.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        globalAudio.currentTime = percentage * globalAudio.duration;
    });

    playerPlayBtn.addEventListener('click', toggleGlobalAudioPlay);

    playerVolumeSlider.addEventListener('input', (e) => {
        globalAudio.volume = e.target.value;
        playerMuteBtn.innerHTML = e.target.value == 0 ? '<i class="fa-solid fa-volume-xmark"></i>' : (e.target.value < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>');
    });

    playerMuteBtn.addEventListener('click', () => {
        globalAudio.muted = !globalAudio.muted;
        playerMuteBtn.innerHTML = globalAudio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    });

    document.getElementById('player-close-btn').addEventListener('click', () => {
        globalAudio.pause();
        persistentPlayer.classList.add('persistent-player-hidden');
        updateFeedPlayButtons(false);
        currentPlayingPostId = null;
    });

    // ==========================================
    // 8. REACCIONES Y COMENTARIOS REALES EN SUPABASE
    // ==========================================
    window.handleReaction = async function(postId, reactionType) {
        if (!currentUser) {
            alert("Inicia sesión para reaccionar a las publicaciones.");
            openAuthModal('login');
            return;
        }

        try {
            // Verificar si ya reaccionó
            const post = posts.find(p => p.id === postId);
            const existing = (post?.reactions || []).find(r => r.user_id === currentUser.id && r.reaction_type === reactionType);

            if (existing) {
                // Eliminar reacción
                await supabase.from('reactions').delete().eq('id', existing.id);
            } else {
                // Insertar reacción
                await supabase.from('reactions').insert({
                    post_id: postId,
                    user_id: currentUser.id,
                    reaction_type: reactionType
                });
            }
            await fetchPosts();
        } catch (err) {
            console.error("Error al reaccionar:", err);
        }
    };

    window.toggleComments = function(postId) {
        const sec = document.getElementById(`comments-section-${postId}`);
        if (sec) sec.classList.toggle('hidden');
    };

    window.handleCommentKeyPress = async function(event, postId) {
        if (event.key === 'Enter') {
            if (!currentUser) {
                alert("Inicia sesión para comentar.");
                openAuthModal('login');
                return;
            }
            const input = document.getElementById(`comment-input-${postId}`);
            const text = input.value.trim();
            if (!text) return;

            try {
                const { error } = await supabase.from('comments').insert({
                    post_id: postId,
                    author_id: currentUser.id,
                    text: text
                });
                if (error) throw error;
                input.value = '';
                await fetchPosts();
                const newSec = document.getElementById(`comments-section-${postId}`);
                if (newSec) newSec.classList.remove('hidden');
            } catch (err) {
                alert("Error al comentar: " + err.message);
            }
        }
    };

    // ==========================================
    // 9. VISTA DE PERFIL DE DJ & DONACIONES A FUTURO
    // ==========================================
    window.openDJProfileById = async function(profileId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (!profile || error) {
                alert("No se pudo cargar el perfil del DJ.");
                return;
            }

            const picEl = document.getElementById('profile-picture');
            if (picEl) picEl.src = profile.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80';
            
            document.getElementById('profile-name').textContent = profile.dj_name || 'DJ';
            document.getElementById('profile-role').textContent = profile.role || 'DJ de Worship 🕊️';
            document.getElementById('profile-bio').textContent = profile.bio || 'Música cristiana para la gloria de Dios.';
            document.getElementById('profile-feed-name').textContent = profile.dj_name || 'este DJ';

            // Donaciones Slot
            const donContainer = document.getElementById('profile-donation-container');
            if (profile.donation_url) {
                donContainer.innerHTML = `
                    <a href="${profile.donation_url}" target="_blank" rel="noopener noreferrer" class="btn btn-donate">
                        <i class="fa-solid fa-heart-circle-bolt"></i> ${escapeHTML(profile.donation_label || 'Sembrar Ofrenda / Apoyar')}
                    </a>
                `;
            } else {
                donContainer.innerHTML = '';
            }

            // Acciones del dueño del perfil
            const ownerContainer = document.getElementById('profile-owner-actions');
            if (currentUser && currentUser.id === profile.id) {
                ownerContainer.innerHTML = `
                    <button class="btn btn-primary" onclick="toggleModal('profile-modal', false); openEditProfileModal()" style="font-size: 0.85rem;">
                        <i class="fa-solid fa-pen-to-square"></i> Editar Mi Perfil
                    </button>
                `;
            } else {
                ownerContainer.innerHTML = '';
            }

            // Redes Sociales
            const socialsContainer = document.getElementById('profile-socials-container');
            const soc = profile.socials || {};
            socialsContainer.innerHTML = `
                ${soc.youtube ? `<a href="${soc.youtube}" target="_blank" title="YouTube"><i class="fa-brands fa-youtube"></i></a>` : ''}
                ${soc.instagram ? `<a href="${soc.instagram.startsWith('http') ? soc.instagram : 'https://instagram.com/' + soc.instagram}" target="_blank" title="Instagram"><i class="fa-brands fa-instagram"></i></a>` : ''}
            `;

            // Estadísticas
            const djPosts = posts.filter(p => p.author_id === profile.id);
            document.getElementById('profile-stat-mixes').textContent = djPosts.length;
            
            let totalAmen = 0;
            djPosts.forEach(p => {
                totalAmen += (p.reactions || []).filter(r => r.reaction_type === 'amen').length;
            });
            document.getElementById('profile-stat-likes').textContent = totalAmen;

            // Mini feed del DJ
            const pFeed = document.getElementById('profile-posts-feed');
            pFeed.innerHTML = '';
            if (djPosts.length === 0) {
                pFeed.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Este DJ no ha subido mixes todavía.</p>`;
            } else {
                djPosts.forEach(p => {
                    const div = document.createElement('div');
                    div.className = 'post glass-panel';
                    div.style.marginBottom = '12px';
                    div.innerHTML = `
                        <h4 style="font-size: 1.05rem; margin-bottom: 6px;">${escapeHTML(p.title)}</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${escapeHTML(p.content || '')}</p>
                        <div style="display:flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.8rem; color: var(--accent-secondary); font-weight:600;">#${escapeHTML(p.genre || 'Worship')}</span>
                            <button class="btn btn-primary" onclick="toggleModal('profile-modal', false); ${p.type === 'audio' ? `playAudioFromMetadata(posts.find(x => x.id === '${p.id}'))` : `openVideoLightbox('${p.id}')`}" style="padding: 6px 14px; font-size: 0.8rem;">
                                <i class="fa-solid fa-play"></i> Reproducir
                            </button>
                        </div>
                    `;
                    pFeed.appendChild(div);
                });
            }

            toggleModal('profile-modal', true);
        } catch (e) {
            console.error("Error cargando perfil:", e);
        }
    };

    window.openCurrentUserProfile = function() {
        if (currentUser) {
            openDJProfileById(currentUser.id);
        } else {
            openAuthModal('login');
        }
    };

    // ==========================================
    // 10. TABS, FILTRADO Y DIRECTORIO
    // ==========================================
    window.setTab = function(tabName) {
        currentTab = tabName;

        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
        });
        document.querySelectorAll('.nav-shortcuts .nav-shortcut').forEach(sc => {
            sc.classList.toggle('active', sc.getAttribute('data-tab') === tabName);
        });

        const filterHeader = document.getElementById('feed-filter-title');
        const filterTitleText = document.getElementById('filter-title-text');
        
        if (tabName === 'inicio') {
            filterHeader.style.display = 'none';
        } else {
            filterHeader.style.display = 'block';
            if (tabName === 'audios') filterTitleText.innerHTML = '<i class="fa-solid fa-music"></i> Mixes de Audio Cristianos';
            else if (tabName === 'videos') filterTitleText.innerHTML = '<i class="fa-solid fa-video"></i> Sets de Video (VJ)';
            else if (tabName === 'djs') filterTitleText.innerHTML = '<i class="fa-solid fa-users"></i> Directorio de DJs & Creadores Cristianos';
            else if (tabName === 'recursos') filterTitleText.innerHTML = '<i class="fa-solid fa-folder-open"></i> Loops y Visuales para Proyectores';
            else if (tabName === 'guardados') filterTitleText.innerHTML = '<i class="fa-solid fa-bookmark"></i> Mis Publicaciones Guardadas';
        }

        if (tabName === 'djs') {
            renderDJDirectory();
        } else {
            renderFeed(getFilteredPosts());
        }
    };

    function getFilteredPosts() {
        let list = [...posts];

        if (currentTab === 'audios') {
            list = list.filter(p => p.type === 'audio');
        } else if (currentTab === 'videos') {
            list = list.filter(p => p.type === 'video');
        } else if (currentTab === 'recursos') {
            list = list.filter(p => p.type === 'recurso');
        } else if (currentTab === 'guardados') {
            list = list.filter(p => savedPostIds.includes(p.id));
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p => 
                (p.title || '').toLowerCase().includes(q) || 
                (p.profiles?.dj_name || '').toLowerCase().includes(q) || 
                (p.content || '').toLowerCase().includes(q) || 
                (p.genre || '').toLowerCase().includes(q)
            );
        }

        return list;
    }

    async function renderDJDirectory() {
        const container = document.getElementById('feed-posts');
        container.innerHTML = '<div class="loading-placeholder"><i class="fa-solid fa-circle-notch fa-spin"></i> Cargando DJs...</div>';

        const { data: djs, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'directory-grid';

        if (!djs || djs.length === 0) {
            container.innerHTML = `
                <div class="feed-empty-state glass-panel">
                    <div class="feed-empty-icon"><i class="fa-solid fa-users"></i></div>
                    <h2 class="feed-empty-title">Directorio Limpio y Listo</h2>
                    <p class="feed-empty-desc">Aún no hay otros DJs registrados. ¡Sé el primero en unirte y abrir tu perfil ministerial!</p>
                    <button class="btn btn-primary" onclick="openAuthModal('signup')"><i class="fa-solid fa-user-plus"></i> Registrarme como DJ</button>
                </div>
            `;
            return;
        }

        djs.forEach(dj => {
            const div = document.createElement('div');
            div.className = 'dj-card glass-panel';
            div.innerHTML = `
                <img src="${dj.avatar_url || 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=150&q=80'}" alt="${escapeHTML(dj.dj_name)}">
                <h4>${escapeHTML(dj.dj_name)}</h4>
                <span>${escapeHTML(dj.role || 'DJ Cristiano')}</span>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px; height: 35px; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(dj.bio || '')}</p>
                <button class="btn btn-primary" onclick="openDJProfileById('${dj.id}')">Ver Perfil</button>
            `;
            grid.appendChild(div);
        });

        container.appendChild(grid);
    }

    // Top Descargas Sidebar
    function renderTopDownloaded() {
        const listEl = document.getElementById('top-downloaded-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const sorted = [...posts].sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0)).slice(0, 3);
        if (sorted.length === 0) {
            listEl.innerHTML = '<li style="font-size:0.8rem; color:var(--text-secondary); padding: 8px;">Las mezclas más descargadas aparecerán aquí.</li>';
            return;
        }

        sorted.forEach(p => {
            const li = document.createElement('li');
            li.className = 'top-mix-item';
            li.style.cursor = 'pointer';
            li.onclick = () => {
                if (p.type === 'audio') playAudioFromMetadata(p);
                else openVideoLightbox(p.id);
            };
            li.innerHTML = `
                <img src="${p.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&q=80'}" alt="Cover">
                <div class="mix-info">
                    <h4>${escapeHTML(p.title)}</h4>
                    <span>${p.downloads_count || 0} descargas</span>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Guardar / Compartir / Descargas
    window.toggleSavePost = function(postId) {
        const idx = savedPostIds.indexOf(postId);
        if (idx > -1) {
            savedPostIds.splice(idx, 1);
            alert("Eliminado de favoritos.");
        } else {
            savedPostIds.push(postId);
            alert("¡Mix guardado en tus favoritos! 🕊️");
        }
        localStorage.setItem('djs_revolution_saved', JSON.stringify(savedPostIds));
        renderFeed(getFilteredPosts());
    };

    window.sharePost = function(postId) {
        const url = `${window.location.origin}/#post-${postId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("¡Vínculo copiado al portapapeles! Comparte la bendición.");
        });
    };

    window.triggerDirectDownload = async function(title, fileUrl, postId) {
        if (!fileUrl) {
            alert("El archivo se está procesando. Estará disponible en breve.");
            return;
        }
        alert(`¡Iniciando descarga de "${title}"!`);
        if (postId) {
            // Incrementar contador en Supabase
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.downloads_count = (post.downloads_count || 0) + 1;
                await supabase.from('posts').update({ downloads_count: post.downloads_count }).eq('id', postId);
                renderFeed(getFilteredPosts());
                renderTopDownloaded();
            }
        }
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = title;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Modal helpers
    window.toggleModal = function(modalId, show) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('active', show);
            if (modalId === 'video-lightbox' && !show) {
                closeVideoLightbox();
            }
        }
    };

    // Búsqueda en tiempo real
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderFeed(getFilteredPosts());
        });
    }

    // Navegación con enlaces data-tab
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setTab(this.getAttribute('data-tab'));
        });
    });

    // Formato de tiempo y utilidades con Hora Oficial de Panamá (America/Panama, GMT-5)
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function formatPanamaTimestamp(dateStr) {
        if (!dateStr) return { relative: "Reciente", panamaTime: "", displayBadge: "Reciente", fullTooltip: "Reciente" };
        const date = new Date(dateStr);
        const now = new Date();
        const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Hora exacta formateada en zona horaria oficial de Panamá (America/Panama - GMT-5)
        const panamaTimeStr = date.toLocaleTimeString('es-PA', {
            timeZone: 'America/Panama',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const panamaDateStr = date.toLocaleDateString('es-PA', {
            timeZone: 'America/Panama',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        // Comparar con el reloj local del cliente (Windows / Navegador)
        let relative = "Hace un momento";
        if (diffSecs >= 60 && diffSecs < 3600) {
            relative = `Hace ${Math.floor(diffSecs / 60)} min`;
        } else if (diffSecs >= 3600 && diffSecs < 86400) {
            relative = `Hace ${Math.floor(diffSecs / 3600)} h`;
        } else if (diffSecs >= 86400 && diffSecs < 604800) {
            relative = `Hace ${Math.floor(diffSecs / 86400)} d`;
        } else if (diffSecs >= 604800) {
            relative = panamaDateStr;
        }

        return {
            relative,
            panamaTime: panamaTimeStr,
            panamaDate: panamaDateStr,
            fullTooltip: `Publicado: ${panamaDateStr}, ${panamaTimeStr} (Hora Oficial de Panamá - GMT-5)`,
            displayBadge: `${relative} • ${panamaTimeStr} (PTY)`
        };
    }

    function formatRelativeTime(dateStr) {
        return formatPanamaTimestamp(dateStr).displayBadge;
    }

    // Reloj Oficial de Panamá en vivo para la cabina y el navbar
    function initPanamaClock() {
        const timeEl = document.getElementById('panama-clock-time');
        const clockContainer = document.getElementById('panama-clock');
        if (!timeEl) return;

        function update() {
            const now = new Date();
            const panamaTimeStr = now.toLocaleTimeString('es-PA', {
                timeZone: 'America/Panama',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            timeEl.textContent = panamaTimeStr;

            // Comparar con reloj de Windows / local del usuario
            const localTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
            if (clockContainer) {
                clockContainer.setAttribute(
                    'title', 
                    `🇵🇦 Hora Oficial de Cabina: ${panamaTimeStr} (Panamá GMT-5)\n💻 Tu reloj local de Windows (${localTz}): ${localTimeStr}`
                );
            }
        }
        update();
        setInterval(update, 1000);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // ==========================================
    // 11. ARRANQUE
    // ==========================================
    await initAuth();
    await fetchPosts();
    initPanamaClock();
});
