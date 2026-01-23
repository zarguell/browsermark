# AGENTS.md

This file provides guidance for agentic coding assistants working on the BrowserMark codebase.

## Project Overview

BrowserMark is a browser-based markdown-to-document converter that generates PDF, DOCX, and MHTML files. It runs entirely in the browser with no backend, deployed via Cloudflare Workers for global CDN hosting.

**Tech Stack:** Pure HTML/CSS/JavaScript (no build step), ES6 modules, Cloudflare Workers deployment

**Key Libraries:**
- Marked (markdown parsing)
- html2pdf.js (PDF generation)
- DocShift (DOCX generation)

## Commands

### Development
```bash
# Local development server
npx wrangler dev

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### Testing
No automated test framework is currently configured. Manual testing involves:
1. Opening the app locally via `npx wrangler dev`
2. Testing markdown rendering in real-time preview
3. Exporting to PDF/DOCX/MHTML formats
4. Verifying headers, footers, page numbers, and styling options

## Code Style Guidelines

### File Organization
- **src/**: All source code (HTML, CSS, JS modules)
- **index.html**: Main UI structure with CDN script imports
- **app.js**: Main application logic and event handlers
- **pdf-generator.js**: PDF export using html2pdf.js
- **docx-generator.js**: DOCX export using DocShift
- **mhtml-generator.js**: MHTML export with image embedding
- **snippet-library.js**: Reusable snippets saved to localStorage
- **styles.css**: All styling including print media queries

### JavaScript Conventions

**Imports:**
- No ES6 imports - scripts are loaded via `<script>` tags in index.html
- Export classes to `window` object: `window.PDFGenerator = PDFGenerator;`

**Classes:**
- Use ES6 class syntax for generators and libraries
- Constructor initializes state and options
- Methods follow camelCase naming
- Separate UI creation methods from logic methods (e.g., `createModal()` vs `addItem()`)

**Functions:**
- camelCase for function names
- Prefer descriptive names: `sanitizeFilename()`, `extractFirstHeader()`
- Utility functions defined at module level, not inside classes

**Error Handling:**
- Try-catch blocks around async operations
- Console error with context: `console.error('PDF Generation Error:', err);`
- User-facing alerts for failures: `alert('Failed: ' + error.message);`
- Graceful fallbacks (e.g., default filename if sanitization fails)

**Event Listeners:**
- Register in `DOMContentLoaded` event in app.js
- Arrow functions for callbacks to preserve `this` context where needed
- Event delegation for dynamically created elements

**Variables:**
- camelCase naming
- Const by default, let when reassignment needed
- Descriptive names: `includePageNumbers`, `headerText`

### HTML/CSS Conventions

**HTML:**
- Semantic elements: use IDs for major elements, classes for repeated patterns
- Hyphen-separated IDs/classes: `preview-content`, `markdown-input`, `options-panel`
- Data attributes for state: `data-tab="headers"`

**CSS:**
- Use CSS variables for theming and configuration: `--header-text`, `--show-link-urls`
- Mobile-first with media queries for print: `@media print`
- Print CSS hides UI elements and sets page margins
- Flexbox for layout, grid not currently used
- Specificity: use ID selectors for main layout elements, class for reusable components

### Styling Patterns

**Export-Specific Classes:**
- `.word-headers`: Applies Word-style header colors (#2E75B6, #5B9BD5, #4472C4)
- `.font-*`: Font family variants (calibri, times, arial, default)

**Print CSS:**
- Separate @page rules for margin setup
- CSS variables control header/footer/page-number visibility
- Hide UI with `display: none !important`

## Key Patterns

### Generators
All export generators share this structure:
```javascript
class Generator {
    constructor() {
        this.options = {};
        this.styles = { /* inline styles */ };
    }
    setOptions(...) { /* update options */ }
    async generate(element, filename) { /* export logic */ }
}
window.Generator = Generator;
```

### localStorage
Key naming: `browsermark-{feature}` (e.g., `browsermark-headers`)
JSON serialization for array storage
Null coalescing for missing keys: `JSON.parse(localStorage.getItem('key') || '[]')`

### Dynamic UI
Create elements programmatically using `document.createElement()`
Set innerHTML for template strings, then attach event listeners
Use `insertAtCursor()` helper for textarea text insertion

## Naming Conventions

- **Classes:** PascalCase (PDFGenerator, SnippetLibrary)
- **Functions/Methods:** camelCase (generatePDF, sanitizeFilename)
- **Variables:** camelCase (headerText, includePageNumbers)
- **Constants:** UPPER_SNAKE_CASE (not heavily used, but preferred for constants)
- **IDs:** kebab-case (markdown-input, preview-content)
- **Classes:** kebab-case (options-panel, word-headers)

## External Library Usage

- **Marked:** `marked.parse(text)` for markdown → HTML conversion
- **html2pdf.js:** Library loaded from CDN, used via `html2pdf().set(opt).from(element).toPdf()`
- **DocShift:** `window.docshift.toDocx(html)` for HTML → DOCX conversion

## Browser Compatibility

Target modern browsers supporting:
- ES6+ syntax (classes, arrow functions, template literals)
- File APIs (Blob, URL.createObjectURL)
- Canvas API (for PDF rendering)
- localStorage API

No IE support required.

## Deployment Notes

- Wrangler CLI for Cloudflare Workers deployment
- Source directory: `src/` (configured in wrangler.jsonc)
- Static file serving, no build process
- CDN URL: https://browsermark.useast01.workers.dev/

## Important: No Build Step

This project intentionally has no build process (no Webpack, Vite, etc.). All code is loaded directly in the browser. Do not add package.json or build configuration unless explicitly required for the feature you're adding.
