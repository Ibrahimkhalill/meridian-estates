import { ArrowRight, ArrowUpRight, Bath, BedDouble, Layers, Maximize } from 'lucide-react';
import Reveal, { CountUp } from './Reveal';
import TiltCard from './TiltCard';
import Parallax from './Parallax';

const UNSPLASH = 'https://images.unsplash.com/photo-';
const img = (id: string, w = 1200) =>
  `${UNSPLASH}${id}?w=${w}&q=80&auto=format&fit=crop`;

/* ------------------------------------------------------------------ 3 stats */

const STATS = [
  { to: 240, suffix: '+', label: 'Residences placed' },
  { to: 18, suffix: '', label: 'Cities represented' },
  { to: 4.9, suffix: '', label: 'Client rating', decimals: 1 },
  { to: 12, suffix: '', label: 'Years advising' },
];

export function Stats() {
  return (
    <section className="border-y border-line bg-band">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-12 px-5 py-20 md:grid-cols-4 md:px-10 md:py-24">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="text-center md:text-left">
            <p
              className="font-display text-ink"
              style={{ fontSize: 'clamp(40px, 4.6vw, 68px)', lineHeight: 1 }}
            >
              <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </p>
            <p className="mt-3 text-sm text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------- 4 featured residences */

const RESIDENCES = [
  {
    id: '1706808849780-7a04fbac83ef',
    name: 'Aether Heights',
    place: 'Beverly Ridge, CA',
    price: '$4,850,000',
    area: '620 m²',
    floors: '3 floors',
    beds: '5 beds',
    baths: '4 baths',
  },
  {
    id: '1613490493576-7fde63acd811',
    name: 'Azure Sanctuary',
    place: 'Costa Brava, ES',
    price: '$3,240,000',
    area: '480 m²',
    floors: '2 floors',
    beds: '4 beds',
    baths: '3 baths',
  },
  {
    id: '1706855203772-c249b75fe016',
    name: 'Summit Pavilion',
    place: 'Aspen Valley, CO',
    price: '$6,100,000',
    area: '740 m²',
    floors: '3 floors',
    beds: '6 beds',
    baths: '5 baths',
  },
];

export function Featured() {
  return (
    <section id="properties" className="scroll-mt-20 mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <h2
          className="font-display max-w-[16ch] text-ink"
          style={{ fontSize: 'clamp(32px, 4vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Residences currently <span className="italic text-muted">on offer</span>
        </h2>
        <a
          href="#"
          className="group inline-flex items-center gap-2 border-b border-line pb-1 text-sm text-ink transition-colors hover:border-ink"
        >
          View all properties
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
        </a>
      </Reveal>

      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {RESIDENCES.map((r, i) => (
          <Reveal key={r.name} delay={i * 110} as="article">
            <TiltCard className="group h-full">
              <div className="overflow-hidden rounded-2xl bg-band shadow-[0_18px_50px_-24px_rgba(22,21,15,0.45)]">
                <img
                  src={img(r.id, 900)}
                  alt={`${r.name}, ${r.place}`}
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={675}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-5">
                <h3 className="font-display text-2xl text-ink">{r.name}</h3>
                <p className="text-sm font-medium text-moss">{r.price}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{r.place}</p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-muted">
                <li className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5" strokeWidth={1.6} />{r.area}</li>
                <li className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" strokeWidth={1.6} />{r.floors}</li>
                <li className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" strokeWidth={1.6} />{r.beds}</li>
                <li className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5" strokeWidth={1.6} />{r.baths}</li>
              </ul>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------ 5 exclusive collection */

export function Collection() {
  return (
    <section id="collection" className="scroll-mt-20 border-y border-line">
      <div className="grid lg:grid-cols-[40%_60%]">
        <Reveal className="flex flex-col justify-center bg-ink px-5 py-20 text-on-dark md:px-14 md:py-28">
          <p className="text-xs uppercase tracking-[0.18em] text-on-dark/50">Exclusive collection</p>
          <h2
            className="font-display mt-6 max-w-[14ch]"
            style={{ fontSize: 'clamp(30px, 3.4vw, 52px)', lineHeight: 1.08, letterSpacing: '-0.02em' }}
          >
            Homes that never reach the open market
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-on-dark/70 md:text-base">
            A quiet register of properties shown only to registered clients. No
            listings, no viewings by appointment alone — an introduction, made
            when the right house and the right person happen to coincide.
          </p>
          <div className="mt-10">
            <button
              type="button"
              className="group inline-flex items-center gap-3 rounded-full border border-on-dark/25 px-7 py-3.5 text-sm text-on-dark transition-colors hover:border-on-dark/60"
            >
              Free consult
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
            </button>
          </div>
        </Reveal>

        <Reveal delay={120} className="min-h-[320px]">
          <Parallax range={54} rounded="" className="h-full min-h-[320px] lg:min-h-[560px]">
            <img
              src={img('1748063578185-3d68121b11ff', 1600)}
              alt="A glass pavilion at dusk, lit from within"
              loading="lazy"
              decoding="async"
              className="h-full min-h-[320px] w-full object-cover lg:min-h-[560px]"
            />
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 6 interiors */

const INTERIORS = [
  {
    id: '1628745277862-bc0b2d68c50c',
    title: 'The kitchen, unhurried',
    body: 'Stone worktops, oak carcassing, and enough room that nobody has to ask you to move.',
  },
  {
    id: '1628744876525-f2678d8af47f',
    title: 'A room that holds the light',
    body: 'South-facing glazing to the floor, so the day moves across the boards rather than past them.',
  },
];

export function Interiors() {
  return (
    <section id="interiors" className="scroll-mt-20 mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <h2
          className="font-display max-w-[18ch] text-ink"
          style={{ fontSize: 'clamp(30px, 3.6vw, 54px)', lineHeight: 1.06, letterSpacing: '-0.02em' }}
        >
          Inside, the detail <span className="italic text-muted">does the talking</span>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {INTERIORS.map((it, i) => (
          <Reveal key={it.title} delay={i * 130}>
            <Parallax range={40} className="aspect-[3/2] bg-band">
              <img
                src={img(it.id, 1100)}
                alt={it.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </Parallax>
            <h3 className="font-display mt-6 text-2xl text-ink">{it.title}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{it.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- 7 process */

const STEPS = [
  {
    n: '01',
    title: 'Discover',
    body: 'We start with how you actually live — the light you want in the morning, the distance you are willing to drive.',
  },
  {
    n: '02',
    title: 'Visit',
    body: 'A shortlist of four or five, walked through in person, unhurried and without an agent hovering at your shoulder.',
  },
  {
    n: '03',
    title: 'Settle',
    body: 'Survey, negotiation and completion handled end to end, with one person answering the phone throughout.',
  },
];

export function Process() {
  return (
    <section id="process" className="scroll-mt-20 border-y border-line bg-band">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <h2
            className="font-display max-w-[16ch] text-ink"
            style={{ fontSize: 'clamp(30px, 3.6vw, 54px)', lineHeight: 1.06, letterSpacing: '-0.02em' }}
          >
            Three steps, and the keys are yours
          </h2>
        </Reveal>
        <ol className="mt-16">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} as="li">
              <div className="grid gap-4 border-t border-line py-9 md:grid-cols-[auto_1fr_2fr] md:gap-12">
                <p className="font-display text-3xl text-muted md:text-4xl">{s.n}</p>
                <h3 className="font-display self-center text-2xl text-ink md:text-3xl">{s.title}</h3>
                <p className="max-w-xl self-center text-sm leading-relaxed text-muted md:text-base">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 8 editorial */

export function Editorial() {
  return (
    <section id="journal" className="scroll-mt-20 relative min-h-[62svh] overflow-hidden md:min-h-[76svh]">
      <Parallax range={72} overscan={1.24} rounded="" className="absolute inset-0 h-full w-full">
        <img
          src={img('1706808849777-96e0d7be3bb7', 1900)}
          alt="The entrance to a modern villa at dusk"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </Parallax>
      {/* scrim: the headline has to stay legible whatever the photo does */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(12,12,10,0.82) 0%, rgba(12,12,10,0.32) 45%, rgba(12,12,10,0.06) 100%)' }}
      />
      <div className="relative mx-auto flex min-h-[62svh] max-w-[1400px] items-end px-5 py-14 md:min-h-[76svh] md:px-10 md:py-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.18em] text-on-dark/60">The journal</p>
          <h2
            className="font-display mt-5 max-w-[18ch] text-on-dark"
            style={{ fontSize: 'clamp(30px, 4.2vw, 62px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            What a house asks of you at six in the evening
          </h2>
          <a
            href="#"
            className="group mt-8 inline-flex items-center gap-2 border-b border-on-dark/30 pb-1 text-sm text-on-dark transition-colors hover:border-on-dark"
          >
            Read the essay
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- 9 CTA */

export function CTA() {
  return (
    <section id="enquire" className="scroll-mt-20 bg-moss">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <h2
            className="font-display max-w-[15ch] text-on-dark"
            style={{ fontSize: 'clamp(30px, 3.8vw, 58px)', lineHeight: 1.06, letterSpacing: '-0.02em' }}
          >
            Tell us what you are looking for
          </h2>
          <form
            className="w-full"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="cta-email" className="block text-sm text-on-dark/70">
              We will write back within two working days.
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="cta-email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-full border border-on-dark/25 bg-transparent px-6 py-4 text-sm text-on-dark placeholder:text-on-dark/40 focus:border-on-dark focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-on-dark px-8 py-4 text-sm font-medium text-ink transition-opacity hover:opacity-90"
              >
                Request a call
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
