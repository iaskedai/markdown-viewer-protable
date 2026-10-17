import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Clock, 
  Compass, 
  Sparkles,
  FolderOpen
} from 'lucide-react';
import TitleBar from './TitleBar';
import MarkdownRenderer from './MarkdownRenderer';

export default function App() {
  const [file, setFile] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const viewerScrollContainerRef = useRef(null);

  // Set default theme to dark
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for files passed via command line arguments on startup
  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onOpenFileFromArg((data) => {
        if (data && data.content) {
          setFile({
            name: data.name,
            path: data.path,
            content: data.content
          });
        }
      });
      return unsubscribe;
    }
  }, []);

  // Auto-generate TOC from rendered DOM headings
  useEffect(() => {
    if (!file) {
      setToc([]);
      setActiveId('');
      return;
    }

    // Give the renderer a brief moment to write DOM
    const timer = setTimeout(() => {
      const container = document.getElementById('markdown-viewer-container');
      if (container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4');
        const list = Array.from(headings).map((el, index) => {
          const id = el.id || `heading-${index}`;
          // Ensure it has an ID
          if (!el.id) el.id = id;
          return {
            id: id,
            text: el.textContent.replace('#', '').trim(), // strip anchor link
            level: parseInt(el.tagName.replace('H', ''), 10)
          };
        });
        setToc(list);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [file]);

  // Scroll spy to highlight active TOC heading
  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible sections
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // Sort by top coordinate to get the highest one in view
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      { 
        root: viewerScrollContainerRef.current,
        rootMargin: '-40px 0px -70% 0px', // focused in top-middle area
        threshold: 0 
      }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc, file]);

  // Handle Native file dialog browsing
  const handleBrowse = async () => {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.openFileDialog();
      if (result) {
        setFile(result);
      }
    } catch (err) {
      alert(`Error reading file: ${err.message}`);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const filePath = droppedFile.path; // Electron exposes file.path directly

      if (filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown') || filePath.endsWith('.txt'))) {
        try {
          const result = await window.electronAPI.readFileContent(filePath);
          if (result) {
            setFile(result);
          }
        } catch (err) {
          alert(`Error reading dropped file: ${err.message}`);
        }
      } else {
        alert('Please drop a valid Markdown file (.md, .markdown)');
      }
    }
  };

  const handleBackToLanding = () => {
    setFile(null);
  };

  // Calculate read metrics
  const getReadStats = () => {
    if (!file || !file.content) return { words: 0, time: 0 };
    const cleanContent = file.content.replace(/[#*`_\[\]()\-]/g, '');
    const words = cleanContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    const time = Math.max(1, Math.round(words / 200)); // ~200 WPM
    return { words, time };
  };

  const { words, time } = getReadStats();

  const handleTocClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden font-sans">
      {/* Frameless TitleBar */}
      <TitleBar fileName={file ? file.name : ''} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex relative overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {/* Landing State */}
        {!file && (
          <div className="flex-grow flex items-center justify-center p-8">
            <div className={`relative max-w-xl w-full p-10 rounded-2xl border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg shadow-xl ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20 scale-102' 
                : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}>
              
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Open Markdown Document
              </h2>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
                Drag and drop your <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500">.md</code> file here, or browse local files.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleBrowse}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm shadow-md hover:shadow-indigo-500/20 transition-all duration-150 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  Browse File
                </button>
              </div>

              {/* Theme Toggle in Landing */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="absolute top-4 right-4 p-2.5 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Viewer State */}
        {file && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left/Main Column - Markdown Scroller */}
            <div 
              ref={viewerScrollContainerRef}
              className="flex-grow overflow-y-auto px-6 md:px-12 py-8 scrollbar"
            >
              <div className="max-w-4xl mx-auto">
                {/* Control bar */}
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/60 pb-6 mb-8">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToLanding}
                      className="flex items-center justify-center p-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                      title="Back to Landing"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h1 className="text-sm font-bold truncate max-w-[240px] md:max-w-[400px]">
                        {file.name}
                      </h1>
                      <div className="flex items-center gap-4 mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {words.toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {time} min read
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                      title="Toggle Theme"
                    >
                      {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Render parsed HTML */}
                <div className="pb-24">
                  <MarkdownRenderer markdown={file.content} />
                </div>
              </div>
            </div>

            {/* Right Column - Table of Contents Sidebar */}
            {toc.length > 0 && (
              <aside className="hidden lg:block w-72 border-l border-slate-200/50 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-950/20 backdrop-blur-sm overflow-y-auto py-8 px-6 select-none">
                <div className="flex items-center gap-2 mb-6 font-bold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <Compass className="w-4 h-4 text-indigo-500/80 dark:text-indigo-400/80" />
                  <span>Table of Contents</span>
                </div>
                
                <nav className="space-y-2 text-sm leading-relaxed border-l border-slate-200 dark:border-slate-800/80 ml-2.5 pl-0">
                  {toc.map((item, index) => {
                    const indent = {
                      1: 'pl-3 font-semibold text-slate-700 dark:text-slate-300',
                      2: 'pl-6 text-slate-500 dark:text-slate-400',
                      3: 'pl-9 text-slate-400 dark:text-slate-500 text-xs',
                      4: 'pl-12 text-slate-400/80 dark:text-slate-500/80 text-xs'
                    }[item.level] || 'pl-3';

                    const isActive = activeId === item.id;

                    return (
                      <a
                        key={`${item.id}-${index}`}
                        href={`#${item.id}`}
                        onClick={(e) => handleTocClick(e, item.id)}
                        className={`block py-1 pr-2 relative -ml-[1px] border-l hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 text-xs font-medium ${indent} ${
                          isActive 
                            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold' 
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.text}
                      </a>
                    );
                  })}
                </nav>
              </aside>
            )}

          </div>
        )}

        {/* Drag Overlay visual cue */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-950/20 border-4 border-indigo-500 backdrop-blur-sm z-40 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
            <div className="p-5 rounded-full bg-white dark:bg-slate-900 shadow-2xl scale-110 animate-bounce flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="mt-4 text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              Drop file to view
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
