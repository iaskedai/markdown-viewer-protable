import React, { useEffect } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// Set up marked options
const renderer = new marked.Renderer();

// Custom heading renderer with clean slug IDs and hover anchors
renderer.heading = (text, level) => {
  const cleanText = text.replace(/<[^>]*>/g, ''); // strip any nested html tags
  const slug = cleanText
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const fontSizes = {
    1: 'text-3xl font-extrabold mt-8 mb-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-2',
    2: 'text-2xl font-bold mt-7 mb-3.5 border-b border-slate-100/50 dark:border-slate-800/30 pb-1.5',
    3: 'text-xl font-bold mt-6 mb-3',
    4: 'text-lg font-semibold mt-5 mb-2.5',
    5: 'text-base font-semibold mt-4 mb-2',
    6: 'text-sm font-semibold mt-4 mb-2'
  };

  const fontSize = fontSizes[level] || 'text-xl';

  return `
    <h${level} id="${slug}" class="${fontSize} tracking-tight text-slate-900 dark:text-slate-50 group flex items-center scroll-mt-6">
      <span>${text}</span>
      <a href="#${slug}" class="ml-2 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity no-drag-region cursor-pointer select-none text-sm font-normal">#</a>
    </h${level}>
  `;
};

// Custom table elements for modern data grid styling
renderer.table = (header, body) => {
  return `
    <div class="my-6 overflow-x-auto rounded-lg border border-slate-200/50 dark:border-slate-800 shadow-sm max-w-full">
      <table class="w-full text-left border-collapse m-0">
        <thead class="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 sticky top-0">
          ${header}
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-950/40">
          ${body}
        </tbody>
      </table>
    </div>
  `;
};

renderer.tablerow = (content) => {
  return `
    <tr class="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 odd:bg-white dark:odd:bg-slate-950/20 even:bg-slate-50/10 dark:even:bg-slate-900/10 transition-colors">
      ${content}
    </tr>
  `;
};

renderer.tablecell = (content, flags) => {
  const align = flags.align ? `text-${flags.align}` : '';
  const cellType = flags.header ? 'th' : 'td';
  const padding = flags.header ? 'px-5 py-3' : 'px-5 py-3.5';
  const styleClass = flags.header 
    ? 'font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400' 
    : 'text-sm text-slate-700 dark:text-slate-300';
  
  return `
    <${cellType} class="${padding} ${align} ${styleClass} whitespace-normal break-words">
      ${content}
    </${cellType}>
  `;
};

// Custom code block renderer (with language badge, syntax highlighting, copy code buttons)
renderer.code = (code, language) => {
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
  let highlighted = code;
  try {
    highlighted = hljs.highlight(code, { language: validLanguage }).value;
  } catch (err) {
    highlighted = hljs.highlightAuto(code).value;
  }

  const codeId = `code-${Math.random().toString(36).substring(2, 11)}`;

  return `
    <div class="relative my-6 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 bg-slate-900 group">
      <div class="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/60 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
        <span>${validLanguage}</span>
        <button 
          id="btn-${codeId}"
          data-code-id="${codeId}"
          class="copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-slate-100 transition-colors duration-150 cursor-pointer select-none text-[11px]"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          Copy
        </button>
      </div>
      <pre class="overflow-x-auto p-4 m-0 text-[13px] font-mono leading-relaxed text-slate-300"><code id="${codeId}" class="hljs language-${validLanguage}">${highlighted}</code></pre>
    </div>
  `;
};

// Custom inline codespan styled as subtle pills
renderer.codespan = (code) => {
  return `<code class="px-1.5 py-0.5 mx-0.5 text-xs font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-700/60 select-text">${code}</code>`;
};

