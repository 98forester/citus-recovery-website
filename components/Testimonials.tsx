import { TESTIMONIALS } from '../constants';

export const Testimonials = () => (
  <section id="testimonials" className="py-32 px-8">
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className={`p-10 rounded-[40px] ${t.isHighlight ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white border border-slate-100 shadow-sm'}`}>
          <p className="text-lg italic mb-8 leading-relaxed opacity-90">"{t.text}"</p>
          <p className="font-bold text-xs uppercase tracking-widest">{t.name}</p>
          <p className="text-[10px] opacity-40">{t.location}</p>
        </div>
      ))}
    </div>
  </section>
);