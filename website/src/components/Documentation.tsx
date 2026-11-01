import React, { useState } from 'react';
import { DOCS_DATA, DocSection } from '../data/docsData';
import { BookOpen, Search, Copy, Check, Terminal, ExternalLink, ChevronRight } from 'lucide-react';
import { OFFICIAL_RELEASE } from '../data/releaseData';

export const Documentation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(DOCS_DATA[0].id);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const filteredTopics = DOCS_DATA.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDoc = DOCS_DATA.find((d) => d.id === selectedTopicId) || DOCS_DATA[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section id="docs" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Technical Knowledgebase
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Platform Documentation & Manuals
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Comprehensive architectural specifications, protocol parsing logic, and detection rule references.
          </p>
        </div>

        {/* Search & Topic Selector Bar */}
        <div className="max-w-md mx-auto relative font-mono text-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documentation topics..."
            className="w-full bg-navy-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Docs Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-mono">
          {/* Left Index Column */}
          <div className="lg:col-span-4 bg-navy-900 rounded-xl border border-slate-800 p-3 space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-semibold px-2 py-1 block">
              Documentation Index
            </span>
            {filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  selectedTopicId === topic.id
                    ? 'bg-navy-950 border-cyan-500 text-white font-bold'
                    : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-[10px] text-cyan-400 block font-normal uppercase">{topic.category}</span>
                  <span className="truncate block font-sans text-xs">{topic.title}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedTopicId === topic.id ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            ))}

            {/* External Repo Docs Link */}
            <div className="pt-3 border-t border-slate-800">
              <a
                href={`${OFFICIAL_RELEASE.repoUrl}/tree/main/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-lg bg-navy-950 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors text-xs"
              >
                <span>Browse Full /docs on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Content Viewer */}
          <div className="lg:col-span-8 bg-navy-900 rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                {activeDoc.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
                {activeDoc.title}
              </h3>
              <p className="text-xs text-slate-400 font-sans pt-1">
                {activeDoc.summary}
              </p>
            </div>

            <div className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
              {activeDoc.content}
            </div>

            {activeDoc.codeSnippet && (
              <div className="space-y-2 pt-2 font-mono">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1.5 uppercase font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Technical Reference & Code:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(activeDoc.codeSnippet!)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-navy-950 rounded-lg border border-slate-800 text-cyan-300 text-xs overflow-x-auto whitespace-pre-wrap">
                  {activeDoc.codeSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
