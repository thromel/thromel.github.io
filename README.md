# tanzimhromel.com

Personal academic site, built with [Astro](https://astro.build) on the [as-folio](https://github.com/dadangnh/as-folio) theme.

```bash
yarn install
yarn dev     # http://localhost:4321
yarn build   # outputs dist/ (includes the Pagefind search index)
```

Site settings live in `src/config/site.ts`; content lives in `src/content/` and `src/data/`. Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`.
