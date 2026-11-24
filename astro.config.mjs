// Pinned to 7.2.0 (7.2.1 breaks Shiki in mdx blocks) — bump with astro.
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import Icons from 'unplugin-icons/vite';

/**
 * Remark plugin: rewrite root-relative src/href inside raw HTML blocks in .md files.
 * Markdown raw HTML (e.g. <img src="/assets/...">) stays as mdast 'html' nodes and
 * is never parsed into hast elements — string replacement is the only reliable path.
 */
function remarkBasePaths() {
  const base = (process.env.ASTRO_BASE ?? '').replace(/\/$/, '');
  if (!base) return (tree) => tree;

  // Match src="/" or href="/" but not src="//" (protocol-relative)
  const re = /((?:src|href)=")\/(?!\/)/g;

  function walk(node) {
    if (node.type === 'html' && typeof node.value === 'string') {
      node.value = node.value.replace(re, `$1${base}/`);
    }
    node.children?.forEach(walk);
  }

  return (tree) => walk(tree);
}

/**
 * Rehype plugin: rewrite root-relative src/href on hast element nodes.
 * Handles standard markdown images (![](/)  → <img src="/">) and MDX JSX elements
 * after remark-rehype converts them to hast.
 */
function rehypeBasePaths() {
  const base = (process.env.ASTRO_BASE ?? '').replace(/\/$/, '');
  if (!base) return (tree) => tree;

  function walk(node) {
    if (node.type === 'element') {
      const src = node.properties?.src;
      if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')) {
        node.properties.src = `${base}${src}`;
      }
      const href = node.properties?.href;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = `${base}${href}`;
      }
    }
    node.children?.forEach(walk);
  }

  return (tree) => walk(tree);
}

// https://astro.build/config
//
// Deployment config is env-first:
// - local development: copy `.env.example` to `.env`
// - GitHub Pages: set repository variables `ASTRO_SITE` and `ASTRO_BASE`
//
// `src/config/site.ts` consumes the resolved Astro values via
// `import.meta.env.SITE` and `import.meta.env.BASE_URL`; it is not the
// source of truth for deployment URLs.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://tanzimhromel.com', // override via ASTRO_SITE env var or edit directly
  base: process.env.ASTRO_BASE ?? '', // override via ASTRO_BASE env var or set '/repo-name' for project pages
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  redirects: {
    // Legacy Jekyll blog URLs (/blog/:year/:month/:day/:title/)
    '/blog/2021/01/24/getting-started-with-ns3/': '/blog/getting-started-with-ns3/',
    '/blog/2022/08/23/getting-started-with-kubernetes-microservices/':
      '/blog/getting-started-with-kubernetes-microservices/',
    '/blog/2024/04/21/intro-to-ci-cd/': '/blog/intro-to-ci-cd/',
    '/blog/2024/11/05/dotnet-tests/': '/blog/dotnet-tests/',
    '/blog/2024/11/29/zero-downtime/': '/blog/zero-downtime/',
    '/blog/2024/12/27/advice-complexity-online-algorithms/':
      '/blog/advice-complexity-online-algorithms/',
    '/blog/2024/12/27/clique-partition-problem-graph-theory/':
      '/blog/clique-partition-problem-graph-theory/',
    '/blog/2024/12/27/design-patterns-professional-software-engineering/':
      '/blog/design-patterns-professional-software-engineering/',
    '/blog/2024/12/27/optimizing-dotnet-microservices-performance/':
      '/blog/optimizing-dotnet-microservices-performance/',
    '/blog/2024/12/27/understanding-xv6-operating-systems/':
      '/blog/understanding-xv6-operating-systems/',
    '/blog/2025/01/20/leveraging-ai-tools-software-engineering/':
      '/blog/leveraging-ai-tools-software-engineering/',
    '/blog/2025/03/20/opentelemetry/': '/blog/opentelemetry/',
    '/blog/2025/04/05/intro-to-nar/': '/blog/intro-to-nar/',
    '/blog/2025/05/20/intro-to-agentic-ai/': '/blog/intro-to-agentic-ai/',
    '/blog/2025/05/23/how-to-handle-hallucinations/': '/blog/how-to-handle-hallucinations/',
    '/blog/2025/05/28/vibe-coding/': '/blog/vibe-coding/',
    '/blog/2025/06/05/memory-management-production-silent-killers/':
      '/blog/memory-management-production-silent-killers/',
    '/blog/2026/06/18/building-fast-1brc-csharp-apple-silicon/':
      '/blog/building-fast-1brc-csharp-apple-silicon/',
    // Legacy Jekyll pagination and project slug paths
    '/blog/page2/': '/blog/page/2/',
    '/blog/page3/': '/blog/page/3/',
    '/blog/page4/': '/blog/page/4/',
    '/projects/bangla_digit_recognition/': '/projects/bangla-digit-recognition/',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    // Allow Astro's <Image> component to optimise images from these remote domains.
    // Used for book covers (Open Library) and GitHub stats cards.
    domains: [
      'covers.openlibrary.org',
      'github-readme-stats.vercel.app',
      'github-profile-trophy.vercel.app',
    ],
  },
  integrations: [
    react(),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  vite: {
    // Icons are provided by unplugin-icons: each icon is a static
    // `~icons/<collection>/<name>` import compiled to a zero-JS inline SVG.
    // An unknown icon name fails the build (unresolved import) instead of a
    // silent warning, so there is no hand-maintained include list to drift.
    plugins: [tailwindcss(), Icons({ compiler: 'astro' })],
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@assets': '/src/assets',
        '@config': '/src/config',
        '@utils': '/src/utils',
        '@content': '/src/content',
        '@data': '/src/data',
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Shorter, readable asset paths (e.g. _s/abc123.js instead of _astro/abc123.js)
          assetFileNames: '_s/[hash][extname]',
          chunkFileNames: '_s/[hash].js',
          entryFileNames: '_s/[hash].js',
        },
      },
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkBasePaths],
      rehypePlugins: [
        [rehypeKatex, { strict: false }],
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
          },
        ],
        rehypeBasePaths,
      ],
    }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
