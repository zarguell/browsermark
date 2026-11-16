/**
 * Tests for copying rendered markdown as rich text to the clipboard
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyRichText } from '../../src/utils/richTextClipboard.js';

describe('copyRichText', () => {
  let clipboardDescriptor;
  let clipboardItem;
  let execCommand;

  beforeEach(() => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    clipboardItem = globalThis.ClipboardItem;
    execCommand = document.execCommand;
  });

  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    } else {
      delete navigator.clipboard;
    }
    if (clipboardItem) {
      globalThis.ClipboardItem = clipboardItem;
    } else {
      delete globalThis.ClipboardItem;
    }
    document.execCommand = execCommand;
    document.body.innerHTML = '';
  });

  function stubAsyncClipboard(write) {
    Object.defineProperty(navigator, 'clipboard', { value: { write }, configurable: true });
    globalThis.ClipboardItem = class {
      constructor(items) { this.items = items; }
    };
  }

  it('writes both HTML and plain-text flavours', async () => {
    const write = vi.fn().mockResolvedValue();
    stubAsyncClipboard(write);

    await copyRichText('<h1>Title</h1>', 'Title');

    expect(write).toHaveBeenCalledOnce();
    const [item] = write.mock.calls[0][0];
    expect(item.items['text/html'].type).toBe('text/html');
    expect(item.items['text/plain'].type).toBe('text/plain');
    expect(await item.items['text/html'].text()).toBe('<h1>Title</h1>');
    expect(await item.items['text/plain'].text()).toBe('Title');
  });

  it('falls back to selection copy when the async clipboard is blocked', async () => {
    stubAsyncClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    document.execCommand = vi.fn().mockReturnValue(true);

    await copyRichText('<p>Hello</p>', 'Hello');

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(document.body.querySelector('[contenteditable="true"]')).toBeNull();
  });

  it('reports failure when no copy path succeeds', async () => {
    delete navigator.clipboard;
    document.execCommand = vi.fn().mockReturnValue(false);

    await expect(copyRichText('<p>Hello</p>', 'Hello'))
      .rejects.toThrow('Failed to copy rich text to clipboard');
  });
});
