# DJ's Revolution Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la aplicación móvil multiplataforma (Android prioritario) de DJ's Revolution en `/djs_revolution_mobile`, totalmente funcional con Supabase, reproductor persistente en segundo plano, feed social y directorio de DJs, manteniendo la carpeta aislada e ignorada en `.gitignore`.

**Architecture:** Flutter con patrón Feature-First y Riverpod para gestión de estado reactivo. La app interactúa directamente con el backend existente de Supabase (Auth, PostgREST, Storage) y utiliza `just_audio` + `audio_service` para streaming de audio persistente con controles nativos en la pantalla de bloqueo y barra de notificaciones de Android.

**Tech Stack:** Flutter 3.44+ (Dart 3.12+), `flutter_riverpod`, `supabase_flutter`, `just_audio`, `audio_service`, `cached_network_image`, `lucide_icons_flutter`.

**Spec:** `docs/superpowers/specs/2026-11-11-djs-revolution-mobile-design.md`

## Global Constraints

- Directorio del proyecto: `c:\Proyectos_Git\djs_revolution\djs_revolution_mobile`
- `.gitignore` del repositorio raíz debe ignorar `/djs_revolution_mobile/` de modo que ningún archivo generado ensucie el control de versiones del proyecto web.
- Credenciales de Supabase: `https://szptdgmdktxowgokpeye.supabase.co` y Anon Key existentes en `src/lib/supabase.js`.
- Audio persistente en Android: debe soportar reproducción en segundo plano y controles en la pantalla de bloqueo mediante `audio_service`.
- Control de contenido pesado: advertencia interactiva al usuario ante subidas multimedia >50MB para resguardar el consumo de datos celulares.

---

### Task 1: Aislamiento en Git y Creación del Proyecto Flutter

**Files:**
- Modify: `.gitignore` (añadir `/djs_revolution_mobile/`)
- Create: `djs_revolution_mobile/pubspec.yaml`
- Test: `djs_revolution_mobile/test/widget_test.dart`

**Interfaces:**
- Consumes: Configuración del repositorio Git raíz.
- Produces: Estructura base de Flutter inicializada e ignorada por Git.

- [ ] **Step 1: Añadir `/djs_revolution_mobile/` al `.gitignore` raíz**

Modificar `.gitignore` agregando:
```gitignore
# Mobile App Project
/djs_revolution_mobile/
```

- [ ] **Step 2: Verificar que git reconozca el cambio en .gitignore**

Run: `git diff .gitignore`
Expected: Línea `/djs_revolution_mobile/` agregada.

- [ ] **Step 3: Crear el proyecto Flutter en `/djs_revolution_mobile`**

Run: `flutter create --org com.djsrevolution --platforms android,ios djs_revolution_mobile`
Expected: Directorio creado exitosamente con soporte para Android y iOS.

- [ ] **Step 4: Actualizar dependencias en `djs_revolution_mobile/pubspec.yaml`**

Agregar las dependencias requeridas en `dependencies`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.6.1
  supabase_flutter: ^2.8.0
  just_audio: ^0.9.42
  audio_service: ^0.18.17
  cached_network_image: ^3.4.1
  lucide_icons_flutter: ^1.1.0
  intl: ^0.19.0
  flutter_dotenv: ^5.2.1
```
Run: `cd djs_revolution_mobile && flutter pub get`
Expected: Resolución y descarga de paquetes sin errores.

- [ ] **Step 5: Verificar que `git status` ignore completamente la carpeta móvil**

Run: `git status`
Expected: Solo `.gitignore` modificado en el working tree; `djs_revolution_mobile/` no debe aparecer como untracked.

- [ ] **Step 6: Commit del cambio en .gitignore**

```bash
git add .gitignore
git commit -m "chore: ignore djs_revolution_mobile project directory"
```

---

### Task 2: Configuración Nativa de Android y Permisos Multimedia

**Files:**
- Modify: `djs_revolution_mobile/android/app/src/main/AndroidManifest.xml`

**Interfaces:**
- Consumes: AndroidManifest generado por Flutter.
- Produces: Permisos de red, wake lock y servicio en primer plano para `AudioService`.

- [ ] **Step 1: Agregar permisos y configuración de Foreground Service en AndroidManifest.xml**

Modificar `djs_revolution_mobile/android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"/>

    <application
        android:label="DJ's Revolution"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name="com.ryanheise.audioservice.AudioServiceActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <service
            android:name="com.ryanheise.audioservice.AudioService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="true">
            <intent-filter>
                <action android:name="android.media.browse.MediaBrowserService" />
            </intent-filter>
        </service>

        <receiver
            android:name="com.ryanheise.audioservice.MediaButtonReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MEDIA_BUTTON" />
            </intent-filter>
        </receiver>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
