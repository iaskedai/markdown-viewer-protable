# Markdown Viewer (Portable Windows App)

A standalone, portable desktop Markdown file viewer designed with modern Windows 11 aesthetics, built using **Electron**, **Tailwind CSS**, and **React**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-0078D6.svg)

---

## ✨ Features

- **Portability**: Builds via Electron Forge into a self-contained portable folder and a `.zip` distributable requiring no installation.
- **Frameless Window**: Custom Windows 11 Fluent title bar with native drag regions, minimize, maximize/restore, and close buttons.
- **100% Offline**: All assets, fonts, icons, syntax highlighting themes, and modules are bundled locally.
- **Drag & Drop**: Drop any `.md` or `.markdown` file directly into the application window or use the "Browse File" button.
- **Sticky Table of Contents (TOC)**: Right sidebar with scroll-spy that automatically tracks and highlights active document headings.
- **Reading Statistics**: Live word count calculation and estimated read time.
- **Dark / Light Mode**: Smooth theme toggling with custom dark and light color palettes.
- **Syntax Highlighting & Copy Button**: IDE-style code blocks with language indicators and one-click copy buttons.
- **Modern Data Grids**: Tables styled with sticky headers, zebra-striping, and low-opacity borders.
- **Rich Callouts**: Left-bordered callout blocks with visual icons for `[!NOTE]`, `[!INFO]`, `[!WARNING]`, `[!SUCCESS]`, and `[!IMPORTANT]`.

---

## 🛠️ Project Structure

```
MD_Viwer/
├── src/
│   ├── main.js             # Electron main process (IPC & frameless window)
│   ├── preload.js          # Secure context bridge
│   ├── renderer.jsx        # React root mounting
│   ├── App.jsx             # Main application layout, state & drag-and-drop
│   ├── TitleBar.jsx        # Custom Windows 11 title bar
│   ├── MarkdownRenderer.jsx # Markdown parser, syntax highlighter, and callouts
│   └── index.css           # Tailwind CSS v4 directives & custom themes
├── index.html              # Vite entrypoint HTML
├── forge.config.js         # Electron Forge packaging configuration
├── vite.main.config.mjs    # Vite config for main process
├── vite.preload.config.mjs # Vite config for preload script
├── vite.renderer.config.mjs# Vite config for React renderer + Tailwind
├── sample.md               # Demo markdown showcase file
└── package.json            # Project dependencies and build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

Run the app locally with hot reloading:
```bash
npm start
```

### Packaging & Distribution

Build the portable Windows executable folder:
```bash
npm run package
```
Output folder will be created at:
```
out/MarkdownViewer-win32-x64/MarkdownViewer.exe
```

Build the self-contained portable ZIP file:
```bash
npm run make
```
Output archive will be created at:
```
out/make/zip/win32/x64/MarkdownViewer-win32-x64-1.0.0.zip
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
