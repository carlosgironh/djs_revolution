// DJ's Revolution - Lógica de Interacciones del Frontend

document.addEventListener('DOMContentLoaded', () => {
    // --- BASE DE DATOS DE DJS Y VJS ---
    const djsDatabase = {
        "DJ Alpha": {
            name: "DJ Alpha",
            role: "Worship Electrónico / Remixes 🕊️",
            avatar: "https://i.pravatar.cc/150?img=12",
            banner: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Productor y DJ enfocado en crear atmósferas de adoración con sonidos electrónicos de vanguardia. Salmo 150 en cada set.",
            mixesCount: 15,
            followers: "12.5k",
            amenCount: "8.4k",
            socials: { youtube: "#", soundcloud: "#", instagram: "#" }
        },
        "DJ Grace": {
            name: "DJ Grace",
            role: "Deep Worship & Chill Ministry 🕊️",
            avatar: "https://i.pravatar.cc/150?img=33",
            banner: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Llevando paz a los corazones a través de mezclas de adoración ambiental y electrónica downtempo para edificación.",
            mixesCount: 8,
            followers: "9.2k",
            amenCount: "5.1k",
            socials: { youtube: "#", soundcloud: "#", instagram: "#" }
        },
        "VJ Zion": {
            name: "VJ Zion",
            role: "Visuales y Bucles de Gloria 🎥",
            avatar: "https://i.pravatar.cc/150?img=60",
            banner: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Creador de loops visuales y fondos dinámicos listos para proyectores de iglesias y eventos en vivo. Iluminando el altar.",
            mixesCount: 22,
            followers: "6.8k",
            amenCount: "3.7k",
            socials: { youtube: "#", instagram: "#" }
        },
        "DJ Israel": {
            name: "DJ Israel",
            role: "Ministerio de Alabanza 🕊️",
            avatar: "https://i.pravatar.cc/150?img=11",
            banner: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            bio: "Explorando ritmos de reggaetón celestial y electro worship para conectar a los jóvenes con Dios. ¡DJS Revolution!",
            mixesCount: 0, // Will increase as the user posts
            followers: "920",
            amenCount: "1.5k",
            socials: { youtube: "#", instagram: "#" }
        }
    };

    // --- BASE DE DATOS DE PUBLICACIONES INICIALES ---
    let posts = [
        {
            id: 1,
            author: "DJ Alpha",
            time: "Hace 2 horas",
            content: "¡Bendiciones mi gente! Les comparto este nuevo set de worship electrónico y remixes de alabanzas contemporáneas. ¡Espero que sea de gran edificación para sus vidas! 🔥🎧🙌",
            type: "video",
            title: "Holy Spirit Worship Electronic Set 2026",
            genre: "Worship Electrónico",
            mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-worship-hands-raised-in-church-41764-large.mp4",
            coverUrl: "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            downloadsCount: 120,
            likes: { amen: 85, bendicion: 40, like: 15 },
            comments: [
                { author: "DJ Grace", avatar: "https://i.pravatar.cc/150?img=33", text: "¡Qué gran unción en este set hermana! Amén.", time: "Hace 1 hora" },
                { author: "VJ Zion", avatar: "https://i.pravatar.cc/150?img=60", text: "¡Los bajos suenan increíbles! Lo usaré para el próximo retiro juvenil.", time: "Hace 30 min" }
            ]
        },
        {
            id: 2,
            author: "DJ Grace",
            time: "Hace 5 horas",
            content: "Sesión de adoración profunda y paz. Ambient & Chill Christian Music Vol. 3 🕊️✨ Ideal para momentos de oración personal y lectura bíblica.",
            type: "audio",
            title: "Ambient Worship Vol 3",
            genre: "Deep Ambient Worship",
            mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            downloadsCount: 340,
            likes: { amen: 120, bendicion: 90, like: 45 },
            comments: [
                { author: "DJ Alpha", avatar: "https://i.pravatar.cc/150?img=12", text: "Hermosa atmósfera de paz espiritual, gracias por compartir.", time: "Hace 4 horas" }
            ]
        },
        {
            id: 3,
            author: "VJ Zion",
            time: "Ayer",
            content: "Bendiciones hermanos VJs. Les dejo este bucle de video en alta definición con motivos de láseres y luces abstractas, ideal para usar como fondo de las letras de las canciones de alabanza en sus proyectores de iglesia. 🎥🙌",
            type: "recurso",
            title: "VJ Laser Lights Loop - Alabanza congregacional",
            genre: "Loops de Alabanza",
            mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41880-large.mp4",
            coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            downloadsCount: 520,
            likes: { amen: 65, bendicion: 30, like: 12 },
            comments: [
                { author: "DJ Israel", avatar: "https://i.pravatar.cc/150?img=11", text: "¡Gran aporte hermano! Lo necesitábamos para el ministerio este domingo.", time: "Hace 18 horas" }
            ]
        }
    ];

    // --- VARIABLES DE ESTADO ---
    let currentTab = 'inicio';
    let searchQuery = '';
    let savedPostIds = [];
    let userLoggedIn = false; // Modo Oyente Público por defecto
    
    // Variables del Reproductor de Audio
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

    // Actualiza la interfaz según el estado de sesión (Oyente vs DJ/VJ)
    function updateAuthUI() {
        const navContainer = document.getElementById('navbar-actions-container');
        const sidebarContainer = document.getElementById('sidebar-user-card');
        const createPostContainer = document.getElementById('create-post-container');

        if (userLoggedIn) {
            // Acciones del Navbar para DJ
            if (navContainer) {
                navContainer.innerHTML = `
                    <span class="user-status-badge dj-status" style="background: rgba(139, 92, 246, 0.1); color: var(--accent-primary); padding: 6px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-compact-disc fa-spin"></i> DJ Israel
                    </span>
                    <button class="btn btn-primary" onclick="toggleModal('upload-modal', true)"><i class="fa-solid fa-upload"></i> Compartir Mix</button>
                    <div class="user-profile" onclick="openCurrentUserProfile()">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Perfil DJ Israel">
                    </div>
                    <button class="btn btn-danger-link" onclick="simulateLogout()" title="Cerrar Sesión" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.1rem; padding: 5px; transition: color 0.3s;"><i class="fa-solid fa-right-from-bracket"></i></button>
                `;
            }

            // Tarjeta del Sidebar para DJ
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <div class="user-card-header">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Mi Perfil" onclick="openCurrentUserProfile()">
                        <div>
                            <h4 onclick="openCurrentUserProfile()">DJ Israel</h4>
                            <span>Ministerio de Alabanza 🕊️</span>
                        </div>
                    </div>
                    <div class="user-card-stats">
                        <div>
                            <strong id="sidebar-mixes-count">${djsDatabase["DJ Israel"].mixesCount}</strong>
                            <span>Mixes</span>
                        </div>
                        <div>
                            <strong>920</strong>
                            <span>Seguidores</span>
                        </div>
                        <div>
                            <strong>1.5k</strong>
                            <span>Amén</span>
                        </div>
                    </div>
                `;
            }

            // Caja de creación de post para DJ
            if (createPostContainer) {
                createPostContainer.innerHTML = `
                    <div class="create-post glass-panel">
                        <div class="create-post-header">
                            <img src="https://i.pravatar.cc/150?img=11" alt="Mi Perfil" onclick="openCurrentUserProfile()">
                            <input type="text" placeholder="¿Qué nuevo mix o bucle quieres compartir hoy para bendición?" onclick="toggleModal('upload-modal', true)">
                        </div>
                        <div class="create-post-actions">
                            <button onclick="openUploadModalWithType('audio')"><i class="fa-solid fa-music" style="color: var(--accent-primary);"></i> Audio Mix</button>
                            <button onclick="openUploadModalWithType('video')"><i class="fa-solid fa-video" style="color: var(--accent-secondary);"></i> Video Mix</button>
                            <button onclick="openUploadModalWithType('recurso')"><i class="fa-solid fa-folder-open" style="color: var(--success);"></i> Bucle / Recurso</button>
                        </div>
                    </div>
                `;
            }
        } else {
            // Acciones del Navbar para Oyente Público
            if (navContainer) {
                navContainer.innerHTML = `
                    <span class="user-status-badge guest-status" style="background: rgba(14, 165, 233, 0.1); color: var(--accent-secondary); padding: 6px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-eye"></i> Oyente (Público)
                    </span>
                    <button class="btn btn-secondary" onclick="simulateLogin()" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--surface-border); border-radius: 12px; font-weight:600; padding: 8px 16px; font-size: 0.85rem;"><i class="fa-solid fa-sign-in-alt"></i> Iniciar Sesión</button>
                `;
            }

            // Tarjeta del Sidebar para Oyente Público
            if (sidebarContainer) {
                sidebarContainer.innerHTML = `
                    <div style="text-align: center; padding: 10px 5px;">
                        <i class="fa-solid fa-dove" style="font-size: 2rem; color: var(--accent-secondary); margin-bottom: 12px; display: block;"></i>
                        <h4 style="margin-bottom: 6px;">¡Bienvenido, Oyente! 🕊️</h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 15px;">Explora y descarga mixes de video y audio gratis para bendecir tu iglesia o tu vida espiritual.</p>
                        <button class="btn btn-primary" onclick="simulateLogin()" style="width: 100%; font-size: 0.85rem; padding: 8px 12px; border-radius: 8px;"><i class="fa-solid fa-compact-disc"></i> Ingresar como DJ/VJ</button>
                    </div>
                `;
            }

            // Banner de invitación para Oyente Público en el Feed
            if (createPostContainer) {
                createPostContainer.innerHTML = `
                    <div class="create-post glass-panel" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(14, 165, 233, 0.05)); border-color: rgba(139, 92, 246, 0.2); padding: 25px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; border-radius: 20px;">
                        <h3 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 4px;">¿Eres DJ o VJ Cristiano? 🎧🕊️</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 500px; line-height: 1.4; margin-bottom: 4px;">Únete a nuestra hermandad para publicar tus propios sets de audio, video y recursos para proyectores.</p>
                        <button class="btn btn-primary" onclick="simulateLogin()"><i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión para Publicar</button>
                    </div>
                `;
            }
        }
    }

    window.simulateLogin = function() {
        userLoggedIn = true;
        updateAuthUI();
        alert("¡Sesión de prueba iniciada como DJ Israel! Ahora puedes publicar mixes, escribir comentarios y reaccionar con Amén.");
        renderFeed(getFilteredPosts());
    };

    window.simulateLogout = function() {
        userLoggedIn = false;
        updateAuthUI();
        alert("Sesión cerrada. Ahora estás en Modo Oyente Público (puedes escuchar y descargar mixes).");
        renderFeed(getFilteredPosts());
    };

    // --- RENDERIZADO DEL MURO PRINCIPAL ---
    function renderFeed(feedPosts = posts) {
        const feedContainer = document.getElementById('feed-posts');
        feedContainer.innerHTML = '';

        if (feedPosts.length === 0) {
            feedContainer.innerHTML = `
                <div class="glass-panel" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 12px;"></i>
                    <p>No se encontraron publicaciones en esta sección.</p>
                </div>
            `;
            return;
        }

        feedPosts.forEach(post => {
            const authorData = djsDatabase[post.author] || djsDatabase["DJ Israel"];
            const totalLikes = post.likes.amen + post.likes.bendicion + post.likes.like;
            const isSaved = savedPostIds.includes(post.id);

            // Generar contenedor de contenido multimedia
            let mediaHTML = '';
            if (post.type === 'audio') {
                const isThisPlaying = (currentPlayingPostId === post.id && !globalAudio.paused);
                mediaHTML = `
                    <div class="media-container audio-container">
                        <img src="${post.coverUrl}" alt="Cover" class="audio-cover">
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
            } else if (post.type === 'video' || post.type === 'recurso') {
                const badge = post.type === 'recurso' ? '<span class="post-tag recurso-tag" style="position:absolute; top:12px; right:12px; z-index:2;"><i class="fa-solid fa-folder-open"></i> VJ Loop</span>' : '';
                mediaHTML = `
                    <div class="media-container video-container" onclick="openVideoLightbox(${post.id})">
                        ${badge}
                        <div class="video-placeholder">
                            <i class="fa-solid fa-play play-icon"></i>
                            <img src="${post.coverUrl}" alt="Video Cover">
                        </div>
                    </div>
                `;
            }

            // Generar etiquetas cristianas
            const tagHTML = `<div class="post-tags"><span class="post-tag ${post.type === 'audio' ? 'audio-tag' : post.type === 'video' ? 'vj-tag' : 'recurso-tag'}">#${post.genre}</span></div>`;

            // Construir elemento artículo
            const article = document.createElement('article');
            article.className = 'post glass-panel';
            article.id = `post-${post.id}`;
            article.innerHTML = `
                <div class="post-header">
                    <div class="post-author" onclick="openDJProfile('${post.author}')" style="cursor: pointer;">
                        <img src="${authorData.avatar}" alt="${post.author}">
                        <div>
                            <h3>${post.author}</h3>
                            <span>${post.time} • <i class="fa-solid fa-globe"></i> Público</span>
                        </div>
                    </div>
                    <button class="post-options" onclick="toggleSavePost(${post.id})">
                        <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark" style="color: ${isSaved ? 'var(--accent-secondary)' : ''}"></i>
                    </button>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${mediaHTML}
                    ${tagHTML}
                </div>
                
                <div class="post-stats">
                    <div style="display: flex; gap: 8px;">
                        <span class="faith-count" style="color: var(--accent-secondary);"><i class="fa-solid fa-dove"></i> ${post.likes.amen} Amén</span>
                        <span class="faith-count" style="color: var(--success);"><i class="fa-solid fa-hands-praying"></i> ${post.likes.bendicion} Bendiciones</span>
                        <span class="faith-count" style="color: var(--danger);"><i class="fa-solid fa-heart"></i> ${post.likes.like}</span>
                    </div>
                    <span>${post.comments.length} Comentarios • ${post.downloadsCount} Descargas</span>
                </div>
                
                <div class="post-actions">
                    <div class="reactions-wrapper">
                        <button class="action-btn"><i class="fa-regular fa-hands-praying"></i> Reaccionar</button>
                        <div class="reactions-popover">
                            <span class="reaction-option" onclick="handleReaction(${post.id}, 'amen')" title="Amén 🕊️">🕊️</span>
                            <span class="reaction-option" onclick="handleReaction(${post.id}, 'bendicion')" title="Bendición 🙌">🙌</span>
                            <span class="reaction-option" onclick="handleReaction(${post.id}, 'like')" title="Me encanta ❤️">❤️</span>
                        </div>
                    </div>
                    
                    <button class="action-btn" onclick="toggleComments(${post.id})"><i class="fa-regular fa-comment"></i> Comentar</button>
                    
                    <button class="action-btn" onclick="sharePost(${post.id})"><i class="fa-solid fa-share"></i> Compartir</button>
                    
                    <button class="action-btn download-btn" onclick="triggerDirectDownload('${post.title}', '${post.mediaUrl}')">
                        <i class="fa-solid fa-download"></i> Descargar
                    </button>
                </div>

                <!-- Collapsible Comments Section -->
                <div class="post-comments-section hidden" id="comments-section-${post.id}">
                    <div class="comments-list" id="comments-list-${post.id}">
                        ${post.comments.map(c => `
                            <div class="comment-item">
                                <img src="${c.avatar}" alt="${c.author}" onclick="openDJProfile('${c.author}')" style="cursor:pointer;">
                                <div class="comment-bubble">
                                    <h5 onclick="openDJProfile('${c.author}')">${c.author}</h5>
                                    <p>${c.text}</p>
                                    <span>${c.time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="post-comments-input-area">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Mi Perfil">
                        <input type="text" placeholder="Escribe un mensaje de bendición..." id="comment-input-${post.id}" onkeypress="handleCommentKeyPress(event, ${post.id})">
                    </div>
                </div>
            `;
            feedContainer.appendChild(article);
        });

        // Re-sincronizar botones de play en los posts cargados
        setupPostAudioTriggers();
    }

    // --- RENDERIZAR WIDGET TOP DESCARGAS ---
    function renderTopDownloaded() {
        const topList = document.getElementById('top-downloaded-list');
        topList.innerHTML = '';

        // Ordenar posts por descargas de mayor a menor y tomar los 3 primeros
        const sorted = [...posts].sort((a, b) => b.downloadsCount - a.downloadsCount).slice(0, 3);

        sorted.forEach(post => {
            const authorData = djsDatabase[post.author] || djsDatabase["DJ Israel"];
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${post.coverUrl}" alt="Cover" onclick="openDJProfile('${post.author}')">
                <div class="mix-info" onclick="playAudioFromMetadata('${post.title}', '${post.author}', '${post.mediaUrl}', '${post.coverUrl}', ${post.id})">
                    <h4>${post.title}</h4>
                    <span>${post.author} • ${post.downloadsCount} descargas</span>
                </div>
            `;
            topList.appendChild(li);
        });
    }

    // --- SISTEMA DE REPRODUCCIÓN PERSISTENTE (AUDIO PLAYER) ---
    function playAudioFromMetadata(title, author, url, cover, postId) {
        // Mostrar reproductor flotante
        persistentPlayer.classList.remove('persistent-player-hidden');
        
        // Actualizar datos del reproductor
        playerCover.src = cover;
        playerTitle.textContent = title;
        playerArtist.textContent = author;
        playerDownloadBtn.onclick = () => triggerDirectDownload(title, url);

        // Si es una canción nueva, recargar e iniciar
        if (currentPlayingPostId !== postId) {
            currentPlayingPostId = postId;
            globalAudio.src = url;
            globalAudio.load();
        }

        // Reproducir / Pausar
        toggleGlobalAudioPlay();
    }

    function toggleGlobalAudioPlay() {
        if (globalAudio.src === "" || globalAudio.src.endsWith('#') || globalAudio.src.includes('undefined')) return;

        if (globalAudio.paused) {
            globalAudio.play().then(() => {
                playerPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                updateFeedPlayButtons(true);
            }).catch(err => {
                console.error("Audio playback error: ", err);
            });
        } else {
            globalAudio.pause();
            playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            updateFeedPlayButtons(false);
        }
    }

    function updateFeedPlayButtons(isPlaying) {
        // Buscar botones de play en los posts y actualizar su icono
        const playButtons = document.querySelectorAll('.post-play-btn');
        playButtons.forEach(btn => {
            const id = parseInt(btn.getAttribute('data-post-id'));
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

    // Configurar listeners para botones de Play en las tarjetas del feed
    function setupPostAudioTriggers() {
        const playButtons = document.querySelectorAll('.post-play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.getAttribute('data-post-id'));
                const post = posts.find(p => p.id === id);
                if (post) {
                    playAudioFromMetadata(post.title, post.author, post.mediaUrl, post.coverUrl, post.id);
                }
            });
        });

        // Progreso clickeable en los posts
        const progressBars = document.querySelectorAll('.post-progress-bar');
        progressBars.forEach(bar => {
            bar.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.getAttribute('data-post-id'));
                if (id === currentPlayingPostId) {
                    const rect = this.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const width = rect.width;
                    const percentage = clickX / width;
                    globalAudio.currentTime = percentage * globalAudio.duration;
                }
            });
        });
    }

    // Actualización del progreso de audio global
    globalAudio.addEventListener('timeupdate', () => {
        if (!globalAudio.duration) return;

        const percentage = (globalAudio.currentTime / globalAudio.duration) * 100;
        playerProgress.style.width = percentage + '%';
        playerCurrentTime.textContent = formatTime(globalAudio.currentTime);
        playerDuration.textContent = formatTime(globalAudio.duration);

        // Actualizar también la barra de progreso dentro del post activo en el feed
        if (currentPlayingPostId !== null) {
            const activePostBar = document.querySelector(`.post-progress-bar[data-post-id="${currentPlayingPostId}"] .progress`);
            const activePostTime = document.querySelector(`.post-time[data-post-id="${currentPlayingPostId}"]`);
            if (activePostBar) {
                activePostBar.style.width = percentage + '%';
            }
            if (activePostTime) {
                activePostTime.textContent = formatTime(globalAudio.currentTime) + ' / ' + formatTime(globalAudio.duration);
            }
        }
    });

    globalAudio.addEventListener('ended', () => {
        playerPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        updateFeedPlayButtons(false);
        playerProgress.style.width = '0%';
        playerCurrentTime.textContent = "00:00";
    });

    // Control de barra de progreso del player inferior (dragging/click)
    playerProgressBar.addEventListener('click', (e) => {
        if (!globalAudio.duration) return;
        const rect = playerProgressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        globalAudio.currentTime = percentage * globalAudio.duration;
    });

    // Play/Pause en reproductor persistente
    playerPlayBtn.addEventListener('click', toggleGlobalAudioPlay);

    // Mute / Volumen
    playerVolumeSlider.addEventListener('input', (e) => {
        globalAudio.volume = e.target.value;
        if (globalAudio.volume === 0) {
            playerMuteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else if (globalAudio.volume < 0.5) {
            playerMuteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        } else {
            playerMuteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    });

    playerMuteBtn.addEventListener('click', () => {
        globalAudio.muted = !globalAudio.muted;
        if (globalAudio.muted) {
            playerMuteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else {
            playerMuteBtn.innerHTML = globalAudio.volume < 0.5 ? '<i class="fa-solid fa-volume-low"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        }
    });

    // Botones Siguiente / Anterior en reproductor global (simulados dentro de los audios del feed)
    document.getElementById('player-next-btn').addEventListener('click', () => {
        const audioPosts = posts.filter(p => p.type === 'audio');
        if (audioPosts.length <= 1) return;
        let currentIndex = audioPosts.findIndex(p => p.id === currentPlayingPostId);
        let nextIndex = (currentIndex + 1) % audioPosts.length;
        const nextPost = audioPosts[nextIndex];
        playAudioFromMetadata(nextPost.title, nextPost.author, nextPost.mediaUrl, nextPost.coverUrl, nextPost.id);
    });

    document.getElementById('player-prev-btn').addEventListener('click', () => {
        const audioPosts = posts.filter(p => p.type === 'audio');
        if (audioPosts.length <= 1) return;
        let currentIndex = audioPosts.findIndex(p => p.id === currentPlayingPostId);
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = audioPosts.length - 1;
        const prevPost = audioPosts[prevIndex];
        playAudioFromMetadata(prevPost.title, prevPost.author, prevPost.mediaUrl, prevPost.coverUrl, prevPost.id);
    });

    document.getElementById('player-close-btn').addEventListener('click', () => {
        globalAudio.pause();
        persistentPlayer.classList.add('persistent-player-hidden');
        updateFeedPlayButtons(false);
        currentPlayingPostId = null;
    });

    // Helper para formatear tiempo
    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // --- REACCIONES (AMEN, BENDICION, ME GUSTA) ---
    window.handleReaction = function(postId, reactionType) {
        if (!userLoggedIn) {
            alert("Para reaccionar debes iniciar sesión. Inicia sesión en modo demo.");
            simulateLogin();
            return;
        }
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.likes[reactionType]++;
            
            // Si el post del autor es el usuario logueado o un DJ, aumentar su Amen general
            if (reactionType === 'amen') {
                const authorData = djsDatabase[post.author];
                if (authorData) {
                    let count = parseFloat(authorData.amenCount);
                    if (!isNaN(count)) {
                        authorData.amenCount = (count + 0.001).toFixed(1) + 'k';
                    }
                }
            }

            renderFeed(getFilteredPosts());
            renderTopDownloaded();
            
            // Si el lightbox de video está abierto para este post, actualizar estadísticas allí
            const lightbox = document.getElementById('video-lightbox');
            if (lightbox.classList.contains('active') && currentLightboxPostId === postId) {
                updateLightboxStats(post);
            }
        }
    };

    // --- COMPARTIR Y GUARDADOS ---
    window.sharePost = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            // Copiar al portapapeles una URL simulada de bendición
            const dummyUrl = `https://djs-revolution.com/mix/${post.id}`;
            navigator.clipboard.writeText(dummyUrl).then(() => {
                alert(`¡Vínculo de bendición copiado al portapapeles! Comparte este mix: ${post.title}`);
            });
        }
    };

    window.toggleSavePost = function(postId) {
        const index = savedPostIds.indexOf(postId);
        if (index > -1) {
            savedPostIds.splice(index, 1);
            alert("Eliminado de tus guardados/favoritos.");
        } else {
            savedPostIds.push(postId);
            alert("¡Mix guardado en tus favoritos espirituales!");
        }
        renderFeed(getFilteredPosts());
    };

    // --- COMENTARIOS INTERACTIVOS ---
    window.toggleComments = function(postId) {
        const commentSection = document.getElementById(`comments-section-${postId}`);
        if (commentSection) {
            commentSection.classList.toggle('hidden');
        }
    };

    window.handleCommentKeyPress = function(event, postId) {
        if (event.key === 'Enter') {
            if (!userLoggedIn) {
                alert("Para escribir un comentario debes registrarte como DJ o VJ. Iniciando sesión de prueba...");
                simulateLogin();
                return;
            }
            const inputField = document.getElementById(`comment-input-${postId}`);
            const commentText = inputField.value.trim();
            if (commentText) {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    post.comments.push({
                        author: "DJ Israel",
                        avatar: "https://i.pravatar.cc/150?img=11",
                        text: commentText,
                        time: "Hace un momento"
                    });
                    
                    inputField.value = '';
                    renderFeed(getFilteredPosts());
                    
                    // Si los comentarios estaban ocultos, mantenerlos visibles al recargar
                    const newCommentSection = document.getElementById(`comments-section-${postId}`);
                    if (newCommentSection) {
                        newCommentSection.classList.remove('hidden');
                    }
                }
            }
        }
    };

    // --- MODALES (SUBIR MIX, VIDEO LIGHTBOX, PERFIL) ---
    window.toggleModal = function(modalId, show) {
        if (modalId === 'upload-modal' && show && !userLoggedIn) {
            alert("Para subir un mix debes estar registrado como DJ o VJ.");
            simulateLogin();
            return;
        }
        const modal = document.getElementById(modalId);
        if (modal) {
            if (show) {
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
                if (modalId === 'video-lightbox') {
                    // Detener video si se cierra lightbox
                    const videoEl = document.getElementById('lightbox-video-element');
                    if (videoEl) videoEl.pause();
                }
            }
        }
    };

    window.openUploadModalWithType = function(type) {
        const typeSelect = document.getElementById('mix-type');
        if (typeSelect) {
            typeSelect.value = type;
            handleFormTypeChange();
        }
        toggleModal('upload-modal', true);
    };

    // Cambiar las opciones del selector de archivos en base al tipo de post (audio / video)
    window.handleFormTypeChange = function() {
        const type = document.getElementById('mix-type').value;
        const fileSelect = document.getElementById('mix-media-file');
        const genreSelect = document.getElementById('mix-genre');
        
        // Filtrar opciones de archivos multimedia
        const options = fileSelect.querySelectorAll('option');
        let firstVisibleSet = false;

        options.forEach(opt => {
            const optType = opt.getAttribute('data-type');
            if (optType === type) {
                opt.style.display = 'block';
                if (!firstVisibleSet) {
                    fileSelect.value = opt.value;
                    firstVisibleSet = true;
                }
            } else {
                opt.style.display = 'none';
            }
        });

        // Sugerir géneros afines
        if (type === 'audio') {
            genreSelect.value = 'Worship Electrónico';
        } else if (type === 'video') {
            genreSelect.value = 'Worship Electrónico';
        } else {
            genreSelect.value = 'Loops de Alabanza';
        }
    };

    // Envío del formulario de subida
    const uploadForm = document.getElementById('upload-mix-form');
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('mix-title').value.trim();
        const description = document.getElementById('mix-description').value.trim();
        const type = document.getElementById('mix-type').value;
        const genre = document.getElementById('mix-genre').value;
        const mediaUrl = document.getElementById('mix-media-file').value;
        
        const coverRadios = document.getElementsByName('mix-cover');
        let coverUrl = '';
        for (let r of coverRadios) {
            if (r.checked) {
                coverUrl = r.value;
                break;
            }
        }

        const newPost = {
            id: posts.length + 1,
            author: "DJ Israel",
            time: "Hace un momento",
            content: description,
            type: type,
            title: title,
            genre: genre,
            mediaUrl: mediaUrl,
            coverUrl: coverUrl,
            downloadsCount: 0,
            likes: { amen: 0, bendicion: 0, like: 0 },
            comments: []
        };

        // Agregar al inicio del feed
        posts.unshift(newPost);
        
        // Incrementar mix count del usuario
        djsDatabase["DJ Israel"].mixesCount++;
        updateAuthUI();

        // Limpiar formulario y cerrar
        uploadForm.reset();
        toggleModal('upload-modal', false);

        // Recargar vistas
        renderFeed(getFilteredPosts());
        renderTopDownloaded();
    });

    // --- FACEBOOK WATCH STYLE LIGHTBOX ---
    let currentLightboxPostId = null;
    const lightboxVideo = document.getElementById('lightbox-video-element');

    window.openVideoLightbox = function(postId) {
        const post = posts.find(p => p.id === postId);
        if (post && (post.type === 'video' || post.type === 'recurso')) {
            currentLightboxPostId = postId;
            
            // Cargar datos en lightbox
            lightboxVideo.src = post.mediaUrl;
            lightboxVideo.poster = post.coverUrl;
            lightboxVideo.load();
            lightboxVideo.play();

            const authorData = djsDatabase[post.author] || djsDatabase["DJ Israel"];
            document.getElementById('lightbox-author-img').src = authorData.avatar;
            document.getElementById('lightbox-author-name').textContent = post.author;
            document.getElementById('lightbox-author-name').onclick = () => { closeVideoLightbox(); openDJProfile(post.author); };
            document.getElementById('lightbox-post-time').textContent = post.time;
            document.getElementById('lightbox-video-title').textContent = post.title;
            document.getElementById('lightbox-video-desc').textContent = post.content;

            // Inyectar tags
            const tagsContainer = document.getElementById('lightbox-video-tags');
            tagsContainer.innerHTML = `<span class="post-tag ${post.type === 'recurso' ? 'recurso-tag' : 'vj-tag'}">#${post.genre}</span>`;

            updateLightboxStats(post);
            renderLightboxComments(post);

            // Listener para enviar comentarios desde lightbox
            const sendBtn = document.getElementById('lightbox-comment-submit-btn');
            const commentField = document.getElementById('lightbox-comment-field');
            
            sendBtn.onclick = () => submitLightboxComment(post.id);
            commentField.onkeypress = (e) => {
                if (e.key === 'Enter') submitLightboxComment(post.id);
            };

            toggleModal('video-lightbox', true);
        }
    };

    window.closeVideoLightbox = function() {
        toggleModal('video-lightbox', false);
    };

    function updateLightboxStats(post) {
        const totalLikes = post.likes.amen + post.likes.bendicion + post.likes.like;
        document.getElementById('lightbox-likes-stat').innerHTML = `<i class="fa-solid fa-heart"></i> ${totalLikes} reacciones de fe`;
        document.getElementById('lightbox-comments-stat').textContent = `${post.comments.length} Comentarios`;
    }

    function renderLightboxComments(post) {
        const list = document.getElementById('lightbox-comments-list');
        list.innerHTML = '';

        if (post.comments.length === 0) {
            list.innerHTML = `<p style="color: var(--text-secondary); text-align: center; font-size: 0.85rem;">Ningún comentario aún. ¡Sé el primero en bendecir esta obra!</p>`;
            return;
        }

        post.comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <img src="${c.avatar}" alt="${c.author}" onclick="closeVideoLightbox(); openDJProfile('${c.author}')" style="cursor:pointer;">
                <div class="comment-bubble">
                    <h5 onclick="closeVideoLightbox(); openDJProfile('${c.author}')">${c.author}</h5>
                    <p>${c.text}</p>
                    <span>${c.time}</span>
                </div>
            `;
            list.appendChild(item);
        });
    }

    function submitLightboxComment(postId) {
        if (!userLoggedIn) {
            alert("Para comentar debes estar registrado como DJ o VJ. Iniciando sesión de prueba...");
            simulateLogin();
            return;
        }
        const field = document.getElementById('lightbox-comment-field');
        const text = field.value.trim();
        if (text) {
            const post = posts.find(p => p.id === postId);
            if (post) {
                post.comments.push({
                    author: "DJ Israel",
                    avatar: "https://i.pravatar.cc/150?img=11",
                    text: text,
                    time: "Hace un momento"
                });
                field.value = '';
                
                // Recargar muro y lightbox
                renderFeed(getFilteredPosts());
                updateLightboxStats(post);
                renderLightboxComments(post);
            }
        }
    }

    // --- SIMULADOR DE PERFILES ---
    window.openDJProfile = function(djName) {
        const dj = djsDatabase[djName];
        if (dj) {
            // Cargar banner e info
            const banner = document.getElementById('profile-banner-element');
            if (banner) banner.style.backgroundImage = `linear-gradient(to bottom, rgba(5,5,5,0.2), #141419), url('${dj.banner}')`;
            
            const picEl = document.getElementById('profile-picture');
            if (picEl) picEl.src = dj.avatar;
            
            const nameEl = document.getElementById('profile-name');
            if (nameEl) nameEl.textContent = dj.name;
            
            const roleEl = document.getElementById('profile-role');
            if (roleEl) roleEl.textContent = dj.role;
            
            const bioEl = document.getElementById('profile-bio');
            if (bioEl) bioEl.textContent = dj.bio;
            
            const feedNameEl = document.getElementById('profile-feed-name');
            if (feedNameEl) feedNameEl.textContent = dj.name;

            // Estadísticas
            // Contar mixes reales subidos por el autor en nuestra base de datos de posts
            const realMixCount = posts.filter(p => p.author === djName).length;
            document.getElementById('profile-stat-mixes').textContent = djName === "DJ Israel" ? dj.mixesCount : realMixCount;
            document.getElementById('profile-stat-followers').textContent = dj.followers;
            document.getElementById('profile-stat-likes').textContent = dj.amenCount;

            // Filtrar posts específicos de este DJ
            const profileFeed = document.getElementById('profile-posts-feed');
            profileFeed.innerHTML = '';
            
            const djPosts = posts.filter(p => p.author === djName);
            if (djPosts.length === 0) {
                profileFeed.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Este DJ no ha subido mixes todavía.</p>`;
            } else {
                // Inyectar mini feed
                djPosts.forEach(post => {
                    const totalLikes = post.likes.amen + post.likes.bendicion + post.likes.like;
                    const div = document.createElement('div');
                    div.className = 'post glass-panel';
                    div.style.marginBottom = '15px';
                    
                    let miniMedia = '';
                    if (post.type === 'audio') {
                        miniMedia = `<button class="btn btn-primary" onclick="toggleModal('profile-modal', false); playAudioFromMetadata('${post.title}', '${post.author}', '${post.mediaUrl}', '${post.coverUrl}', ${post.id})"><i class="fa-solid fa-play"></i> Escuchar Audio Mix</button>`;
                    } else {
                        miniMedia = `<button class="btn btn-primary" onclick="toggleModal('profile-modal', false); openVideoLightbox(${post.id})"><i class="fa-solid fa-play"></i> Ver Video Mix</button>`;
                    }

                    div.innerHTML = `
                        <h4 style="font-size: 1.1rem; margin-bottom: 8px;">${post.title}</h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px;">${post.content}</p>
                        <div style="display:flex; justify-content: space-between; align-items:center;">
                            <span style="font-size: 0.8rem; color: var(--accent-secondary); font-weight:600;">#${post.genre}</span>
                            ${miniMedia}
                        </div>
                    `;
                    profileFeed.appendChild(div);
                });
            }

            toggleModal('profile-modal', true);
        }
    };

    window.openCurrentUserProfile = function() {
        openDJProfile("DJ Israel");
    };

    // --- FILTRADO DE TABS Y NAVEGACIÓN ---
    window.setTab = function(tabName) {
        currentTab = tabName;
        
        // Actualizar estado visual de los enlaces (tanto navbar como sidebar)
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        sidebarLinks.forEach(link => {
            const linkTab = link.getAttribute('data-tab');
            if (linkTab === tabName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        const navShortcuts = document.querySelectorAll('.nav-shortcuts .nav-shortcut');
        navShortcuts.forEach(shortcut => {
            const shortTab = shortcut.getAttribute('data-tab');
            if (shortTab === tabName) {
                shortcut.classList.add('active');
            } else {
                shortcut.classList.remove('active');
            }
        });

        // Título del filtro visible
        const filterHeader = document.getElementById('feed-filter-title');
        const filterTitleText = document.getElementById('filter-title-text');
        
        if (tabName === 'inicio') {
            filterHeader.style.display = 'none';
        } else {
            filterHeader.style.display = 'block';
            if (tabName === 'audios') filterTitleText.innerHTML = '<i class="fa-solid fa-music"></i> Mixes de Audio Cristianos';
            else if (tabName === 'videos') filterTitleText.innerHTML = '<i class="fa-solid fa-video"></i> Sets de Video (VJ)';
            else if (tabName === 'djs') filterTitleText.innerHTML = '<i class="fa-solid fa-users"></i> Directorio de DJs & VJs Cristianos';
            else if (tabName === 'recursos') filterTitleText.innerHTML = '<i class="fa-solid fa-folder-open"></i> Loops y Visuales para Proyectores';
            else if (tabName === 'guardados') filterTitleText.innerHTML = '<i class="fa-solid fa-bookmark"></i> Mis Publicaciones Guardadas';
        }

        // Renderizar en base al filtro seleccionado
        if (tabName === 'djs') {
            renderDJDirectory();
        } else {
            renderFeed(getFilteredPosts());
        }
    };

    // Retorna los posts filtrados por tab y búsqueda
    function getFilteredPosts() {
        let list = [...posts];

        // 1. Filtrar por Tab
        if (currentTab === 'audios') {
            list = list.filter(p => p.type === 'audio');
        } else if (currentTab === 'videos') {
            list = list.filter(p => p.type === 'video');
        } else if (currentTab === 'recursos') {
            list = list.filter(p => p.type === 'recurso');
        } else if (currentTab === 'guardados') {
            list = list.filter(p => savedPostIds.includes(p.id));
        }

        // 2. Filtrar por Búsqueda
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.author.toLowerCase().includes(q) || 
                p.content.toLowerCase().includes(q) || 
                p.genre.toLowerCase().includes(q)
            );
        }

        return list;
    }

    // Renderizar directorio de DJs
    function renderDJDirectory() {
        const container = document.getElementById('feed-posts');
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'directory-grid';

        Object.values(djsDatabase).forEach(dj => {
            const div = document.createElement('div');
            const isVJ = dj.name === "VJ Zion";
            div.className = `dj-card glass-panel ${isVJ ? 'vj-type' : ''}`;
            div.innerHTML = `
                <img src="${dj.avatar}" alt="${dj.name}">
                <h4>${dj.name}</h4>
                <span>${dj.role}</span>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px; height: 35px; overflow:hidden; text-overflow:ellipsis;">${dj.bio}</p>
                <button class="btn btn-primary" onclick="openDJProfile('${dj.name}')">Ver Perfil</button>
            `;
            grid.appendChild(div);
        });

        container.appendChild(grid);
    }

    // Configurar listeners de clicks en las sidebars y navbar para pestañas
    const links = document.querySelectorAll('[data-tab]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            setTab(tab);
        });
    });

    // --- BÚSQUEDA FUNCIONAL EN TIEMPO REAL ---
    const searchInput = document.getElementById('global-search');
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (currentTab === 'djs') {
            // Filtrar directorio
            const cards = document.querySelectorAll('.dj-card');
            cards.forEach(card => {
                const name = card.querySelector('h4').textContent.toLowerCase();
                const role = card.querySelector('span').textContent.toLowerCase();
                if (name.includes(searchQuery.toLowerCase()) || role.includes(searchQuery.toLowerCase())) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        } else {
            renderFeed(getFilteredPosts());
        }
    });

    // --- MOCK LIVE STREAM SIMULATION ---
    window.startMockLive = function(djName, streamName, avatar) {
        alert(`¡Conectándote al Live Stream de ${djName} - "${streamName}"! 🕊️`);
        
        // Simular abriendo un reproductor de video con el stream en vivo (usando video de adoración de mixkit)
        const mockPost = {
            id: 999,
            author: djName,
            time: "Transmitiendo EN VIVO ahora 🔴",
            content: `Únete a la transmisión en vivo de edificación de ${djName}. ${streamName}. 🙌✨`,
            type: 'video',
            title: `${djName} en Vivo`,
            genre: "EDM Cristiano Live",
            mediaUrl: djName === 'DJ Grace' ? "https://assets.mixkit.co/videos/preview/mixkit-worship-hands-raised-in-church-41764-large.mp4" : "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41880-large.mp4",
            coverUrl: avatar,
            downloadsCount: 0,
            likes: { amen: 150, bendicion: 80, like: 30 },
            comments: [
                { author: "DJ Alpha", avatar: "https://i.pravatar.cc/150?img=12", text: "¡El Señor está en este lugar! Gran set.", time: "Hace 1 min" }
            ]
        };

        // Insertar temporalmente el post de live en la base de datos de posts para abrirlo en el lightbox
        const exist = posts.find(p => p.id === 999);
        if (exist) {
            posts = posts.filter(p => p.id !== 999);
        }
        posts.unshift(mockPost);
        openVideoLightbox(999);
    };

    // --- DESCARGAS SIMULADAS ---
    window.triggerDirectDownload = function(title, fileUrl) {
        alert(`¡Iniciando descarga de bendición! \nArchivo: ${title}\nDescarga limpia, libre de virus, para uso ministerial.`);
        
        // Incrementar descarga en base de datos
        const post = posts.find(p => p.title === title || p.mediaUrl === fileUrl);
        if (post) {
            post.downloadsCount++;
            renderFeed(getFilteredPosts());
            renderTopDownloaded();
        }

        // Simular descarga real abriendo el enlace en una pestaña nueva
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = title;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- INICIALIZACIÓN ---
    renderFeed();
    renderTopDownloaded();
    updateAuthUI();
});
