---
layout: archive
title: "Blog"
permalink: /blog/
author_profile: true
---

{% include base_path %}

Welcome to my blog! Here, I share my thoughts, experiences, and insights on:
* Technical deep-dives into software engineering
* Paper reviews and research insights
* Book summaries and learning experiences
* Industry trends and best practices

## Latest Posts

{% for post in site.blog reversed %}
  {% include archive-single.html %}
{% endfor %} 