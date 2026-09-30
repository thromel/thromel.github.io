---
layout: page
title: contributions
permalink: /contributions/
description: Curated open-source contribution evidence across research infrastructure, frameworks, and language tooling.
nav: true
nav_order: 6
github_user: thromel
---

<p class="text-muted text-uppercase small">Open-source contribution evidence</p>
<p class="lead">Each selected contribution links to the merged pull request. The live count adds context, but the patches are the evidence.</p>

<section data-contributions-curated aria-labelledby="contributions-curated-title">
  <p class="text-muted text-uppercase small mb-0">Curated proof</p>
  <h3 id="contributions-curated-title">Merged work in external repositories</h3>
  <div class="row row-cols-1 row-cols-md-2">
    {% for item in site.data.contributions.highlights %}
    <div class="col mb-4">
      <div class="card h-100">
        <div class="card-body">
          <p class="text-muted text-uppercase small mb-1">Merged change</p>
          <h4 class="card-title">{{ item.name }}</h4>
          <p class="small text-muted">{{ item.repo }} · {{ item.area }} · verified <time datetime="{{ site.data.contributions.last_verified }}">{{ site.data.contributions.last_verified }}</time></p>
          <p class="card-text">{{ item.summary }}</p>
          <a data-contribution-proof href="{{ item.proof_url }}" target="_blank" rel="noopener noreferrer" aria-label="{{ item.proof_label | escape }} direct pull request (opens in a new tab)">{{ item.proof_label }} · direct pull request</a>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>
</section>

<section class="card mt-4" data-contribution-count data-github-user="{{ page.github_user }}" data-state="unavailable" aria-busy="false" aria-labelledby="contribution-count-title">
  <div class="card-body">
    <p class="text-muted text-uppercase small mb-0">Live supporting signal</p>
    <h3 id="contribution-count-title">Merged external pull requests</h3>
    <p id="contribution-count-status" class="contribution-count__status" aria-live="polite">The live count has not been requested yet. Selected contribution evidence is available above.</p>
    <p><strong id="contribution-count-value" class="h2">—</strong> <span>merged pull requests to external repositories</span></p>
    <button id="contribution-count-refresh" class="btn btn-sm z-depth-0 js-only" type="button" disabled>Load current count</button>
    <noscript><p data-no-js-fallback>Live count unavailable without JavaScript. Selected contribution evidence is shown above.</p></noscript>
    <p class="small text-muted mt-3 mb-0">Count query last reviewed {{ site.data.contributions.last_verified }}. Curated pull-request evidence above remains useful if GitHub is slow or unavailable.</p>
  </div>
</section>

<script src="{{ '/assets/js/contribution-count.js' | relative_url }}" defer></script>
