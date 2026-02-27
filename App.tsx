import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';
import { TrustBadges } from './components/TrustBadges';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="bg-[#F9F8F6]">
      <Header />
      <Hero />
      <TrustBadges />
      <section id="legal" className="py-32 px-8 bg-white border-y border-black/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif italic mb-8">Built on Statute 45.032</h2>
          <p className="text-slate-500 leading-relaxed">
            Foreclosure surplus funds are your legal property. We navigate the Florida court system to return your equity—with total transparency.
          </p>
        </div>
      </section>
      <section id="scams" className="py-20 bg-red-50 text-center px-8 border-b border-red-100">
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.3em] mb-4 block">Consumer Alert</span>
        <h3 className="text-2xl font-serif italic mb-4">Never sign an "Assignment of Rights"</h3>
        <p className="max-w-2xl mx-auto text-sm text-slate-600">
          Predatory recovery companies charge as much as 40%. Under FS 45.033, we protect your equity for a flat 10% fee.
        </p>
      </section>
      <Services />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;