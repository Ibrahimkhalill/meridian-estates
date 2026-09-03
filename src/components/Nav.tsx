import { useEffect, useState } from 'react';

/**
 * Every one of these used to be `href="#"`, and the page carried no ids for
 * them to have pointed at — so the navigation was five words that did nothing,
 * which is what a visitor reads as the site being broken.
 *
 * Three of the old labels were Mortgage, Company and Careers. Those cannot be
 * made to work: this is one page, and it has no mortgage, company or careers
 * section for them to reach. Pointing them at the nearest thing that does
 * exist would be worse than leaving them dead, because then they would work
 * and lie. So the list is the page's own sections, and each label now names
 * what you actually land on.
 */
const LINKS = [
  { label: 'Properties', href: '#properties' },
  { label: 'Off-market', href: '#collection', badge: 'New' },
  { label: 'Interiors', href: '#interiors' },
  { label: 'Process', href: '#process' },
  { label: 'Journal', href: '#journal' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

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

  /**
   * Which section you are in.
   *
   * Read directly off the boxes rather than through an IntersectionObserver.
   * The observer version worked going down and would not let go coming back:
   * the band it needs here is a single line, and against a slice that thin the
   * exit entry was not arriving, so the last section you passed stayed lit
   * through the enquiry form and into the footer.
   *
   * A line rather than a range because these sections are tall enough that two
   * are on screen most of the time, and "is it visible" lights up two links at
   * once. Whichever section that one line falls inside is where you are — and
   * when it falls inside none of them, which is true throughout the hero and
   * the enquiry form, nothing is marked. That is correct: neither is a place
   * the nav claims to take you.
   *
   * Throttled to a frame, and reading five cached boxes, so it costs about
   * nothing next to the scroll work the page is already doing.
   */
  useEffect(() => {
    const targets = LINKS.map((l) => ({
      href: l.href,
      el: document.querySelector(l.href),
    })).filter((t): t is { href: string; el: Element } => !!t.el);

    let raf = 0;
    const read = () => {
      raf = 0;
      const line = window.innerHeight * 0.28;
      let found: string | null = null;
      for (const t of targets) {
        const r = t.el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          found = t.href;
          break;
        }
      }
      setActive(found);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
            <li key={l.label}>
              <a
                href={l.href}
                aria-current={active === l.href ? 'true' : undefined}
                className={`flex items-center gap-2 text-sm transition-colors hover:text-ink ${
                  active === l.href ? 'text-ink' : 'text-muted'
                }`}
              >
                <span className="relative">
                  {l.label}
                  {/* A rule under the label rather than a colour change alone:
                      muted to ink is a small step at 14px, and on a page this
                      long the mark has to be findable at a glance. */}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-ink transition-all duration-300 ${
                      active === l.href ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </span>
                {l.badge && (
                  <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium text-on-dark">
                    {l.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="#enquire"
            className="hidden rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-ink sm:block"
          >
            List a property
          </a>

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
              <li key={l.label} className="border-b border-line/60 last:border-0">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === l.href ? 'true' : undefined}
                  className={`flex items-center gap-3 py-4 text-base ${
                    active === l.href ? 'text-moss' : 'text-ink'
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium text-on-dark">
                      {l.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-[1400px] px-5 pb-5 md:px-10">
            <a
              href="#enquire"
              onClick={() => setOpen(false)}
              className="block w-full rounded-full border border-line px-5 py-3.5 text-center text-sm text-ink transition-colors hover:border-ink"
            >
              List a property
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
