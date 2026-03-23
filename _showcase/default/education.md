---
show: false
width: 6
date: 2020-01-12 00:01:00 +0800
---
<div class="m-4">
    <h5>Education</h5>
    <ul class="list-unstyled mb-1">
        {% for item in site.data.profile.education %}
        <li class="media mb-3 education-list-item">
            {% if item.logo %}
            <img src="{{ item.logo | relative_url }}" alt="{{ item.name }} badge" class="education-list-logo">
            {% endif %}
            <div class="media-body education-list-copy">
                <div class="education-list-name">{{ item.name }}</div>
                <div class="small d-flex education-list-meta">
                    <div>
                        {{ item.position }}
                        {% if item.status %}
                        <span class="education-status-badge">{{ item.status }}</span>
                        {% endif %}
                    </div>
                    <div class="mt-auto ml-auto no-break"><em>{{ item.date }}</em></div>
                </div>
            </div>
        </li>
        {% endfor %}
    </ul>
</div>
