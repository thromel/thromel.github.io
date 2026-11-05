---
layout: default
title: about
permalink: /
---

<div class="term">

<section class="term-win" id="hero">
  <div class="term-bar"><span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span><span class="term-title">tanzim@ualberta:~</span></div>
  <div class="term-body" id="term-body">
    <p class="ln"><span class="ps">$</span> <b>ssh</b> <span class="arg">tanzim@ualberta</span></p>
    <p class="ln"><span class="ok">[ OK ]</span> connected</p>
    <h1 class="term-name">Tanzim Hossain Romel</h1>
    <p class="term-tag">M.Sc. student @ University of Alberta &middot; AI4SE &middot; trustworthy AI agents</p>
    <p class="ln"><span class="gt">&gt;</span> SREGym blog on turning postmortems into SRE benchmark problems</p>
    <p class="ln"><span class="gt">&gt;</span> GTA/GRA at UAlberta, TA for CMPUT 174</p>
    <p class="ln muted" id="term-hint">type 'help' for commands, or just scroll</p>
    <div id="term-out" aria-live="polite"></div>
  </div>
</section>

<section class="term-sec" id="whois">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">whois</span> <span class="arg">tanzim</span></h2>
  <div class="whois">
    <figure class="whois-photo">
      <img src="{{ '/assets/img/prof_pic.webp' | relative_url }}" width="130" alt="Tanzim Hossain Romel" loading="lazy">
      <figcaption>Lake Minnewanka, Banff National Park, September 2026.</figcaption>
    </figure>
    <dl class="kv">
      <dt>name</dt><dd>Tanzim Hossain Romel</dd>
      <dt>role</dt><dd>M.Sc. student, Computing Science</dd>
      <dt>org</dt><dd><a href="https://www.ualberta.ca/en/computing-science/index.html" target="_blank" rel="noopener noreferrer">University of Alberta</a></dd>
      <dt>advisor</dt><dd><a href="https://apps.ualberta.ca/directory/person/zy25" target="_blank" rel="noopener noreferrer">Dr. Zhou Yang</a></dd>
      <dt>group</dt><dd><a href="https://u-a-goose.github.io/" target="_blank" rel="noopener noreferrer">U-A-Goose Lab</a></dd>
      <dt>focus</dt><dd>AI4SE, LLM4Coding, trustworthy AI, AI for SRE, long-horizon coding agents</dd>
      <dt>location</dt><dd>Edmonton, Alberta</dd>
      <dt>email</dt><dd><a href="mailto:%74%61%6E%7A%69%6D%68%6F@%75%61%6C%62%65%72%74%61.%63%61">tanzimho@ualberta.ca</a><br><a href="mailto:%74%61%6E%68%72%6F%6D%65%6C@%67%6D%61%69%6C.%63%6F%6D">tanhromel@gmail.com</a></dd>
    </dl>
  </div>
</section>

<section class="term-sec" id="about">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">cat</span> <span class="arg">about.txt</span></h2>
  <div class="cat" markdown="1">

I study how AI agents behave in real software systems, and how to make their decisions inspectable, reliable, and trustworthy.

I bring about three years of professional software-engineering experience, formerly at <a href="https://www.iqvia.com/" target="_blank" rel="noopener noreferrer">IQVIA</a>.

My research interests are AI4SE, LLM4Coding, trustworthy AI, long-horizon coding agents, and AI for SRE.

I care about focused, sustained work. Here is [how I think about work ethic]({% post_url 2026-09-29-focused-work-and-deliberate-rest %}).

I live in Edmonton, Alberta. Fun fact: Edmonton's North Saskatchewan River Valley is one of the largest stretches of connected urban parkland in North America.

  </div>
</section>

<section class="term-sec" id="links">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">cat</span> <span class="arg">links.txt</span></h2>
  <div class="pills">
    <a class="pill" href="mailto:%74%61%6E%7A%69%6D%68%6F@%75%61%6C%62%65%72%74%61.%63%61"><span class="glyph" aria-hidden="true">@</span>email</a>
    <a class="pill" href="https://scholar.google.com/citations?user=zHV4EU8AAAAJ" target="_blank" rel="external nofollow noopener"><span class="glyph" aria-hidden="true">&sect;</span>scholar</a>
    <a class="pill" href="https://github.com/thromel" target="_blank" rel="external nofollow noopener"><span class="glyph" aria-hidden="true">&lt;/&gt;</span>github</a>
    <a class="pill" href="https://www.linkedin.com/in/thromel" target="_blank" rel="external nofollow noopener"><span class="glyph" aria-hidden="true">in</span>linkedin</a>
    <a class="pill" href="https://orcid.org/0009-0009-2432-8960" target="_blank" rel="external nofollow noopener"><span class="glyph" aria-hidden="true">id</span>orcid</a>
    <a class="pill" href="https://twitter.com/tanzimhromel" target="_blank" rel="external nofollow noopener"><span class="glyph" aria-hidden="true">x</span>x</a>
    <a class="pill" href="{{ '/cv/' | relative_url }}"><span class="glyph" aria-hidden="true">#</span>cv</a>
  </div>
