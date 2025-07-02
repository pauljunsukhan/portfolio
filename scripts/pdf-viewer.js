const params = new URLSearchParams(window.location.search);
const file = params.get('file');

const container = document.getElementById('pdf-viewer-container');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');

const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const downloadBtn = document.getElementById('download-pdf');
const printBtn = document.getElementById('print-pdf');
const pageInput = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');
const searchInput = document.getElementById('search-input');

let pdfDoc = null;
let currentPage = 1;
let scale = 1.2;

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}

if (!file) {
  showError('No PDF specified.');
} else {
  const pdfjsLib = window['pdfjsLib'];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js';

  async function init() {
    try {
      loadingIndicator.style.display = 'block';
      pdfDoc = await pdfjsLib.getDocument(file).promise;
      totalPagesEl.textContent = pdfDoc.numPages;
      renderPage(currentPage);
    } catch (err) {
      showError('Failed to load PDF.');
      console.error(err);
    }
  }

  async function renderPage(num) {
    try {
      loadingIndicator.style.display = 'block';
      container.innerHTML = '';
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page-container';
      pageContainer.appendChild(canvas);
      container.appendChild(pageContainer);

      await page.render({ canvasContext: context, viewport }).promise;

      const textContent = await page.getTextContent();
      const textLayer = document.createElement('div');
      textLayer.className = 'textLayer';
      pageContainer.appendChild(textLayer);
      pdfjsLib.renderTextLayer({
        textContent,
        container: textLayer,
        viewport,
        textDivs: []
      });

      pageInput.value = num;
      currentPage = num;
      loadingIndicator.style.display = 'none';
      errorMessage.style.display = 'none';
    } catch (err) {
      showError('Failed to render page.');
      console.error(err);
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage <= 1) return;
    renderPage(currentPage - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage >= pdfDoc.numPages) return;
    renderPage(currentPage + 1);
  });

  pageInput.addEventListener('change', () => {
    const num = parseInt(pageInput.value, 10);
    if (num >= 1 && num <= pdfDoc.numPages) {
      renderPage(num);
    }
  });

  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(scale + 0.25, 3);
    renderPage(currentPage);
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(scale - 0.25, 0.5);
    renderPage(currentPage);
  });

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = file;
    link.download = file.split('/').pop();
    link.click();
  });

  printBtn.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.src = file;
    document.body.appendChild(frame);
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    };
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      search();
    }
  });

  async function search() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((t) => t.str).join(' ').toLowerCase();
      if (text.includes(query)) {
        renderPage(i);
        break;
      }
    }
  }

  init();
}
