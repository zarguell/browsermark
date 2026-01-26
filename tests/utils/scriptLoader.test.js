import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScriptLoader } from '../../src/utils/scriptLoader.js';

describe('ScriptLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new ScriptLoader();
    // Clear the document head
    document.head.innerHTML = '';
  });

  describe('constructor', () => {
    it('should initialize with empty loadedScripts set', () => {
      expect(loader.loadedScripts).toBeInstanceOf(Set);
      expect(loader.loadedScripts.size).toBe(0);
    });
  });

  describe('load()', () => {
    it('should add script tag to document head', async () => {
      const testUrl = 'https://example.com/test.js';

      // Mock the script loading behavior
      const mockScript = {
        onload: null,
        onerror: null,
        src: ''
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockScript);
      vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
        // Simulate successful load
        setTimeout(() => {
          if (mockScript.onload) mockScript.onload();
        }, 0);
        return mockScript;
      });

      const loadPromise = loader.load(testUrl);

      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(mockScript.src).toBe(testUrl);

      await loadPromise;
      expect(loader.loadedScripts.has(testUrl)).toBe(true);
    });

    it('should resolve immediately if already loaded', async () => {
      const testUrl = 'https://example.com/test.js';

      // First load
      loader.loadedScripts.add(testUrl);

      // Second load should resolve immediately
      await expect(loader.load(testUrl)).resolves.toBeUndefined();
    });

    it('should reject on script load error', async () => {
      const testUrl = 'https://example.com/missing.js';

      const mockScript = {
        onload: null,
        onerror: null,
        src: ''
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockScript);
      vi.spyOn(document.head, 'appendChild').mockImplementation(() => {
        // Simulate load error
        setTimeout(() => {
          if (mockScript.onerror) mockScript.onerror();
        }, 0);
        return mockScript;
      });

      await expect(loader.load(testUrl)).rejects.toThrow('Failed to load');
    });
  });

  describe('loadModule()', () => {
    it('should load an ES module and return it', async () => {
      // Use a real data URL module
      const testUrl = 'data:text/javascript;charset=utf-8,export const testValue=42;export default {foo:"bar"};';

      const module = await loader.loadModule(testUrl);

      expect(module).toBeDefined();
      expect(module.testValue).toBe(42);
      expect(loader.loadedScripts.has(testUrl)).toBe(true);
    });

    it('should resolve immediately if module already loaded', async () => {
      const testUrl = 'data:text/javascript;charset=utf-8,export const testValue=42;';

      // First load
      loader.loadedScripts.add(testUrl);

      // Second load should resolve immediately
      await expect(loader.loadModule(testUrl)).resolves.toBeUndefined();
    });
  });
});
