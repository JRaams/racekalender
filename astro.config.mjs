import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import purgecss from "astro-purgecss";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: "auto",
  },
  integrations: [
    svelte(),
    icon(),
    purgecss({
      safelist: {
        standard: [":hover", ":focus", ":where", ":is", "button", ".past"]
      },
    }),
  ]
});
