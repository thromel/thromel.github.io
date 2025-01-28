---
permalink: /bookmarks/
title: "Useful Bookmarks"
excerpt: "A curated collection of useful resources and tools"
author_profile: true
---

<!-- Add Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

A curated collection of resources, tools, and references that I find valuable for software development, research, and continuous learning. Feel free to explore and bookmark these for your own use!

<div class="bookmarks-grid" markdown="0">
  <div class="bookmark-category">
    <h3><i class="fas fa-cloud"></i> Cloud & DevOps</h3>
    <ul>
      <li><a href="https://12factor.net/" target="_blank">The Twelve-Factor App</a> - Best practices for building cloud-native applications</li>
      <li><a href="https://aws.amazon.com/architecture/well-architected/" target="_blank">AWS Well-Architected Framework</a> - Cloud architecture best practices</li>
      <li><a href="https://kubernetes.io/docs/home/" target="_blank">Kubernetes Documentation</a> - Official K8s documentation</li>
      <li><a href="https://docs.microsoft.com/en-us/azure/architecture/patterns/" target="_blank">Cloud Design Patterns</a> - Microsoft's cloud architecture patterns</li>
    </ul>
  </div>

  <div class="bookmark-category">
    <h3><i class="fas fa-code"></i> Software Engineering</h3>
    <ul>
      <li><a href="https://martinfowler.com/" target="_blank">Martin Fowler's Blog</a> - Software architecture and design patterns</li>
      <li><a href="https://refactoring.guru/" target="_blank">Refactoring Guru</a> - Design patterns and refactoring techniques</li>
      <li><a href="https://www.patterns.dev/" target="_blank">Patterns.dev</a> - Modern web app design patterns</li>
      <li><a href="https://microservices.io/" target="_blank">Microservices.io</a> - Microservices architecture patterns</li>
    </ul>
  </div>

  <div class="bookmark-category">
    <h3><i class="fas fa-brain"></i> Research & Learning</h3>
    <ul>
      <li><a href="https://arxiv.org/list/cs.SE/recent" target="_blank">arXiv CS.SE</a> - Latest software engineering research papers</li>
      <li><a href="https://paperswithcode.com/" target="_blank">Papers with Code</a> - ML papers with implementations</li>
      <li><a href="https://dl.acm.org/" target="_blank">ACM Digital Library</a> - Computer science research papers</li>
      <li><a href="https://scholar.google.com/" target="_blank">Google Scholar</a> - Academic research search engine</li>
    </ul>
  </div>

  <div class="bookmark-category">
    <h3><i class="fas fa-tools"></i> Tools & Resources</h3>
    <ul>
      <li><a href="https://excalidraw.com/" target="_blank">Excalidraw</a> - System design diagrams</li>
      <li><a href="https://www.figma.com/" target="_blank">Figma</a> - UI/UX design tool</li>
      <li><a href="https://roadmap.sh/" target="_blank">roadmap.sh</a> - Developer roadmaps</li>
      <li><a href="https://devdocs.io/" target="_blank">DevDocs</a> - API documentation browser</li>
    </ul>
  </div>

  <div class="bookmark-category">
    <h3><i class="fas fa-graduation-cap"></i> Academic Resources</h3>
    <ul>
      <li><a href="https://www.overleaf.com/" target="_blank">Overleaf</a> - LaTeX editor for academic writing</li>
      <li><a href="https://www.mendeley.com/" target="_blank">Mendeley</a> - Reference manager</li>
      <li><a href="https://www.zotero.org/" target="_blank">Zotero</a> - Research assistant</li>
      <li><a href="https://www.connectedpapers.com/" target="_blank">Connected Papers</a> - Explore connected research papers</li>
    </ul>
  </div>

  <div class="bookmark-category">
    <h3><i class="fas fa-laptop-code"></i> Programming Resources</h3>
    <ul>
      <li><a href="https://leetcode.com/" target="_blank">LeetCode</a> - Coding practice and interviews</li>
      <li><a href="https://www.hackerrank.com/" target="_blank">HackerRank</a> - Coding challenges</li>
      <li><a href="https://exercism.org/" target="_blank">Exercism</a> - Code practice and mentorship</li>
      <li><a href="https://www.codewars.com/" target="_blank">Codewars</a> - Programming challenges</li>
    </ul>
  </div>
</div>

<style>
.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.bookmark-category {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bookmark-category h3 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bookmark-category i {
  font-size: 0.9em;
}

.bookmark-category ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.bookmark-category li {
  margin-bottom: 0.8rem;
}

.bookmark-category a {
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.bookmark-category a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}
</style> 