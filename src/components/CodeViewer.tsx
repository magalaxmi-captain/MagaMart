import React, { useState } from 'react';
import { JAVA_FILES } from '../data/javaCodebase';
import { JavaCodeFile } from '../types';
import { Code2, Copy, Check, FileCode, Shield, Server, Database, Layers } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaCodeFile>(JAVA_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = Array.from(new Set(JAVA_FILES.map(f => f.category)));

  const filteredFiles = JAVA_FILES.filter(
    f => f.fileName.toLowerCase().includes(searchFilter.toLowerCase()) ||
         f.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
         f.path.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Layers className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
              Java Servlet / JSP + DAO Architecture
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">MagaMart Backend Codebase</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete, copy-pasteable production Java classes, JSP templates, MySQL DDL, and web.xml deployment descriptor.
          </p>
        </div>

        {/* Security Highlights Pill */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-slate-300">
            <div className="font-semibold text-white">Security Hardened:</div>
            <div className="text-[11px] text-slate-400">
              PreparedStatements, PBKDF2 Hashing, Session Fixation Guards
            </div>
          </div>
        </div>
      </div>

      {/* Main Code Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: File Navigator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Project Structure
            </label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter files..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 mb-3"
            />
          </div>

          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {categories.map((category) => {
              const filesInCat = filteredFiles.filter(f => f.category === category);
              if (filesInCat.length === 0) return null;

              return (
                <div key={category}>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {filesInCat.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                          selectedFile.id === file.id
                            ? 'bg-sky-500/10 border border-sky-500/40 text-sky-300 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
                          <span className="truncate">{file.fileName}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-sans uppercase">
                          {file.language}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Display & Action Bar */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
          
          {/* File Header Bar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">
                  {selectedFile.fileName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-sky-300 border border-slate-700">
                  {selectedFile.category}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                {selectedFile.path}
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code Block</span>
                </>
              )}
            </button>
          </div>

          {/* Description & Usage Note */}
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <span className="font-semibold text-slate-300 flex-shrink-0">Architecture Role:</span>
            <span>{selectedFile.description}</span>
          </div>

          {/* Source Code Container with Syntax Appearance */}
          <div className="p-4 overflow-x-auto bg-[#0b0f19] max-h-[600px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed tab-4">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

          {/* Footer Highlights */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Stack: Java 17+ (Servlets 4.0 / Jakarta EE) + MySQL 8.0 Connector/J</span>
            <span>UTF-8 • Strict Typed</span>
          </div>

        </div>

      </div>

    </div>
  );
};
