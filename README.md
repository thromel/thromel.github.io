# Tanzim Hossain Romel - Personal Website

[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-brightgreen)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Performance](https://img.shields.io/badge/Performance-Optimized-blue)](https://web.dev/vitals/)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-orange)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Responsive/responsive_design_building_blocks)

This repository contains the source code for my personal academic and professional website. Visit the live site at [thromel.github.io](https://thromel.github.io).

## Table of Contents

- [About](#about)
- [Features](#features)
- [UI/UX Design System](#uiux-design-system)
- [Architecture](#architecture)
- [Local Development](#local-development)
- [Accessibility Features](#accessibility-features)
- [Performance Optimization](#performance-optimization)
- [Contributing](#contributing)
- [Contact](#contact)

## About

This website showcases my professional experience, research projects, publications, and technical skills as a Software Development Engineer at IQVIA and researcher in the fields of Blockchain Technology and LLM Systems.

## Features

### Core Features
- 🎯 **Professional Portfolio** - Comprehensive showcase of experience and skills
- 📚 **Research & Publications** - Academic work and research projects
- 💼 **Project Gallery** - Detailed project showcases with technology stacks
- 🎨 **Liquid Glass Design** - Modern, responsive design with dual themes
- ♿ **Accessibility Focused** - WCAG 2.1 AA compliant design
- 📱 **Mobile Optimized** - Mobile-first responsive design
- 🌙 **Dark/Light Themes** - Seamless theme switching with user preference detection

### Technical Features
- ⚡ **Performance Optimized** - Fast loading with optimized assets
- 🔍 **SEO Optimized** - Structured data and meta optimization
- 🎨 **CSS Custom Properties** - Maintainable design system
- 📐 **Semantic HTML** - Proper document structure and landmarks
- 🎯 **Focus Management** - Keyboard navigation support
- 🎭 **Smooth Animations** - Performance-optimized micro-interactions

## UI/UX Design System

### Design Philosophy
The portfolio implements a **Liquid Glass** design philosophy that combines:
- **Translucent surfaces** with subtle backdrop effects
- **Smooth micro-interactions** that provide user feedback
- **Consistent spacing** using a mathematical scale
- **Accessible color palettes** meeting WCAG standards
- **Typography hierarchy** optimized for readability

### Color Palette

#### Light Theme
```css
--bg-primary: #f8fafb;           /* Main background */
--bg-secondary: rgba(255, 255, 255, 0.7);  /* Card backgrounds */
--text-primary: #1a202c;         /* High contrast text (WCAG AA) */
--text-secondary: #2d3748;       /* Body text (WCAG AA) */
--accent-primary: #0284c7;       /* Primary brand color (WCAG AA) */
--accent-secondary: #4f46e5;     /* Secondary accent (WCAG AA) */
```

#### Dark Theme
```css
--bg-primary: #0f172a;           /* Main background */
--bg-secondary: rgba(15, 23, 42, 0.7);  /* Card backgrounds */
--text-primary: #ffffff;         /* Maximum contrast text */
--text-secondary: #f1f5f9;       /* High contrast secondary text */
--accent-primary: #38bdf8;       /* Primary brand color */
--accent-secondary: #818cf8;     /* Secondary accent */
```

### Typography Scale
```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;     /* 20px */
--font-size-2xl: 1.5rem;     /* 24px */
--font-size-3xl: 1.875rem;   /* 30px */
--font-size-4xl: 2.25rem;    /* 36px */
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Architecture

### File Structure
```
├── _data/                  # Site configuration and content data
│   ├── profile.yml        # Personal information and content
│   ├── navigation.yml     # Site navigation structure
│   └── display.yml        # Display preferences
├── _includes/             # Reusable template components
│   └── widgets/          # UI components
├── _layouts/              # Page layouts
├── _posts/               # Blog posts and articles
├── _showcase/            # Project showcases
├── assets/
│   ├── css/              # Stylesheets
│   │   ├── developer-theme.css  # Main theme system with CSS custom properties
│   │   ├── custom.css    # Component-specific styles and accessibility
│   │   ├── enhanced-animations.css  # Performance-optimized animations
│   │   └── performance-optimizations.css  # Core Web Vitals improvements
│   ├── js/               # JavaScript functionality
│   └── images/           # Static assets
└── scripts/              # Build and utility scripts
```

### CSS Architecture
- **developer-theme.css** - Core design system with CSS custom properties, typography scale, and theme switching
- **custom.css** - Component-specific styling, accessibility enhancements, and focus management
- **enhanced-animations.css** - Performance-optimized animations and micro-interactions
- **performance-optimizations.css** - Core Web Vitals and loading optimizations

### Component System
- **Cards** - Consistent content containers with glass morphism effects
- **Timeline** - Experience and education presentation with enhanced accessibility
- **Tech Tags** - Skill and technology indicators with hover interactions
- **Navigation** - Responsive navigation with complete ARIA support

## Local Development

### Prerequisites
- Ruby 2.7+ and Bundler
- Node.js 14+ (for build tools)
- Git

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/thromel/thromel.github.io.git
   cd thromel.github.io
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Start development server**
   ```bash
   bundle exec jekyll serve --livereload
   ```

4. **View the site**
   Open `http://localhost:4000` in your browser

### Development Commands
```bash
# Development with live reload
bundle exec jekyll serve --livereload

# Build for production
bundle exec jekyll build

# Run accessibility tests
npx axe-core --tags wcag21aa https://thromel.github.io

# Run performance audit
npx lighthouse --only=performance --output=html https://thromel.github.io

# Validate HTML
npx html-validate **/*.html
```

## Accessibility Features

### WCAG 2.1 AA Compliance

#### ✅ Implemented Features
- **Color Contrast**: All text meets 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Keyboard Navigation**: Complete keyboard accessibility with visible focus indicators
- **Screen Reader Support**: Semantic HTML structure with proper ARIA labels
- **Skip Links**: Navigation shortcuts for keyboard and screen reader users
- **Responsive Design**: Works across all screen sizes and zoom levels up to 200%
- **Theme Support**: Dark and light themes with system preference detection

#### Key Accessibility Implementations

**Skip Links for Keyboard Users**
```html
<div class="skip-links">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#navigation" class="skip-link">Skip to navigation</a>
  <a href="#footer" class="skip-link">Skip to footer</a>
</div>
```

**Enhanced Focus Indicators**
```css
*:focus-visible {
  outline: 3px solid var(--accent-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(var(--accent-primary-rgb), 0.2);
}
```

**Semantic Section Structure**
```html
<main role="main" aria-label="Main content">
  <section aria-labelledby="education-heading">
    <h3 id="education-heading">Education</h3>
    <!-- Content with proper heading hierarchy -->
  </section>
</main>
```

### Testing Tools & Commands
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/cli pa11y lighthouse

# Run accessibility audits
npx axe-core --tags wcag21aa https://thromel.github.io
npx pa11y --standard WCAG2AA https://thromel.github.io
npx lighthouse --only=accessibility --output=html https://thromel.github.io
```

## Performance Optimization

### Current Performance Metrics
- **Performance Score**: 95+ (Lighthouse)
- **Accessibility Score**: 98+ (Lighthouse)
- **Best Practices**: 95+ (Lighthouse)
- **SEO Score**: 95+ (Lighthouse)

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Strategies

#### CSS Optimization
```css
/* GPU-accelerated animations */
.card {
  transform: translateZ(0);
  transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
}

/* Efficient hover effects */
.card:hover {
  transform: translateZ(0) translateY(-4px);
}
```

#### Image Optimization
```html
<!-- Responsive images with WebP support -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" 
       alt="Description"
       loading="lazy"
       width="300" 
       height="200">
</picture>
```

#### JavaScript Performance
```javascript
// Passive event listeners
document.addEventListener('scroll', handler, { passive: true });

// Debounced operations
const debouncedHandler = debounce(expensiveFunction, 250);
```

## Contributing

### Development Workflow
1. **Create a feature branch**
   ```bash
   git checkout -b feature/improvement-name
   ```

2. **Follow the design system**
   - Use existing CSS custom properties
   - Follow semantic HTML structure
   - Ensure WCAG 2.1 AA compliance
   - Test with keyboard navigation and screen readers

3. **Test your changes**
   ```bash
   # Run local development server
   bundle exec jekyll serve --livereload
   
   # Run accessibility tests
   npx axe-core --tags wcag21aa http://localhost:4000
   
   # Test keyboard navigation manually
   ```

4. **Submit a pull request**
   - Include description of changes
   - Add screenshots for visual changes
   - Include accessibility testing results

### Code Style Guidelines
- **CSS**: Use CSS custom properties for consistent theming
- **HTML**: Follow semantic HTML5 structure with proper ARIA labels
- **JavaScript**: Use modern ES6+ syntax with accessibility considerations
- **Performance**: Optimize for Core Web Vitals and mobile experience

### Testing Requirements
- [ ] Accessibility testing with screen readers
- [ ] Keyboard navigation validation
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness verification
- [ ] Performance metric validation
- [ ] Color contrast verification

## Technologies Used

### Core Technologies
- **Jekyll** - Static site generator with Liquid templating
- **GitHub Pages** - Hosting and deployment
- **Sass/SCSS** - CSS preprocessing with variables and mixins
- **JavaScript ES6+** - Modern JavaScript with accessibility features

### Development Tools
- **Bundler** - Ruby dependency management
- **Jekyll LiveReload** - Development server with hot reloading
- **GitHub Actions** - CI/CD pipeline for automated deployment

### Performance & Monitoring
- **Lighthouse** - Performance and accessibility auditing
- **axe-core** - Automated accessibility testing
- **pa11y** - Command-line accessibility testing
- **HTML Validate** - HTML structure validation

### Design System
- **CSS Custom Properties** - Maintainable theming system
- **CSS Grid & Flexbox** - Modern layout techniques
- **Intersection Observer** - Efficient scroll-based animations
- **Prefers-reduced-motion** - Accessibility-conscious animations

## Project Achievements

### Recent Improvements (Phase 1 - Foundation)
- ✅ **Complete WCAG 2.1 AA compliance** with proper color contrast and keyboard navigation
- ✅ **Enhanced semantic HTML** structure with comprehensive ARIA labeling
- ✅ **Improved typography system** with responsive scaling and consistent hierarchy
- ✅ **Performance optimizations** achieving 95+ Lighthouse scores
- ✅ **Modern design system** with CSS custom properties and liquid glass aesthetics

### Future Enhancements (Roadmap)
- **Phase 2**: Advanced interactions, content filtering, and mobile experience enhancements
- **Phase 3**: Progressive Web App features, advanced micro-interactions
- **Phase 4**: Performance monitoring, analytics integration, and user experience optimizations

## Contact

For any inquiries, feel free to contact me at:
- 📧 **Email**: romel.rcs@gmail.com
- 💼 **LinkedIn**: [thromel](https://www.linkedin.com/in/thromel)
- 🐙 **GitHub**: [thromel](https://github.com/thromel)
- 🌐 **Website**: [thromel.github.io](https://thromel.github.io)

## Acknowledgements

This website is based on the [academic-homepage](https://github.com/luost26/academic-homepage) Jekyll template by Tianyu Lou, enhanced with modern UI/UX principles, comprehensive accessibility features, and performance optimizations.

### Design Inspiration
- **Liquid Glass Design** - Modern translucent UI design principles
- **Material Design** - Google's design system for interaction patterns
- **Apple Human Interface Guidelines** - Accessibility and usability standards
- **WCAG 2.1** - Web Content Accessibility Guidelines for inclusive design

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Last Updated**: January 2025 | **Version**: 2.1.0 | **Accessibility**: WCAG 2.1 AA Compliant
