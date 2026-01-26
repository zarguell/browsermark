/**
 * DiagramManager - Orchestrates diagram rendering across multiple diagram types
 * Manages renderer registry and routes diagram blocks to appropriate renderers
 */

import { MermaidRenderer } from './renderers/mermaidRenderer.js';
import { VizRenderer } from './renderers/vizRenderer.js';
import { NomnomlRenderer } from './renderers/nomnomlRenderer.js';
import { PikchrRenderer } from './renderers/pikchrRenderer.js';

export class DiagramManager {
  constructor() {
    // Map of language (lowercase) -> renderer instance
    this.renderers = new Map();
    this.registerDefaultRenderers();
  }

  /**
   * Register default diagram renderers
   * Called during construction
   * @private
   */
  registerDefaultRenderers() {
    // Mermaid - flowcharts, sequence diagrams, etc.
    this.register('mermaid', new MermaidRenderer());

    // Viz.js (Graphviz) - DOT language graphs
    // Register both 'dot' and 'graphviz' aliases
    const vizRenderer = new VizRenderer();
    this.register('dot', vizRenderer);
    this.register('graphviz', vizRenderer);

    // Nomnoml - UML diagrams
    this.register('nomnoml', new NomnomlRenderer());

    // Pikchr - PIC-like technical diagrams
    this.register('pikchr', new PikchrRenderer());
  }

  /**
   * Register a renderer for a specific diagram language
   * @param {string} language - The language identifier (case-insensitive)
   * @param {DiagramRenderer} renderer - The renderer instance
   */
  register(language, renderer) {
    if (!renderer) {
      throw new Error(`Cannot register null/undefined renderer for language: ${language}`);
    }

    if (typeof renderer.render !== 'function') {
      throw new Error(`Renderer must implement render() method for language: ${language}`);
    }

    this.renderers.set(language.toLowerCase(), renderer);
  }

  /**
   * Render a diagram using the appropriate renderer
   * @param {string} language - The diagram language (case-insensitive)
   * @param {string} code - The diagram code to render
   * @returns {Promise<SVGSVGElement>} - The rendered SVG element
   * @throws {Error} If no renderer is registered for the language
   */
  async renderDiagram(language, code) {
    const renderer = this.renderers.get(language.toLowerCase());

    if (!renderer) {
      throw new Error(`No renderer registered for language: ${language}`);
    }

    try {
      return await renderer.render(code);
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Failed to render ${language} diagram: ${error.message}`);
    }
  }

  /**
   * Check if a diagram language is supported
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {boolean} - True if the language has a registered renderer
   */
  supportsLanguage(language) {
    if (!language) {
      return false;
    }

    return this.renderers.has(language.toLowerCase());
  }

  /**
   * Get list of supported languages
   * @returns {string[]} - Array of supported language identifiers
   */
  getSupportedLanguages() {
    return Array.from(this.renderers.keys());
  }

  /**
   * Remove a renderer registration
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {boolean} - True if a renderer was removed
   */
  unregister(language) {
    return this.renderers.delete(language.toLowerCase());
  }

  /**
   * Clear all renderer registrations
   */
  clearRenderers() {
    this.renderers.clear();
  }

  /**
   * Get the renderer instance for a language
   * @param {string} language - The language identifier (case-insensitive)
   * @returns {DiagramRenderer|undefined} - The renderer instance or undefined
   */
  getRenderer(language) {
    return this.renderers.get(language.toLowerCase());
  }
}
