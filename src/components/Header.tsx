import { useState } from 'react';
import { Link } from 'react-router-dom';

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center bg-[#F9F8F6]/80 backdrop-blur-md border-b border-black/5">
      <Link to="/" aria-label="Citus Recovery Solutions — Home" className="text-2xl font-serif font-semibold italic tracking-tighter">
        Citus
      </Link>

      {/* Desktop nav */}
      <nav aria-label="Main navigation" className="hidden lg:flex gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-400">
        <a href="#surplus-types" className="hover:text-black transition-colors">Services</a>
        <a href="#process" className="hover:text-black transition-colors">Process</a>
        <a href="#why-citus" className="hover:text-black transition-colors">Why Citus</a>
        <a href="#scams" className="hover:text-red-600 transition-colors">Scam Alert</a>
        <a href="#testimonials" className="hover:text-black transition-colors">Reviews</a>
        <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
        <Link to="/portal" className="hover:text-emerald-600 transition-colors">Client Portal</Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 -mr-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        <span className="block w-5 h-0.5 bg-slate-900 mb-1" />
        <span className="block w-5 h-0.5 bg-slate-900 mb-1" />
        <span className="block w-3 h-0.5 bg-slate-900" />
      </button>

      {/* CTA */}
      <Link
        to="/portal"
        className="hidden lg:inline-block px-6 py-3 bg-emerald-600 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        aria-label="Start your claim in the client portal"
      >
        Start Your Claim
      </Link>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="absolute top-full left-0 w-full bg-[#F9F8F6]/95 backdrop-blur-md border-b border-black/5 py-8 px-8 flex flex-col gap-6 text-[11px] uppercase tracking-widest font-bold text-slate-400 lg:hidden"
        >
          <a href="#surplus-types" onClick={() => setMobileOpen(false)} className="hover:text-black transition-colors">Services</a>
          <a href="#process" onClick={() => setMobileOpen(false)} className="hover:text-black transition-colors">Process</a>
          <a href="#why-citus" onClick={() => setMobileOpen(false)} className="hover:text-black transition-colors">Why Citus</a>
          <a href="#scams" onClick={() => setMobileOpen(false)} className="hover:text-red-600 transition-colors">Scam Alert</a>
          <a href="#testimonials" onClick={() => setMobileOpen(false)} className="hover:text-black transition-colors">Reviews</a>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="hover:text-black transition-colors">FAQ</a>
          <Link
            to="/portal"
            onClick={() => setMobileOpen(false)}
            className="hover:text-emerald-600 transition-colors"
          >
            Client Portal
          </Link>
          <Link
            to="/portal"
            onClick={() => setMobileOpen(false)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-full text-center hover:bg-emerald-700 transition-all"
          >
            Start Your Claim
          </Link>
          <a href="tel:+14074798310" className="text-emerald-600 text-center">(407) 479-8310</a>
        </nav>
      )}
    </header>
  );
};