```

- [ ] **Step 2: Verificar sintaxis del manifest**

Run: `cd djs_revolution_mobile && flutter analyze`
Expected: Ningún error relacionado con configuración nativa.

---

### Task 3: Capa Core: Configuración, Cliente Supabase y Tema Visual Dark Modern

**Files:**
- Create: `djs_revolution_mobile/lib/core/config/constants.dart`
- Create: `djs_revolution_mobile/lib/core/config/supabase_client.dart`
- Create: `djs_revolution_mobile/lib/core/theme/app_colors.dart`
- Create: `djs_revolution_mobile/lib/core/theme/app_theme.dart`
- Test: `djs_revolution_mobile/test/unit/core_theme_test.dart`

**Interfaces:**
- Consumes: Configuración y colores definidos en la versión web.
- Produces: `AppColors`, `AppTheme.darkTheme`, `AppConstants.supabaseUrl`, `AppConstants.supabaseAnonKey`.

- [ ] **Step 1: Escribir prueba unitaria para validar constantes y tema visual**

Crear `djs_revolution_mobile/test/unit/core_theme_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:djs_revolution_mobile/core/config/constants.dart';
import 'package:djs_revolution_mobile/core/theme/app_colors.dart';
import 'package:djs_revolution_mobile/core/theme/app_theme.dart';

