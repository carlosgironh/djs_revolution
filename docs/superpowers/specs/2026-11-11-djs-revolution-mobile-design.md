# Especificación de Diseño: DJ's Revolution Mobile (Android / Multiplataforma)

- **Fecha:** 2026-11-11
- **Estado:** Aprobado
- **Ubicación del código:** `/djs_revolution_mobile` (ignorado en `.gitignore`)
- **Tecnología:** Flutter (Dart) con Arquitectura Feature-First + Riverpod + Supabase Flutter SDK

---

## 1. Resumen Ejecutivo y Objetivos

DJ's Revolution Mobile es la versión móvil multiplataforma (enfocada inicialmente en Android) del ecosistema web de DJ's Revolution. Permite a DJs y amantes de la música electrónica interactuar con la comunidad, descubrir sets musicales, consultar el directorio de DJs y disfrutar de un reproductor de audio persistente con reproducción en segundo plano y controles en pantalla de bloqueo.

La aplicación mantendrá paridad funcional con la plataforma web existente en interacciones sociales y consumo multimedia, optimizando la experiencia móvil para conexiones celulares según el paradigma de aplicaciones como YouTube e Instagram (gestión inteligente de ancho de banda y advertencias para subida de archivos pesados).

---

## 2. Aislamiento y Configuración de Repositorio

1. **Directorio del Proyecto:** `c:\Proyectos_Git\djs_revolution\djs_revolution_mobile`
2. **Aislamiento en Git:**
   Se añade de forma explícita al `.gitignore` raíz del repositorio:
   ```gitignore
   # Mobile App Project
   /djs_revolution_mobile/
   ```
3. **Multiplataforma:**
   Base de código Flutter compartida al 100% entre Android y futuras compilaciones de iOS/Web.

---

## 3. Pila Tecnológica y Dependencias

* **Framework:** Flutter 3.x (Dart 3.x)
* **Gestión de Estado:** `flutter_riverpod` (^2.6.1)
* **Backend & Autenticación:** `supabase_flutter` (^2.8.0)
* **Audio en Segundo Plano:** `just_audio` (^0.9.42) + `audio_service` (^0.18.17)
* **Video:** `video_player` (^2.9.2) / `chewie` (^1.8.5)
* **Imágenes y Caché:** `cached_network_image` (^3.4.1)
* **Iconografía:** `lucide_icons_flutter` (^1.1.0)
* **Variables de Entorno:** `flutter_dotenv` (^5.2.1)

---

## 4. Arquitectura de Software (Feature-First)

El proyecto se estructurará bajo el patrón modular por características dentro de `/djs_revolution_mobile/lib`:

```text
lib/
├── core/
│   ├── config/
│   │   ├── constants.dart        # Supabase URL y Anon Key
│   │   └── supabase_client.dart  # Inicialización de Supabase
│   ├── theme/
│   │   ├── app_colors.dart       # Paleta Dark (#09090b, #121214, acentos neón)
│   │   └── app_theme.dart        # ThemeData global de Material 3
│   ├── services/
│   │   └── audio_handler.dart    # Implementación BaseAudioHandler para Android
│   └── utils/
│       ├── date_formatter.dart   # Formateo de fechas y tiempo transcurrido
│       └── media_guard.dart      # Validaciones de tamaño y ancho de banda
├── features/
│   ├── auth/
│   │   ├── controllers/          # auth_controller.dart (Riverpod)
│   │   ├── models/               # user_profile.dart
│   │   └── views/                # login_screen.dart, profile_edit_dialog.dart
│   ├── feed/
│   │   ├── controllers/          # feed_controller.dart (AsyncNotifier)
│   │   ├── models/               # post.dart, comment.dart, reaction.dart
│   │   └── views/                # feed_screen.dart, post_card.dart, comments_sheet.dart
│   ├── djs/
│   │   ├── controllers/          # dj_directory_controller.dart
│   │   └── views/                # dj_directory_screen.dart, dj_profile_modal.dart
│   ├── player/
│   │   ├── controllers/          # player_controller.dart
│   │   └── views/                # mini_player.dart, full_player_sheet.dart
│   └── post_creation/
│       ├── controllers/          # create_post_controller.dart
│       └── views/                # create_post_screen.dart
└── main.dart                     # Punto de entrada de la aplicación
```

---

## 5. Integración con Supabase

* **Credenciales:**
  * URL: `https://szptdgmdktxowgokpeye.supabase.co`
  * Anon Key: Reutilización de la clave pública existente del cliente web.
* **Mapeo de Entidades:**
  * `posts`: `id`, `title`, `description`, `audio_url`, `video_url`, `author_id`, `created_at`.
  * `profiles`: `id`, `username`, `full_name`, `avatar_url`, `bio`, `is_dj`, `social_links`.
  * `reactions`: `id`, `post_id`, `user_id`, `type`.
  * `comments`: `id`, `post_id`, `author_id`, `content`, `created_at`.
* **Buckets de Storage:**
  * `audio_tracks`: streaming de pistas.
  * `avatars` / `covers`: imágenes de perfil y miniaturas con caché en dispositivo.

---

## 6. Experiencia de Usuario y Manejo Multimedia

1. **Reproductor Persistente:**
   * **Mini-Player:** Barra anclada fija sobre el `BottomNavigationBar`. Permite reproducir/pausar, ver progreso y abrir el reproductor completo sin recargar ni interrumpir la navegación.
   * **Segundo Plano Android:** Uso de `AudioHandler` para mantener la reproducción al apagar la pantalla o minimizar la aplicación, integrando portada, título y controles en la pantalla de bloqueo y barra de notificaciones.
2. **Política de Datos y Red (Instagram/YouTube Paradigm):**
   * Subida de texto, enlaces, carátulas optimizadas y audios MP3/AAC con barra de progreso reactiva.
   * Detección de archivos multimedia de gran tamaño (>50 MB): despliegue de advertencia interactiva para proteger el consumo de datos celulares y sugerir Wi-Fi o uso de la versión web.

---

## 7. Configuración Nativa de Android (`AndroidManifest.xml`)

Permisos y servicios requeridos:
* `android.permission.INTERNET`
* `android.permission.WAKE_LOCK`
* `android.permission.FOREGROUND_SERVICE`
* `android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK`
* Configuración del servicio `com.ryanheise.audioservice.AudioService` en AndroidManifest.

---

## 8. Estrategia de Verificación y Pruebas

1. **Pruebas Unitarias:**
   * Serialización y parsing de modelos `Post` y `Profile` desde respuestas JSON de Supabase.
   * Validación del estado reactivo de `FeedNotifier` y `PlayerNotifier`.
2. **Pruebas de Componentes (Widgets):**
   * Renderizado y respuesta táctil del `MiniPlayer`.
   * Estructura de `PostCard` y gestión de likes optimistas.
3. **Análisis Estático y Compilación:**
   * Ejecución de `flutter analyze` sin advertencias críticas.
   * Comprobación de que `/djs_revolution_mobile` se encuentra ignorado por `git status`.
