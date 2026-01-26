/**
 * markdownParser - Utilities for parsing markdown and extracting diagram code blocks
 */

/**
 * Regular expression to match fenced code blocks in markdown
 * Matches: ```language\ncode\n```
 */
const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;

/**
 * Extract all code blocks from markdown text
 * @param {string} markdown - The markdown text to parse
 * @returns {Array<{language: string, code: string, startIndex: number, endIndex: number, fullMatch: string}>}
 *         Array of code block objects with language, code, position info, and full match
 */
export function extractCodeBlocks(markdown) {
  const blocks = [];
  let match;

  // Reset regex state
  CODE_BLOCK_REGEX.lastIndex = 0;

  while ((match = CODE_BLOCK_REGEX.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || '',
      code: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      fullMatch: match[0]
    });
  }

  return blocks;
}

/**
 * Check if a language identifier is a supported diagram language
 * @param {string} language - The language identifier to check
 * @returns {boolean} - True if the language is a diagram language
 */
export function isDiagramLanguage(language) {
  if (!language) return false;

  const diagramLanguages = ['mermaid', 'dot', 'graphviz', 'nomnoml', 'pikchr'];
  return diagramLanguages.includes(language.toLowerCase());
}

/**
 * Extract only diagram code blocks from markdown text
 * @param {string} markdown - The markdown text to parse
 * @returns {Array<{language: string, code: string, startIndex: number, endIndex: number, fullMatch: string}>}
 *         Array of diagram code block objects
 */
export function getDiagramBlocks(markdown) {
  const allBlocks = extractCodeBlocks(markdown);
  return allBlocks.filter(block => isDiagramLanguage(block.language));
}
