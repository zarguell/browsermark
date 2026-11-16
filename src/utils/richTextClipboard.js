/**
 * Copy rendered HTML to the clipboard with both rich-text and plain-text flavours.
 * This lets Word, Google Docs and Apple Notes paste the formatted document.
 * @param {string} html - The rendered HTML to copy.
 * @param {string} plainText - Plain-text alternative for plain-text targets.
 * @returns {Promise<void>}
 */
export async function copyRichText(html, plainText) {
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([plainText], { type: 'text/plain' })
                })
            ]);
            return;
        } catch (error) {
            // Async clipboard can be blocked; fall back to the selection-based copy.
        }
    }

    copyRichTextWithSelection(html);
}

/**
 * Copy HTML through a temporary selection for browsers without async clipboard support.
 * @param {string} html - The rendered HTML to copy.
 * @returns {void}
 */
function copyRichTextWithSelection(html) {
    const selectionHost = document.createElement('div');
    selectionHost.contentEditable = 'true';
    selectionHost.style.position = 'fixed';
    selectionHost.style.left = '-9999px';
    selectionHost.innerHTML = html;
    document.body.appendChild(selectionHost);

    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(selectionHost);
    selection.removeAllRanges();
    selection.addRange(range);

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } finally {
        selection.removeAllRanges();
        selectionHost.remove();
    }

    if (!copied) {
        throw new Error('Failed to copy rich text to clipboard');
    }
}
