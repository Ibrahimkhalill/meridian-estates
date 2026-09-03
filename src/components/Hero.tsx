import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import Loader from './Loader';

// R3F + drei + three is a large dependency — keep it out of the main chunk.
const Scene = lazy(() => import('../scene/Scene'));

/** How many viewport heights the camera journey is spread over. */
const JOURNEY_VH = 7;

/**
 * If nothing has moved for this long the load has failed rather than merely
 * being slow — a blocked CDN, a dead texture — and the page is better off
 * without the overlay. It watches for a *stall* rather than running a plain
 * deadline because 16 MB of textures legitimately takes a while on a thin
 * connection, and cutting that off mid-download would be the wrong call.
 */
const STALL_MS = 20000;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [night, setNight] = useState(false);
  const [entered, setEntered] = useState(false);
  const [hintGone, setHintGone] = useState(false);

  /**
   * Loading progress goes into a ref, not state.
   *
   * It arrives once per file — thirty-odd times in a couple of seconds — and
   * as state every one of those re-rendered Hero, and through it the whole
   * scene: `useTiled`/`useSurface` take their repeat as an array literal, so
   * their memos miss on every render and re-clone every texture in the villa.
   * Worse, that work runs inside the loading manager's own notification, and
   * React eventually threw "maximum update depth exceeded" during the load.
   *
   * The Loader already runs a frame loop to animate its counter, so it can
   * read the ref there and nothing else needs to re-render at all.
   */
  const loadPctRef = useRef<number | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [booted, setBooted] = useState(false);

  const handleProgress = useCallback((p: number) => {
    loadPctRef.current = p;
  }, []);
  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleExit = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => setBooted(true), []);

  // A refresh half way down the journey would otherwise restore that scroll
  // position behind the overlay, so the camera is already deep inside the
  // house when the overlay lifts. Start at the front door instead — unless the
  // visitor asked for a specific section by hash.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  // Scrolling behind a full-screen overlay burns through the camera journey
  // with nothing to see, so the page is held still until the villa is up.
  useEffect(() => {
    if (booted) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => {
      el.style.overflow = prev;
    };
  }, [booted]);

  useEffect(() => {
    if (sceneReady) return;
    let lastSeen = loadPctRef.current;
    let lastMoved = Date.now();
    const id = setInterval(() => {
      if (loadPctRef.current !== lastSeen) {
        lastSeen = loadPctRef.current;
        lastMoved = Date.now();
      } else if (Date.now() - lastMoved > STALL_MS) {
        setSceneReady(true);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [sceneReady]);

  useEffect(() => {
    const onScroll = () => {
      const node = sectionRef.current;
      if (!node) return;
      const total = node.offsetHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      progressRef.current = Math.min(1, Math.max(0, p));
      // Copy fades out once the camera is past the threshold.
      setEntered(progressRef.current > 0.30);
      if (progressRef.current > 0.04) setHintGone(true);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative"
      style={{ height: `${JOURNEY_VH * 100}svh` }}
    >
      {/* The canvas is pinned for the whole journey. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <Suspense
          fallback={<div className="absolute inset-0 bg-band" aria-hidden="true" />}
        >
          <Scene
            night={night}
            progressRef={progressRef}
            onProgress={handleProgress}
            onReady={handleReady}
          />
        </Suspense>

        {/* ---------- scrim ----------
             The copy sits over a live 3D scene, so whatever is behind any given
             word changes as the camera moves and as day flips to night. At dusk
             the support paragraph landed on a bright patch of sky and became
             unreadable. A soft gradient at the top and bottom — where the copy
             actually is — buys the contrast back without flattening the render,
             and it inverts with the mode so it works in both. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            entered ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            background: night
              ? 'linear-gradient(to bottom, rgba(6,8,12,0.62) 0%, rgba(6,8,12,0.24) 34%, rgba(6,8,12,0) 56%, rgba(6,8,12,0.32) 100%)'
              : 'linear-gradient(to bottom, rgba(246,245,242,0.78) 0%, rgba(246,245,242,0.30) 34%, rgba(246,245,242,0) 56%, rgba(246,245,242,0.42) 100%)',
          }}
        />

        {/* ---------- copy over the scene ----------
             Held back until the overlay lifts. These animate in on mount, so
             leaving them in the tree during the load means the headline plays
             its entrance behind a full-screen panel and the visitor arrives
             after the show is over. */}
        {revealed && (
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
              entered ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-between px-5 py-8 md:px-10 md:py-12">
              <div className="flex flex-wrap items-start justify-between gap-8 pt-14 md:pt-20">
                <h1
                  className={`font-display max-w-[13ch] font-normal transition-colors duration-700 ${
                    night ? 'text-on-dark' : 'text-ink'
                  }`}
                  style={{
                    fontSize: 'clamp(33px, 5.4vw, 88px)',
                    lineHeight: 1.02,
                    letterSpacing: '-0.03em',
                    // Belt and braces over a moving background: the scrim does the
                    // work, this catches the edge cases the scrim cannot.
                    textShadow: night
                      ? '0 1px 40px rgba(0,0,0,0.55)'
                      : '0 1px 30px rgba(246,245,242,0.75)',
                  }}
                >
                  <span className="a-word-pop d-100 mr-[0.22em] inline-block">Discover</span>
                  <span className="a-word-pop d-200 mr-[0.22em] inline-block">space</span>
                  <span
                    className={`a-word-pop d-300 mr-[0.22em] inline-block italic transition-colors duration-700 ${
                      night ? 'text-on-dark/70' : 'text-muted'
                    }`}
                  >
                    you truly
                  </span>
                  <span className="a-word-pop d-400 inline-block">belong in</span>
                </h1>

                <div className="a-fade-up d-500 max-w-xs pt-3">
                  <p
                    className={`text-xs uppercase tracking-[0.18em] transition-colors duration-700 ${
                      night ? 'text-on-dark/55' : 'text-muted/80'
                    }`}
                  >
                    Meridian&deg; &mdash; private residences
                  </p>
                  <p
                    className={`mt-4 text-sm leading-relaxed transition-colors duration-700 md:text-base ${
                      night ? 'text-on-dark/85' : 'text-muted'
                    }`}
                    style={{
                      textShadow: night ? '0 1px 24px rgba(0,0,0,0.6)' : 'none',
                    }}
                  >
                    More than a house &mdash; a sanctuary where your day unfolds.
                    Scroll to walk up the steps and step inside.
                  </p>
                </div>
              </div>

              {/* On a phone this row is the day/night toggle only. "Book a
                viewing" is a 180px pill next to a 145px toggle in 350px of
                usable width, so it wrapped onto two lines and pushed the
                toggle under it; the same call to action sits in the CTA
                section further down, where it has the room. */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <button
                  type="button"
                  className="a-fade-up d-600 pointer-events-auto group hidden items-center gap-3 rounded-full bg-moss px-8 py-4 text-sm font-medium text-on-dark transition-colors hover:bg-moss-hover sm:inline-flex"
                >
                  Book a viewing
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </button>

                {/* day / night */}
                <div
                  className={`a-fade-up d-800 pointer-events-auto flex items-center gap-1 rounded-full border p-1 backdrop-blur transition-colors duration-700 ${
                    night ? 'border-white/20 bg-black/30' : 'border-line bg-bone/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setNight(false)}
                    aria-pressed={!night}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      !night ? 'bg-ink text-on-dark' : 'text-on-dark/70 hover:text-on-dark'
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" strokeWidth={1.8} /> Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setNight(true)}
                    aria-pressed={night}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                      night ? 'bg-on-dark text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" strokeWidth={1.8} /> Night
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll hint. Hidden on a phone: it is centred at the bottom, which
            is exactly where the day/night toggle sits once that row stops
            having room to spread out — the two printed on top of each other.
            The hero copy already says to scroll, and on a phone scrolling is
            not a thing anyone needs prompting to try. */}
        {revealed && (
          <div
            className={`pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 transition-opacity duration-500 sm:block ${
              hintGone ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p
              className={`a-fade-in d-1000 rounded-full border px-4 py-2 text-[11px] tracking-wide backdrop-blur transition-colors duration-700 ${
                night ? 'border-white/20 bg-black/30 text-on-dark/80' : 'border-line bg-bone/80 text-muted'
              }`}
            >
              Scroll to step inside
            </p>
          </div>
        )}
      </div>

      {!booted && (
        <Loader
          progressRef={loadPctRef}
          ready={sceneReady}
          onExit={handleExit}
          onDone={handleDone}
        />
      )}
    </section>
  );
}
