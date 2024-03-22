import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import icon from 'astro-icon';
import purgecss from 'astro-purgecss';
import robotsTxt from 'astro-robots-txt';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://racekalender.pages.dev',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    svelte(),
    icon(),
    purgecss({
      safelist: {
        standard: [':hover', ':focus', ':where', ':is', 'button', '.past'],
      },
    }),
    robotsTxt(),
    sitemap(),
  ],
});
