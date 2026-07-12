const inputZone = document.getElementById('input-zone');

inputZone.innerHTML = `
  <div class="ss-input-wrapper">
    <input type="file" id="ss-camera-input" accept="image/*" capture="environment" class="ss-hidden-input" />
    <input type="file" id="ss-file-input" accept="image/*,application/pdf" class="ss-hidden-input" />
    
    <div id="ss-dropzone" class="ss-dropzone">
      <p>Drag & drop an image or PDF here</p>
      <button id="ss-camera-btn" class="ss-btn">📷 Take Photo</button>
      <button id="ss-upload-btn" class="ss-btn">📁 Upload File</button>
      <button id="ss-live-btn" class="ss-btn ss-btn-live">🎥 Live Preview</button>
    </div>

    <div id="ss-live-preview-container" class="ss-live-container ss-hidden">
      <video id="ss-live-camera" autoplay playsinline class="ss-live-video"></video>
      <div id="ss-live-text-overlay" class="ss-live-overlay"></div>
      <button id="ss-live-dyslexia-toggle" class="ss-btn ss-live-dyslexia-toggle">🔤 Dyslexia View</button>
      <button id="ss-live-stop-btn" class="ss-btn ss-live-stop">✕ Stop Live Preview</button>
    </div>

    <div class="ss-url-row">
      <input type="text" id="ss-url-input" class="ss-url-field" placeholder="Or paste a URL..." />
      <button id="ss-url-btn" class="ss-btn">🔗 Load</button>
    </div>
    <p id="ss-url-error" class="ss-url-error ss-hidden"></p>

    <div id="ss-loading" class="ss-loading ss-hidden">
      <p id="ss-loading-text">Reading your document...</p>
    </div>
  </div>
`;

document.getElementById('ss-camera-btn').addEventListener('click', () => {
  document.getElementById('ss-camera-input').click();
});

document.getElementById('ss-upload-btn').addEventListener('click', () => {
  document.getElementById('ss-file-input').click();
});

document.getElementById('ss-camera-input').addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

document.getElementById('ss-file-input').addEventListener('change', (e) => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

document.getElementById('ss-url-btn').addEventListener('click', () => {
  const url = document.getElementById('ss-url-input').value.trim();
  if (url) {
    handleUrlSubmit(url);
  }
});

document.getElementById('ss-url-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('ss-url-btn').click();
  }
});

document.getElementById('ss-live-btn').addEventListener('click', startLivePreview);
document.getElementById('ss-live-stop-btn').addEventListener('click', stopLivePreview);

document.getElementById('ss-live-dyslexia-toggle').addEventListener('click', () => {
  liveDyslexiaOn = !liveDyslexiaOn;
  const btn = document.getElementById('ss-live-dyslexia-toggle');
  btn.textContent = liveDyslexiaOn ? '🔤 Dyslexia View: ON' : '🔤 Dyslexia View';
  btn.classList.toggle('ss-live-toggle-active', liveDyslexiaOn);
});


