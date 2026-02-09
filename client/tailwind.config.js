/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Primary - Sky Blue scale
        'sky-blue': {
          50: 'hsl(204, 100%, 97%)',
          100: 'hsl(202, 100%, 93%)',
          200: 'hsl(200, 100%, 85%)',
          300: 'hsl(199, 100%, 75%)',
          400: 'hsl(199, 100%, 65%)',
          500: 'hsl(199, 100%, 58%)',
          600: 'hsl(199, 100%, 48%)',
          700: 'hsl(199, 100%, 38%)',
          800: 'hsl(199, 100%, 28%)',
          900: 'hsl(199, 100%, 18%)',
          DEFAULT: 'rgb(43, 177, 255)',
        },
        // Secondary - Warm Coral/Salmon scale
        'salmon': {
          50: 'hsl(17, 100%, 97%)',
          100: 'hsl(17, 100%, 92%)',
          200: 'hsl(17, 100%, 84%)',
          300: 'hsl(17, 100%, 74%)',
          400: 'hsl(17, 100%, 64%)',
          500: 'hsl(17, 100%, 54%)',
          600: 'hsl(17, 100%, 44%)',
          700: 'hsl(17, 100%, 34%)',
          DEFAULT: 'lightsalmon',
        },
        // Accent - Warm Gold (highlights, favorites, stars)
        'gold': {
          50: 'hsl(45, 100%, 96%)',
          100: 'hsl(45, 100%, 90%)',
          200: 'hsl(45, 100%, 80%)',
          300: 'hsl(45, 100%, 65%)',
          400: 'hsl(45, 100%, 50%)',
          500: 'hsl(45, 100%, 42%)',
          DEFAULT: 'hsl(45, 100%, 50%)',
        },
        // Success - Soft Green (adoption success, available status)
        'success': {
          50: 'hsl(142, 70%, 96%)',
          100: 'hsl(142, 70%, 90%)',
          200: 'hsl(142, 60%, 80%)',
          300: 'hsl(142, 55%, 65%)',
          400: 'hsl(142, 50%, 50%)',
          500: 'hsl(142, 45%, 40%)',
          600: 'hsl(142, 40%, 30%)',
          DEFAULT: 'hsl(142, 55%, 65%)',
        },
        // Warning - Amber
        'warning': {
          50: 'hsl(38, 100%, 96%)',
          100: 'hsl(38, 100%, 90%)',
          200: 'hsl(38, 95%, 80%)',
          300: 'hsl(38, 90%, 65%)',
          400: 'hsl(38, 85%, 50%)',
          500: 'hsl(38, 80%, 42%)',
          DEFAULT: 'hsl(38, 90%, 65%)',
        },
        // Neutral - Warm Gray
        'warm-gray': {
          50: 'hsl(30, 20%, 98%)',
          100: 'hsl(30, 15%, 95%)',
          200: 'hsl(30, 12%, 90%)',
          300: 'hsl(30, 10%, 80%)',
          400: 'hsl(30, 8%, 65%)',
          500: 'hsl(30, 6%, 50%)',
          600: 'hsl(30, 6%, 35%)',
          700: 'hsl(30, 8%, 25%)',
          800: 'hsl(30, 10%, 15%)',
          900: 'hsl(30, 12%, 8%)',
        },
        // shadcn theme colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'capriola': ['Capriola', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'sans': ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      gridTemplateColumns: {
        'main': '5% 20% 50% 20% 5%',
        'splash': '15% 70% 15%',
        'splash-top': '35% 30% 35%',
      },
      gridTemplateRows: {
        'main': '10% 70% 20%',
        'nav': '15% 70% 15%',
        'splash-top': '75% 10% 15%',
      },
      borderRadius: {
        'lg': "var(--radius)",
        'md': "calc(var(--radius) - 2px)",
        'sm': "calc(var(--radius) - 4px)",
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 0 20px rgba(43, 177, 255, 0.25)',
        'glow-salmon': '0 0 20px rgba(255, 160, 122, 0.25)',
      },
      keyframes: {
        droop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(100%)" },
        },
        "fade-in-scale": {
          from: { opacity: "0", transform: "scale(0.8)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        'droop': 'droop 0.75s ease-in',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "fade-in-down": "fade-in-down 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "wiggle": "wiggle 0.5s ease-in-out",
        "heartbeat": "heartbeat 0.6s ease-in-out",
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.2s ease-in",
        "fade-in-scale": "fade-in-scale 0.2s ease-out",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
