import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    isLocalhost: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Environment variable with fallback
const MASTER_PASSWORD = import.meta.env.VITE_COMMAND_CENTER_PASSWORD;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Check if we are running on localhost/127.0.0.1
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Auto-authenticate on localhost
        if (isLocalhost) return true;
        try {
            return localStorage.getItem('citus_auth') === 'true';
        } catch {
            return false;
        }
    });

    const login = (password: string) => {
        if (password === MASTER_PASSWORD || isLocalhost) {
            setIsAuthenticated(true);
            try {
                localStorage.setItem('citus_auth', 'true');
            } catch (e) {
                console.warn('LocalStorage save failed:', e);
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        try {
            localStorage.removeItem('citus_auth');
        } catch (e) {
            console.warn('LocalStorage remove failed:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLocalhost }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
