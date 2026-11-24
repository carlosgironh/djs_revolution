/**
 * Dynamic HLS & direct media loader shared across VideoLightboxModal,
 * InlineVideoPlayer, and PlayerContext.
 * Lazily imports `hls.js` only when an `.m3u8` stream is played so the
 * initial bundle stays lightweight.
 */
export function attachMediaSource({
  mediaEl,
  streamUrl,
  directUrl,
  useFallback = false,
  autoPlay = true,
  lowLatency = false,
  onFallback,
  onPlaying,
}) {
  if (!mediaEl) return () => {};

  let cancelled = false;
  let hlsInstance = null;

  const source = useFallback ? directUrl : (streamUrl || directUrl);
  if (!source) return () => {};

  const safePlay = () => {
    if (!autoPlay || cancelled) return;
    mediaEl.play().then(() => {
      onPlaying?.();
    }).catch(() => {});
  };

  if (source.includes('.m3u8')) {
    (async () => {
      try {
        const { default: Hls } = await import('hls.js');
        if (cancelled) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            ...(lowLatency ? { lowLatencyMode: true, backBufferLength: 90 } : {}),
          });
          hlsInstance = hls;

          hls.loadSource(source);
          hls.attachMedia(mediaEl);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            safePlay();
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data.fatal || cancelled) return;

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }

            console.warn('HLS fatal error, intentando respaldo directo:', data);
            hls.destroy();
            if (hlsInstance === hls) hlsInstance = null;

            if (directUrl && !useFallback) {
              onFallback?.(directUrl);
            }
          });
        } else if (mediaEl.canPlayType('application/vnd.apple.mpegurl')) {
          mediaEl.src = source;
          safePlay();
        } else if (directUrl) {
          mediaEl.src = directUrl;
          safePlay();
        }
      } catch (err) {
        if (!cancelled && directUrl && !useFallback) {
          console.warn('Error cargando hls.js, usando archivo directo:', err);
          onFallback?.(directUrl);
        }
      }
    })();
  } else {
    mediaEl.src = directUrl || source;
    safePlay();
  }

  return () => {
    cancelled = true;
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  };
}
