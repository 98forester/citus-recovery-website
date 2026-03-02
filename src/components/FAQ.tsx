import { useState } from 'react';
import { FAQ_ITEMS } from '../constants';

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" aria-labelledby="faq-heading" className="py-32 px-8 bg-white border-t border-black/5">
            <div className="max-w-3xl mx-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] block text-center mb-4">Common Questions</span>
                <h2 id="faq-heading" className="text-4xl font-serif italic text-center mb-20">Surplus Funds FAQ</h2>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="border-b border-slate-100 pb-4">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full text-left flex justify-between items-center py-4 group"
                                aria-expanded={openIndex === i}
                                aria-controls={`faq-answer-${i}`}
                            >
                                <span className="font-bold text-sm pr-8 group-hover:text-slate-600 transition-colors">
                                    {item.question}
                                </span>
                                <span className="text-slate-300 text-xl flex-shrink-0 transition-transform duration-200" style={{ transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                                    +
                                </span>
                            </button>
                            {openIndex === i && (
                                <div
                                    id={`faq-answer-${i}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${i}`}
                                    className="pb-4 text-slate-500 text-sm leading-relaxed"
                                >
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
