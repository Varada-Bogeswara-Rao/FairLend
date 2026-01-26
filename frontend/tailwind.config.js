/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Background colors
                'bg-primary': '#0B0E14',
                'bg-secondary': '#0F172A',
                'bg-card': '#1a1f2e',
                'bg-card-hover': '#232938',

                // Accent colors
                'accent-emerald': '#10b981',
                'accent-cyan': '#06b6d4',

                // Status colors
                'warning-amber': '#f59e0b',
                'error-red': '#ef4444',

                // Text colors
                'text-primary': '#f8fafc',
                'text-secondary': '#cbd5e1',
                'text-muted': '#94a3b8',

                // Border colors
                'border-primary': '#334155',
                'border-secondary': '#1e293b',

                // Tier colors
                'tier-bronze': '#cd7f32',
                'tier-silver': '#c0c0c0',
                'tier-gold': '#ffd700',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            borderRadius: {
                'card': '12px',
                'button': '8px',
            },
            boxShadow: {
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
                'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
                'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
                'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
