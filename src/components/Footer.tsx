const COLUMNS = [
  {
    heading: 'Properties',
    links: ['Buy', 'Rent', 'New developments', 'Exclusive collection', 'Sold archive'],
  },
  {
    heading: 'Services',
    links: ['Mortgage advice', 'Valuation', 'Property management', 'Relocation'],
  },
  {
    heading: 'Company',
    links: ['About', 'Our advisers', 'Careers', 'Journal', 'Press'],
  },
  {
    heading: 'Contact',
    links: ['hello@meridian.estate', '+1 (415) 555 0148', 'Book a viewing', 'Offices'],
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
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-ink/80 transition-colors hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Meridian Estates. All rights reserved.</p>
          <p>
            Villa modelled in WebGL from primitives &middot; textures{' '}
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
