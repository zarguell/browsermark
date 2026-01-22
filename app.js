// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdown-input');
    const previewContent = document.getElementById('preview-content');
    const exportBtn = document.getElementById('export-btn');
    const printBtn = document.getElementById('print-btn');
    const optionsToggle = document.getElementById('options-toggle');
    const optionsPanel = document.getElementById('options-panel');
    const headerInput = document.getElementById('header-input');
    const footerInput = document.getElementById('footer-input');
    const pageNumbersCheckbox = document.getElementById('page-numbers-checkbox');
    const linkUrlsCheckbox = document.getElementById('link-urls-checkbox');

    // Initialize PDF Generator
    const pdfGenerator = new PDFGenerator();

    // Default markdown text
    const defaultText = `# Welcome to Markdoc

Markdoc is a simple markdown to PDF converter that generates high-quality documents.

## Features

- Live preview of your markdown
- Custom headers and footers
- Page numbering support
- Clean, professional PDF output

\`\`\`javascript
// Example code block
function hello() {
    console.log('Hello, Markdoc!');
}
\`\`\`

> This is a blockquote example.
`;
    input.value = defaultText;

    // Update preview function
    function updatePreview() {
        const text = input.value;
        previewContent.innerHTML = marked.parse(text);
    }

    // Options panel toggle
    optionsToggle.addEventListener('click', () => {
        optionsPanel.classList.toggle('collapsed');
        optionsToggle.textContent = optionsPanel.classList.contains('collapsed') ? 'Show Options' : 'Hide Options';
    });

    // Function to update print CSS variables
    function updatePrintOptions() {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;
        const showLinkUrls = linkUrlsCheckbox.checked;

        document.documentElement.style.setProperty('--header-text', `"${headerText}"`);
        document.documentElement.style.setProperty('--footer-text', `"${footerText}"`);
        document.documentElement.style.setProperty('--page-numbers', includePageNumbers ? '' : 'none');
        document.documentElement.style.setProperty('--show-link-urls', showLinkUrls ? 'inline' : 'none');
    }

    // Export PDF with options
    exportBtn.addEventListener('click', () => {
        const headerText = headerInput.value.trim();
        const footerText = footerInput.value.trim();
        const includePageNumbers = pageNumbersCheckbox.checked;

        pdfGenerator.setOptions(headerText, footerText, includePageNumbers);
        pdfGenerator.generatePDF(previewContent);
    });

    // Print PDF (text-searchable)
    printBtn.addEventListener('click', () => {
        updatePrintOptions();
        window.print();
    });

    // Update print options when inputs change
    headerInput.addEventListener('input', updatePrintOptions);
    footerInput.addEventListener('input', updatePrintOptions);
    pageNumbersCheckbox.addEventListener('change', updatePrintOptions);
    linkUrlsCheckbox.addEventListener('change', updatePrintOptions);

    // Input event listener
    input.addEventListener('input', updatePreview);

    // Initial render
    updatePreview();
    updatePrintOptions();
});
