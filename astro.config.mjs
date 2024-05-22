import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Computer Science Capstone Handbook",
      customCss: [
        // Path to your Tailwind base styles:
        "./src/tailwind.css",
      ],
      social: {
        github: "https://github.com/adulbrich/cs-capstone-handbook",
      },
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
