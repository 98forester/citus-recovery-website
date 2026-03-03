import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// ── Startup diagnostics ──────────────────────────────
// Check that all required env vars are present at boot
const envCheck = {
    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_EMAILJS_SERVICE_ID: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
    VITE_EMAILJS_TEMPLATE_ID: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    VITE_EMAILJS_PUBLIC_KEY: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};
const allSet = Object.values(envCheck).every(Boolean);
console.log(
    `%c[ENV] ${allSet ? '✅ All environment variables loaded' : '❌ MISSING environment variables'}`,
    allSet ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold',
    envCheck
);
if (!allSet) {
    console.warn(
        '⚠️ If you are on Netlify, set these in Site Settings → Environment Variables.\n' +
        '   If running locally, ensure .env exists in the project root and restart the dev server.'
    );
}
// ─────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
