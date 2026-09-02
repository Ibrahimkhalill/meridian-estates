import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/**
 * Scroll parallax for the photography below the hero.
 *
 * Every registered element shares ONE scroll listener and ONE rAF loop. A
 * listener per image would be the obvious way to write this and the wrong one:
 * the hero already drives a WebGL camera off the same scroll event, and piling
 * a dozen more handlers onto it is exactly how the page starts to feel heavy.
 *
 * Only elements currently on screen are written to, and the only property
 * touched is `transform`, which the compositor can handle without re-running
 * layout or paint.
 */

type Entry = {
  el: HTMLElement;
  /** Total travel in px across a full pass through the viewport. */
  range: number;
};

const entries = new Set<Entry>();
let raf = 0;
let listening = false;
let reduced = false;

function tick() {
  raf = 0;
  const vh = window.innerHeight;
  for (const entry of entries) {
    const r = entry.el.getBoundingClientRect();
    // Skip anything off screen — no work for the 90% of the page not in view.
    if (r.bottom < -200 || r.top > vh + 200) continue;
    // 0 when the element's top hits the bottom of the viewport, 1 when its
    // bottom leaves the top. Centred so the image sits neutral mid-screen.
    const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
    const y = -p * entry.range;
    entry.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  }
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function register(entry: Entry) {
  if (reduced) return () => {};
  entries.add(entry);
  if (!listening) {
    listening = true;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  schedule();
  return () => {
    entries.delete(entry);
    entry.el.style.transform = '';
  };
}

/**
 * Wraps an image so it drifts against its frame as the page scrolls. The frame
 * clips, and the image is oversized by `overscan` so the drift never exposes an
 * edge — `range` px of travel needs at least that much slack top and bottom.
 */
export default function Parallax({
  children,
  range = 46,
  overscan = 1.18,
  className = '',
  rounded = 'rounded-2xl',
}: {
  children: ReactNode;
  range?: number;
  overscan?: number;
  className?: string;
  rounded?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = inner.current;
    if (!el) return;
    return register({ el, range });
  }, [range]);

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`}>
      <div
        ref={inner}
        className="h-full w-full will-change-transform"
        style={{ scale: String(overscan) }}
      >
        {children}
      </div>
    </div>
  );
}
