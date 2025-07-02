const params = new URLSearchParams(window.location.search);
const file = params.get('file');

if (!file) {
  document.getElementById('pdf-viewer-container').textContent = 'No PDF specified.';
} else {
  const pdfjsLib = window['pdfjsLib'];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';

  const container = document.getElementById('pdf-viewer-container');

  async function renderPDF(url) {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        container.appendChild(canvas);
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (err) {
      container.textContent = 'Failed to load PDF.';
      console.error(err);
    }
  }

  renderPDF(file);
}
