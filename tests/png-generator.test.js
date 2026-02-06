/**
 * Tests for PNG Generator
 * Tests that the PNG export functionality works correctly with width constraints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PNGGenerator } from '../src/png-generator.js';

// Mock the html2canvas module
vi.mock('html2canvas', () => {
  // Create a factory function that returns our mock
  const mock = vi.fn().mockImplementation((element, options) => {
    // Store the element for assertions
    mock.lastCalledElement = element;
    
    // Return a promise that resolves to a mock canvas
    return Promise.resolve({
      toBlob: (callback) => {
        callback(new Blob([], { type: 'image/png' }));
      }
    });
  });
  
  // Return the mock as the default export
  return {
    default: mock
  };
});

describe('PNGGenerator', () => {
  let pngGenerator;
  let mockElement;
  let html2canvasMock;

  beforeEach(async () => {
    pngGenerator = new PNGGenerator();
    mockElement = document.createElement('div');
    mockElement.innerHTML = '<p>Test content</p>';
    
    // Get reference to the mock
    const module = await import('html2canvas');
    html2canvasMock = module.default;
    
    // Reset the mock before each test
    html2canvasMock.mockReset();
    
    // Setup the mock implementation
    html2canvasMock.mockImplementation((element, options) => {
      // Store the element for assertions
      html2canvasMock.lastCalledElement = element;
      
      // Return a promise that resolves to a mock canvas
      return Promise.resolve({
        toBlob: (callback) => {
          callback(new Blob([], { type: 'image/png' }));
        }
      });
    });
  });

  describe('generatePNG', () => {
    it('should constrain width to standard document size', async () => {
      // Call generatePNG - this should apply our width constraints
      await pngGenerator.generatePNG(mockElement, 'test.png');

      // Check that html2canvas was called
      expect(html2canvasMock).toHaveBeenCalled();
      
      // Get the cloned element that was passed to html2canvas
      const clonedElement = html2canvasMock.lastCalledElement;
      
      // Check that the cloned element has the correct width constraints
      expect(clonedElement.style.width).toBe('8.5in');
      expect(clonedElement.style.maxWidth).toBe('8.5in');
    });

    it('should maintain proper styling for document export', async () => {
      // Call generatePNG - this should apply our styling
      await pngGenerator.generatePNG(mockElement, 'test.png');

      // Check that html2canvas was called
      expect(html2canvasMock).toHaveBeenCalled();
      
      // Get the cloned element that was passed to html2canvas
      const clonedElement = html2canvasMock.lastCalledElement;
      
      // Check that the cloned element has proper styling
      expect(clonedElement.style.padding).toBe('40px');
      // Background color gets normalized to rgb format
      expect(clonedElement.style.background).toBe('rgb(255, 255, 255)');
      // Margin gets normalized to px format
      expect(clonedElement.style.margin).toBe('0px auto');
    });
    
    it('should properly hide the cloned element during processing', async () => {
      // Call generatePNG
      await pngGenerator.generatePNG(mockElement, 'test.png');

      // Check that html2canvas was called
      expect(html2canvasMock).toHaveBeenCalled();
      
      // Get the cloned element that was passed to html2canvas
      const clonedElement = html2canvasMock.lastCalledElement;
      
      // Check that the cloned element is positioned off-screen
      expect(clonedElement.style.position).toBe('absolute');
      expect(clonedElement.style.left).toBe('-9999px');
      expect(clonedElement.style.top).toBe('-9999px');
    });
  });
});