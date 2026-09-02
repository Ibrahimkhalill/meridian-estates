import Nav from './components/Nav';
import Hero from './components/Hero';
import Footer from './components/Footer';
import {
  CTA,
  Collection,
  Editorial,
  Featured,
  Interiors,
  Process,
  Stats,
} from './components/Sections';

export default function App() {
  return (
    <div className="min-h-screen bg-bone text-ink" style={{ overflowX: 'clip' }}>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Featured />
        <Collection />
        <Interiors />
        <Process />
        <Editorial />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
