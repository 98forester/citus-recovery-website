import { COMPANY } from '../constants';

export const Footer = () => (
  <footer className="py-20 px-8 border-t border-slate-100 bg-white" role="contentinfo">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
      <div>
        <a href="/" aria-label="Citus Recovery Solutions — Home" className="font-serif italic text-2xl font-bold">
          Citus
        </a>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Recovery Solutions</p>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          {COMPANY.address}<br />
          {COMPANY.city}
        </p>
        <a href={`tel:${COMPANY.phoneTel}`} className="text-[11px] font-bold text-slate-600 tracking-wider mt-2 block hover:text-slate-900 transition-colors">
          {COMPANY.phone}
        </a>
        <a href={`mailto:${COMPANY.email}`} className="text-[11px] text-slate-400 block mt-1 hover:text-slate-600 transition-colors">
          {COMPANY.email}
        </a>
      </div>
      <nav aria-label="Footer navigation" className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex flex-col md:flex-row gap-4 md:gap-8">
        <a href="#surplus-types" className="hover:text-black transition-colors">Services</a>
        <a href="#process" className="hover:text-black transition-colors">Process</a>
        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
        <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
        <a href="/terms" className="hover:text-black transition-colors">Terms</a>
      </nav>
      <div className="text-right">
        <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest block mb-2" lang="es">Se Habla Español</span>
        <p className="text-[10px] text-slate-300">© 2026 Citus Recovery Solutions</p>
        <p className="text-[10px] text-slate-300 mt-1">{COMPANY.address}, {COMPANY.city}</p>
      </div>
    </div>
  </footer>
);