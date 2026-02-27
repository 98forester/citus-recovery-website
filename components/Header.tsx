export const Header = () => (
  <header className="fixed top-0 w-full z-[100] px-8 py-6 flex justify-between items-center bg-[#F9F8F6]/80 backdrop-blur-md border-b border-black/5">
    <div className="text-2xl font-serif font-semibold italic tracking-tighter">Citus</div>
    <nav className="hidden lg:flex gap-8 text-[10px] uppercase tracking-widest font-bold text-slate-400">
      <a href="#legal" className="hover:text-black">Statutes</a>
      <a href="#scams" className="hover:text-red-600">Scam Alert</a>
      <a href="#process" className="hover:text-black">Process</a>
    </nav>
    <a href="#audit" className="px-6 py-3 bg-slate-900 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all">
      Free Fund Audit
    </a>
  </header>
);