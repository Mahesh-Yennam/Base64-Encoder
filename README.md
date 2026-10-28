# Base64 Encoder & Decoder — Gamility Tools

An advanced, bidirectional Base64 engineering tool supporting plain text, full UTF-8 Unicode, binary files, and images. Features URL-safe Base64 mode, chunked line wrapping (MIME / PEM 64-char & 76-char), real-time data URI generation, live image preview, and 1-click snippet exports for CSS and HTML.

---

## 🌟 Features & Highlights

- **🔤 True UTF-8 Unicode Support:** Encodes and decodes emojis, multi-byte international scripts (Japanese, Cyrillic, Arabic, Chinese), and binary character sets without Latin1 encoding exceptions.
- **🖼️ File & Image Base64 Engine:**
  - Drag-and-drop or upload any image, audio, PDF, or binary file.
  - Generates RFC 2397 Data URIs (`data:image/png;base64,...`).
  - Real-time visual image preview.
  - 1-click export of CSS `background-image: url(...)` and HTML `<img src="...">` snippets.
  - Download decoded binary files with automatic MIME-type extension detection.
- **⚙️ Advanced Encoding Flags:**
  - **URL-Safe Base64 (RFC 4648 §5):** Replaces `+` and `/` with `-` and `_`, allowing safe use in web URLs, query parameters, and JWT tokens.
  - **No Padding:** Omits trailing `=` padding characters.
  - **MIME Line Breaks:** Optional 64-character (PEM) or 76-character (MIME) line wrapping.
- **📊 Payload Analytics:** Live reporting of original raw size, encoded Base64 size, payload expansion overhead (+33.3%), and character counts.
- **🔒 100% Client-Side Privacy:** Zero network transmissions. All file reading and binary manipulation executes strictly inside your browser's local memory.

---

## 🚀 Quick Start

### Local Preview
Open `index.html` directly in any modern web browser:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Or serve via any static HTTP server:
```bash
npx serve .
```

---

## 🛡️ License & Copyright

Copyright © 2026 [Gamility](https://mahesh-yennam.github.io/Gamility/). All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or commercial exploitation is strictly prohibited without prior written permission from Gamility.
