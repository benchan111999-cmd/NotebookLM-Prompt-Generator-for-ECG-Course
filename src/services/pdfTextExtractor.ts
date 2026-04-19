// PDF Text Extraction Service using pdfjs-dist in a Web Worker

// Create a blob URL for the worker script
let workerBlobURL: string | null = null;

// Initialize the worker blob URL
const initWorkerBlobURL = () => {
  if (workerBlobURL !== null) return workerBlobURL;
  
  const workerScript = `
    self.onmessage = async (e: MessageEvent) => {
      const { arrayBuffer } = e.data;
      try {
        // Dynamically import pdfjs-dist
        const { getDocument } = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.esm.min.js');
        
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ');
          textContent += pageText + '\\n\\n';
        }
        
        self.postMessage({ type: 'success', text: textContent.trim() });
      } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
      }
    };
  `;
  
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  workerBlobURL = URL.createObjectURL(blob);
  return workerBlobURL;
};

// Extract text from PDF using Web Worker
export const extractPDFText = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const workerBlobURL = initWorkerBlobURL();
    const worker = new Worker(workerBlobURL);
    
    worker.onmessage = (e: MessageEvent) => {
      worker.terminate(); // Clean up worker
      
      if (e.data.type === 'success') {
        resolve(e.data.text);
      } else if (e.data.type === 'error') {
        reject(new Error(e.data.error));
      }
    };
    
    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error(`Worker error: ${error.message}`));
    };
    
    worker.postMessage({ arrayBuffer });
  });
};

// Cleanup blob URL when no longer needed (call on unmount in React)
export const cleanupPDFWorker = () => {
  if (workerBlobURL !== null) {
    URL.revokeObjectURL(workerBlobURL);
    workerBlobURL = null;
  }
};