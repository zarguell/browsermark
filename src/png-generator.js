// Import html2canvas
import html2canvas from 'html2canvas';

// PNG Generation Module
class PNGGenerator {
    constructor() {
        // PNG generator doesn't need header/footer options like PDF
    }

    generatePNG(element, filename = 'browsermark-document.png') {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Apply styles to ensure proper rendering and constrain width
        clone.style.maxWidth = '8.5in'; // Standard Word document width
        clone.style.width = '8.5in';
        clone.style.padding = '40px';
        clone.style.background = '#fff';
        clone.style.margin = '0 auto';
        
        // Temporarily add to DOM for proper rendering
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '-9999px';
        document.body.appendChild(clone);
        
        // Use html2canvas to generate PNG
        html2canvas(clone, {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: '#ffffff'
        })
        .then(canvas => {
            // Remove the cloned element
            document.body.removeChild(clone);
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
                // Create download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }, 'image/png', 0.95);
        })
        .catch((err) => {
            // Remove the cloned element in case of error
            if (clone.parentNode) {
                document.body.removeChild(clone);
            }
            
            console.error('PNG Generation Error:', err);
            alert('Failed to generate PNG. Check console for details.');
        });
    }
}

// Export for use in app.js
export { PNGGenerator };