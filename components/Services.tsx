import { STEPS } from '../constants';

export const Services = () => (
  <section id="process" className="py-32 px-8 max-w-7xl mx-auto">
    <h2 className="text-center font-serif text-4xl mb-20 italic">The Path to Recovery</h2>
    <div className="grid md:grid-cols-3 gap-16">
      {STEPS.map(step => (
        <div key={step.id} className="group">
          <span className="text-slate-200 text-6xl font-serif italic block mb-6 group-hover:text-slate-900 transition-colors">{step.id}</span>
          <h3 className="text-xl font-bold mb-4 italic">{step.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  </section>
);