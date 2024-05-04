import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Computer Science Capstone Handbook",
      social: {
        github: "https://github.com/adulbrich/cs-capstone-handbook",
      },
      sidebar: [
        {
          label: "Project Selection",
          autogenerate: { directory: "project-selection" },
        },
        {
          label: "Project Evaluation",
          autogenerate: { directory: "project-evaluation" },
        },
      ],
    }),
  ],
});
