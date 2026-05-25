import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite + React fast-refresh + Tailwind v4 plugin.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
