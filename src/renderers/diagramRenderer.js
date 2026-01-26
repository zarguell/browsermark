/**
 * DiagramRenderer - Base class for diagram renderers
 * Provides common functionality for all diagram rendering implementations
 */
export class DiagramRenderer {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the renderer (load libraries, etc.)
   * Must be implemented by subclasses
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  /**
   * Render diagram code to SVG element
   * Must be implemented by subclasses
   * @param {string} code - Diagram code to render
   * @returns {Promise<SVGSVGElement>} - Rendered SVG element
   */
  async render(code) {
    throw new Error('render() must be implemented');
  }

  /**
   * Convert SVG string to SVGElement
   * @param {string} svgString - SVG as string
   * @returns {SVGSVGElement} - SVG element
   */
  svgStringToElement(svgString) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    return svgDoc.documentElement;
  }

  /**
   * Ensure SVG has inline styles for html2canvas compatibility
   * Copies computed styles to inline styles
   * @param {SVGSVGElement} svgElement - SVG element to process
   * @returns {SVGSVGElement} - Same SVG element with inline styles
   */
  ensureInlineStyles(svgElement) {
    // Copy computed styles to inline styles
    const allElements = svgElement.querySelectorAll('*');
    allElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      // Only copy essential properties
      const props = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size'];
      props.forEach(prop => {
        const value = computed.getPropertyValue(prop);
        if (value) {
          el.style[prop] = value;
        }
      });
    });
    return svgElement;
  }
}
