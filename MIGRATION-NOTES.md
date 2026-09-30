# Migration notes (WP0)

Fresh al-folio v1.x (gems: al_folio_core 1.0.15 etc.) checkout, `.git` re-initialised with no remote and no commits.
Source of truth (read-only): /Users/tanzimho/github/thromel.github.io

## What changed
- `_config.yml`: title "Tanzim Hossain Romel's Portfolio", description copied from old config, first/last name, `email: tanhromel@gmail.com`
  (old `_data/profile.yml` `email`; `work_email` is tanzimho@ualberta.ca), `url: https://tanzimhromel.com`, `baseurl: ""`,
  `imagemagick.enabled: false`, scholar `last_name: [Romel]`, `first_name: [Tanzim Hossain]`, `keep_files` keeps CNAME,
  demo `external_sources`, `display_tags/categories`, disqus shortname, `books`/`teachings` collections removed, extra excludes (`test/`, `requirements.txt`, MIGRATION-NOTES.md).
- Footer: old site had no footer_text in _config.yml (its footer.html prints "© <year> <name>"); footer_text is now "© Tanzim Hossain Romel. Powered by Jekyll with al-folio" (static; config values are not liquid-rendered, so no dynamic year). Adjust if desired.
- Jupyter: `jekyll-jupyter-notebook` removed from `_config.yml` plugins and Gemfile.
- Removed demo content: all `_posts`, `_news`, `_projects`, `_books`, `_teachings`, bib entries (`papers.bib` now empty), pages (about_einstein, books, dropdown, plugins, profiles, repositories, teaching), `_data/repositories.yml`, `featured_plugins.yml`, `coauthors.yml`/`venues.yml`/`citations.yml` emptied, demo images/audio/video/html/plotly/notebook/pdf/Einstein CV PDF, lighthouse_results, readme_preview.
- `.gitkeep` in `_posts _news _projects _bibliography assets/img assets/img/publication_preview assets/pdf`.
- Minimal pages kept: `_pages/{404,about,blog,cv,news,projects,publications}.md`. `_data/cv.yml`, `_data/socials.yml`, `assets/json/resume.json` are stubs (name/email only).
- `.github/workflows/`: only `deploy.yml` kept (no ImageMagick/nbconvert/Python/giscus-update steps). Others deleted.
- `CNAME` = tanzimhromel.com. Bundler configured `path vendor/bundle` (in `.bundle/config`).
- Left untouched: AGENTS.md/CLAUDE.md/.claude/.agents/.codex/.gemini (al-folio's own agent files; they mention a "superpowers"-style bootstrap: ignore), docs/, test/, bin/, Dockerfile, package.json, purgecss config. Prune later if wanted.

## Build (works, exit 0)
```
export PATH=$HOME/.local/share/mise/installs/ruby/3.3.12/bin:$PATH
cd /Users/tanzimho/github/thromel-alfolio
bundle install
LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 JEKYLL_ENV=production bundle exec jekyll build
```
Output: `_site/` (404, index, blog, cv, news, projects, publications, feed.xml, sitemap.xml, CNAME).
Optional CSS purge (as in deploy.yml): `npm ci && npx purgecss -c purgecss.config.js` (not run in WP0).

## Gotchas
- `jekyll-terser` git gem (RobertoJBeltran) installed fine from GitHub (network needed on first `bundle install`). Without `LC_ALL/LANG=en_US.UTF-8` terser prints `"\xE2" on US-ASCII` exceptions on some JS files (build still succeeds but JS may be unminified). Always set the locale.
- With `imagemagick.enabled: false` no webp variants are generated; images render as plain `<img>`. Keep image `.jpg/.png` in `assets/img/`.
- `vendor/`, `_site`, `.jekyll-cache` are gitignored. Gemfile.lock changed (jupyter gem removed).
- Empty `papers.bib` + `{% bibliography %}` builds fine. `about.md` with `selected_papers: true` needs at least the bib file to exist.
- deploy.yml still branches on master/main and needs `npm ci` (package-lock.json is retained); CI Ruby is 3.3.5. `contents: write` + gh-pages deploy action publishes `_site` to `gh-pages` branch: set Pages source accordingly later.
- Demo `docs/`/`test/` reference removed demo content; they are excluded from the build.

## al-folio keys later agents need
- Nav: page front matter `nav: true` + `nav_order: N` (blog 1, publications 2, projects 3, cv 5, news has no nav). Dropdowns: `nav_order` plus `dropdown: true` on child pages with a parent page having `children:` (dropdown.md was deleted; see docs/CUSTOMIZE.md).
- About page (`_pages/about.md`, `permalink: /`): `profile: {align, image (file in assets/img/), image_circular, more_info}`, `selected_papers: true`, `social: true`, `announcements: {enabled, scrollable, limit}` (news from `_news/`), `latest_posts: {enabled, scrollable, limit}`. `subtitle:` accepts HTML.
- Selected papers: in `_bibliography/papers.bib` add `selected={true}` to an entry; other fields: `abbr`, `preview` (image in `assets/img/publication_preview/`), `pdf`, `code`, `arxiv`, `html`, `slides`, `poster`, `website`, `abstract`, `award`, `bibtex_show={true}`. Author highlighting is via `scholar.last_name/first_name`; co-author links in `_data/coauthors.yml` (key = last name lowercase, `firstname` list, `url`); venue badge colors in `_data/venues.yml`.
- News: files in `_news/*.md` with front matter `layout: post`, `date: YYYY-MM-DD HH:MM:SS+0000`, `inline: true` (shows inline text on about page instead of a page), body is the text; `related_posts: false`.
- Projects: `_projects/*.md` with `layout: page`, `title`, `description`, `img`, `importance` (sort), `category` (must be in `display_categories` of `_pages/projects.md`, currently `[work, fun]`), optional `github`, `giscus_comments`, `redirect`. `horizontal: true/false` in projects.md front matter for layout.
- Posts: `_posts/YYYY-MM-DD-slug.md`, `layout: post`, `title`, `description`, `date`, `tags`, `categories`, `featured`, `thumbnail`, `toc`, `related_posts`, `giscus_comments`, `pretty_table`. Blog page shows `display_tags`/`display_categories` from `_config.yml`.
- CV: `_pages/cv.md` `cv_format: rendercv` reads `_data/cv.yml` (RenderCV schema: `cv.sections.<Name>` lists); `cv_format: jsonresume` reads `assets/json/resume.json`; `cv_pdf:` path/URL adds download button (removed in stub); rendercv assets in `assets/rendercv/`.
- Socials: `_data/socials.yml` (jekyll-socials keys: email, github_username, linkedin_username, scholar_userid, orcid_id, custom_social ...). `enable_navbar_social`, `protect_email` in _config.yml.
- Profile pic: `assets/img/<file>` referenced by `profile.image`.
- Old data to port (see old repo `_data/profile.yml`): about_snippet, current_focus, affiliations logos under `assets/images/...` (old path) -> move under `assets/img/`.
