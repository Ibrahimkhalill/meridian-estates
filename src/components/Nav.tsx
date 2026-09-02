export default function Nav() {
  const links = ['Properties', 'Mortgage', 'Company', 'Careers', 'Journal'];
  return (
    <header className="a-fade-in fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bone/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-10">
        <a href="#top" className="font-display flex items-start text-xl tracking-tight text-ink md:text-2xl">
          MERIDIAN<span className="ml-0.5 text-[0.5em]">&deg;</span>
        </a>
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <li key={l}>
              <a href="#" className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
                {l}
                {l === 'Mortgage' && (
                  <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-medium text-on-dark">New</span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="rounded-full border border-line px-5 py-2 text-sm text-ink transition-colors hover:border-ink">
          List a property
        </button>
      </nav>
    </header>
  );
}
