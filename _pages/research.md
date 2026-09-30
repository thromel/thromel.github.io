---
layout: page
title: research
permalink: /research/
description: Research on reliable AI agents, SRE-agent evaluation, ML ecosystem security, agent-choice auditing, and developer tools.
nav: true
nav_order: 3
scholar_id: zHV4EU8AAAAJ
---

<p class="text-muted text-uppercase small">Research dossier</p>
<h2>AI agents in real software systems</h2>
<p class="lead">{{ site.data.research.agenda.thesis }} {{ site.data.research.agenda.trajectory }}</p>
<p>
  <a class="btn btn-sm z-depth-0" role="button" href="{{ '/publications/' | relative_url }}">Publication record</a>
  <a class="btn btn-sm z-depth-0" role="button" href="{{ '/assets/pdf/cv.pdf' | relative_url }}">CV</a>
  <a class="btn btn-sm z-depth-0" role="button" href="https://scholar.google.com/citations?user={{ page.scholar_id }}" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar profile (opens in a new tab)">Scholar profile</a>
</p>

<h3 class="mt-4">Questions, artifacts, and what the evidence supports</h3>
<p class="text-muted text-uppercase small">Evidence anchors</p>

{% for anchor in site.data.research.anchors %}
<div class="card mb-4" id="{{ anchor.id }}" data-research-anchor="{{ anchor.id }}" data-verified-on="{{ anchor.last_verified }}" data-publicity="{{ anchor.publicity | default: 'public' }}">
  {% if anchor.image %}
  <figure class="text-center m-0 p-3">
    <img class="img-fluid rounded{% if anchor.image_kind == 'mark' %} w-25{% endif %}" src="{{ anchor.image | relative_url }}"{% if anchor.image_sources %} srcset="{% for source in anchor.image_sources %}{{ source.path | relative_url }} {{ source.width }}w{% unless forloop.last %}, {% endunless %}{% endfor %}" sizes="{{ anchor.image_sizes }}"{% endif %} alt="{{ anchor.image_alt }}" width="{{ anchor.image_width }}" height="{{ anchor.image_height }}" loading="lazy" decoding="async" data-research-visual>
    {% if anchor.image_caption %}<figcaption class="text-muted small mt-2">{{ anchor.image_caption }}</figcaption>{% endif %}
  </figure>
  {% endif %}
  <div class="card-body">
    <p class="text-muted text-uppercase small mb-1">0{{ forloop.index }} · {{ anchor.label }}</p>
    <p class="font-italic" data-research-question>{{ anchor.question }}</p>
    <h4 class="card-title">{{ anchor.title }}</h4>
    <p class="card-text">{{ anchor.description }}</p>
    <table class="table table-sm table-borderless">
      <tbody>
        <tr><th scope="row" class="w-25">Status</th><td data-research-status>{{ anchor.status }}</td></tr>
        <tr><th scope="row">Context</th><td data-research-context>{{ anchor.context }}</td></tr>
        <tr><th scope="row">Last verified</th><td><time datetime="{{ anchor.last_verified }}">{{ anchor.last_verified }}</time></td></tr>
      </tbody>
    </table>
    {% if anchor.publicity == 'abstract-only' %}<p class="small text-muted">The manuscript is not public; this record is deliberately limited to an abstract-level summary.</p>{% endif %}
    <p class="mb-0">{% for link in anchor.links limit:3 %}<a class="btn btn-sm z-depth-0" role="button" href="{{ link.url | relative_url }}"{% if link.url contains '://' %} target="_blank" rel="noopener noreferrer" aria-label="{{ link.label | escape }} for {{ anchor.title | escape }} (opens in a new tab)"{% endif %}>{{ link.label }}</a> {% endfor %}</p>
  </div>
</div>
{% endfor %}

<h3 class="mt-5">The instrumentation around the research</h3>
<p class="text-muted text-uppercase small">Supporting systems</p>
<p>These systems make the agent’s context, choices, and program-level effects more inspectable.</p>
<div class="table-responsive">
<table class="table table-hover" data-research-systems>
  <thead><tr><th scope="col">System</th><th scope="col">Status</th><th scope="col">Role</th></tr></thead>
  <tbody>
    {% for system in site.data.research.supporting_systems %}
    <tr>
      <td><a href="{{ system.url | relative_url }}"{% if system.url contains '://' %} target="_blank" rel="noopener noreferrer" aria-label="{{ system.name | escape }} (opens in a new tab)"{% endif %}>{{ system.name }}</a></td>
      <td>{{ system.status }}</td>
      <td>{{ system.role }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
</div>

<h3 class="mt-5">Work with me on an artifact, question, or evaluation</h3>
<p class="text-muted text-uppercase small">Collaboration</p>
<p>{{ site.data.research.contact.copy }}</p>
<p>
  <a class="btn btn-sm z-depth-0" role="button" href="mailto:{{ site.email }}">Start a conversation</a>
  <a class="btn btn-sm z-depth-0" role="button" href="{{ '/contributions/' | relative_url }}">Open-source contributions</a>
</p>
