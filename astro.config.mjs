import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import starlightScrollToTop from 'starlight-scroll-to-top';
// import starlightPageActions from 'starlight-page-actions';
// import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
  site: 'https://capstone.alexulbrich.com',

  // The Project Evaluation section was dissolved into Assignments and Learning
  // Objectives (2026-08-18). These URLs were live and linked from elsewhere, so
  // they redirect rather than 404.
  redirects: {
    '/project-evaluation/project-partner-evaluation':
      '/assignments/project-partner-evaluation/',
    '/project-evaluation/peer-evaluations': '/assignments/peer-evaluations/',
    '/project-evaluation/conversion': '/learning-objectives/grading/',
    '/project-evaluation/breakdown': '/assignments/introduction/',
    '/project-evaluation/rubrics': '/assignments/introduction/',
    '/project-evaluation/assignments': '/assignments/introduction/',
  },

  integrations: [
    mermaid(),
    sitemap(),
    starlight({
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
      title: 'CS Capstone Handbook',
      lastUpdated: true,
      components: {},
      customCss: [
        // Path to your Tailwind base styles:
        './src/styles/global.css',
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/adulbrich/cs-capstone-handbook',
        },
      ],
      head: [
        {
          tag: 'script',
          attrs: {
            src: '/knowledge/js/script.outbound-links.js',
            'data-api': '/knowledge/api/event',
            'data-domain': 'capstone.alexulbrich.com',
            defer: true,
          },
        },
      ],
      sidebar: [
        {
          label: 'Introduction',
          items: [{ autogenerate: {
            directory: 'introduction',
          }}],
        },
        {
          label: 'Learning Objectives and Grading',
          items: [{ autogenerate: {
            directory: 'learning-objectives',
          }}],
        },
        {
          label: 'Assignments',
          items: [{ autogenerate: {
            directory: 'assignments',
          }}],
        },
        {
          label: 'Practicalities',
          items: [{ autogenerate: {
            directory: 'practicalities',
          }}],
        },
        {
          label: 'Activities',
          items: [{ autogenerate: {
            directory: 'activities',
          }}],
        },
        {
          label: 'Guides',
          items: [{ autogenerate: {
            directory: 'guides',
          }}],
        },
        {
          label: 'About',
          items: [{ autogenerate: {
            directory: 'about',
          }}],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss(), starlightScrollToTop()],
    ssr: {
      noExternal: ['zod'],
    },
  },
});
