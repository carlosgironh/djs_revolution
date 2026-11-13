import React, { useEffect, useRef } from 'react';

/**
 * AdSenseBanner Component
 * Renders a Google AdSense responsive ad unit.
 * Set client and slot props according to your AdSense dashboard.
 */
export function AdSenseBanner({
  client = "ca-pub-4074408230613118",
  slot,
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
      // Catch in case of adblocker or before domain approval
      console.warn("AdSense push:", e);
    }
  }, []);

  return (
    <div className={`overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-2 text-center min-h-[90px] flex items-center justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client={client}
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdSenseBanner;

