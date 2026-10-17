# Premium Markdown Viewer Showcase

Welcome to your standalone, portable **Markdown Viewer** built with Electron, React, and Tailwind CSS.

## Features Overview

Here is a summary of the capabilities provided in this portable viewer:

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Frameless Window** | Windows 11 Fluent style title bar with custom drag and controls | Supported |
| **Drag & Drop** | Instant rendering upon dropping any `.md` file | Supported |
| **Sticky TOC** | Right-side table of contents with active scroll-spy | Supported |
| **Data Grids** | Modern zebra-striping with sticky header & rounded border | Supported |
| **Dark Mode** | Seamless toggle between modern light and deep dark themes | Supported |
| **Code Highlighting** | VS Code style syntax highlights with 1-click copy button | Supported |

---

## Blockquotes and Callouts

The viewer automatically converts GitHub-style alert callouts into elegant left-bordered cards with clean visual iconography:

> [!NOTE]
> This is an **Info Callout** box. Use it for context, background details, and general recommendations.

> [!SUCCESS]
> This is a **Success Callout** box. Great for highlighting completed operations, best practices, and milestones.

> [!WARNING]
> This is a **Warning Callout** box. Designed for critical steps, security notes, and potential pitfalls.

> [!IMPORTANT]
> This is an **Important Callout** box. Highlights mandatory parameters or prerequisite system requirements.

You can also use traditional blockquotes:

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra

---

## Code Blocks & Syntax Highlighting

Code blocks feature a language indicator badge, syntax highlighting, and a functional **Copy** button:

```typescript
interface DocumentViewerProps {
  filePath?: string;
  theme: 'light' | 'dark';
  enableToc: boolean;
}

export function initializeViewer(config: DocumentViewerProps): void {
  console.log(`Starting viewer with ${config.theme} mode.`);
}
```

```python
import sys

def parse_markdown(file_path: str) -> dict:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return {"file": file_path, "length": len(content)}

if __name__ == "__main__":
    print(parse_markdown("sample.md"))
```

Inline code is styled with subtle, pill-shaped tags: Use `electron-forge package` or `npm run make` to distribute your binary.

---

## Large Data Grid

A larger sample table demonstrating the sticky header and zebra-striped rows:

| ID | Module Name | Platform | Memory | Bundle Size |
| :--- | :--- | :--- | :--- | :--- |
| 001 | Electron Core | Win32 x64 | 45 MB | Standalone |
| 002 | React 18 Engine | Web / Local | 12 MB | Bundled |
| 003 | Tailwind CSS v4 | CSS Compiler | ~0 MB | 40 KB (Static) |
| 004 | Highlight.js | Offline Syntax | 8 MB | Embedded |
| 005 | Marked.js | Fast Parser | 2 MB | Embedded |
| 006 | Lucide Icons | Vector Glyphs | 1 MB | Embedded |

---

## Heading Anchors & Navigation

Click any heading or Table of Contents item on the right to navigate smoothly to that section.
