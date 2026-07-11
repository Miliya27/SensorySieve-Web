
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