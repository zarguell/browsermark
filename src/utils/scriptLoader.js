/**
 * ScriptLoader - Dynamically loads scripts and modules
 * Handles caching to avoid reloading the same resources
 */
export class ScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
  }

  /**
   * Load a regular script tag
   * @param {string} url - URL of the script to load
   * @returns {Promise<void>}
   */
  async load(url) {
    if (this.loadedScripts.has(url)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        this.loadedScripts.add(url);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load an ES module
   * @param {string} url - URL of the module to load
   * @returns {Promise<any>} - The loaded module
   */
  async loadModule(url) {
    if (this.loadedScripts.has(url)) {
      return Promise.resolve();
    }

    const module = await import(url);
    this.loadedScripts.add(url);
    return module;
  }
}
