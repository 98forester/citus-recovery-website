import { motion } from 'framer-motion';

interface PortalProgressProps {
    currentStep: number;
    totalSteps: number;
}

const STEP_LABELS = ['Client Info', 'Documents', 'Review & Sign', 'Confirmation'];

export const PortalProgress = ({ currentStep, totalSteps }: PortalProgressProps) => {
    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-slate-200" />
                {/* Progress line fill */}
                <motion.div
                    className="absolute top-5 left-0 h-[2px] bg-emerald-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />

                {STEP_LABELS.map((label, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={stepNum} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${isCompleted
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : isActive
                                            ? 'bg-white border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20'
                                            : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {isCompleted ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    stepNum
                                )}
                            </motion.div>
                            <span
                                className={`mt-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
