import React, { useEffect, useRef } from 'react';

/**
 * AdSenseBanner Component
 * Renders the Google AdSense ad unit (Slot: 5572757736 / First).
 */
export function AdSenseBanner({
  client = "ca-pub-4074408230613118",
  slot = "5572757736",
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
      console.warn("AdSense push:", e);
    }
  }, []);

  return (
    <div className={`overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-2 text-center min-h-[100px] flex items-center justify-center my-3 ${className}`}>
      {/* First */}
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdSenseBanner;
