"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLite } from "@/components/Curtain";

/**
 * Measures real frame time once per visit. A phone that cannot hold about 24 fps on a still page
 * gets the light version: no reveals, parallax or curtain. The <head> script already covers
 * devices that say up front they are small (memory, cores, data saver).
 */
function probeFrameRate() {
  try { if (sessionStorage.getItem("lite")) return; } catch { return; }
  if (document.visibilityState !== "visible") return;
  const gaps: number[] = [];
  let last = 0;
  const tick = (now: number) => {
    if (document.visibilityState !== "visible") return; // a background tab throttles frames: not a verdict
    if (last) gaps.push(now - last);
    last = now;
    if (gaps.length < 40) { requestAnimationFrame(tick); return; }
    // The median ignores a few long frames from hydration or image decoding; a steady crawl is what counts.
    const slow = gaps.sort((a, b) => a - b)[20] > 40;
    if (slow) document.documentElement.classList.add("lite");
    try { sessionStorage.setItem("lite", slow ? "1" : "0"); } catch { /* private mode */ }
  };
  requestAnimationFrame(tick);
}

/** Scroll reveal and parallax for [data-reveal] and [data-parallax]. */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(probeFrameRate, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => reveal.observe(el));
    scan();
    // Content swapped in from Supabase arrives after the first scan.
    const added = new MutationObserver(scan);
    added.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    const move = () => {
      frame = 0;
      if (isLite()) return;
      for (const el of document.querySelectorAll<HTMLElement>("[data-parallax]")) {
        const box = el.parentElement!.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) continue;
        const progress = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(progress * -4).toFixed(2)}%, 0) scale(1.09)`;
      }
    };
    const onScroll = () => { frame ||= requestAnimationFrame(move); };
    if (!isLite()) {
      move();
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onScroll);
    }
    return () => {
      reveal.disconnect();
      added.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
