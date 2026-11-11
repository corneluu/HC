"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BASE_PATH } from "@/lib/site";

const COVER_MS = 320;

/** True when the visitor's device or settings ask for the light version. */
export const isLite = () =>
  document.documentElement.classList.contains("lite") || matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Yellow curtain between pages: it covers the old page, the route changes underneath, then it lifts.
 * Only same-language internal links are taken over; everything else navigates as usual.
 */
export function Curtain() {
  const pathname = usePathname();
  const router = useRouter();
  const el = useRef<HTMLDivElement>(null);
  const covering = useRef(false);

  useEffect(() => {
    let push = 0;
    let failsafe = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || covering.current) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.origin !== location.origin) return;
      if (!a.pathname.startsWith(`${BASE_PATH}/`) || a.pathname === location.pathname || isLite()) return;
      const next = a.pathname.slice(BASE_PATH.length);
      const here = location.pathname.slice(BASE_PATH.length);
      if (next.split("/")[1] !== here.split("/")[1]) return; // another language or the admin: full page load
      e.preventDefault();
      covering.current = true;
      if (el.current) el.current.dataset.state = "in";
      push = window.setTimeout(() => router.push(next + a.search + a.hash), COVER_MS);
      // If the route never changes, do not leave the visitor behind a yellow wall.
      failsafe = window.setTimeout(() => {
        covering.current = false;
        if (el.current) el.current.dataset.state = "";
      }, 4000);
    };
    const clear = () => clearTimeout(failsafe);
    document.addEventListener("click", onClick, true);
    document.addEventListener("curtain:lift", clear);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("curtain:lift", clear);
      clearTimeout(push);
      clearTimeout(failsafe);
    };
  }, [router]);

  useEffect(() => {
    if (!covering.current || !el.current) return;
    covering.current = false;
    document.dispatchEvent(new Event("curtain:lift"));
    const node = el.current;
    node.dataset.state = "out";
    const done = window.setTimeout(() => { if (node.dataset.state === "out") node.dataset.state = ""; }, 500);
    return () => clearTimeout(done);
  }, [pathname]);

  return <div ref={el} className="curtain" aria-hidden><i /></div>;
}
