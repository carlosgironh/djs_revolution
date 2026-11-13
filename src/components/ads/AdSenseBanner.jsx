import React, { useEffect, useRef } from 'react';

/**
 * AdSenseBanner Component
 * Renders a Google AdSense responsive ad unit.
 * Set client and slot props according to your AdSense dashboard.
 */
export function AdSenseBanner({
  client = "ca-pub-XXXXXXXXXXXXXXXX",
  slot = "1234567890",
  format = "auto",
  responsive = true,
  className = ""
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !pushedRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (e) {
      console.warn("AdSense push error or adblocker enabled:", e);
    }
  }, []);

  const isPlaceholder = client === "ca-pub-XXXXXXXXXXXXXXXX";

  return (
    <div className={`overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-2 text-center ${className}`}>
      {isPlaceholder ? (
        <div className="py-3 px-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <span>Espacio Publicitario</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
            <span>AdSense</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Espacio reservado para anuncios patrocinados
          </p>
        </div>
      ) : (
        <ins
          ref={adRef}
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      )}
    </div>
  );
}

export default AdSenseBanner;
