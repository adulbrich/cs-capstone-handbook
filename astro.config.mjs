import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [starlightImageZoom()],
      title: "Computer Science Capstone Handbook",
      customCss: [
        // Path to your Tailwind base styles:
        "./src/tailwind.css",
      ],
      social: {
        github: "https://github.com/adulbrich/cs-capstone-handbook",
      },
      head: [
        {
          tag: "script",
          attrs: {
            src: "https://plausible.io/js/script.outbound-links.js",
            "data-domain": "capstone.alexulbrich.com",
            defer: true,
          },
        },
      ],
      sidebar: [
        {
          label: "Introduction",
          autogenerate: {
            directory: "introduction",
          },
        },
        {
          label: "Learning Objectives",
          autogenerate: {
            directory: "learning-objectives",
          },
        },
        {
          label: "Project Selection",
          autogenerate: {
            directory: "project-selection",
          },
        },
        {
          label: "Activities",
          autogenerate: {
            directory: "activities",
          },
        },
        {
          label: "Project Evaluation",
          autogenerate: {
            directory: "project-evaluation",
          },
        },
      ],
    }),
    tailwind({
      // Disable the default base styles:
      applyBaseStyles: false,
    }),
  ],
});
