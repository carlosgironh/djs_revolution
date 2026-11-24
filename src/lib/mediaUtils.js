import { supabase } from './supabase';

export const BRAND_LOGO_URL = '/logo_full.png?v=2.1.0';
const DEFAULT_COVER_BASE = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80';

/**
 * Returns the best cover/thumbnail URL for a post with Mux and default fallbacks.
 */
export function getCoverImageUrl(post, width = 600) {
  if (post?.cover_url) return post.cover_url;
  if (post?.mux_playback_id) {
    return `https://image.mux.com/${post.mux_playback_id}/thumbnail.jpg`;
  }
  return `${DEFAULT_COVER_BASE}&w=${width}`;
}

/**
 * Returns the best direct downloadable binary URL for a post
 * (Supabase Storage or direct MP4/MP3, NEVER an .m3u8 playlist)
 */
export function getDirectMediaUrl(post) {
  if (!post) return '';

  // 1. Direct file_url if not m3u8
  if (post.file_url && !post.file_url.includes('.m3u8')) {
    return post.file_url;
  }

  // 2. mux_audio_url if not m3u8
  if (post.mux_audio_url && !post.mux_audio_url.includes('.m3u8')) {
    return post.mux_audio_url;
  }

  // 3. video_url or audio_url if not m3u8
  if (post.video_url && !post.video_url.includes('.m3u8')) {
    return post.video_url;
  }
  if (post.audio_url && !post.audio_url.includes('.m3u8')) {
    return post.audio_url;
  }
  if (post.media_url && !post.media_url.includes('.m3u8')) {
    return post.media_url;
  }

  return '';
}

/**
 * Returns the best HLS streaming URL for a post
 */
export function getStreamingMediaUrl(post) {
  if (!post) return '';
  if (post.mux_playback_id) {
    return `https://stream.mux.com/${post.mux_playback_id}.m3u8`;
  }
  if (post.video_url && post.video_url.includes('.m3u8')) {
    return post.video_url;
  }
  if (post.audio_url && post.audio_url.includes('.m3u8')) {
    return post.audio_url;
  }
  return getDirectMediaUrl(post);
}

/**
 * Safely downloads a media file with the correct extension and binary content.
 * Prevents corrupted .m3u8 text downloads or mismatched .mp3/.mp4 extensions.
 */
export async function downloadMediaFile(post, onCountIncrement) {
  if (!post) return;

  const directUrl = getDirectMediaUrl(post);
  if (!directUrl) {
    alert("El archivo original se está procesando o sólo está disponible en streaming.");
    return;
  }

  // Determine actual type / extension
  const isVideo = post.type === 'video' || directUrl.toLowerCase().includes('.mp4') || directUrl.toLowerCase().includes('.mov');
  const ext = isVideo ? 'mp4' : 'mp3';

  const cleanTitle = (post.title || (isVideo ? 'video_set' : 'mix'))
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();
  const filename = `${cleanTitle}.${ext}`;

  // Increment counter in Supabase
  if (post.id) {
    try {
      await supabase
        .from('posts')
        .update({ downloads_count: (post.downloads_count || 0) + 1 })
        .eq('id', post.id);
      if (typeof onCountIncrement === 'function') {
        onCountIncrement();
      }
    } catch (err) {
      console.warn("Error incrementando descargas:", err);
    }
  }

  try {
    // Fetch blob (Supabase Storage allows CORS)
    const response = await fetch(directUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (err) {
    console.warn("Descarga por Blob falló, abriendo enlace directo:", err);
    const a = document.createElement('a');
    a.href = directUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
