"use client";

import { useEffect } from "react";

/** Service worker-ийг зөвхөн production (npm start) үед бүртгэнэ. `npm run dev` үед cache саад болохгүй. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("[pwa] service worker бүртгэгдсэнгүй", err));
  }, []);
  return null;
}
