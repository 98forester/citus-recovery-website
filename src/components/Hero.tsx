import { motion } from 'framer-motion';
import { COMPANY } from '../constants';

export const Hero = () => (
  <section aria-labelledby="hero-heading" className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#F9F8F6] pt-24">
    <motion.div
      initial={{ opacity: 0, filter: 'blur(20px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="inline-block px-4 py-1.5 rounded-full border border-slate-200 bg-white mb-8 text-[10px] uppercase tracking-widest font-bold text-slate-400">
        St. Petersburg, FL — Serving All 67 Counties
      </div>
      <h1 id="hero-heading" className="text-5xl md:text-[7rem] font-serif leading-[0.9] tracking-tighter text-slate-900 mb-8">
        Your home was sold. <br />
        <span className="italic font-light text-slate-400">The extra money is yours.</span>
      </h1>
      <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-light mb-4">
        When a Florida foreclosure auction sells your property for more than you owed, the surplus belongs to <strong className="text-slate-700 font-medium">you</strong> — not the bank, not the county, not the recovery company that sent you a letter.
      </p>
      <p className="max-w-2xl mx-auto text-slate-400 text-base font-light mb-4">
        We've helped families across Florida recover tens of thousands of dollars they didn't know they were owed. And if you're still in foreclosure, we may be able to help you <strong className="text-slate-600 font-medium">keep your home</strong> through creative finance solutions.
      </p>
      <p className="max-w-xl mx-auto text-sm text-slate-400 mb-12">
        No upfront cost. No obligation. Free consultation. We only get paid when you do.
      </p>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <a
          href={COMPANY.calendly}
          target="_blank"
          rel="noopener noreferrer"
          className="px-12 py-5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          aria-label="Schedule a free 30-minute consultation"
        >
          Schedule Free Consultation
        </a>
        <a
          href={`tel:${COMPANY.phoneTel}`}
          className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          aria-label={`Call us now at ${COMPANY.phone}`}
        >
          or call <span className="underline">{COMPANY.phone}</span>
        </a>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest uppercase">
        <span className="text-emerald-600">✓ No Upfront Fees</span>
        <span className="text-slate-400">✓ Competitive Rates</span>
        <span className="text-slate-400">✓ 100% Virtual Process</span>
        <span className="text-slate-400" lang="es">✓ Hablamos Español</span>
      </div>
    </motion.div>
  </section>
);