export const Footer = () => (
  <footer className="py-20 px-8 border-t border-slate-100 bg-white">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
      <div>
        <span className="font-serif italic text-2xl font-bold">Citus</span>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Florida Surplus Group</p>
      </div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex gap-8">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <span className="text-emerald-600">Se Habla Español</span>
      </div>
      <p className="text-[10px] text-slate-300">© 2026 CitusRecoverySolutions.com</p>
    </div>
  </footer>
);