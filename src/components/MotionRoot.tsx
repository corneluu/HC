"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll reveal and parallax for [data-reveal], [data-words] and [data-parallax]. */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const SELECTOR = "[data-reveal]:not(.is-in),[data-words]:not(.is-in)";
    const scan = () => document.querySelectorAll(SELECTOR).forEach((el) => reveal.observe(el));
    scan();
    // Content swapped in from Supabase arrives after the first scan.
    const added = new MutationObserver(scan);
    added.observe(document.body, { childList: true, subtree: true });

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const move = () => {
      frame = 0;
      for (const el of document.querySelectorAll<HTMLElement>("[data-parallax]")) {
        const box = el.parentElement!.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) continue;
        const progress = (box.top + box.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(progress * -10).toFixed(2)}%, 0) scale(1.22)`;
      }
    };
    const onScroll = () => { frame ||= requestAnimationFrame(move); };
    if (!still) {
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
