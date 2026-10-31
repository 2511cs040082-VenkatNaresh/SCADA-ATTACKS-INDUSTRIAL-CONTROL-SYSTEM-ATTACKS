/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#090d16',          // Dark charcoal background
          panel: '#131c2e',       // Deep navy panels
          panelBorder: '#1e293b', // Subtle border
          header: '#0e1524',      // Header background
          sidebar: '#0c121e',     // Sidebar background
          
          // Status & Telemetry Palette
          telemetry: '#38bdf8',   // Cyan / Blue telemetry
          telemetryDim: '#0284c7',
          healthy: '#10b981',     // Green status
          warning: '#f59e0b',     // Amber warning
          critical: '#ef4444',    // Red critical alert
          
          textPrimary: '#f8fafc', // Light gray/white text
          textSecondary: '#94a3b8', // Muted text
          textMuted: '#64748b',   // Dim label text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
