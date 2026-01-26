import { describe, it, expect } from 'vitest';
import { extractCodeBlocks, isDiagramLanguage, getDiagramBlocks } from '../../src/utils/markdownParser.js';

describe('extractCodeBlocks', () => {
  it('should extract a single code block with language', () => {
    const markdown = '```javascript\nconsole.log("hello");\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('javascript');
    expect(blocks[0].code).toBe('console.log("hello");');
  });

  it('should extract a single code block without language', () => {
    const markdown = '```\ncode here\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('');
    expect(blocks[0].code).toBe('code here');
  });

  it('should extract multiple code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```\n\nSome text\n\n```python\ny = 2\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].language).toBe('javascript');
    expect(blocks[0].code).toBe('const x = 1;');
    expect(blocks[1].language).toBe('python');
    expect(blocks[1].code).toBe('y = 2');
  });

  it('should handle code blocks with nested backticks in content', () => {
    const markdown = '```javascript\nconst str = "`backticks`";\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe('const str = "`backticks`";');
  });

  it('should handle mixed diagram and regular code blocks', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```\n\n```javascript\nconsole.log("test");\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].language).toBe('mermaid');
    expect(blocks[0].code).toBe('graph TD\nA-->B');
    expect(blocks[1].language).toBe('javascript');
    expect(blocks[1].code).toBe('console.log("test");');
  });

  it('should include startIndex and endIndex', () => {
    const markdown = 'Text before\n```mermaid\ngraph TD\nA-->B\n```\nText after';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].startIndex).toBeGreaterThan(0);
    expect(blocks[0].endIndex).toBeGreaterThan(blocks[0].startIndex);
  });

  it('should include fullMatch', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].fullMatch).toBe(markdown);
  });

  it('should handle code blocks with special characters', () => {
    const markdown = '```dot\ndigraph G {\n  A -> B;\n  B -> C;\n}\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('dot');
    expect(blocks[0].code).toContain('digraph G');
  });

  it('should handle empty code blocks', () => {
    const markdown = '```\n\n```';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe('');
  });

  it('should return empty array for markdown without code blocks', () => {
    const markdown = '# Heading\n\nJust regular text\n\nNo code blocks here';
    const blocks = extractCodeBlocks(markdown);

    expect(blocks).toHaveLength(0);
  });
});

describe('isDiagramLanguage', () => {
  it('should return true for mermaid', () => {
    expect(isDiagramLanguage('mermaid')).toBe(true);
  });

  it('should return true for dot', () => {
    expect(isDiagramLanguage('dot')).toBe(true);
  });

  it('should return true for graphviz', () => {
    expect(isDiagramLanguage('graphviz')).toBe(true);
  });

  it('should return true for nomnoml', () => {
    expect(isDiagramLanguage('nomnoml')).toBe(true);
  });

  it('should return true for pikchr', () => {
    expect(isDiagramLanguage('pikchr')).toBe(true);
  });

  it('should return false for non-diagram languages', () => {
    expect(isDiagramLanguage('javascript')).toBe(false);
    expect(isDiagramLanguage('python')).toBe(false);
    expect(isDiagramLanguage('java')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isDiagramLanguage('MERMAID')).toBe(true);
    expect(isDiagramLanguage('Mermaid')).toBe(true);
    expect(isDiagramLanguage('DOT')).toBe(true);
    expect(isDiagramLanguage('Dot')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isDiagramLanguage('')).toBe(false);
  });
});

describe('getDiagramBlocks', () => {
  it('should filter to only diagram code blocks', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```\n\n```javascript\nconsole.log("test");\n```';
    const blocks = getDiagramBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('mermaid');
  });

  it('should handle multiple diagram types', () => {
    const markdown = '```mermaid\ngraph TD\nA-->B\n```\n\n```dot\ndigraph G { A -> B; }\n```';
    const blocks = getDiagramBlocks(markdown);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].language).toBe('mermaid');
    expect(blocks[1].language).toBe('dot');
  });

  it('should include all supported diagram languages', () => {
    const markdown = '```mermaid\nA-->B\n```\n\n```dot\nA->B\n```\n\n```graphviz\nA--B\n```\n\n```nomnoml\n[A]->[B]\n```\n\n```pikchr\nbox "A"\n```';
    const blocks = getDiagramBlocks(markdown);

    expect(blocks).toHaveLength(5);
  });

  it('should return empty array when no diagram blocks exist', () => {
    const markdown = '```javascript\nconsole.log("test");\n```\n\n```python\nprint("test")\n```';
    const blocks = getDiagramBlocks(markdown);

    expect(blocks).toHaveLength(0);
  });

  it('should handle mixed diagram and non-diagram blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```\n\n```mermaid\ngraph TD\nA-->B\n```\n\n```python\ny = 2\n```';
    const blocks = getDiagramBlocks(markdown);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].language).toBe('mermaid');
  });
});
