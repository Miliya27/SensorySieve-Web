
const inputZone = document.getElementById('input-zone');

inputZone.innerHTML = `
  <div class="ss-input-wrapper">
    <input type="file" id="ss-camera-input" accept="image/*" capture="environment" class="ss-hidden-input" />
    <input type="file" id="ss-file-input" accept="image/*,application/pdf" class="ss-hidden-input" />
    
    <div id="ss-dropzone" class="ss-dropzone">
      <p>Drag & drop an image or PDF here</p>
      <button id="ss-camera-btn" class="ss-btn">📷 Take Photo</button>
      <button id="ss-upload-btn" class="ss-btn">📁 Upload File</button>
    </div>

    <div id="ss-loading" class="ss-loading ss-hidden">
      <p>Reading your document...</p>
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

function showLoading(isLoading) {
  document.getElementById('ss-loading').classList.toggle('ss-hidden', !isLoading);
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

  const contrastFactor = 1.5; 

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