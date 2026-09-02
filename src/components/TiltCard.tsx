import { useRef } from 'react';
import type { ReactNode } from 'react';

/** Degrees of tilt at the very corner of the card. */
const MAX_TILT = 8;

/**
 * Cursor-following card tilt with a tracking highlight.
 *
 * Depth comes from perspective on the rotation, a cast shadow, the photo
 * scaling inside its frame, and a highlight that tracks the cursor. An earlier
 * draft went further and gave the card `transform-style: preserve-3d`, pushing
 * the photo and caption to different translateZ depths so they parallaxed
 * against each other as the card turned. That was backed out for want of a way
 * to confirm it renders correctly, not because it was shown to be broken — so
 * it is a reasonable thing to try again against a real browser.
 *
 * No `will-change: transform`: the tilt is a brief hover animation, and leaving
 * the hint on permanently would promote every card to its own composited layer
 * for the life of the page for no benefit.
 *
 * Transforms are written straight to the node in the pointer handler rather
 * than through React state — re-rendering a grid of cards on every mousemove
 * is a reliable way to make a page feel like it is dragging.
 */
export default function TiltCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const node = ref.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    node.style.transform = `perspective(1100px) rotateY(${px * MAX_TILT * 2}deg) rotateX(${-py * MAX_TILT * 2}deg) scale(1.012)`;
    if (glare.current) {
      glare.current.style.opacity = '1';
      glare.current.style.background = `radial-gradient(400px circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.30), transparent 62%)`;
    }
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = '';
    if (glare.current) glare.current.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`relative transition-transform duration-[600ms] ease-out motion-reduce:!transform-none ${className}`}
    >
      {children}
      <div
        ref={glare}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{ aspectRatio: '4 / 3' }}
      />
    </div>
  );
}
