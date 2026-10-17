import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, FileText } from 'lucide-react';

export default function TitleBar({ fileName }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
      
      const unsubscribe = window.electronAPI.onMaximizedStatus((status) => {
        setIsMaximized(status);
      });
      
      return unsubscribe;
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximize();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.close();
  };

  return (
    <div className="drag-region flex items-center justify-between w-full h-10 select-none bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md text-slate-700 dark:text-slate-300 transition-colors duration-200 z-50">
      {/* Title details & Logo */}
      <div className="no-drag-region flex items-center gap-2 pl-3">
        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
          MD VIEWER
        </span>
        {fileName && (
          <>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold truncate max-w-[280px] text-slate-700 dark:text-slate-200">
              {fileName}
            </span>
          </>
        )}
      </div>

      {/* Spacer for drag */}
      <div className="flex-1 h-full" />

      {/* Window Action Controls */}
      <div className="no-drag-region flex items-center h-full">
        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-11 h-full hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors duration-150 text-slate-500 dark:text-slate-400"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-11 h-full hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors duration-150 text-slate-500 dark:text-slate-400"
          title={isMaximized ? "Restore Down" : "Maximize"}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3 rotate-180 text-slate-500 dark:text-slate-400" />
          ) : (
            <Square className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-12 h-full hover:bg-red-500 hover:text-white transition-colors duration-150 text-slate-500 dark:text-slate-400"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
