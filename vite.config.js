import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: https://hynnk0-hub.github.io/heavy-monitor/
export default defineConfig({
  plugins: [react()],
  base: '/heavy-monitor/',         // ← 리포 이름
});
