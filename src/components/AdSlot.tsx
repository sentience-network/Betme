"use client";

import { useEffect, useRef } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  /** AdSense ad-unit slot id (data-ad-slot). Required for live ads. */
  slot?: string;
  /** If set, an ad impression on this prediction accrues revenue to its participants. */
  predictionId?: string;
  className?: string;
}

// Renders a Google AdSense unit when NEXT_PUBLIC_ADSENSE_CLIENT is configured,
// otherwise a house "Sponsored" placeholder. Either way, when a predictionId is
// provided it records one ad impression so ad revenue is shared out.
export function AdSlot({ slot, predictionId, className }: Props) {
  const accrued = useRef(false);

  useEffect(() => {
    if (ADSENSE_CLIENT && slot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // adsbygoogle not ready yet; ignore.
      }
    }
  }, [slot]);

  useEffect(() => {
    if (!predictionId || accrued.current) return;
    accrued.current = true;
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictionId }),
    }).catch(() => {});
  }, [predictionId]);

  return (
    <div className={"card overflow-hidden " + (className ?? "")} data-testid="ad-slot">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Sponsored</span>
        <span className="text-[10px] text-slate-600">Ad revenue shared with predictors</span>
      </div>
      {ADSENSE_CLIENT && slot ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex h-24 items-center justify-center bg-gradient-to-r from-slate-900 to-slate-800 text-center text-sm text-slate-400">
          Your ad could be here — connect AdSense to start earning.
        </div>
      )}
    </div>
  );
}
