import { motion } from 'framer-motion';

export const Hero = () => (
  <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#F9F8F6]">
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(20px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="inline-block px-4 py-1.5 rounded-full border border-slate-200 bg-white mb-8 text-[10px] uppercase tracking-widest font-bold text-slate-400">
        Attorney + Real Estate Broker Dual Credential
      </div>
      <h1 className="text-6xl md:text-[8rem] font-serif leading-[0.9] tracking-tighter text-slate-900 mb-8">
        Your equity, <br/><span className="italic font-light text-slate-400">recovered.</span>
      </h1>
      <p className="max-w-xl mx-auto text-slate-500 text-lg md:text-xl font-light mb-12">
        Florida Statute 45.032 ensures foreclosure surplus belongs to you. We reclaim it with absolute legal precision.
      </p>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <a href="#audit" className="px-12 py-5 bg-slate-900 text-white rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-transform">
          Check My Fund Status
        </a>
        <div className="text-[11px] font-bold text-emerald-600 tracking-widest">10% FLAT FEE</div>
      </div>
    </motion.div>
  </section>
);