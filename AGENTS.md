# AGENTS.md

This file provides guidance for agentic coding assistants working on the BrowserMark codebase.

## Project Overview

BrowserMark is a browser-based markdown-to-document converter that generates PDF, DOCX, and MHTML files with diagram support. Deployed via Cloudflare Workers.

**Tech Stack:** Vite build system, ES6 modules, Vitest testing, Cloudflare Workers deployment

**Key Libraries:**
- Marked (markdown parsing)
- html2pdf.js (PDF generation)
- DocShift (DOCX generation)
- Mermaid, Viz.js, Nomnoml, Pikchr (diagram rendering)

## Commands

### Development
```bash
# Local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare Workers
npx wrangler deploy
```

### Testing
```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run a single test file
npx vitest run path/to/test.test.js

# Run tests matching a pattern
npx vitest run -t "test name or pattern"
```

## Code Style Guidelines

### File Organization
- **src/**: All source code
  - **renderers/**: Diagram renderer modules
  - **utils/**: Utility functions (helpers, processors)
- **tests/**: Mirror src structure for tests (*.test.js)
- **dist/**: Build output (generated, do not edit)

### JavaScript Conventions

**Imports/Exports:**
- Use ES6 `import`/`export` (default exports for main modules, named for utilities)
- Dynamic imports for lazy loading: `const module = await import('./module.js');`
- No CDN script tags - all dependencies via npm

**Classes:**
- PascalCase: `class DiagramManager { ... }`
- Constructor initializes state
- Methods: camelCase (`renderDiagram`, `supportsLanguage`)
- Private methods: underscore prefix (`_notifyLoadingComplete`)
- Export classes: `export class DiagramManager { ... }`

**Functions:**
- camelCase: `sanitizeFilename()`, `extractCodeBlocks()`
- Descriptive names
- JSDoc comments for public APIs:
  ```javascript
  /**
   * Render a diagram using the appropriate renderer
   * @param {string} language - The diagram language (case-insensitive)
   * @param {string} code - The diagram code to render
   * @returns {Promise<SVGSVGElement>} - The rendered SVG element
   */
  async renderDiagram(language, code) { ... }
  ```

**Error Handling:**
- Try-catch around async operations
- Throw descriptive errors: `throw new Error('No loader found for language: ${language}')`
- Console error with context: `console.error('Diagram render error:', error);`

**Variables:**
- camelCase: `headerText`, `includePageNumbers`, `rendererLoaders`
- `const` by default, `let` when reassignment needed
- Descriptive names over brevity

**Types:**
- No TypeScript - use JSDoc for type hints
- Type hints in comments: `@param {string} language`, `@returns {Promise<SVGElement>}`

### Testing Conventions

**Test File Structure:**
- Naming: `*.test.js` in `tests/` directory
- Mirror src structure: `tests/renderers/mermaidRenderer.test.js`

**Test Patterns:**
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiagramManager } from '../src/DiagramManager.js';

describe('Feature name', () => {
  let manager;

  beforeEach(() => {
    manager = new DiagramManager();
  });

  it('should do something', () => {
    expect(result).toBe(expected);
  });

  it('should handle error cases', async () => {
    await expect(promise).rejects.toThrow('error message');
  });
});
```

**Best Practices:**
- Use `describe` to group related tests
- Use `beforeEach` for test setup
- Use `expect` assertions (not console.log)
- Test both success and error cases
- Mock external dependencies
- Test async functions with `async/await` and `await expect()`

### HTML/CSS Conventions

**HTML:**
- IDs for unique elements: `markdown-input`, `preview-content`
- Classes for reusable patterns: `options-panel`, `word-headers`
- Hyphen-separated: `data-tab="headers"`

**CSS:**
- CSS variables: `--header-text`, `--show-link-urls`
- Print media queries: `@media print`
- Flexbox for layout
- ID selectors for main elements, class for components

## Naming Conventions

- **Classes:** PascalCase (DiagramManager, MermaidRenderer)
- **Functions/Methods:** camelCase (renderDiagram, sanitizeFilename)
- **Variables:** camelCase (headerText, includePageNumbers)
- **Private methods:** _camelCase (_notifyLoadingComplete)
- **Constants:** UPPER_SNAKE_CASE (use sparingly)
- **Files:** camelCase (DiagramManager.js, mermaidRenderer.js)

## Key Patterns

### Dynamic Import Pattern
```javascript
async loadRenderer(language) {
  const module = await import('./renderer.js');
  const RendererClass = module[Object.keys(module)[0]];
  return new RendererClass();
}
```

### localStorage
Key naming: `browsermark-{feature}`
JSON serialization: `JSON.parse(localStorage.getItem('key') || '[]')`

### Error Propagation
Throw errors from utilities, catch in UI layer for user-friendly alerts

## External Library Usage

- **Marked:** `marked.parse(text)` for markdown → HTML
- **Vitest:** Test framework with jsdom environment
- **html2pdf.js:** `html2pdf().set(opt).from(element).toPdf()`
- **DocShift:** `window.docshift.toDocx(html)`

## Browser Compatibility

Modern browsers supporting:
- ES6 modules
- Async/await
- File APIs (Blob, URL.createObjectURL)
- Canvas API

No IE support required.

## Important Notes

- Build step: Vite bundles and optimizes code
- No linting tools configured - maintain consistency manually
- Tests use jsdom environment for DOM simulation
- All npm dependencies, no CDN imports in source code
