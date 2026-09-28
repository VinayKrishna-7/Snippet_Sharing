import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, Trash2, RotateCcw, Copy } from 'lucide-react';
import { getLanguageMeta } from '../utils/languages';

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '480px',
  readOnly = false,
  onResetTemplate,
}) {
  const editorRef = useRef(null);
  const langMeta = getLanguageMeta(language);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const lineCount = value ? value.split('\n').length : 0;
  const charCount = value ? value.length : 0;

  return (
    <div className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col transition-all focus-within:border-brand-500/50">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          {/* Mac-style window controls */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <FileCode className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-semibold text-slate-200">{langMeta.name}</span>
            <span className="text-slate-500 text-[11px]">({langMeta.ext})</span>
          </div>
        </div>

        {/* Stats and quick actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
            <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} / 100,000 chars</span>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1.5">
              {onResetTemplate && (
                <button
                  type="button"
                  onClick={onResetTemplate}
                  title="Insert starter code template"
                  className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden xs:inline">Template</span>
                </button>
              )}
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  title="Clear editor"
                  className="px-2 py-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden xs:inline">Clear</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative w-full overflow-hidden bg-[#1e1e1e]">
        <Editor
          height={height}
          language={langMeta.monaco || 'javascript'}
          value={value}
          theme="vs-dark"
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: 'smooth',
            renderWhitespace: 'none',
            folding: true,
            lineDecorationsWidth: 8,
          }}
          loading={
            <div className="h-[480px] flex items-center justify-center text-slate-500 text-xs font-mono">
              Loading code editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
