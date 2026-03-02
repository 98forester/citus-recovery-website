import { SURPLUS_TYPES } from '../constants';

export const SurplusTypes = () => (
    <section id="surplus-types" aria-labelledby="surplus-types-heading" className="py-32 px-8 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block text-center mb-4">What We Do</span>
            <h2 id="surplus-types-heading" className="text-4xl font-serif italic text-center mb-6">Recovery, Prevention & Everything In Between</h2>
            <p className="text-center text-slate-500 max-w-2xl mx-auto mb-20">
                Whether your home was already sold at auction, you're facing foreclosure right now, or you're an heir to a property you didn't even know had money attached to it — we have a path forward for you.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SURPLUS_TYPES.map(type => (
                    <div key={type.title} className="p-10 rounded-3xl border border-slate-100 bg-[#F9F8F6] hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-bold italic mb-4">{type.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">{type.description}</p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${type.statute === 'Creative Finance' ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {type.statute}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
