import { useEffect, useState } from 'react';

const LINKS = ['Properties', 'Mortgage', 'Company', 'Careers', 'Journal'];

export default function Nav() {
  const [open, setOpen] = useState(false);

  /**
   * Below `lg` the links were simply hidden and nothing replaced them, so on a
   * phone the site had no navigation at all — a wordmark and a button. They go
   * in a panel instead.
   */
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      el.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="a-fade-in fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bone/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-10">
        <a
          href="#top"
          className="font-display flex items-start text-xl tracking-tight text-ink md:text-2xl"
        >
          MERIDIAN<span className="ml-0.5 text-[0.5em]">&deg;</span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l}>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
              >
                {l}
                {l === 'Mortgage' && (
                  <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium text-on-dark">
                    New
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-ink sm:block"
          >
            List a property
          </button>

          {/* Two bars that become a cross. No icon dependency, and the button
              is a full thumb target rather than the glyph inside it. */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line/70 bg-bone lg:hidden">
          <ul className="mx-auto max-w-[1400px] px-5 py-2 md:px-10">
            {LINKS.map((l) => (
              <li key={l} className="border-b border-line/60 last:border-0">
                <a
                  href="#"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-4 text-base text-ink"
                >
                  {l}
                  {l === 'Mortgage' && (
                    <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium text-on-dark">
                      New
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-[1400px] px-5 pb-5 md:px-10">
            <button
              type="button"
              className="w-full rounded-full border border-line px-5 py-3.5 text-sm text-ink transition-colors hover:border-ink"
            >
              List a property
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
