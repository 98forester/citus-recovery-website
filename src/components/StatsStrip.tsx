import { STATS } from '../constants';

export const StatsStrip = () => (
    <section aria-label="Key statistics" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(stat => (
                <div key={stat.label}>
                    <div className="text-3xl md:text-4xl font-serif italic font-bold mb-2">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-400">{stat.label}</div>
                </div>
            ))}
        </div>
    </section>
);
