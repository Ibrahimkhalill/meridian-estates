import { useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';

/** How long the curtain takes to clear once it starts leaving. */
export const EXIT_MS = 1100;
/** A beat at 100 so the number is legible before the wipe. */
const HOLD_MS = 460;

interface LoaderProps {
  /**
   * 0–100 from three's loading manager, or null while the scene's own
   * JavaScript chunk is still on the wire — at that point nothing has been
   * queued yet, so there is genuinely no figure to report.
   *
   * A ref rather than a value: it changes once per file loaded, and pushing
   * that through React re-rendered the whole scene each time. The frame loop
   * below has to run anyway, so it reads it there. See Hero.
   */
  progressRef: RefObject<number | null>;
  /** True once the scene has actually put a frame on the screen. */
  ready: boolean;
  /** Fires as the wipe starts, so the hero copy can animate in behind it. */
  onExit: () => void;
  /** Fires when the wipe is over and the overlay can unmount. */
  onDone: () => void;
}

export default function Loader({ progressRef, ready, onExit, onDone }: LoaderProps) {
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const targetRef = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  /**
   * index.html paints its own copy of this card so the first frame the browser
   * draws is not a blank page — the app bundle alone is a beat or two on a slow
   * line. This component is that card's continuation, and the two are drawn to
   * the same measurements, so retiring the static one here is invisible.
   */
  useEffect(() => {
    document.getElementById('boot')?.remove();
    document.documentElement.classList.remove('booting');
  }, []);

  /**
   * Latched once the manager reports a figure above zero. The manager can
   * momentarily report zero again as it queues more work, and without the
   * latch the card would flip back to the indeterminate sweep, throw away the
   * figure it was showing and re-label itself — a visible stutter each time a
   * new batch started.
   */
  const [counting, setCounting] = useState(false);
  const countingRef = useRef(false);

  /**
   * One frame loop does everything: reads the manager, keeps the target
   * monotonic — it reports 100% of the four files it knows about, then drops
   * to 40% when the next batch is queued, and a figure that runs backwards
   * reads as a fault — and eases the displayed number toward it, so the count
   * moves the whole time instead of sitting still through a slow file and then
   * jumping. Once the villa is up it closes twice as fast, so the last stretch
   * to 100 is not what the visitor ends up waiting on.
   */
  const readyRef = useRef(false);
  readyRef.current = ready;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const raw = progressRef.current ?? 0;
      if (raw > 0 && !countingRef.current) {
        countingRef.current = true;
        setCounting(true);
      }
      const next = readyRef.current ? 100 : raw;
      if (next > targetRef.current) targetRef.current = next;

      setShown((s) => {
        const t = targetRef.current;
        if (reduced.current) return t;
        return t - s < 0.2 ? t : s + (t - s) * (readyRef.current ? 0.16 : 0.075);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  /**
   * On a repeat visit everything is in cache and `ready` can arrive while the
   * counter is still climbing through the forties. Leaving on that would wipe
   * the card away mid-count, which reads as a glitch — so the exit waits for
   * the figure to actually land on 100. The cap is there because a backgrounded
   * tab stops serving frames, and the counter would never get there.
   */
  const [capped, setCapped] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setCapped(true), 2500);
    return () => clearTimeout(t);
  }, [ready]);

  const settled = ready && (shown >= 99.5 || capped);

  // The callbacks are held in a ref so a parent that re-renders mid-wipe cannot
  // restart the timers and strand the overlay on screen.
  const cbs = useRef({ onExit, onDone });
  cbs.current = { onExit, onDone };

  useEffect(() => {
    if (!settled) return;
    const t1 = setTimeout(() => {
      setLeaving(true);
      cbs.current.onExit();
    }, HOLD_MS);
    const t2 = setTimeout(() => cbs.current.onDone(), HOLD_MS + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [settled]);

  const pct = Math.min(100, Math.round(shown));

  /**
   * Zero percent with an empty rule looks like a fault, and it is also the
   * least informative thing the manager ever says — it means the queue is
   * filling and nothing has come back yet. That is what the travelling
   * highlight is for.
   */
  const indeterminate = !ready && !counting;

  /**
   * Each of these is a phase that is actually happening. The gap between "all
   * files downloaded" and "the villa is on screen" is real — shader compilation
   * on a cold GPU cache can run to a second or more — and saying so beats
   * sitting on 100 with no explanation.
   */
  const status = ready
    ? 'Step inside'
    : indeterminate
      ? 'Preparing'
      : pct >= 100
        ? 'Building the scene'
        : 'Loading materials';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-busy={!ready}
      className={`fixed inset-0 z-[100] bg-bone ${leaving ? 'pointer-events-none' : ''}`}
      style={
        reduced.current
          ? { opacity: leaving ? 0 : 1, transition: `opacity ${EXIT_MS}ms ease-out` }
          : {
              // The curtain lifts rather than fades, so the villa is revealed
              // from the ground up — the order you would take a building in if
              // you were walking towards it.
              clipPath: leaving ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)',
              transition: `clip-path ${EXIT_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
            }
      }
    >
      {/* One centred column. Everything the visitor needs to read — what is
          loading, and how far along it is — sits in one place under the
          wordmark, rather than being pushed out to opposite corners of an empty
          screen where it reads as decoration instead of a status. */}
      <div
        className="flex h-full items-center justify-center px-6"
        style={{
          // The content leaves slightly ahead of the curtain, so the card is
          // already emptying as it lifts instead of being sliced mid-word.
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(-20px)' : 'none',
          transition:
            'opacity 520ms ease-out, transform 640ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="w-full max-w-[360px] text-center">
          <p className="font-display flex items-start justify-center text-2xl tracking-tight text-ink md:text-3xl">
            MERIDIAN<span className="ml-0.5 text-[0.5em] text-moss">&deg;</span>
          </p>

          {/* Before the manager has counted anything the figure sits at 00 in
              the muted tone — a counter at rest rather than a reading. It takes
              the ink colour the moment it means something. */}
          <p
            className={`mt-12 transition-colors duration-500 font-display ${
              indeterminate ? 'text-muted/35' : 'text-ink'
            }`}
            style={{
              fontSize: 'clamp(52px, 7vw, 84px)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {/* Padded to two digits so the figure does not shrink from 00 to 0
                the instant real counting starts, which reads as a stumble. */}
            {String(pct).padStart(2, '0')}
            <span
              className={`align-top text-[0.26em] transition-colors duration-500 ${
                indeterminate ? 'text-muted/25' : 'text-muted'
              }`}
            >
              %
            </span>
          </p>

          {/* The rule doubles as the progress track. Quarter marks give the
              fill something to be read against, and a taller tick rides its
              leading edge — a dimension marker on an architectural drawing. */}
          <div className="relative mt-6 h-px w-full bg-line">
            {[25, 50, 75].map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className="absolute top-1/2 h-[5px] w-px -translate-y-1/2 bg-line"
                style={{ left: `${t}%` }}
              />
            ))}
            {indeterminate ? (
              <span
                aria-hidden="true"
                className="a-sweep absolute inset-y-0 left-0 w-1/4 bg-ink"
              />
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-ink transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 h-[9px] w-px -translate-y-1/2 bg-ink transition-[left] duration-700 ease-out"
                  style={{ left: `${pct}%` }}
                />
              </>
            )}
          </div>

          <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-muted">
            {status}
          </p>

          <p className="mx-auto mt-10 max-w-[30ch] text-[13px] leading-relaxed text-muted/80">
            Architect-designed residences. Walk inside without leaving your chair.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