</section>

<section class="term-sec" id="news">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">tail</span> <span class="arg">-n 10 news.log</span></h2>
  {% include news-log.liquid limit=10 %}
  <p class="more"><a href="{{ '/news/' | relative_url }}">[all news]</a></p>
</section>

<section class="term-sec" id="pubs">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">ls</span> <span class="arg">./publications/</span></h2>
  <div class="publications term-pubs">
    {% bibliography %}
  </div>
  <p class="more"><a href="{{ '/publications/' | relative_url }}">[all publications]</a></p>
</section>

<section class="term-sec" id="projects">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">ls</span> <span class="arg">./projects/</span></h2>
  {% assign featured = "ctxhelm,contextledger,patchsmith,1brc-csharp,blockchain-ticketing,eventfly-an-end-to-end-event-management-system" | split: "," %}
  <ul class="proj-list">
    {% for slug in featured %}{% for p in site.projects %}{% if p.slug == slug %}
    <li><a class="proj-name" href="{{ p.url | relative_url }}">{{ p.title }}</a><span class="proj-desc">{{ p.description }}</span></li>
    {% endif %}{% endfor %}{% endfor %}
  </ul>
  <p class="more"><a href="{{ '/projects/' | relative_url }}">[all projects]</a></p>
</section>

<section class="term-sec" id="research">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">cat</span> <span class="arg">research.txt</span></h2>
  <div class="cat" markdown="1">

I work on three connected questions.

- **Long-horizon coding agents.** How can they preserve context, repository memory, and architectural intent as software evolves? See [ContextLedger]({{ '/projects/contextledger/' | relative_url }}).
- **AI for SRE.** How should agents be evaluated when diagnosis and recovery happen inside live reliability conditions? See [SREGym](https://www.sregym.com/).
- **Trustworthy AI.** How can we inspect agent choices, security boundaries, and evidence when the final answer still looks acceptable? See [SHIFT]({{ '/projects/research-reagent-plus-plus/' | relative_url }}).

More on the [research page]({{ '/research/' | relative_url }}).

  </div>
</section>

<section class="term-sec" id="experience">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">history</span> <span class="arg">| grep job</span></h2>
  <ol class="hist">
    {% for e in site.data.cv.cv.sections.Experience %}
    {% assign start = e.start_date | default: e.date | append: '' %}
    {% assign end = e.end_date | append: '' %}
    <li>
      <div class="hist-head"><b>{{ e.position }}</b> &middot; <a href="{{ e.url }}" target="_blank" rel="noopener noreferrer">{{ e.company }}</a></div>
      <div class="hist-date muted"><time datetime="{{ start | slice: 0, 10 }}">{{ start | slice: 0, 7 }}</time> &ndash; {% if end != '' %}<time datetime="{{ end }}">{{ end }}</time>{% else %}present{% endif %}</div>
      <div class="hist-sum">{{ e.summary | markdownify | strip_html | truncatewords: 26 }}</div>
      {% for h in e.highlights limit: 2 %}<div class="hist-hl"><span class="gt">&gt;</span> {{ h | markdownify | strip_html | strip_newlines | truncatewords: 22 }}</div>{% endfor %}
    </li>
    {% endfor %}
  </ol>
  <p class="more"><a href="{{ '/cv/' | relative_url }}">[full cv]</a></p>
</section>

<section class="term-sec" id="education">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">cat</span> <span class="arg">education.txt</span></h2>
  <ul class="edu">
    {% for e in site.data.cv.cv.sections.Education limit: 2 %}
    <li><b>{{ e.institution }}</b>, {{ e.studyType }}<br><span class="muted">{{ e.highlights[0] }}</span></li>
    {% endfor %}
  </ul>
</section>

<section class="term-sec" id="posts">
  <h2 class="ps-line"><span class="ps">$</span> <span class="cmd">ls</span> <span class="arg">./posts/</span></h2>
  <ul class="post-ls">
    {% for post in site.posts limit: 3 %}
    <li><time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%Y-%m-%d' }}</time> <a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
  <p class="more"><a href="{{ '/blog/' | relative_url }}">[all posts]</a></p>
</section>

</div>

<script defer src="{{ '/assets/js/terminal.js' | relative_url }}"></script>
