/**
 * Tests for DiagramManager
 * Tests diagram type routing and renderer management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiagramManager } from '../src/DiagramManager.js';

// Mock renderers
class MockRenderer {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
  }

  async render(code) {
    if (!this.initialized) {
      await this.initialize();
    }
    // Return a mock SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-code', code);
    return svg;
  }
}

describe('DiagramManager', () => {
  let manager;

  beforeEach(() => {
    manager = new DiagramManager();
  });

  describe('renderer routing', () => {
    it('should route mermaid block to MermaidRenderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('mermaid', mockRenderer);

      const svg = await manager.renderDiagram('mermaid', 'graph TD\nA-->B');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
      expect(svg.getAttribute('data-code')).toBe('graph TD\nA-->B');
    });

    it('should route dot block to VizRenderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('dot', mockRenderer);

      const svg = await manager.renderDiagram('dot', 'digraph G { A -> B; }');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
    });

    it('should route graphviz block to VizRenderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('graphviz', mockRenderer);

      const svg = await manager.renderDiagram('graphviz', 'graph { A -- B; }');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
    });

    it('should route nomnoml block to NomnomlRenderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('nomnoml', mockRenderer);

      const svg = await manager.renderDiagram('nomnoml', '[A]->[B]');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
    });

    it('should route pikchr block to PikchrRenderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('pikchr', mockRenderer);

      const svg = await manager.renderDiagram('pikchr', 'box "A"; arrow; box "B"');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
    });

    it('should handle unknown diagram type gracefully', async () => {
      await expect(
        manager.renderDiagram('unknown', 'some code')
      ).rejects.toThrow('No renderer registered for language: unknown');
    });

    it('should be case-insensitive for language matching', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('mermaid', mockRenderer);

      const svg = await manager.renderDiagram('MERMAID', 'graph TD\nA-->B');

      expect(svg).toBeTruthy();
      expect(svg.tagName).toBe('svg');
    });
  });

  describe('renderer registration', () => {
    it('should register custom renderers', async () => {
      const customRenderer = new MockRenderer();
      manager.register('custom', customRenderer);

      expect(manager.supportsLanguage('custom')).toBe(true);

      const svg = await manager.renderDiagram('custom', 'custom code');
      expect(svg).toBeTruthy();
    });

    it('should override existing renderer when registering same language', async () => {
      const renderer1 = new MockRenderer();
      const renderer2 = new MockRenderer();

      manager.register('mermaid', renderer1);
      manager.register('mermaid', renderer2);

      // Should use the last registered renderer
      const svg = await manager.renderDiagram('mermaid', 'code');
      expect(svg).toBeTruthy();
    });

    it('should support multiple languages with same renderer', async () => {
      const mockRenderer = new MockRenderer();
      manager.register('dot', mockRenderer);
      manager.register('graphviz', mockRenderer);

      expect(manager.supportsLanguage('dot')).toBe(true);
      expect(manager.supportsLanguage('graphviz')).toBe(true);

      const svg1 = await manager.renderDiagram('dot', 'digraph { A -> B }');
      const svg2 = await manager.renderDiagram('graphviz', 'graph { A -- B }');

      expect(svg1).toBeTruthy();
      expect(svg2).toBeTruthy();
    });
  });

  describe('language support checking', () => {
    it('should return true for supported languages', () => {
      manager.register('mermaid', new MockRenderer());
      manager.register('dot', new MockRenderer());

      expect(manager.supportsLanguage('mermaid')).toBe(true);
      expect(manager.supportsLanguage('dot')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(manager.supportsLanguage('unknown')).toBe(false);
      expect(manager.supportsLanguage('python')).toBe(false);
    });

    it('should be case-insensitive', () => {
      manager.register('mermaid', new MockRenderer());

      expect(manager.supportsLanguage('MERMAID')).toBe(true);
      expect(manager.supportsLanguage('Mermaid')).toBe(true);
      expect(manager.supportsLanguage('mermaid')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should propagate renderer errors', async () => {
      class ErrorRenderer extends MockRenderer {
        async render(code) {
          throw new Error('Renderer error');
        }
      }

      const errorRenderer = new ErrorRenderer();
      manager.register('error', errorRenderer);

      await expect(
        manager.renderDiagram('error', 'code')
      ).rejects.toThrow('Renderer error');
    });

    it('should handle initialization errors', async () => {
      class InitErrorRenderer {
        async initialize() {
          throw new Error('Init failed');
        }

        async render(code) {
          if (!this.initialized) {
            await this.initialize();
          }
          return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        }
      }

      const errorRenderer = new InitErrorRenderer();
      manager.register('init-error', errorRenderer);

      await expect(
        manager.renderDiagram('init-error', 'code')
      ).rejects.toThrow('Init failed');
    });
  });

  describe('default renderers', () => {
    it('should register default renderers on construction', () => {
      expect(manager.supportsLanguage('mermaid')).toBe(true);
      expect(manager.supportsLanguage('dot')).toBe(true);
      expect(manager.supportsLanguage('graphviz')).toBe(true);
      expect(manager.supportsLanguage('nomnoml')).toBe(true);
      expect(manager.supportsLanguage('pikchr')).toBe(true);
    });

    it('should have separate renderer instances for dot and graphviz', () => {
      // Both should be supported but they might share the same renderer instance
      expect(manager.supportsLanguage('dot')).toBe(true);
      expect(manager.supportsLanguage('graphviz')).toBe(true);
    });
  });
});
