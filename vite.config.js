import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Check if we're building for single file distribution
const isSingleFile = process.env.BUILD_SINGLE_FILE === 'true';

export default defineConfig({
  plugins: [
    isSingleFile ? viteSingleFile() : null
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: isSingleFile ? 100000000 : 4096,
    rollupOptions: {
      output: {
        inlineDynamicImports: isSingleFile,
        manualChunks: isSingleFile ? undefined : {
          'marked': ['marked'],
          'pdf-export': ['html2pdf.js', 'html2canvas'],
          'docx-export': ['docshift'],
          'mermaid-core': ['mermaid'],
          'viz-renderer': ['@viz-js/viz'],
          'nomnoml': ['nomnoml'],
          'pikchr': ['pikchr-js'],
        }
      }
    }
  }
});
