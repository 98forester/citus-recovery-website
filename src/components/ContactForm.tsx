import { useState } from 'react';
import { COMPANY } from '../constants';

export const ContactForm = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <section id="audit" aria-labelledby="audit-heading" className="py-32 px-8 bg-[#F9F8F6]">
            <div className="max-w-2xl mx-auto">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] block text-center mb-4">Free · No Obligation · 48-Hour Response</span>
                <h2 id="audit-heading" className="text-4xl font-serif italic text-center mb-4">Find Out If You're Owed Money</h2>
                <p className="text-center text-slate-500 mb-4">
                    Enter your details and our team will search the court records across all 67 Florida counties to confirm whether surplus funds exist in your name. This search is completely free.
                </p>
                <p className="text-center text-slate-400 text-sm mb-12">
                    Already facing foreclosure? Tell us in the notes and we'll explore creative options to help you keep your home — even if surplus funds aren't in the picture.
                </p>

                {submitted ? (
                    <div className="text-center py-16 px-8 bg-white rounded-3xl border border-emerald-100" role="alert">
                        <div className="text-4xl mb-4">✓</div>
                        <h3 className="text-xl font-bold mb-2">We're On It</h3>
                        <p className="text-slate-500 text-sm mb-4">Our team is searching Florida court records now. You'll hear from us within 48 hours with your results.</p>
                        <p className="text-slate-400 text-xs">Want to talk sooner? Call us at <a href={`tel:${COMPANY.phoneTel}`} className="text-slate-700 font-bold hover:text-emerald-600">{COMPANY.phone}</a></p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="first-name" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">First Name *</label>
                                <input id="first-name" type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Last Name *</label>
                                <input id="last-name" type="text" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email *</label>
                            <input id="email" type="email" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                            <input id="phone" type="tel" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="county" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Florida County</label>
                                <input id="county" type="text" placeholder="e.g. Miami-Dade, Pinellas, Orange" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
                            </div>
                            <div>
                                <label htmlFor="situation" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your Situation</label>
                                <select id="situation" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
                                    <option value="">Select one...</option>
                                    <option value="surplus">My property was already sold at auction</option>
                                    <option value="foreclosure">I'm currently facing foreclosure</option>
                                    <option value="heir">I'm an heir to a foreclosed property</option>
                                    <option value="letter">I received a letter about surplus funds</option>
                                    <option value="other">Other / Not sure</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Anything else we should know?</label>
                            <textarea id="notes" rows={3} placeholder="Timeline, property address, questions, etc." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none" />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                        >
                            Check My Funds — Free
                        </button>
                        <p className="text-[10px] text-slate-400 text-center">
                            By submitting, you agree to be contacted about your potential claim. No obligation. No cost. You can also <a href={COMPANY.calendly} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">book a free consultation directly</a>.
                        </p>
                    </form>
                )}

                <div className="text-center mt-12">
                    <p className="text-sm text-slate-500 mb-2">Prefer to talk to a real person right now?</p>
                    <a href={`tel:${COMPANY.phoneTel}`} className="text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                        {COMPANY.phone}
                    </a>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold" lang="es">Se Habla Español</p>
                    <a href={`mailto:${COMPANY.email}`} className="text-xs text-slate-400 block mt-2 hover:text-slate-600 transition-colors">{COMPANY.email}</a>
                </div>
            </div>
        </section>
    );
};
