"use client";

import { useEffect, type RefObject } from "react";

/**
 * The scroll engine for the Scroll V3 Dual landing — a direct port of the
 * design prototype's `apply()` (`Plugfolio Scroll V3 Dual.dc.html`):
 *
 *   • hero group fades/rises out over its 150vh section
 *   • the top bar reveals once the hero has scrolled past
 *   • the 420vh journey scrubs its four steps and phone screens off scroll
 *   • `data-rev` elements fade/rise in, `data-count` counts up, `data-bar` fills
 *
 * Values are continuous functions of scroll position, so the engine mutates
 * opacity/transform imperatively (a React re-render per frame is the wrong
 * tool). Everything static stays in classes; `prefers-reduced-motion` renders
 * every element at its final state.
 */
export function useLandingScroll(root: RefObject<HTMLElement | null>, roleKey: string) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;
    const one = (name: string) => rootEl.querySelector<HTMLElement>(`[data-lp="${name}"]`);
    const all = (sel: string) => Array.from(rootEl.querySelectorAll<HTMLElement>(sel));
    const s1 = one("s1");
    const s1group = one("s1group");
    const s1cue = one("s1cue");
    const s2 = one("s2");
    const topbar = one("topbar");
    const steps = all("[data-step]");
    const revs = all("[data-rev]");
    const counts = all("[data-count]");
    const bars = all("[data-bar]");
    const screens = all("[data-scr]");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    const ez = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const prog = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
    };

    const apply = () => {
      if (!s1 || !s1group) return;
      const vh = window.innerHeight;

      const p1 = reduced ? 0 : prog(s1);
      s1group.style.opacity = String(1 - ez(seg(p1, 0.4, 0.95)));
      s1group.style.transform = `translateY(${-ez(seg(p1, 0, 1)) * 60}px)`;
      if (s1cue) s1cue.style.opacity = String(Math.max(0, 1 - seg(p1, 0.02, 0.2)));

      if (topbar) {
        const show = window.scrollY > s1.offsetHeight - vh * 1.02;
        topbar.style.opacity = show ? "1" : "0";
        topbar.style.transform = show ? "translateY(0)" : "translateY(-8px)";
        topbar.style.pointerEvents = show ? "auto" : "none";
      }

      // The journey scrub: which of the four steps/screens is in frame.
      const narrow = rootEl.offsetWidth < 720;
      const p2 = s2 ? (reduced ? 1 : prog(s2)) : 1;
      const framePos = reduced ? 3 : seg(p2, 0.05, 0.92) * 3;
      const active = Math.max(0, Math.min(3, Math.round(framePos)));
      for (const el of steps) {
        const i = Number(el.dataset.step);
        el.style.display = narrow && i !== active ? "none" : "flex";
        el.style.opacity = i === active ? "1" : "0.35";
        el.style.transform = i === active ? "translateX(8px)" : "translateX(0)";
      }
      for (const el of screens) {
        const i = Number(el.dataset.scr);
        const d = Math.max(-1.02, Math.min(1.02, i - framePos));
        el.style.transform = `translateY(${d * 100}%)`;
      }

      // Reveals: staggered by column, and anything the page can't scroll far
      // enough to reveal (the footer) clamps to fully shown.
      const scrollH = document.documentElement.scrollHeight;
      const revealAt = (el: HTMLElement, i: number) => {
        const r = el.getBoundingClientRect();
        const minTop = Math.max(0, r.top + window.scrollY - (scrollH - vh));
        const start = vh * (0.98 - (i % 3) * 0.03);
        const end = Math.max(vh * 0.62, minTop);
        if (reduced || start <= end) return 1;
        return ez(Math.min(1, Math.max(0, (start - r.top) / (start - end))));
      };
      revs.forEach((el, i) => {
        const e = revealAt(el, i);
        el.style.opacity = String(e);
        el.style.transform = `translateY(${(1 - e) * 40}px)`;
      });
      for (const el of counts) {
        const value = Math.round(Number(el.dataset.count) * revealAt(el, 0));
        el.textContent = value.toLocaleString("en-IN");
      }
      for (const el of bars) {
        el.style.width = `${Number(el.dataset.bar) * revealAt(el, 1)}%`;
      }
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        apply();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [root, roleKey]);
}
