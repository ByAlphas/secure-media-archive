# 🛡️ Secure Media Archive

<div align="center">

![Secure Media Archive](https://img.shields.io/badge/Secure%20Media%20Archive-v1.0.0-blue?style=for-the-badge&logo=shield&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Security](https://img.shields.io/badge/Security-First-red?style=for-the-badge&logo=security&logoColor=white)

**A beautiful, secure, and user-friendly personal media archive system**  
*Upload, organize, and access your photos and videos with complete privacy and security.*

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🛠️ Installation](#%EF%B8%8F-installation) • [📸 FFmpeg Setup](#-ffmpeg-setup-required) • [📖 Usage](#-usage) • [🔒 Security](#-security)

</div>

---

## 🌟 Overview

**Secure Media Archive** is a modern full-stack web application designed for personal media file management. Built with security and user experience in mind, it provides a private, encrypted space for storing and organizing your photos and videos.

---

### 🎯 Perfect For
- 📸 Personal Photo Collections  
- 🎬 Video Archives  
- 🔐 Private Media Storage  
- 👨‍👩‍👧‍👦 Family Media Management  
- 💼 Professional Media Organization  

---

## ⚙️ Configuration

You can modify upload size limits, file count restrictions, or even video duration limits from the source code, typically under the `media.js` files.

Default values:

- **Max single file size:** 5 GB  
- **Max number of files per upload:** 50  
- **Max video duration:** 1 hour  



---

## 🛠️ Installation

### Prerequisites

- 📦 Node.js (v18 or higher)  
- 📝 npm (comes with Node.js)  
- 📸 FFmpeg (required for thumbnail generation)  

---

## 📸 FFmpeg Setup (Required)

This project depends on [FFmpeg](https://ffmpeg.org/) **exclusively** for generating **thumbnails** of uploaded media files. Without FFmpeg installed and configured, **uploads will not work**.

### 🔽 1. Download FFmpeg

Download the official Essentials Build:  
[https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z)

### 📂 2. Extract the Archive

Extract to:

```plaintext
C:\ffmpeg
```

You should have:

```plaintext
C:\ffmpeg\bin\ffmpeg.exe
C:\ffmpeg\bin\ffplay.exe
C:\ffmpeg\bin\ffprobe.exe
```

### 🔧 3. Add to System PATH

1. Open **Environment Variables**
2. Edit the `Path` under **System Variables**
3. Add the following line:

```plaintext
C:\ffmpeg\bin
```

4. Click **OK**

### ✅ 4. Verify Installation

Open a terminal and run:

```bash
ffmpeg -version
```

If FFmpeg version details appear, you're good to go!

> ⚠️ Without FFmpeg, file uploads will fail due to missing thumbnails.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd secure-media-archive

# Install dependencies
npm install

# Start the server
npm start
```

Your secure media archive will now run at:  
📍 `http://localhost:3000`

### 🔐 Default Login

* **Username:** `admin`  
* **Password:** `developedbyalpha`

---

## ✨ Features

### 🔐 Security First

* Session-based authentication with bcrypt  
* Protected uploads  
* CSRF protection & input sanitization

### 📁 Smart File Management

* Drag & Drop uploads  
* Auto-generated thumbnails (via FFmpeg)  
* File metadata tracking

### 🎨 Modern UI

* Responsive layout  
* Modal viewer  
* Fast-loading thumbnails

---

## 📖 Usage

* Upload files (`.jpg`, `.png`, `.mp4`, etc.)  
* Thumbnails auto-generated via FFmpeg  
* View/manage uploads via the dashboard  
* Delete or download files

---

## 🔒 Security

Security Features:

* Password hashing (bcrypt)  
* File type validation  
* Authenticated access  
* Session expiration

---

## 🏗️ Architecture & Stack

* **Backend:** Node.js + Express  
* **Database:** SQLite  
* **Authentication:** bcryptjs  
* **File Handling:** Multer + Sharp  
* **Media Processing:** FFmpeg (thumbnail only)

---

## 🚀 Deployment

```bash
npm run dev     # Development mode (auto-restart with nodemon)
npm start       # Production mode
```

Change your secret token in `app.js`:

```js
// WARNING
// Change your secret token!
// Use at least 22 characters with symbols, letters, and numbers.
```

> 🔐 Do **NOT** share your secret token publicly!

---

## 🤝 Contributing

Contributions are welcome!  
Please follow code style guidelines, test your changes, and update documentation as needed.

---

## 📄 License

MIT License — see `LICENSE` file for full details.

---

<div align="center">

Created by [Alpha](https://github.com/ByAlphas) as a personal, secure solution to store private media.  
If you found this project useful, consider giving it a ⭐ on GitHub!

[⬆️ Back to Top](#-secure-media-archive)

</div>
