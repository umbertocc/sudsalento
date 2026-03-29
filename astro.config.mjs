import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 1. Il dominio principale (senza slash finale)
  site: 'https://umbertocc.github.io',
  
  // 2. La sottocartella del repository (con gli slash)
  base: '/sudsalento',

  vite: {
    plugins: [tailwindcss()]
  }
});