const dropzone = document.getElementById('ss-dropzone');

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('ss-dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('ss-dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ss-dragover');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});


function handleFile(file) {
  showLoading(true);

  if (file.type === 'application/pdf') {
    extractFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    extractFromImage(file);
  } else {
    showLoading(false);
    alert('Please upload an image or a PDF.');
  }
}

function showLoading(isLoading, message = 'Reading your document...') {
  const loadingEl = document.getElementById('ss-loading');
  const loadingTextEl = document.getElementById('ss-loading-text');
  loadingTextEl.textContent = message;
  loadingEl.classList.toggle('ss-hidden', !isLoading);
  document.getElementById('ss-dropzone').classList.toggle('ss-hidden', isLoading);
}


function preprocessImage(imageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const contrastFactor = 1.3;

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    let contrasted = (gray - 128) * contrastFactor + 128;
    contrasted = Math.max(0, Math.min(255, contrasted));

    pixels[i] = contrasted;
    pixels[i + 1] = contrasted;
    pixels[i + 2] = contrasted;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}


function extractFromImage(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      const processedCanvas = preprocessImage(img);

      try {
        const result = await Tesseract.recognize(processedCanvas, 'eng');
        const text = result.data.text.trim();
        finishExtraction(text);
      } catch (err) {
        console.error('OCR failed:', err);
        showLoading(false);
        alert('Could not read text from that image. Try a clearer photo.');
      }
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

async function extractFromPDF(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    fullText = fullText.trim();

    if (fullText.length === 0) {
      showLoading(false);
      alert('This PDF has no selectable text (it may be a scanned image). Try uploading it as an image instead.');
      return;
    }

    finishExtraction(fullText);
  } catch (err) {
    console.error('PDF extraction failed:', err);
    showLoading(false);
    alert('Could not read that PDF.');
  }
}

function finishExtraction(text) {
  showLoading(false);
  window.dispatchEvent(new CustomEvent('textExtracted', { detail: { text } }));
}


const URL_FETCH_ENDPOINT = '/api/fetch-url-proxy';

async function handleUrlSubmit(url) {
  hideUrlError();
  showLoading(true, 'Fetching page content...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(URL_FETCH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No readable text found at that URL.');
    }

    showLoading(false);
    window.dispatchEvent(new CustomEvent('textExtracted', { detail: { text: data.text } }));

  } catch (err) {
    clearTimeout(timeoutId);
    showLoading(false);

    if (err.name === 'AbortError') {
      showUrlError('That took too long to load. Try again or use a different URL.');
    } else {
      showUrlError('Could not load that page. Check the URL and try again.');
    }
    console.error('URL fetch failed:', err);
  }
}

function showUrlError(message) {
  const errorEl = document.getElementById('ss-url-error');
  errorEl.textContent = message;
  errorEl.classList.remove('ss-hidden');
}

function hideUrlError() {
  const errorEl = document.getElementById('ss-url-error');
  errorEl.classList.add('ss-hidden');
}


// ---- Live Preview Mode — separate code path, camera-loop based ----

let liveStream = null;
let liveOcrInterval = null;
let liveIsProcessing = false;
let liveDyslexiaOn = false; // LOCAL toggle — no dependency on app.js / window.currentMode
const liveCaptureCanvas = document.createElement('canvas');
const liveCtx = liveCaptureCanvas.getContext('2d');

async function startLivePreview() {
  const video = document.getElementById('ss-live-camera');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  });
  liveStream = stream;
  video.srcObject = stream;

  document.getElementById('ss-live-preview-container').classList.remove('ss-hidden');
  document.getElementById('ss-dropzone').classList.add('ss-hidden');

  liveOcrInterval = setInterval(runLiveOCR, 1800);
}

function stopLivePreview() {
  clearInterval(liveOcrInterval);
  if (liveStream) {
    liveStream.getTracks().forEach(track => track.stop());
    liveStream = null;
  }
  document.getElementById('ss-live-preview-container').classList.add('ss-hidden');
  document.getElementById('ss-dropzone').classList.remove('ss-hidden');
}

function grabLiveFrame(video) {
  liveCaptureCanvas.width = video.videoWidth;
  liveCaptureCanvas.height = video.videoHeight;
  liveCtx.drawImage(video, 0, 0, liveCaptureCanvas.width, liveCaptureCanvas.height);
  return liveCaptureCanvas;
}

async function runLiveOCR() {
  if (liveIsProcessing) return;
  const video = document.getElementById('ss-live-camera');
  if (video.videoWidth === 0 || video.videoHeight === 0) return;
  liveIsProcessing = true;

  const frame = grabLiveFrame(video);
  const result = await Tesseract.recognize(frame, 'eng');
  const text = result.data.text.trim();

  if (text.length > 0) {
    updateLiveOverlay(text);
  }

  liveIsProcessing = false;
}

function updateLiveOverlay(text) {
  const overlay = document.getElementById('ss-live-text-overlay');
  overlay.style.opacity = 0;

  setTimeout(() => {
    if (liveDyslexiaOn && window.DyslexiaMode) {
      DyslexiaMode.render(text, overlay);
    } else {
      overlay.textContent = text;
    }
    overlay.style.opacity = 1;
  }, 200);
}

window.addEventListener('beforeunload', () => {
  if (liveStream) stopLivePreview();
});