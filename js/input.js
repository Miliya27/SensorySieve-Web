
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

// ---- Step 5: draw the image to a canvas and pre-process it ----
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