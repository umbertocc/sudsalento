import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 1. Il dominio principale (con suffisso repo)
  site: 'https://umbertocc.github.io/sudsalento',
  // 2. La sottocartella del repository (con slash iniziale e finale)
  base: '/sudsalento/',
  vite: {
    plugins: [tailwindcss()]
  }
});