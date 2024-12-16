import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
// import starlightImageZoom from "starlight-image-zoom";
// import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  site: "https://capstone.alexulbrich.com",
  integrations: [
    sitemap(),
    starlight({
      // plugins: [starlightImageZoom(), starlightLinksValidator()],
      title: "CS Capstone Handbook",
      components: {
        Pagination: "./src/components/Pagination.astro",
      },
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
            src: "/knowledge/js/script.outbound-links.js",
            "data-api": "/knowledge/api/event",
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
          label: "Practicalities",
          autogenerate: {
            directory: "practicalities",
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
        {
          label: "About",
          autogenerate: {
            directory: "about",
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
