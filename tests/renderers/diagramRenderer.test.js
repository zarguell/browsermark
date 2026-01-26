import { describe, it, expect, beforeEach } from 'vitest';
import { DiagramRenderer } from '../../src/renderers/diagramRenderer.js';

describe('DiagramRenderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new DiagramRenderer();
  });

  describe('constructor', () => {
    it('should initialize with initialized flag set to false', () => {
      expect(renderer.initialized).toBe(false);
    });
  });

  describe('initialize()', () => {
    it('should throw an error when not implemented by subclass', async () => {
      await expect(renderer.initialize()).rejects.toThrow('initialize() must be implemented');
    });
  });

  describe('render()', () => {
    it('should throw an error when not implemented by subclass', async () => {
      await expect(renderer.render('code')).rejects.toThrow('render() must be implemented');
    });
  });

  describe('svgStringToElement()', () => {
    it('should convert SVG string to SVGElement', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';

      const svgElement = renderer.svgStringToElement(svgString);

      expect(svgElement).toBeInstanceOf(SVGElement);
      expect(svgElement.tagName).toBe('svg');
      expect(svgElement.getAttribute('width')).toBe('100');
      expect(svgElement.getAttribute('height')).toBe('100');
    });

    it('should handle SVG with namespace', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';

      const svgElement = renderer.svgStringToElement(svgString);

      expect(svgElement).toBeInstanceOf(SVGElement);
      expect(svgElement.querySelector('rect')).toBeTruthy();
    });
  });

  describe('ensureInlineStyles()', () => {
    it('should copy computed styles to inline styles for SVG elements', () => {
      // Create a test SVG element
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg" style="fill: red;"><circle cx="50" cy="50" r="40" style="fill: blue;"/></svg>';
      const svgElement = renderer.svgStringToElement(svgString);

      // Add to DOM so computed styles work
      document.body.appendChild(svgElement);
      const result = renderer.ensureInlineStyles(svgElement);
      document.body.removeChild(svgElement);

      expect(result).toBe(svgElement);
    });

    it('should return the same SVG element', () => {
      const svgString = '<svg xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80"/></svg>';
      const svgElement = renderer.svgStringToElement(svgString);

      const result = renderer.ensureInlineStyles(svgElement);

      expect(result).toBe(svgElement);
    });
  });
});
