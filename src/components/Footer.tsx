/**
 * A footer directory for an agency that does not exist. Most of these name
 * pages a real build would have and this one does not, so they stay inert —
 * inventing destinations for them would be worse than the gap.
 *
 * The four in Contact are different: an address, a number and a call to
 * action are things a visitor tries to *use*, and all three have somewhere
 * real to go. Anything with an `href` here is live; the rest are plain text
 * that no longer pretends to be a link.
 */
const COLUMNS: { heading: string; links: { label: string; href?: string }[] }[] = [
  {
    heading: 'Properties',
    links: [
      { label: 'Buy', href: '#properties' },
      { label: 'Rent' },
      { label: 'New developments' },
      { label: 'Exclusive collection', href: '#collection' },
      { label: 'Sold archive' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Mortgage advice' },
      { label: 'Valuation' },
      { label: 'Property management' },
      { label: 'Relocation' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About' },
      { label: 'Our advisers' },
      { label: 'Careers' },
      { label: 'Journal', href: '#journal' },
      { label: 'Press' },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { label: 'hello@meridian.estate', href: 'mailto:hello@meridian.estate' },
      { label: '+1 (415) 555 0148', href: 'tel:+14155550148' },
      { label: 'Book a viewing', href: '#enquire' },
      { label: 'Offices' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bone">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <a href="#top" className="font-display flex items-start text-2xl tracking-tight text-ink">
              MERIDIAN<span className="ml-0.5 text-[0.5em]">&deg;</span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              An advisory practice for people buying somewhere to live, not
              somewhere to list.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-xs uppercase tracking-[0.16em] text-muted">{col.heading}</h2>
              {/* Roomier rows on a phone: at 18px tall these were well under
                  any thumb-sized target. The extra padding does the work, so
                  the type and the rhythm are unchanged on a desktop. */}
              <ul className="mt-3 space-y-0 sm:mt-5 sm:space-y-3">
                {col.links.map((l) =>
                  l.href ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="-mx-2 inline-block px-2 py-2.5 text-sm text-ink/80 transition-colors hover:text-ink sm:mx-0 sm:px-0 sm:py-0"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li
                      key={l.label}
                      className="-mx-2 px-2 py-2.5 text-sm text-ink/45 sm:mx-0 sm:px-0 sm:py-0"
                    >
                      {l.label}
                    </li>
                  )
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Meridian Estates. All rights reserved.</p>
          {/* The line already credits who made the textures and the
              photographs; whoever built the thing belongs at the front of it,
              not in the copyright, which is the (fictional) client's. */}
          <p>
            Built by{' '}
            <a
              href="https://github.com/Ibrahimkhalill"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline underline-offset-2 transition-colors hover:text-moss"
            >
              Ibrahim Khalil
            </a>{' '}
            &middot; villa modelled in WebGL from primitives &middot; textures{' '}
            <a
              href="https://polyhaven.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Poly Haven
            </a>{' '}
            (CC0) &middot; photography{' '}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Unsplash
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
