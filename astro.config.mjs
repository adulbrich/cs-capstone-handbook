import { readFileSync } from "node:fs";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import mermaid from "astro-mermaid";
import starlightLinksValidator from "starlight-links-validator";
import starlightScrollToTop from "starlight-scroll-to-top";
import { activitiesSidebar } from "./src/lib/activities-sidebar.mjs";
// import starlightPageActions from 'starlight-page-actions';
// import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mermaid(),
    // The instructor tools under /tools/ and the decks under /decks/ are
    // noindex and stay out of the map.
    sitemap({
      filter: (page) => !(page.includes("/tools/") || page.includes("/decks/")),
    }),
    svelte(),
    starlight({
      components: {},
      customCss: [
        // Path to your Tailwind base styles:
        "./src/styles/global.css",
      ],
      // The 404 page is src/pages/404.astro; see it for why.
      disable404Route: true,
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
        {
          // Opens term tabs on the current term; see the file for why and how.
          content: readFileSync(
            new URL("./src/lib/term-tabs.js", import.meta.url),
            "utf8"
          ),
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
        activitiesSidebar,
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

  // Sections and pages that have been dissolved had live URLs, so they
  // redirect rather than 404.
  //
  // Project Evaluation went into Assignments and Learning Objectives. Project
  // Selection, Team Formation, and Changing or Pivoting Projects merged into
  // Projects and Teams, and Resource Requests folded into the students page
  // (#69).
  //
  // Practicalities itself was then dissolved (#162): orientation to the three
  // audience pages, IP and NDA policy to its own page, the Expo to an ungraded
  // assignment, and the four example shipping paths to the Shipping guide. The five
  // redirects above chained through pages that no longer exist, so they now
  // point at the surviving destination directly.
  //
  // The activity library was regrouped by kind of work (#416): eleven theme
  // pages became twelve, so each retired page points at the page that
  // received most of its activities. AI Practice was dissolved, and its URL
  // points at the Generative AI guide, which took its framing and links its
  // activities. A redirect carries the page, not the anchor.
  redirects: {
    "/activities/ai": "/guides/generative-ai/",
    "/activities/communication": "/activities/presenting/",
    "/activities/conflict": "/activities/team-and-workflow/",
    "/activities/creative": "/activities/ideation/",
    "/activities/design": "/activities/technical-design/",
    "/activities/planning": "/activities/planning-and-risk/",
    "/activities/reflective": "/activities/learning-and-reflection/",
    "/activities/teamwork": "/activities/team-and-workflow/",
    "/activities/user": "/activities/working-with-users/",
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
    // Mermaid's shared parser chunk is about 660 kB. It is the library's own
    // code and loads only on a page with a diagram, so splitting it buys
    // nothing. The limit sits just above it so a new oversized chunk warns.
    build: { chunkSizeWarningLimit: 700 },
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["zod"],
    },
  },
});
