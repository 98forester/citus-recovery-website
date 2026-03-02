import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { StatsStrip } from '../components/StatsStrip';
import { TrustBadges } from '../components/TrustBadges';
import { SurplusTypes } from '../components/SurplusTypes';
import { Services } from '../components/Services';
import { WhyChoose } from '../components/WhyChoose';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { ContactForm } from '../components/ContactForm';
import { Footer } from '../components/Footer';

export const HomePage = () => {
  return (
    <div className="bg-[#F9F8F6]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" role="main">
        <Hero />
        <TrustBadges />
        <StatsStrip />
        <SurplusTypes />

        <section id="legal" aria-labelledby="legal-heading" className="py-32 px-8 border-y border-black/5">
          <div className="max-w-4xl mx-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block text-center mb-4">Your Legal Right</span>
            <h2 id="legal-heading" className="text-4xl font-serif italic text-center mb-8">The Law Is on Your Side</h2>
            <div className="text-slate-500 leading-relaxed space-y-6">
              <p>
                Florida law doesn't leave surplus funds to chance. Under <strong className="text-slate-700">Statute 45.032</strong>, there is a <em>rebuttable legal presumption</em> that the owner of record on the date the <em>lis pendens</em> was filed is entitled to surplus proceeds — after payment of any subordinate lienholders. In plain English: <strong className="text-slate-700">the money is presumed to be yours</strong> unless someone proves otherwise.
              </p>
              <p>
                This presumption applies to mortgage foreclosures. For tax deed sales, <strong className="text-slate-700">Statute 197.582</strong> governs the surplus distribution with different timelines and requirements — which is why having experienced representation matters.
              </p>
              <p>
                And here's what the unsolicited letters won't tell you: under <strong className="text-slate-700">FS 45.033</strong>, non-attorney surplus recovery services are legally capped at <strong className="text-emerald-600">12%</strong> of the recovered amount. Many companies violate this cap by having you sign an "Assignment of Rights" — which transfers your legal claim to them entirely. <strong className="text-slate-700">Never sign an Assignment of Rights without legal counsel.</strong>
              </p>
              <p className="text-sm text-slate-400 italic">
                Our team works with licensed attorneys who provide full legal representation under Florida Bar guidelines — not just a form letter and a prayer.
              </p>
            </div>
          </div>
        </section>

        <section id="scams" aria-labelledby="scams-heading" className="py-24 bg-red-50 px-8 border-b border-red-100">
          <div className="max-w-3xl mx-auto">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.3em] mb-4 block text-center" role="status">⚠ Consumer Alert</span>
            <h3 id="scams-heading" className="text-2xl font-serif italic mb-8 text-center">Received a Letter About Surplus Funds? Read This First.</h3>
            <div className="text-sm text-slate-600 space-y-4">
              <p>
                After a foreclosure sale, it's common to receive letters from companies offering to recover your surplus funds. <strong className="text-red-700">Be very careful before signing anything.</strong> Here's what you need to know:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Most are unlicensed "recovery companies"</strong> — they cannot represent you in court, cannot fight competing liens, and cannot protect your interests if your claim is contested.</li>
                <li><strong>Many charge 30–40% of your funds</strong> through a document called an "Assignment of Rights" — which transfers your legal claim to them.</li>
                <li><strong>Florida Statute 45.033 caps non-attorney recovery services at 12%</strong> — but many companies circumvent this cap through deceptive contracts.</li>
                <li><strong>Once you sign an Assignment of Rights, it's extremely difficult to undo</strong> — even if you later find a better option.</li>
              </ul>
              <p className="mt-6 font-medium text-slate-700">
                If you've already received a letter, don't panic — and don't sign. Call us at <strong>(407) 479-8310</strong> for a free, no-obligation review of your situation. We'll tell you honestly whether we can help, how much you're likely owed, and what your best path forward is.
              </p>
            </div>
          </div>
        </section>

        <Services />
        <WhyChoose />
        <Testimonials />
        <FAQ />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
};
