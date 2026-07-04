import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlightScrollToTop from 'starlight-scroll-to-top';
// import starlightPageActions from 'starlight-page-actions';
// import starlightImageZoom from "starlight-image-zoom";
// import starlightLinksValidator from "starlight-links-validator";

// https://astro.build/config
export default defineConfig({
  site: 'https://capstone.alexulbrich.com',

  integrations: [
    mermaid(),
    sitemap(),
    starlight({
      plugins: [
        // starlightLinksValidator(),
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
          label: 'Learning Objectives',
          items: [{ autogenerate: {
            directory: 'learning-objectives',
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
          label: 'Project Evaluation',
          items: [{ autogenerate: {
            directory: 'project-evaluation',
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
