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
        starlightScrollToTop(),
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
          label: "Overview",
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

  // Two sections have been dissolved and their URLs were live, so they redirect
  // rather than 404.
  //
  // Project Evaluation went into Assignments and Learning Objectives. Project
  // Selection, Team Formation, and Changing or Pivoting Projects merged into
  // Projects and Teams, and Resource Requests folded into the students page
  // (#69).
  //
  // Practicalities itself was then dissolved (#162): orientation to the three
  // audience pages, IP and NDA policy to its own page, the Expo to an ungraded
  // assignment, and the four outcome types to the Shipping guide. The five
  // redirects above chained through pages that no longer exist, so they now
  // point at the surviving destination directly.
  redirects: {
    "/practicalities/categories": "/guides/shipping/",
    "/practicalities/change":
      "/introduction/for-students/#if-the-project-or-the-team-has-to-change",
    "/practicalities/expo": "/assignments/expo/",
    "/practicalities/projects-and-teams":
      "/introduction/for-students/#how-you-get-your-project-and-team",
    "/practicalities/resources": "/introduction/for-students/#resources",
    "/practicalities/selection":
      "/introduction/for-students/#how-you-get-your-project-and-team",
    "/practicalities/teams":
      "/introduction/for-students/#how-you-get-your-project-and-team",
    "/practicalities/types": "/guides/shipping/",
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
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["zod"],
    },
  },
});
