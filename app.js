/**
 * ============================================================================
 * Base64 Encoder & Decoder — Gamility Tools
 * Standalone pure client-side two-way text, Unicode, image & binary converter.
 * Copyright © 2026 Gamility (All Rights Reserved)
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY_TAB = 'gamility_b64_tab';
  const STORAGE_KEY_DIR = 'gamility_b64_dir';
  const STORAGE_KEY_URLSAFE = 'gamility_b64_urlsafe';
  const STORAGE_KEY_NOPAD = 'gamility_b64_nopad';
  const STORAGE_KEY_WRAP = 'gamility_b64_wrap';

  // --- DOM Elements: Navigation & Hero ---
  const tabBtnText = document.getElementById('tab-btn-text');
  const tabBtnFile = document.getElementById('tab-btn-file');
  const modeTextSection = document.getElementById('mode-text-section');
  const modeFileSection = document.getElementById('mode-file-section');

  // Text Mode Elements
  const btnDirEncode = document.getElementById('btn-dir-encode');
  const btnDirDecode = document.getElementById('btn-dir-decode');
  const btnSwapText = document.getElementById('btn-swap-text');
  const optUrlSafe = document.getElementById('opt-url-safe');
  const optNoPadding = document.getElementById('opt-no-padding');
  const optLineWrap = document.getElementById('opt-line-wrap');
  const btnSampleText = document.getElementById('btn-sample-text');
  const btnClearText = document.getElementById('btn-clear-text');

  const textInputTitle = document.getElementById('text-input-title');
  const textInputMeta = document.getElementById('text-input-meta');
  const textOutputTitle = document.getElementById('text-output-title');
  const textOutputMeta = document.getElementById('text-output-meta');
  const textInput = document.getElementById('text-input');
  const textOutput = document.getElementById('text-output');

  const statTextInputSize = document.getElementById('stat-text-input-size');
  const statTextOutputSize = document.getElementById('stat-text-output-size');
  const statTextOverhead = document.getElementById('stat-text-overhead');
  const btnCopyText = document.getElementById('btn-copy-text');
  const btnDownloadText = document.getElementById('btn-download-text');

  // File Mode Elements
  const fileDropzone = document.getElementById('file-dropzone');
  const filePicker = document.getElementById('file-picker');
  const loadedFileCard = document.getElementById('loaded-file-card');
  const fileTypeIcon = document.getElementById('file-type-icon');
  const fileName = document.getElementById('fileName');
  const fileNameEl = document.getElementById('file-name');
  const fileSubEl = document.getElementById('file-sub');
  const btnClearFile = document.getElementById('btn-clear-file');
  const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
  const imagePreview = document.getElementById('image-preview');
  const previewDimensions = document.getElementById('preview-dimensions');

  const btnOptDataUri = document.getElementById('btn-opt-datauri');
  const btnOptRawB64 = document.getElementById('btn-opt-rawb64');
  const fileB64Output = document.getElementById('file-b64-output');

  const btnCopyDataUri = document.getElementById('btn-copy-datauri');
  const btnCopyRawB64 = document.getElementById('btn-copy-rawb64');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnDownloadFile = document.getElementById('btn-download-file');
  const btnSampleFile = document.getElementById('btn-sample-file');

  const statFileRawSize = document.getElementById('stat-file-raw-size');
  const statFileB64Size = document.getElementById('stat-file-b64-size');
  const statFileOverhead = document.getElementById('stat-file-overhead');

  // Toast Elements
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let currentDirection = 'encode'; // 'encode' | 'decode'
  let toastTimer = null;
  let activeFileState = null; // { name, type, size, dataUri, rawB64 }
  let fileOutputDisplayMode = 'datauri'; // 'datauri' | 'rawb64'

  // Samples
  const SAMPLE_TEXT = `🚀 Gamility Platform: Base64 Engineering Studio
--------------------------------------------------
Multilingual Support:
• English: Hello World!
• Japanese: こんにちは世界 (Kon'nichiwa sekai)
• Spanish: ¡Hola, mundo maravilloso!
• Arabic: مرحباً بالعالم
• Emojis: 🛡️ ✨ 📦 💻 🎨 ⚡

JSON Payload Snippet:
{ "verified": true, "overhead": "+33.3%", "privacy": "100% Client-Side" }`;

  const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#090e1a"/>
  <circle cx="50" cy="50" r="32" fill="none" stroke="url(#g)" stroke-width="6"/>
  <path d="M42 36 L62 50 L42 64 Z" fill="#60a5fa"/>
</svg>`;

  // --- Size Helper ---
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- Robust UTF-8 Base64 Converter Engine ---
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    const binStr = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binStr);
  }

  function base64ToUtf8(b64) {
    // 1. Restore standard characters if URL-safe
    let clean = b64.replace(/-/g, '+').replace(/_/g, '/');
    // 2. Remove whitespace/linebreaks
    clean = clean.replace(/\s+/g, '');
    // 3. Restore padding if omitted
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    const binStr = atob(clean);
    const bytes = Uint8Array.from(binStr, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function applyFlagsToBase64(b64, isUrlSafe, isNoPadding, wrapLen) {
    let result = b64;
    if (isUrlSafe) {
      result = result.replace(/\+/g, '-').replace(/\//g, '_');
    }
    if (isNoPadding) {
      result = result.replace(/=+$/, '');
    }
    if (wrapLen && wrapLen !== 'none') {
      const len = parseInt(wrapLen, 10);
      const regex = new RegExp(`.{1,${len}}`, 'g');
      result = (result.match(regex) || []).join('\n');
    }
    return result;
  }

  // --- Text Mode Logic ---
  function processTextConversion() {
    const rawInput = textInput.value;
    const isUrlSafe = optUrlSafe.checked;
    const isNoPadding = optNoPadding.checked;
    const wrapSetting = optLineWrap.value;

    const inputByteLen = new Blob([rawInput]).size;
    textInputMeta.textContent = `${rawInput.length.toLocaleString()} characters`;
    statTextInputSize.textContent = formatBytes(inputByteLen);

    if (!rawInput) {
      textOutput.value = '';
      textOutputMeta.textContent = '0 characters';
      statTextOutputSize.textContent = '0 B';
      statTextOverhead.textContent = '+0%';
      return;
    }

    if (currentDirection === 'encode') {
      try {
        const baseB64 = utf8ToBase64(rawInput);
        const transformed = applyFlagsToBase64(baseB64, isUrlSafe, isNoPadding, wrapSetting);
        textOutput.value = transformed;

        const outputByteLen = new Blob([transformed]).size;
        textOutputMeta.textContent = `${transformed.length.toLocaleString()} characters`;
        statTextOutputSize.textContent = formatBytes(outputByteLen);

        const overhead = inputByteLen > 0 
          ? Math.round(((outputByteLen - inputByteLen) / inputByteLen) * 100)
          : 0;
        statTextOverhead.textContent = overhead >= 0 ? `+${overhead}%` : `${overhead}%`;

      } catch (err) {
        textOutput.value = `[Encoding Error: ${err.message}]`;
        textOutputMeta.textContent = 'Error';
      }
    } else {
      // Decode direction
      try {
        const decoded = base64ToUtf8(rawInput);
        textOutput.value = decoded;

        const outputByteLen = new Blob([decoded]).size;
        textOutputMeta.textContent = `${decoded.length.toLocaleString()} characters`;
        statTextOutputSize.textContent = formatBytes(outputByteLen);

        const overhead = outputByteLen > 0
          ? Math.round(((inputByteLen - outputByteLen) / outputByteLen) * 100)
          : 0;
        statTextOverhead.textContent = overhead >= 0 ? `+${overhead}%` : `${overhead}%`;

      } catch (err) {
        textOutput.value = `[Invalid Base64 Input: ${err.message}]`;
        textOutputMeta.textContent = 'Invalid';
        statTextOutputSize.textContent = '0 B';
        statTextOverhead.textContent = 'N/A';
      }
    }
  }

  function setDirection(dir) {
    currentDirection = dir;
    if (dir === 'encode') {
      btnDirEncode.classList.add('active');
      btnDirDecode.classList.remove('active');
      textInputTitle.textContent = 'Plain Text Input (UTF-8)';
      textInput.placeholder = 'Type or paste text to encode here...';
      textOutputTitle.textContent = 'Base64 Encoded Output';
      textOutput.placeholder = 'Encoded result will appear here...';
    } else {
      btnDirEncode.classList.remove('active');
      btnDirDecode.classList.add('active');
      textInputTitle.textContent = 'Base64 Encoded Input';
      textInput.placeholder = 'Paste Base64 string to decode here...';
      textOutputTitle.textContent = 'Plain Text Output (UTF-8)';
      textOutput.placeholder = 'Decoded plain text will appear here...';
    }
    processTextConversion();
  }

  function swapText() {
    const currentOut = textOutput.value;
    if (!currentOut.startsWith('[Invalid') && !currentOut.startsWith('[Encoding')) {
      textInput.value = currentOut;
      setDirection(currentDirection === 'encode' ? 'decode' : 'encode');
      showToast('Swapped input and output!');
    }
  }

  // --- Image & File Mode Logic ---
  function handleLoadedFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      const commaIdx = dataUri.indexOf(',');
      const rawB64 = commaIdx !== -1 ? dataUri.substring(commaIdx + 1) : dataUri;

      activeFileState = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUri: dataUri,
        rawB64: rawB64
      };

      renderFileState();
      showToast(`Loaded ${file.name}!`);
    };

    reader.readAsDataURL(file);
  }

  function renderFileState() {
    if (!activeFileState) return;

    // 1. Update File Banner
    loadedFileCard.classList.remove('hidden');
    fileNameEl.textContent = activeFileState.name;
    fileSubEl.textContent = `${activeFileState.type} • ${formatBytes(activeFileState.size)}`;

    // Set file icon
    if (activeFileState.type.startsWith('image/')) {
      fileTypeIcon.textContent = '🖼️';
    } else if (activeFileState.type.includes('pdf')) {
      fileTypeIcon.textContent = '📕';
    } else if (activeFileState.type.includes('audio')) {
      fileTypeIcon.textContent = '🎵';
    } else if (activeFileState.type.includes('video')) {
      fileTypeIcon.textContent = '🎬';
    } else {
      fileTypeIcon.textContent = '📄';
    }

    // 2. Image Visual Preview
    if (activeFileState.type.startsWith('image/') || activeFileState.type === 'image/svg+xml') {
      imagePreview.src = activeFileState.dataUri;
      imagePreview.onload = () => {
        previewDimensions.textContent = `${imagePreview.naturalWidth} × ${imagePreview.naturalHeight} px`;
      };
      imagePreviewWrapper.classList.remove('hidden');
    } else {
      imagePreviewWrapper.classList.add('hidden');
    }

    // 3. Output Textarea
    updateFileOutputContent();

    // 4. Metrics
    const rawLen = activeFileState.size;
    const b64Len = activeFileState.rawB64.length;
    statFileRawSize.textContent = formatBytes(rawLen);
    statFileB64Size.textContent = formatBytes(b64Len);
    const overhead = rawLen > 0 ? Math.round(((b64Len - rawLen) / rawLen) * 100) : 0;
    statFileOverhead.textContent = `+${overhead}%`;
  }

  function updateFileOutputContent() {
    if (!activeFileState) return;
    if (fileOutputDisplayMode === 'datauri') {
      fileB64Output.value = activeFileState.dataUri;
    } else {
      fileB64Output.value = activeFileState.rawB64;
    }
  }

  function handleDirectFileTextareaInput(val) {
    const trimmed = val.trim();
    if (!trimmed) return;

    // Check if it's a data URI
    if (trimmed.startsWith('data:')) {
      const semiIdx = trimmed.indexOf(';');
      const commaIdx = trimmed.indexOf(',');
      const mime = semiIdx !== -1 ? trimmed.substring(5, semiIdx) : 'image/png';
      const raw = commaIdx !== -1 ? trimmed.substring(commaIdx + 1) : '';

      // Estimate byte size from raw base64
      const estBytes = Math.round((raw.length * 3) / 4);

      activeFileState = {
        name: `decoded-file.${guessExtension(mime)}`,
        type: mime,
        size: estBytes,
        dataUri: trimmed,
        rawB64: raw
      };
      renderFileState();
      showToast('Detected Base64 Data URI!');
    }
  }

  function guessExtension(mime) {
    const map = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/json': 'json',
      'audio/mpeg': 'mp3'
    };
    return map[mime] || 'bin';
  }

  function clearFile() {
    activeFileState = null;
    filePicker.value = '';
    loadedFileCard.classList.add('hidden');
    imagePreviewWrapper.classList.add('hidden');
    imagePreview.src = '';
    fileB64Output.value = '';
    statFileRawSize.textContent = '0 B';
    statFileB64Size.textContent = '0 B';
    statFileOverhead.textContent = '+0%';
    showToast('File buffer cleared.');
  }

  // --- Toast Notification ---
  function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Copy failed. Please copy manually.');
    }
    document.body.removeChild(temp);
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`);
  }

  function downloadBinaryFromBase64(filename, rawBase64, mimeType) {
    try {
      const clean = rawBase64.replace(/\s+/g, '');
      const binStr = atob(clean);
      const len = binStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}!`);
    } catch (err) {
      showToast('Could not decode binary file: ' + err.message);
    }
  }

  // --- Switch Mode Tabs ---
  function setTab(tab) {
    if (tab === 'text') {
      tabBtnText.classList.add('active');
      tabBtnFile.classList.remove('active');
      tabBtnText.setAttribute('aria-selected', 'true');
      tabBtnFile.setAttribute('aria-selected', 'false');
      modeTextSection.classList.remove('hidden');
      modeFileSection.classList.add('hidden');
    } else {
      tabBtnText.classList.remove('active');
      tabBtnFile.classList.add('active');
      tabBtnText.setAttribute('aria-selected', 'false');
      tabBtnFile.setAttribute('aria-selected', 'true');
      modeTextSection.classList.add('hidden');
      modeFileSection.classList.remove('hidden');
    }
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    // Mode tabs
    tabBtnText.addEventListener('click', () => setTab('text'));
    tabBtnFile.addEventListener('click', () => setTab('file'));

    // Text Direction controls
    btnDirEncode.addEventListener('click', () => setDirection('encode'));
    btnDirDecode.addEventListener('click', () => setDirection('decode'));
    btnSwapText.addEventListener('click', swapText);

    // Text Flags
    optUrlSafe.addEventListener('change', processTextConversion);
    optNoPadding.addEventListener('change', processTextConversion);
    optLineWrap.addEventListener('change', processTextConversion);

    // Text Input typing
    textInput.addEventListener('input', processTextConversion);

    // Text sample & clear
    btnSampleText.addEventListener('click', () => {
      textInput.value = SAMPLE_TEXT;
      setDirection('encode');
      showToast('Loaded sample text payload!');
    });

    btnClearText.addEventListener('click', () => {
      textInput.value = '';
      processTextConversion();
      showToast('Text buffer cleared.');
    });

    // Text copy & download
    btnCopyText.addEventListener('click', () => {
      if (!textOutput.value) {
        showToast('Nothing to copy.');
        return;
      }
      copyToClipboard(textOutput.value, 'Result copied to clipboard!');
    });

    btnDownloadText.addEventListener('click', () => {
      if (!textOutput.value) {
        showToast('Nothing to download.');
        return;
      }
      const fname = currentDirection === 'encode' ? 'encoded.b64' : 'decoded.txt';
      downloadFile(fname, textOutput.value, 'text/plain;charset=utf-8');
    });

    // File Dropzone & Picker
    filePicker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleLoadedFile(e.target.files[0]);
      }
    });

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('drag-active');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('drag-active');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('drag-active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLoadedFile(e.dataTransfer.files[0]);
      }
    });

    btnClearFile.addEventListener('click', clearFile);

    // File Output mode toggles
    btnOptDataUri.addEventListener('click', () => {
      fileOutputDisplayMode = 'datauri';
      btnOptDataUri.classList.add('active');
      btnOptRawB64.classList.remove('active');
      updateFileOutputContent();
    });

    btnOptRawB64.addEventListener('click', () => {
      fileOutputDisplayMode = 'rawb64';
      btnOptDataUri.classList.remove('active');
      btnOptRawB64.classList.add('active');
      updateFileOutputContent();
    });

    // File Textarea manual edits
    fileB64Output.addEventListener('input', () => {
      handleDirectFileTextareaInput(fileB64Output.value);
    });

    // File Snippet Copies
    btnCopyDataUri.addEventListener('click', () => {
      if (!activeFileState) {
        showToast('No file loaded.');
        return;
      }
      copyToClipboard(activeFileState.dataUri, 'Data URI copied to clipboard!');
    });

    btnCopyRawB64.addEventListener('click', () => {
      if (!activeFileState) {
        showToast('No file loaded.');
        return;
      }
      copyToClipboard(activeFileState.rawB64, 'Raw Base64 copied to clipboard!');
    });

    btnCopyCss.addEventListener('click', () => {
      if (!activeFileState) {
        showToast('No file loaded.');
        return;
      }
      const cssSnippet = `background-image: url("${activeFileState.dataUri}");`;
      copyToClipboard(cssSnippet, 'CSS snippet copied to clipboard!');
    });

    btnCopyHtml.addEventListener('click', () => {
      if (!activeFileState) {
        showToast('No file loaded.');
        return;
      }
      const htmlSnippet = `<img src="${activeFileState.dataUri}" alt="${activeFileState.name}">`;
      copyToClipboard(htmlSnippet, 'HTML <img> tag copied to clipboard!');
    });

    // Download Decoded Binary File
    btnDownloadFile.addEventListener('click', () => {
      if (!activeFileState) {
        showToast('No file loaded.');
        return;
      }
      downloadBinaryFromBase64(activeFileState.name, activeFileState.rawB64, activeFileState.type);
    });

    // Sample File (SVG)
    btnSampleFile.addEventListener('click', () => {
      const blob = new Blob([SAMPLE_SVG], { type: 'image/svg+xml' });
      const file = new File([blob], 'gamility-badge.svg', { type: 'image/svg+xml' });
      handleLoadedFile(file);
    });
  }

  // --- Bootstrap ---
  function initApp() {
    initEvents();

    // Initialize with sample text
    textInput.value = SAMPLE_TEXT;
    processTextConversion();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
