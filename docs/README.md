# Documentación de DJ Revolution 🎧

Bienvenido a la documentación oficial del proyecto **DJ Revolution**.

---

## 📁 Estructura de Documentación

### 📱 Aplicación Móvil (Flutter Multiplataforma)
* **[Diseño y Especificación](file:///c:/Proyectos_Git/djs_revolution/docs/mobile/djs-revolution-mobile-design.md)**:
  * Arquitectura técnica, diseño UI glassmorphic, esquema de color morado/neón de alto contraste y componentes principales.
* **[Plan de Implementación y Ejecución](file:///c:/Proyectos_Git/djs_revolution/docs/mobile/djs-revolution-mobile-plan.md)**:
  * Desglose de tareas, suites de pruebas unitarias y de widgets, servicios de audio en segundo plano y controllers.

---

### ☁️ Backend & Streaming
* **Supabase (`szptdgmdktxowgokpeye`)**:
  * Autenticación con Row Level Security (RLS).
  * Tablas: `profiles`, `posts`, `reactions`, `comments`, `followers`.
  * Bucket de almacenamiento permanente `media` con acceso público y subida segura autenticada.
  * Trigger `trg_sync_posts_fields` para sincronización automática de columnas (`content` ↔ `description`, `media_url` ↔ `audio_url`/`file_url`).
* **Mux Video & Audio Streaming**:
  * Edge Function `mux-service`: Creación de Direct Uploads prefirmados y consulta de estado de transcodificación asíncrona (`status`, `asset_id`, `playback_id`).
  * URLs de reproducción HLS HD: `https://stream.mux.com/{playback_id}.m3u8`.

---

### 🤖 Configuración de Asistentes & Ruflo
* **[Guía de Configuración Claude / Ruflo](file:///c:/Proyectos_Git/djs_revolution/docs/CLAUDE.md)**:
  * Instrucciones, directrices de arquitectura y configuración de enjambres de agentes.

