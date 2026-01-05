/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['JetBrains Mono', 'monospace'],
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            animation: {
                'cursor-blink': 'cursor-blink 1s step-end infinite',
                'float-balloon': 'float-balloon 3.5s ease-in-out infinite',
                'inflate-balloon': 'inflate-balloon 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            },
            keyframes: {
                'cursor-blink': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                'float-balloon': {
                    '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(2deg)' },
                },
                'inflate-balloon': {
                    '0%': { transform: 'scale(0) translate(0, 0)', opacity: '0' },
                    '60%': { transform: 'scale(1.1) translate(0, -90px)', opacity: '1' },
                    '100%': { transform: 'scale(1) translate(0, -90px)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
