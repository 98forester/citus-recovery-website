import { TESTIMONIALS } from '../constants';

export const Testimonials = () => (
  <section id="testimonials" aria-labelledby="testimonials-heading" className="py-32 px-8 bg-[#F9F8F6]">
    <div className="max-w-7xl mx-auto">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block text-center mb-4">Real Clients. Real Recoveries.</span>
      <h2 id="testimonials-heading" className="text-4xl font-serif italic text-center mb-20">Hear From Families We've Helped</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
        {TESTIMONIALS.map((t, i) => (
          <article
            key={i}
            role="listitem"
            className={`p-10 rounded-[40px] ${t.isHighlight ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white border border-slate-100 shadow-sm'}`}
          >
            {t.amount && (
              <div className={`text-2xl font-serif italic font-bold mb-4 ${t.isHighlight ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {t.amount}
              </div>
            )}
            <blockquote>
              <p className="text-sm italic mb-8 leading-relaxed opacity-90">"{t.text}"</p>
            </blockquote>
            <p className="font-bold text-xs uppercase tracking-widest">{t.name}</p>
            <p className={`text-[10px] ${t.isHighlight ? 'text-slate-400' : 'text-slate-400'}`}>{t.location}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);