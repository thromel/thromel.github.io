class SiteSearch {
    constructor() {
        this.searchData = [];
        this.searchIndex = [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            await this.loadSearchData();
            this.buildSearchIndex();
            this.setupSearchUI();
            this.isInitialized = true;
        } catch (error) {
            console.error('Search initialization failed:', error);
        }
    }

    async loadSearchData() {
        const response = await fetch('/search.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.searchData = await response.json();
    }

    buildSearchIndex() {
        this.searchIndex = this.searchData.map((item, index) => ({
            ...item,
            searchText: this.createSearchText(item),
            index: index
        }));
    }

    createSearchText(item) {
        return [
            item.title,
            item.excerpt,
            item.content,
            item.categories ? item.categories.join(' ') : '',
            item.tags ? item.tags.join(' ') : ''
        ].join(' ').toLowerCase();
    }

    search(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const results = [];

        for (const item of this.searchIndex) {
            let score = 0;
            let titleMatches = 0;
            let contentMatches = 0;

            for (const term of searchTerms) {
                const titleMatch = item.title.toLowerCase().includes(term);
                const contentMatch = item.searchText.includes(term);

                if (titleMatch) {
                    titleMatches++;
                    score += 10;
                }
                if (contentMatch) {
                    contentMatches++;
                    score += 1;
                }
            }

            if (score > 0) {
                results.push({
                    ...item,
                    score: score,
                    titleMatches: titleMatches,
                    contentMatches: contentMatches
                });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    setupSearchUI() {
        const searchModal = this.createSearchModal();
        document.body.appendChild(searchModal);

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
        });

        const searchInput = document.getElementById('site-search-input');
        const searchResults = document.getElementById('site-search-results');

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const results = this.search(e.target.value);
                this.displayResults(results, searchResults);
            }, 300);
        });

        searchInput.addEventListener('keydown', (e) => {
            const activeResult = document.querySelector('.search-result.active');
            const allResults = document.querySelectorAll('.search-result');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = activeResult ? activeResult.nextElementSibling : allResults[0];
                if (next && next.classList.contains('search-result')) {
                    this.setActiveResult(next);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = activeResult ? activeResult.previousElementSibling : allResults[allResults.length - 1];
                if (prev && prev.classList.contains('search-result')) {
                    this.setActiveResult(prev);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeResult) {
                    const link = activeResult.querySelector('a');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            }
        });
    }

    createSearchModal() {
        const modal = document.createElement('div');
        modal.id = 'search-modal';
        modal.className = 'search-modal';
        modal.innerHTML = `
            <div class="search-modal-backdrop" onclick="siteSearch.closeSearchModal()"></div>
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="site-search-input" placeholder="Search posts, projects, publications..." autocomplete="off">
                        <span class="search-shortcut">Ctrl+K</span>
                    </div>
                    <button class="search-close-btn" onclick="siteSearch.closeSearchModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-modal-body">
                    <div id="site-search-results" class="search-results"></div>
                </div>
                <div class="search-modal-footer">
                    <div class="search-tips">
                        <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                        <span><kbd>Enter</kbd> to select</span>
                        <span><kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    displayResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        const html = results.map((result, index) => `
            <div class="search-result ${index === 0 ? 'active' : ''}" data-url="${result.url}">
                <a href="${result.url}" onclick="siteSearch.closeSearchModal()">
                    <div class="search-result-header">
                        <h4 class="search-result-title">${this.highlightMatches(result.title, result.titleMatches > 0)}</h4>
                        <span class="search-result-type">${result.type}</span>
                    </div>
                    <p class="search-result-excerpt">${this.truncateText(result.excerpt, 120)}</p>
                    ${result.date ? `<div class="search-result-date">${result.date}</div>` : ''}
                </a>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    highlightMatches(text, hasMatch) {
        return hasMatch ? `<mark>${text}</mark>` : text;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    setActiveResult(element) {
        document.querySelectorAll('.search-result.active').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    openSearchModal() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('site-search-input');
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            input.focus();
        }, 100);
    }

    closeSearchModal() {
        const modal = document.getElementById('search-modal');
        const input = document.getElementById('site-search-input');
        const results = document.getElementById('site-search-results');
        
        modal.style.display = 'none';
        document.body.style.overflow = '';
        input.value = '';
        results.innerHTML = '';
    }
}

let siteSearch;
document.addEventListener('DOMContentLoaded', () => {
    siteSearch = new SiteSearch();
});