import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";
import starlightLinksValidator from "starlight-links-validator";
import starlightScrollToTop from "starlight-scroll-to-top";
// import starlightPageActions from 'starlight-page-actions';
// import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mermaid(),
    sitemap(),
    starlight({
      components: {},
      customCss: [
        // Path to your Tailwind base styles:
        "./src/styles/global.css",
      ],
      head: [
        {
          attrs: {
            "data-api": "/knowledge/api/event",
            "data-domain": "capstone.alexulbrich.com",
            defer: true,
            src: "/knowledge/js/script.outbound-links.js",
          },
          tag: "script",
        },
      ],
      lastUpdated: true,
      plugins: [
        starlightLinksValidator(),
        // starlightPageActions({
        //   baseUrl: "https://engr103.alexulbrich.com",
        //   actions: {
        //     markdown: false,
        //     // custom: {
        //     //   grok: {
        //     //     label: "Open in Grok",
        //     //     href: "https://grok.com/?q=",
        //     //   },
        //     // },
        //   },
        // })
      ],
      sidebar: [
        {
          items: [
            {
              autogenerate: {
                directory: "introduction",
              },
            },
          ],
          label: "Introduction",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "learning-objectives",
              },
            },
          ],
          label: "Learning Objectives and Grading",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "assignments",
              },
            },
          ],
          label: "Assignments",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "practicalities",
              },
            },
          ],
          label: "Practicalities",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "activities",
              },
            },
          ],
          label: "Activities",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "guides",
              },
            },
          ],
          label: "Guides",
        },
        {
          items: [
            {
              autogenerate: {
                directory: "about",
              },
            },
          ],
          label: "About",
        },
      ],
      social: [
        {
          href: "https://github.com/adulbrich/cs-capstone-handbook",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "CS Capstone Handbook",
    }),
  ],

  // The Project Evaluation section was dissolved into Assignments and Learning
  // Objectives. These URLs were live and linked from elsewhere, so they
  // redirect rather than 404.
  redirects: {
    "/project-evaluation/assignments": "/assignments/introduction/",
    "/project-evaluation/breakdown": "/assignments/introduction/",
    "/project-evaluation/conversion": "/learning-objectives/grading/",
    "/project-evaluation/peer-evaluations": "/assignments/peer-evaluations/",
    "/project-evaluation/project-partner-evaluation":
      "/assignments/project-partner-evaluation/",
    "/project-evaluation/rubrics": "/assignments/introduction/",
  },
  site: "https://capstone.alexulbrich.com",

  vite: {
    plugins: [tailwindcss(), starlightScrollToTop()],
    ssr: {
      noExternal: ["zod"],
    },
  },
});