// Beautiful Left-Bordered Callouts & Blockquotes with iconography
renderer.blockquote = (quote) => {
  let content = quote.trim();
  
  // Clean up leading/trailing <p> wrappers if needed to match start of alert tag
  const noteRegex = /^<p>\s*\[!(NOTE|INFO)\]\s*(?:<br>)?/i;
  const warningRegex = /^<p>\s*\[!(WARNING|CAUTION)\]\s*(?:<br>)?/i;
  const successRegex = /^<p>\s*\[!(SUCCESS|TIP)\]\s*(?:<br>)?/i;
  const importantRegex = /^<p>\s*\[!(IMPORTANT)\]\s*(?:<br>)?/i;

  let alertType = null;
  let icon = '';
  let borderClass = '';
  let titleClass = '';
  let titleText = '';

  if (noteRegex.test(content)) {
    alertType = 'info';
    content = content.replace(noteRegex, '<p>');
    icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2".5 viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.085 1.085l-.04.02m0 0a.75.75 0 11-1.084-1.085m1.084 1.085l.041-.021a.75.75 0 111.085 1.086l-.04.022m-1.085-1.086V15.75m0 0a.75.75 0 11-1.084-1.085m1.084 1.085l.041-.02a.75.75 0 111.085 1.085l-.04.02m-9.041-3.93a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>`;
    borderClass = 'border-l-4 border-sky-500 bg-sky-50/30 dark:bg-sky-950/10';
    titleClass = 'text-sky-700 dark:text-sky-400';
    titleText = 'Info';
  } else if (warningRegex.test(content)) {
    alertType = 'warning';
    content = content.replace(warningRegex, '<p>');
    icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`;
    borderClass = 'border-l-4 border-amber-500 bg-amber-50/30 dark:bg-amber-950/10';
    titleClass = 'text-amber-700 dark:text-amber-400';
    titleText = 'Warning';
  } else if (successRegex.test(content)) {
    alertType = 'success';
    content = content.replace(successRegex, '<p>');
    icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    borderClass = 'border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10';
    titleClass = 'text-emerald-700 dark:text-emerald-400';
    titleText = 'Success';
  } else if (importantRegex.test(content)) {
    alertType = 'important';
    content = content.replace(importantRegex, '<p>');
    icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-4.437M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"></path></svg>`;
    borderClass = 'border-l-4 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10';
    titleClass = 'text-indigo-700 dark:text-indigo-400';
    titleText = 'Important';
  }

  if (alertType) {
    return `
      <div class="my-6 p-4 rounded-r-xl ${borderClass}">
        <div class="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wide ${titleClass}">
          ${icon}
          <span>${titleText}</span>
        </div>
        <div class="text-slate-700 dark:text-slate-300 text-[14.5px] leading-relaxed">${content}</div>
      </div>
    `;
  }

  return `
    <blockquote class="my-6 pl-4 border-l-4 border-slate-300 dark:border-slate-700 italic text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/10 py-1.5 rounded-r">
      ${quote}
    </blockquote>
  `;
};

// General typography overrides
renderer.paragraph = (text) => {
  return `<p class="my-4.5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">${text}</p>`;
};

renderer.list = (body, ordered, start) => {
  const tag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'list-decimal pl-6 my-4.5 space-y-2' : 'list-disc pl-6 my-4.5 space-y-2';
  return `<${tag} class="${listClass} text-slate-700 dark:text-slate-300 text-[15px]">${body}</${tag}>`;
};

renderer.listitem = (text) => {
  return `<li class="leading-relaxed">${text}</li>`;
};

renderer.link = (href, title, text) => {
  const titleAttr = title ? `title="${title}"` : '';
  return `<a href="${href}" ${titleAttr} target="_blank" class="external-link font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-4 decoration-2 decoration-indigo-500/20 hover:decoration-indigo-500 transition-colors duration-150">${text}</a>`;
};

marked.use({ renderer });

export default function MarkdownRenderer({ markdown }) {
  useEffect(() => {
    // Expose global click listener for copying code blocks
    const handleCopyClick = (e) => {
      const copyBtn = e.target.closest('.copy-code-btn');
      if (copyBtn) {
        const codeId = copyBtn.getAttribute('data-code-id');
        const codeElement = document.getElementById(codeId);
        if (codeElement) {
          const textToCopy = codeElement.innerText;
          navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied!
            `;
            copyBtn.classList.remove('bg-slate-800', 'hover:bg-slate-700');
            copyBtn.classList.add('bg-emerald-950/60', 'text-emerald-400', 'border', 'border-emerald-800/40');
            
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
              copyBtn.classList.add('bg-slate-800', 'hover:bg-slate-700');
              copyBtn.classList.remove('bg-emerald-950/60', 'text-emerald-400', 'border', 'border-emerald-800/40');
            }, 2000);
          });
        }
      }
    };

    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, []);

  const getHTMLContent = () => {
    if (!markdown) return '';
    const rawMarkup = marked.parse(markdown);
    return DOMPurify.sanitize(rawMarkup, {
      ADD_TAGS: ['iframe', 'button', 'svg', 'path'], // allow custom elements
      ADD_ATTR: ['target', 'onclick', 'data-code-id', 'class', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']
    });
  };

  return (
    <article 
      id="markdown-viewer-container"
      className="markdown-body text-slate-800 dark:text-slate-200 max-w-none select-text"
      dangerouslySetInnerHTML={{ __html: getHTMLContent() }}
    />
  );
}
