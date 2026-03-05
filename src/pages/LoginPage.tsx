import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated, isLocalhost } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // @ts-ignore
    const from = location.state?.from?.pathname || '/command-center';

    // Auto-redirect if already authenticated (e.g. on localhost or via cookie/localStorage)
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        // Artificial delay for "premium" feel
        setTimeout(() => {
            if (login(password)) {
                navigate(from, { replace: true });
            } else {
                setError(true);
                setLoading(false);
            }
        }, 800);
    };

    // If on localhost, show a minimal loading state while we redirect
    if (isLocalhost || isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
                <div className="text-white/20 text-xs tracking-widest uppercase">
                    Redirecting to Command Center...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-xl">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Citus Recovery</h1>
                    <p className="text-white/40 text-sm">Secure Command Center Access</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3 ml-1">
                                Master Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-white/[0.05] border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-white/10`}
                                placeholder="••••••••••••"
                                autoFocus
                            />
                            {error && (
                                <p className="mt-3 text-xs text-red-400 font-medium flex items-center gap-2">
                                    <span>⚠️</span> Incorrect password. Access denied.
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className={`w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${loading || !password
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-violet-600/20'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Authenticate</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[10px] text-white/10 uppercase tracking-widest font-medium">
                    Restricted Access • Authorized Use Only
                </p>
            </div>
        </div>
    );
}
