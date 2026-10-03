---
layout: about
title: about
permalink: /
subtitle: <a href="https://www.ualberta.ca/en/computing-science/index.html" target="_blank" rel="noopener noreferrer">University of Alberta</a> &middot; M.Sc. in Computing Science &middot; <a href="https://u-a-goose.github.io/" target="_blank" rel="noopener noreferrer">U-A-Goose Lab</a>

profile:
  align: right
  image: prof_pic.webp
  image_circular: false
  more_info: >
    <p><em>Me in front of Lake Minnewanka, Banff National Park, September 2026.</em></p>
    <div class="contact-icons">
      <a href="mailto:%74%61%6E%7A%69%6D%68%6F@%75%61%6C%62%65%72%74%61.%63%61" title="Email"><i class="fa-solid fa-envelope"></i></a>
      <a href="https://github.com/thromel" title="GitHub" rel="external nofollow noopener" target="_blank"><i class="fa-brands fa-github"></i></a>
      <a href="https://scholar.google.com/citations?user=zHV4EU8AAAAJ" title="Google Scholar" rel="external nofollow noopener" target="_blank"><i class="ai ai-google-scholar"></i></a>
      <a href="https://www.linkedin.com/in/thromel" title="LinkedIn" rel="external nofollow noopener" target="_blank"><i class="fa-brands fa-linkedin"></i></a>
      <a href="https://orcid.org/0009-0009-2432-8960" title="ORCID" rel="external nofollow noopener" target="_blank"><i class="ai ai-orcid"></i></a>
      <a href="https://twitter.com/tanzimhromel" title="X" rel="external nofollow noopener" target="_blank"><i class="fa-brands fa-x-twitter"></i></a>
    </div>
    <p><a href="mailto:%74%61%6E%7A%69%6D%68%6F@%75%61%6C%62%65%72%74%61.%63%61">tanzimho@ualberta.ca</a></p>
    <p><a href="mailto:%74%61%6E%68%72%6F%6D%65%6C@%67%6D%61%69%6C.%63%6F%6D">tanhromel@gmail.com</a></p>

selected_papers: true # includes papers marked selected={true} in the bib
social: false

announcements:
  enabled: true
  scrollable: true
  limit: 5

latest_posts:
  enabled: true
  scrollable: true
  limit: 3
---

I study how AI agents behave in real software systems, and how to make their decisions inspectable, reliable, and trustworthy.

I bring about three years of professional software-engineering experience, formerly at <a href="https://www.iqvia.com/" target="_blank" rel="noopener noreferrer">IQVIA</a>.

My research interests are AI4SE, LLM4Coding, trustworthy AI, long-horizon coding agents, and AI for SRE.

I care about focused, sustained work. Here is [how I think about work ethic]({% post_url 2026-09-29-focused-work-and-deliberate-rest %}).

I live in Edmonton, Alberta. Fun fact: Edmonton's North Saskatchewan River Valley is one of the largest stretches of connected urban parkland in North America.

## Research

I work on three connected questions.

- **Long-horizon coding agents.** How can they preserve context, repository memory, and architectural intent as software evolves? See [ContextLedger]({{ '/projects/contextledger/' | relative_url }}).
- **AI for SRE.** How should agents be evaluated when diagnosis and recovery happen inside live reliability conditions? See [SREGym](https://www.sregym.com/).
- **Trustworthy AI.** How can we inspect agent choices, security boundaries, and evidence when the final answer still looks acceptable? See [SHIFT]({{ '/projects/research-reagent-plus-plus/' | relative_url }}).

More on the [research page]({{ '/research/' | relative_url }}).

## Education

- **University of Alberta**, M.Sc. in Computing Science, September 2026 to present. U-A-Goose group, supervised by [Dr. Zhou Yang](https://apps.ualberta.ca/directory/person/zy25).
- **Bangladesh University of Engineering and Technology (BUET)**, B.Sc. in Computer Science and Engineering, April 2018 to May 2023.

## Selected projects

<div class="row row-cols-1 row-cols-md-2 g-3 mb-3">
  <div class="col">
    <div class="card h-100"><div class="card-body">
      <h5 class="card-title"><a href="{{ '/projects/ctxhelm/' | relative_url }}">ctxhelm</a></h5>
      <p class="card-text">Local-first context plans, release proof, and source-free agent evaluation.</p>
    </div></div>
  </div>
  <div class="col">
    <div class="card h-100"><div class="card-body">
      <h5 class="card-title"><a href="{{ '/projects/contextledger/' | relative_url }}">ContextLedger</a></h5>
      <p class="card-text">A research notebook on OpenCode compaction, provenance, and live GPT-5.5 experiments.</p>
    </div></div>
  </div>
  <div class="col">
    <div class="card h-100"><div class="card-body">
      <h5 class="card-title"><a href="{{ '/projects/patchsmith/' | relative_url }}">PatchSmith</a></h5>
      <p class="card-text">System design and R&amp;D notes for bounded patches, sandbox validation, and auditable repair runs.</p>
    </div></div>
  </div>
  <div class="col">
    <div class="card h-100"><div class="card-body">
      <h5 class="card-title"><a href="{{ '/projects/1brc-csharp/' | relative_url }}">1BRC C# on Apple Silicon</a></h5>
      <p class="card-text">A .NET 10 NativeAOT performance case study: byte parsing, native aggregation, and ARM64 tuning.</p>
    </div></div>
  </div>
</div>

[All projects]({{ '/projects/' | relative_url }})