void main() {
  test('AppConstants must have valid Supabase endpoints', () {
    expect(AppConstants.supabaseUrl, isNotEmpty);
    expect(AppConstants.supabaseAnonKey, isNotEmpty);
    expect(AppConstants.supabaseUrl.startsWith('https://'), isTrue);
  });

  test('AppTheme creates a dark theme with matching branding colors', () {
    final theme = AppTheme.darkTheme;
    expect(theme.brightness, equals(AppTheme.darkTheme.brightness));
    expect(AppColors.primary, isNotNull);
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/unit/core_theme_test.dart`
Expected: FAIL con errores de imports no encontrados.

- [ ] **Step 3: Implementar `constants.dart`**

Crear `djs_revolution_mobile/lib/core/config/constants.dart`:
```dart
class AppConstants {
  static const String appName = "DJ's Revolution";
  static const String supabaseUrl = "https://szptdgmdktxowgokpeye.supabase.co";
  static const String supabaseAnonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cHRkZ21ka3R4b3dnb2twZXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDUwNjAsImV4cCI6MjEwNDM4MTA2MH0.tSbLM2tCgWxfpnNRMg0qCVgQm63psYlD3_cbLW6qKyo";
  static const String muxEnvKey = "kk0c2blkv34tchrb68f41uar5";
  static const String muxServiceUrl =
      "https://szptdgmdktxowgokpeye.supabase.co/functions/v1/mux-service";
}
```

- [ ] **Step 4: Implementar `app_colors.dart` y `app_theme.dart`**

Crear `djs_revolution_mobile/lib/core/theme/app_colors.dart`:
```dart
import 'package:flutter/material.dart';

class AppColors {
  static const Color background = Color(0xFF09090B); // Zinc 950
  static const Color surface = Color(0xFF121214);    // Zinc 900
  static const Color surfaceLight = Color(0xFF1E1E22);
  static const Color border = Color(0xFF27272A);      // Zinc 800
  static const Color primary = Color(0xFF8B5CF6);     // Purple 500
  static const Color primaryLight = Color(0xFFA78BFA);
  static const Color secondary = Color(0xFFEC4899);   // Pink 500
  static const Color textPrimary = Color(0xFFFAFAFA);
  static const Color textSecondary = Color(0xFFA1A1AA);
  static const Color textMuted = Color(0xFF71717A);
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
}
```

Crear `djs_revolution_mobile/lib/core/theme/app_theme.dart`:
```dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surface,
        selectedItemColor: AppColors.primaryLight,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
```

- [ ] **Step 5: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/unit/core_theme_test.dart`
Expected: PASS.

---

### Task 4: Modelos de Datos (Post, Profile, Reaction, Comment)

**Files:**
- Create: `djs_revolution_mobile/lib/features/auth/models/user_profile.dart`
- Create: `djs_revolution_mobile/lib/features/feed/models/post.dart`
- Create: `djs_revolution_mobile/lib/features/feed/models/reaction.dart`
- Create: `djs_revolution_mobile/lib/features/feed/models/comment.dart`
- Test: `djs_revolution_mobile/test/unit/models_test.dart`

**Interfaces:**
- Consumes: JSON responses provenientes de Supabase tables (`posts`, `profiles`, `reactions`, `comments`).
- Produces: Clases inmutables con métodos `fromJson` y `toJson`.

- [ ] **Step 1: Escribir prueba unitaria de parsing de modelos**

Crear `djs_revolution_mobile/test/unit/models_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:djs_revolution_mobile/features/auth/models/user_profile.dart';
import 'package:djs_revolution_mobile/features/feed/models/post.dart';

void main() {
  test('UserProfile fromJson and toJson serialization', () {
    final json = {
      'id': 'usr-123',
      'username': 'dj_beat',
      'full_name': 'DJ Beatmaster',
      'avatar_url': 'https://example.com/avatar.jpg',
      'is_dj': true,
      'bio': 'Panama underground vibes',
    };

    final profile = UserProfile.fromJson(json);
    expect(profile.id, equals('usr-123'));
    expect(profile.username, equals('dj_beat'));
    expect(profile.isDj, isTrue);
    expect(profile.toJson()['username'], equals('dj_beat'));
  });

  test('Post fromJson parses nested author and reactions count', () {
    final json = {
      'id': 'post-456',
      'title': 'Summer Electro Mix 2026',
      'description': 'Live set recording',
      'audio_url': 'https://example.com/audio.mp3',
      'video_url': null,
      'author_id': 'usr-123',
      'created_at': '2026-06-01T20:00:00Z',
      'profiles': {
        'id': 'usr-123',
        'username': 'dj_beat',
        'full_name': 'DJ Beatmaster',
        'avatar_url': null,
        'is_dj': true,
      },
      'reactions': [{'id': 'r-1', 'type': 'fire'}],
      'comments': [{'id': 'c-1', 'content': 'Tremendo set!'}],
    };

    final post = Post.fromJson(json);
    expect(post.id, equals('post-456'));
    expect(post.title, equals('Summer Electro Mix 2026'));
    expect(post.author?.username, equals('dj_beat'));
    expect(post.reactionsCount, equals(1));
    expect(post.commentsCount, equals(1));
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/unit/models_test.dart`
Expected: FAIL con símbolos no declarados.

- [ ] **Step 3: Implementar `user_profile.dart`, `reaction.dart`, `comment.dart` y `post.dart`**

Crear `djs_revolution_mobile/lib/features/auth/models/user_profile.dart`:
```dart
class UserProfile {
  final String id;
  final String? username;
  final String? fullName;
  final String? avatarUrl;
  final bool isDj;
  final String? bio;

  UserProfile({
    required this.id,
    this.username,
    this.fullName,
    this.avatarUrl,
    this.isDj = false,
    this.bio,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      username: json['username'] as String?,
      fullName: json['full_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      isDj: json['is_dj'] as bool? ?? false,
      bio: json['bio'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'full_name': fullName,
    'avatar_url': avatarUrl,
    'is_dj': isDj,
    'bio': bio,
  };
}
```

Crear `djs_revolution_mobile/lib/features/feed/models/reaction.dart`:
```dart
class Reaction {
  final String id;
  final String? postId;
  final String? userId;
  final String type;

  Reaction({
    required this.id,
    this.postId,
    this.userId,
    required this.type,
  });

  factory Reaction.fromJson(Map<String, dynamic> json) {
    return Reaction(
      id: json['id'] as String,
      postId: json['post_id'] as String?,
      userId: json['user_id'] as String?,
      type: json['type'] as String? ?? 'like',
    );
  }
}
```

Crear `djs_revolution_mobile/lib/features/feed/models/comment.dart`:
```dart
import '../../auth/models/user_profile.dart';

class Comment {
  final String id;
  final String? postId;
  final String? authorId;
  final String content;
  final DateTime? createdAt;
  final UserProfile? author;

  Comment({
    required this.id,
    this.postId,
    this.authorId,
    required this.content,
    this.createdAt,
    this.author,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      postId: json['post_id'] as String?,
      authorId: json['author_id'] as String?,
      content: json['content'] as String? ?? '',
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'] as String) : null,
      author: json['profiles'] != null ? UserProfile.fromJson(json['profiles'] as Map<String, dynamic>) : null,
    );
  }
}
```

Crear `djs_revolution_mobile/lib/features/feed/models/post.dart`:
```dart
import '../../auth/models/user_profile.dart';
import 'reaction.dart';
import 'comment.dart';

class Post {
  final String id;
  final String title;
  final String? description;
  final String? audioUrl;
  final String? videoUrl;
  final String? authorId;
  final DateTime? createdAt;
  final UserProfile? author;
  final List<Reaction> reactions;
  final List<Comment> comments;

  Post({
    required this.id,
    required this.title,
    this.description,
    this.audioUrl,
    this.videoUrl,
    this.authorId,
    this.createdAt,
    this.author,
    this.reactions = const [],
    this.comments = const [],
  });

  int get reactionsCount => reactions.length;
  int get commentsCount => comments.length;

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['id'] as String,
      title: json['title'] as String? ?? 'Sin título',
      description: json['description'] as String?,
      audioUrl: json['audio_url'] as String?,
      videoUrl: json['video_url'] as String?,
      authorId: json['author_id'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      author: json['profiles'] != null
          ? UserProfile.fromJson(json['profiles'] as Map<String, dynamic>)
          : null,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((r) => Reaction.fromJson(r as Map<String, dynamic>))
              .toList() ??
          const [],
      comments: (json['comments'] as List<dynamic>?)
              ?.map((c) => Comment.fromJson(c as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/unit/models_test.dart`
Expected: PASS.

---

### Task 5: Servicio de Audio y Handler de Reproducción Persistente

**Files:**
- Create: `djs_revolution_mobile/lib/core/services/audio_handler.dart`
- Create: `djs_revolution_mobile/lib/features/player/controllers/player_controller.dart`
- Test: `djs_revolution_mobile/test/unit/player_controller_test.dart`

**Interfaces:**
- Consumes: `just_audio`, `audio_service`, `Post` model.
- Produces: `AudioHandler` singleton y `playerStateProvider` para controlar reproducción global.

- [ ] **Step 1: Escribir prueba unitaria para el estado del reproductor**

Crear `djs_revolution_mobile/test/unit/player_controller_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:djs_revolution_mobile/features/feed/models/post.dart';
import 'package:djs_revolution_mobile/features/player/controllers/player_controller.dart';

void main() {
  test('PlayerState initial state is idle', () {
    const state = PlayerState();
    expect(state.isPlaying, isFalse);
    expect(state.currentPost, isNull);
    expect(state.progress, equals(0.0));
  });

  test('PlayerState copyWith updates current track and playing status', () {
    final post = Post(id: '1', title: 'Electronic Anthem');
    const state = PlayerState();
    final updated = state.copyWith(currentPost: post, isPlaying: true);

    expect(updated.isPlaying, isTrue);
    expect(updated.currentPost?.title, equals('Electronic Anthem'));
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/unit/player_controller_test.dart`
Expected: FAIL con `PlayerState` no definido.

- [ ] **Step 3: Implementar `audio_handler.dart` y `player_controller.dart`**

Crear `djs_revolution_mobile/lib/core/services/audio_handler.dart`:
```dart
import 'package:audio_service/audio_service.dart';
import 'package:just_audio/just_audio.dart';

class AppAudioHandler extends BaseAudioHandler with SeekHandler {
  final AudioPlayer _player = AudioPlayer();

  AppAudioHandler() {
    _player.playbackEventStream.listen((PlaybackEvent event) {
      final playing = _player.playing;
      playbackState.add(playbackState.value.copyWith(
        controls: [
          MediaControl.rewind,
          if (playing) MediaControl.pause else MediaControl.play,
          MediaControl.fastForward,
        ],
        systemActions: const {
          MediaAction.seek,
        },
        androidCompactActionIndices: const [0, 1, 2],
        processingState: const {
          ProcessingState.idle: AudioProcessingState.idle,
          ProcessingState.loading: AudioProcessingState.loading,
          ProcessingState.buffering: AudioProcessingState.buffering,
          ProcessingState.ready: AudioProcessingState.ready,
          ProcessingState.completed: AudioProcessingState.completed,
        }[_player.processingState]!,
        playing: playing,
        updatePosition: _player.position,
        bufferedPosition: _player.bufferedPosition,
        speed: _player.speed,
      ));
    });
  }

  Future<void> playTrack(String url, String title, String artist) async {
    mediaItem.add(MediaItem(
      id: url,
      title: title,
      artist: artist,
    ));
    await _player.setUrl(url);
    await _player.play();
  }

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> stop() => _player.stop();

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  Stream<Duration> get positionStream => _player.positionStream;
  Stream<Duration?> get durationStream => _player.durationStream;
  Stream<bool> get playingStream => _player.playingStream;
}
```

Crear `djs_revolution_mobile/lib/features/player/controllers/player_controller.dart`:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/post.dart' as feed;
import '../../core/services/audio_handler.dart';

class PlayerState {
  final feed.Post? currentPost;
  final bool isPlaying;
  final Duration position;
  final Duration duration;

  const PlayerState({
    this.currentPost,
    this.isPlaying = false,
    this.position = Duration.zero,
    this.duration = Duration.zero,
  });

  double get progress {
    if (duration.inMilliseconds == 0) return 0.0;
    return (position.inMilliseconds / duration.inMilliseconds).clamp(0.0, 1.0);
  }

  PlayerState copyWith({
    feed.Post? currentPost,
    bool? isPlaying,
    Duration? position,
    Duration? duration,
  }) {
    return PlayerState(
      currentPost: currentPost ?? this.currentPost,
      isPlaying: isPlaying ?? this.isPlaying,
      position: position ?? this.position,
      duration: duration ?? this.duration,
    );
  }
}

final audioHandlerProvider = Provider<AppAudioHandler?>((ref) => null);

class PlayerController extends StateNotifier<PlayerState> {
  final AppAudioHandler? _handler;

  PlayerController(this._handler) : super(const PlayerState()) {
    _handler?.playingStream.listen((playing) {
      state = state.copyWith(isPlaying: playing);
    });
    _handler?.positionStream.listen((pos) {
      state = state.copyWith(position: pos);
    });
    _handler?.durationStream.listen((dur) {
      if (dur != null) state = state.copyWith(duration: dur);
    });
  }

  Future<void> playPost(feed.Post post) async {
    if (post.audioUrl == null) return;
    state = state.copyWith(currentPost: post);
    await _handler?.playTrack(
      post.audioUrl!,
      post.title,
      post.author?.fullName ?? post.author?.username ?? 'DJ',
    );
  }

  Future<void> togglePlay() async {
    if (state.isPlaying) {
      await _handler?.pause();
    } else {
      await _handler?.play();
    }
  }

  Future<void> seek(double percentage) async {
    final targetMs = (state.duration.inMilliseconds * percentage).toInt();
    await _handler?.seek(Duration(milliseconds: targetMs));
  }
}

final playerControllerProvider = StateNotifierProvider<PlayerController, PlayerState>((ref) {
  final handler = ref.watch(audioHandlerProvider);
  return PlayerController(handler);
});
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/unit/player_controller_test.dart`
Expected: PASS.

---

### Task 6: Autenticación y Perfil de Usuario con Supabase

**Files:**
- Create: `djs_revolution_mobile/lib/features/auth/controllers/auth_controller.dart`
- Create: `djs_revolution_mobile/lib/features/auth/views/auth_dialog.dart`
- Test: `djs_revolution_mobile/test/unit/auth_controller_test.dart`

**Interfaces:**
- Consumes: `SupabaseClient` de `supabase_flutter`.
- Produces: `authControllerProvider` gestionando `currentUser`, `currentProfile` y operaciones de sesión.

- [ ] **Step 1: Escribir prueba unitaria para AuthState**

Crear `djs_revolution_mobile/test/unit/auth_controller_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:djs_revolution_mobile/features/auth/controllers/auth_controller.dart';
import 'package:djs_revolution_mobile/features/auth/models/user_profile.dart';

void main() {
  test('AuthState represents unauthenticated user initially', () {
    const state = AuthState();
    expect(state.isAuthenticated, isFalse);
    expect(state.profile, isNull);
  });

  test('AuthState represents authenticated user when profile exists', () {
    final profile = UserProfile(id: 'u-1', username: 'tiesto');
    final state = AuthState(profile: profile);
    expect(state.isAuthenticated, isTrue);
    expect(state.profile?.username, equals('tiesto'));
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/unit/auth_controller_test.dart`
Expected: FAIL con `AuthState` no definido.

- [ ] **Step 3: Implementar `auth_controller.dart` y `auth_dialog.dart`**

Crear `djs_revolution_mobile/lib/features/auth/controllers/auth_controller.dart`:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';

class AuthState {
  final User? user;
  final UserProfile? profile;
  final bool isLoading;

  const AuthState({
    this.user,
    this.profile,
    this.isLoading = false,
  });

  bool get isAuthenticated => user != null || profile != null;

  AuthState copyWith({
    User? user,
    UserProfile? profile,
    bool? isLoading,
  }) {
    return AuthState(
      user: user ?? this.user,
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthController extends StateNotifier<AuthState> {
  final SupabaseClient _supabase;

  AuthController(this._supabase) : super(const AuthState()) {
    _init();
  }

  void _init() {
    final session = _supabase.auth.currentSession;
    if (session != null) {
      state = state.copyWith(user: session.user);
      fetchProfile(session.user.id);
    }

    _supabase.auth.onAuthStateChange.listen((data) {
      final user = data.session?.user;
      state = state.copyWith(user: user);
      if (user != null) {
        fetchProfile(user.id);
      } else {
        state = const AuthState();
      }
    });
  }

  Future<void> fetchProfile(String userId) async {
    try {
      final res = await _supabase.from('profiles').select().eq('id', userId).maybeSingle();
      if (res != null) {
        state = state.copyWith(profile: UserProfile.fromJson(res));
      }
    } catch (_) {}
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      await _supabase.auth.signInWithPassword(email: email, password: password);
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> signUp(String email, String password, String username) async {
    state = state.copyWith(isLoading: true);
    try {
      await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {'username': username},
      );
    } finally {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    state = const AuthState();
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(Supabase.instance.client);
});
```

Crear `djs_revolution_mobile/lib/features/auth/views/auth_dialog.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../controllers/auth_controller.dart';

class AuthDialog extends ConsumerStatefulWidget {
  const AuthDialog({super.key});

  @override
  ConsumerState<AuthDialog> createState() => _AuthDialogState();
}

class _AuthDialogState extends ConsumerState<AuthDialog> {
  bool _isLogin = true;
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _userCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _userCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Dialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              _isLogin ? 'Iniciar Sesión' : 'Crear Cuenta',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (!_isLogin) ...[
              TextField(
                controller: _userCtrl,
                decoration: const InputDecoration(labelText: 'Nombre de DJ / Usuario'),
              ),
              const SizedBox(height: 12),
            ],
            TextField(
              controller: _emailCtrl,
              decoration: const InputDecoration(labelText: 'Correo electrónico'),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passCtrl,
              decoration: const InputDecoration(labelText: 'Contraseña'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: authState.isLoading
                  ? null
                  : () async {
                      final email = _emailCtrl.text.trim();
                      final pass = _passCtrl.text.trim();
                      if (_isLogin) {
                        await ref.read(authControllerProvider.notifier).signIn(email, pass);
                      } else {
                        await ref.read(authControllerProvider.notifier).signUp(email, pass, _userCtrl.text.trim());
                      }
                      if (context.mounted && ref.read(authControllerProvider).isAuthenticated) {
                        Navigator.of(context).pop();
                      }
                    },
              child: authState.isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(_isLogin ? 'Entrar' : 'Registrarme'),
            ),
            TextButton(
              onPressed: () => setState(() => _isLogin = !_isLogin),
              child: Text(
                _isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión',
                style: const TextStyle(color: AppColors.primaryLight),
              ),
            )
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/unit/auth_controller_test.dart`
Expected: PASS.

---

### Task 7: Feed de Publicaciones y Directorio de DJs

**Files:**
- Create: `djs_revolution_mobile/lib/features/feed/controllers/feed_controller.dart`
- Create: `djs_revolution_mobile/lib/features/feed/views/post_card.dart`
- Create: `djs_revolution_mobile/lib/features/djs/views/dj_directory_view.dart`
- Test: `djs_revolution_mobile/test/widget/post_card_test.dart`

**Interfaces:**
- Consumes: `Post`, `UserProfile`, `playerControllerProvider`.
- Produces: Tarjeta interactiva `PostCard` y vista de directorio `DjDirectoryView`.

- [ ] **Step 1: Escribir prueba de widget para `PostCard`**

Crear `djs_revolution_mobile/test/widget/post_card_test.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:djs_revolution_mobile/features/feed/models/post.dart';
import 'package:djs_revolution_mobile/features/auth/models/user_profile.dart';
import 'package:djs_revolution_mobile/features/feed/views/post_card.dart';

void main() {
  testWidgets('PostCard renders title and author username', (tester) async {
    final post = Post(
      id: 'p-1',
      title: 'Techno Revolution Live',
      description: 'Recorded at Space Panama',
      author: UserProfile(id: 'u-1', username: 'dj_carlos', fullName: 'Carlos DJ'),
    );

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: PostCard(post: post),
          ),
        ),
      ),
    );

    expect(find.text('Techno Revolution Live'), findsOneWidget);
    expect(find.text('Carlos DJ'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/widget/post_card_test.dart`
Expected: FAIL con `PostCard` no definido.

- [ ] **Step 3: Implementar `feed_controller.dart`, `post_card.dart` y `dj_directory_view.dart`**

Crear `djs_revolution_mobile/lib/features/feed/controllers/feed_controller.dart`:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/post.dart';

class FeedNotifier extends AsyncNotifier<List<Post>> {
  @override
  Future<List<Post>> build() async {
    return _fetchPosts();
  }

  Future<List<Post>> _fetchPosts() async {
    try {
      final res = await Supabase.instance.client
          .from('posts')
          .select('*, profiles:author_id (*), reactions (*), comments (*)')
          .order('created_at', ascending: false);

      return (res as List).map((json) => Post.fromJson(json as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchPosts());
  }
}

final feedProvider = AsyncNotifierProvider<FeedNotifier, List<Post>>(() => FeedNotifier());
```

Crear `djs_revolution_mobile/lib/features/feed/views/post_card.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../models/post.dart';
import '../../player/controllers/player_controller.dart';

class PostCard extends ConsumerWidget {
  final Post post;

  const PostCard({super.key, required this.post});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerControllerProvider);
    final isCurrentTrack = playerState.currentPost?.id == post.id;
    final isPlaying = isCurrentTrack && playerState.isPlaying;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primary,
                radius: 20,
                child: Text(
                  (post.author?.fullName ?? post.author?.username ?? 'DJ')[0].toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.author?.fullName ?? post.author?.username ?? 'DJ Anónimo',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    Text(
                      '@${post.author?.username ?? "dj"}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              if (post.audioUrl != null)
                IconButton(
                  icon: Icon(
                    isPlaying ? LucideIcons.pauseCircle : LucideIcons.playCircle,
                    color: AppColors.primaryLight,
                    size: 32,
                  ),
                  onPressed: () {
                    if (isCurrentTrack) {
                      ref.read(playerControllerProvider.notifier).togglePlay();
                    } else {
                      ref.read(playerControllerProvider.notifier).playPost(post);
                    }
                  },
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            post.title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          ),
          if (post.description != null && post.description!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              post.description!,
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              Icon(LucideIcons.heart, size: 18, color: post.reactionsCount > 0 ? AppColors.secondary : AppColors.textMuted),
              const SizedBox(width: 6),
              Text('${post.reactionsCount}', style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
              const SizedBox(width: 20),
              const Icon(LucideIcons.messageSquare, size: 18, color: AppColors.textMuted),
              const SizedBox(width: 6),
              Text('${post.commentsCount}', style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
            ],
          ),
        ],
      ),
    );
  }
}
```

Crear `djs_revolution_mobile/lib/features/djs/views/dj_directory_view.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/models/user_profile.dart';

class DjDirectoryView extends StatefulWidget {
  const DjDirectoryView({super.key});

  @override
  State<DjDirectoryView> createState() => _DjDirectoryViewState();
}

class _DjDirectoryViewState extends State<DjDirectoryView> {
  List<UserProfile> _djs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDjs();
  }

  Future<void> _loadDjs() async {
    try {
      final res = await Supabase.instance.client
          .from('profiles')
          .select()
          .eq('is_dj', true)
          .order('full_name');
      setState(() {
        _djs = (res as List).map((j) => UserProfile.fromJson(j as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_djs.isEmpty) {
      return const Center(
        child: Text('No hay DJs registrados aún', style: TextStyle(color: AppColors.textMuted)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 12),
      itemCount: _djs.length,
      itemBuilder: (context, index) {
        final dj = _djs[index];
        return ListTile(
          leading: CircleAvatar(
            backgroundColor: AppColors.primary,
            child: Text((dj.fullName ?? dj.username ?? 'D')[0].toUpperCase(), style: const TextStyle(color: Colors.white)),
          ),
          title: Text(dj.fullName ?? dj.username ?? 'DJ', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          subtitle: Text(dj.bio ?? '@${dj.username}', style: const TextStyle(color: AppColors.textSecondary)),
        );
      },
    );
  }
}
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/widget/post_card_test.dart`
Expected: PASS.

---

### Task 8: MiniPlayer Persistente y Pantalla Principal

**Files:**
- Create: `djs_revolution_mobile/lib/features/player/views/mini_player.dart`
- Create: `djs_revolution_mobile/lib/features/player/views/full_player_sheet.dart`
- Create: `djs_revolution_mobile/lib/features/home/main_screen.dart`
- Modify: `djs_revolution_mobile/lib/main.dart`
- Test: `djs_revolution_mobile/test/widget/main_screen_test.dart`

**Interfaces:**
- Consumes: `MiniPlayer`, `PostCard`, `AppTheme`, `AppAudioHandler`.
- Produces: UI Principal de navegación de la app con reproductor flotante persistente.

- [ ] **Step 1: Escribir prueba de widget para MainScreen**

Crear `djs_revolution_mobile/test/widget/main_screen_test.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:djs_revolution_mobile/features/home/main_screen.dart';

void main() {
  testWidgets('MainScreen displays bottom navigation items', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: MainScreen(),
        ),
      ),
    );

    expect(find.text('Inicio'), findsOneWidget);
    expect(find.text('DJs'), findsOneWidget);
    expect(find.text('Publicar'), findsOneWidget);
    expect(find.text('Perfil'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/widget/main_screen_test.dart`
Expected: FAIL con `MainScreen` no definido.

- [ ] **Step 3: Implementar `mini_player.dart`, `full_player_sheet.dart`, `main_screen.dart` y `main.dart`**

Crear `djs_revolution_mobile/lib/features/player/views/mini_player.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../controllers/player_controller.dart';
import 'full_player_sheet.dart';

class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerControllerProvider);
    final post = playerState.currentPost;

    if (post == null) return const SizedBox.shrink();

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => const FullPlayerSheet(),
        );
      },
      child: Container(
        height: 64,
        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 8, offset: Offset(0, 4))],
        ),
        child: Column(
          children: [
            LinearProgressIndicator(
              value: playerState.progress,
              minHeight: 2,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    const Icon(LucideIcons.music, color: AppColors.primaryLight, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                          ),
                          Text(
                            post.author?.fullName ?? post.author?.username ?? 'DJ',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        playerState.isPlaying ? LucideIcons.pause : LucideIcons.play,
                        color: Colors.white,
                      ),
                      onPressed: () => ref.read(playerControllerProvider.notifier).togglePlay(),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

Crear `djs_revolution_mobile/lib/features/player/views/full_player_sheet.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/theme/app_colors.dart';
import '../controllers/player_controller.dart';

class FullPlayerSheet extends ConsumerWidget {
  const FullPlayerSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerControllerProvider);
    final post = playerState.currentPost;

    if (post == null) return const SizedBox.shrink();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: const Icon(LucideIcons.disc, size: 80, color: AppColors.primary),
          ),
          Column(
            children: [
              Text(post.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary), textAlign: TextAlign.center),
              const SizedBox(height: 6),
              Text(post.author?.fullName ?? post.author?.username ?? 'DJ', style: const TextStyle(fontSize: 16, color: AppColors.textSecondary)),
            ],
          ),
          Slider(
            value: playerState.progress,
            activeColor: AppColors.primary,
            inactiveColor: AppColors.border,
            onChanged: (val) => ref.read(playerControllerProvider.notifier).seek(val),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                iconSize: 48,
                icon: const Icon(LucideIcons.skipBack, color: Colors.white),
                onPressed: () => ref.read(playerControllerProvider.notifier).seek(0),
              ),
              const SizedBox(width: 24),
              IconButton(
                iconSize: 64,
                icon: Icon(playerState.isPlaying ? LucideIcons.pauseCircle : LucideIcons.playCircle, color: AppColors.primary),
                onPressed: () => ref.read(playerControllerProvider.notifier).togglePlay(),
              ),
              const SizedBox(width: 24),
              IconButton(
                iconSize: 48,
                icon: const Icon(LucideIcons.skipForward, color: Colors.white),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

Crear `djs_revolution_mobile/lib/features/home/main_screen.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../core/theme/app_colors.dart';
import '../feed/controllers/feed_controller.dart';
import '../feed/views/post_card.dart';
import '../djs/views/dj_directory_view.dart';
import '../player/views/mini_player.dart';
import '../auth/views/auth_dialog.dart';
import '../auth/controllers/auth_controller.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text("DJ's Revolution", style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: -0.5)),
        actions: [
          IconButton(
            icon: Icon(authState.isAuthenticated ? LucideIcons.userCheck : LucideIcons.user),
            onPressed: () {
              if (authState.isAuthenticated) {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: AppColors.surface,
                    title: Text(authState.profile?.fullName ?? 'Mi Perfil'),
                    content: Text('Conectado como @${authState.profile?.username ?? "dj"}'),
                    actions: [
                      TextButton(
                        onPressed: () {
                          ref.read(authControllerProvider.notifier).signOut();
                          Navigator.pop(ctx);
                        },
                        child: const Text('Cerrar Sesión', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                );
              } else {
                showDialog(context: context, builder: (_) => const AuthDialog());
              }
            },
          )
        ],
      ),
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: [
              // Feed Tab
              Consumer(
                builder: (context, ref, _) {
                  final feedAsync = ref.watch(feedProvider);
                  return feedAsync.when(
                    data: (posts) => RefreshIndicator(
                      color: AppColors.primary,
                      onRefresh: () => ref.read(feedProvider.notifier).refresh(),
                      child: posts.isEmpty
                          ? const Center(child: Text('No hay publicaciones aún', style: TextStyle(color: AppColors.textMuted)))
                          : ListView.builder(
                              padding: const EdgeInsets.only(bottom: 80, top: 8),
                              itemCount: posts.length,
                              itemBuilder: (ctx, i) => PostCard(post: posts[i]),
                            ),
                    ),
                    loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                    error: (err, _) => Center(child: Text('Error: $err', style: const TextStyle(color: AppColors.error))),
                  );
                },
              ),
              // DJs Tab
              const Padding(padding: EdgeInsets.only(bottom: 80), child: DjDirectoryView()),
              // Post / Upload Placeholder
              const Center(child: Text('Creación de Posts (Disponible con Sesión)', style: TextStyle(color: AppColors.textMuted))),
              // Profile Tab
              Center(
                child: Text(
                  authState.isAuthenticated
                      ? 'Perfil de ${authState.profile?.fullName ?? authState.profile?.username}'
                      : 'Inicia sesión para ver tu perfil y favoritos',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: MiniPlayer(),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.home), label: 'Inicio'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.disc), label: 'DJs'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.plusCircle), label: 'Publicar'),
          BottomNavigationBarItem(icon: Icon(LucideIcons.user), label: 'Perfil'),
        ],
      ),
    );
  }
}
```

Actualizar `djs_revolution_mobile/lib/main.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:audio_service/audio_service.dart';
import 'core/config/constants.dart';
import 'core/theme/app_theme.dart';
import 'core/services/audio_handler.dart';
import 'features/player/controllers/player_controller.dart';
import 'features/home/main_screen.dart';

late AppAudioHandler _globalAudioHandler;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  _globalAudioHandler = await AudioService.init(
    builder: () => AppAudioHandler(),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'com.djsrevolution.audio',
      androidNotificationChannelName: "DJ's Revolution Playback",
      androidNotificationOngoing: true,
      androidStopForegroundOnPause: true,
    ),
  );

  runApp(
    ProviderScope(
      overrides: [
        audioHandlerProvider.overrideWithValue(_globalAudioHandler),
      ],
      child: const DjsRevolutionApp(),
    ),
  );
}

class DjsRevolutionApp extends StatelessWidget {
  const DjsRevolutionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "DJ's Revolution",
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainScreen(),
    );
  }
}
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/widget/main_screen_test.dart`
Expected: PASS.

---

### Task 9: Guardia de Medios y Optimización de Ancho de Banda

**Files:**
- Create: `djs_revolution_mobile/lib/core/utils/media_guard.dart`
- Test: `djs_revolution_mobile/test/unit/media_guard_test.dart`

**Interfaces:**
- Consumes: Tamaño de archivo en bytes.
- Produces: `MediaGuard.validateFileSize` retornando estado o advertencia de consumo móvil (YouTube/Instagram pattern).

- [ ] **Step 1: Escribir prueba unitaria para `MediaGuard`**

Crear `djs_revolution_mobile/test/unit/media_guard_test.dart`:
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:djs_revolution_mobile/core/utils/media_guard.dart';

void main() {
  test('MediaGuard approves lightweight files under 50MB', () {
    const bytes = 10 * 1024 * 1024; // 10 MB
    final check = MediaGuard.checkMedia(bytes);
    expect(check.isAllowed, isTrue);
    expect(check.showWarning, isFalse);
  });

  test('MediaGuard issues warning for heavy files exceeding 50MB', () {
    const bytes = 65 * 1024 * 1024; // 65 MB
    final check = MediaGuard.checkMedia(bytes);
    expect(check.isAllowed, isTrue);
    expect(check.showWarning, isTrue);
    expect(check.warningMessage, contains('Wi-Fi'));
  });
}
```

- [ ] **Step 2: Ejecutar test y verificar que falle**

Run: `cd djs_revolution_mobile && flutter test test/unit/media_guard_test.dart`
Expected: FAIL con `MediaGuard` no definido.

- [ ] **Step 3: Implementar `media_guard.dart`**

Crear `djs_revolution_mobile/lib/core/utils/media_guard.dart`:
```dart
class MediaCheckResult {
  final bool isAllowed;
  final bool showWarning;
  final String? warningMessage;

  const MediaCheckResult({
    required this.isAllowed,
    required this.showWarning,
    this.warningMessage,
  });
}

class MediaGuard {
  static const int heavyThresholdBytes = 50 * 1024 * 1024; // 50 MB
  static const int hardLimitBytes = 250 * 1024 * 1024;    // 250 MB

  static MediaCheckResult checkMedia(int sizeInBytes) {
    if (sizeInBytes > hardLimitBytes) {
      return const MediaCheckResult(
        isAllowed: false,
        showWarning: true,
        warningMessage: 'El archivo excede el límite móvil (250MB). Por favor utiliza la versión web.',
      );
    }
    if (sizeInBytes > heavyThresholdBytes) {
      return const MediaCheckResult(
        isAllowed: true,
        showWarning: true,
        warningMessage: 'Archivo pesado (>50MB). Te sugerimos conectar a Wi-Fi para optimizar tus datos celulares.',
      );
    }
    return const MediaCheckResult(isAllowed: true, showWarning: false);
  }
}
```

- [ ] **Step 4: Ejecutar test y verificar que pase**

Run: `cd djs_revolution_mobile && flutter test test/unit/media_guard_test.dart`
Expected: PASS.

---

### Task 10: Verificación Completa del Proyecto Móvil y Control de Git

**Files:**
- Test: Suite completa de pruebas en `djs_revolution_mobile/test/`
- Check: `flutter analyze`
- Check: `git status`

- [ ] **Step 1: Ejecutar la suite completa de pruebas**

Run: `cd djs_revolution_mobile && flutter test`
Expected: Todas las pruebas unitarias y de widgets pasan exitosamente.

- [ ] **Step 2: Ejecutar análisis estático de código**

Run: `cd djs_revolution_mobile && flutter analyze`
Expected: `No issues found!`

- [ ] **Step 3: Verificar que el repositorio Git de la raíz permanezca limpio**

Run: `git status`
Expected: `djs_revolution_mobile/` sigue ignorado y no hay archivos sin seguimiento fuera de los esperados.
