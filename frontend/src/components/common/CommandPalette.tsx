import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Server,
  AlertTriangle,
  ShieldAlert,
  PlaySquare,
  FileText,
  Settings,
  Grid,
  Zap,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { role, canExecuteSimulation } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const defaultCommands = [
    { title: 'Go to Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" />, path: '/dashboard', cat: 'NAV' },
    { title: 'Go to Asset Inventory', icon: <Server className="w-4 h-4 text-blue-400" />, path: '/assets', cat: 'NAV' },
    { title: 'Go to Alerts Console', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, path: '/alerts', cat: 'NAV' },
    { title: 'Go to Incident Workspace', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, path: '/incidents', cat: 'NAV' },
    { title: 'Go to Simulation Laboratory', icon: <PlaySquare className="w-4 h-4 text-emerald-400" />, path: '/simulation', cat: 'NAV' },
    { title: 'Go to MITRE ATT&CK Matrix', icon: <Grid className="w-4 h-4 text-purple-400" />, path: '/mitre', cat: 'NAV' },
    { title: 'Go to Defense & Response', icon: <Zap className="w-4 h-4 text-sky-400" />, path: '/response', cat: 'NAV' },
    { title: 'Go to Reports Generator', icon: <FileText className="w-4 h-4 text-slate-400" />, path: '/reports', cat: 'NAV' },
    { title: 'Go to System Settings', icon: <Settings className="w-4 h-4 text-slate-400" />, path: '/settings', cat: 'NAV' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await apiService.globalSearch(query);
        setSearchResults(results);
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.url) {
      navigate(item.url);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = query.trim() ? searchResults : defaultCommands;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (list.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + list.length) % (list.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (list[selectedIndex]) {
        handleSelect(list[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search Assets, Alerts, Incidents, Detections, MITRE Techniques, Commands... (Press Esc to exit)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {loading && <span className="text-xs text-cyan-400 animate-pulse">Searching...</span>}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results / Navigation List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/60">
          {query.trim() === '' ? (
            <div>
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Quick Navigation & Commands
              </div>
              {defaultCommands.map((cmd, idx) => (
                <div
                  key={cmd.path}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors ${
                    selectedIndex === idx ? 'bg-cyan-950/80 border border-cyan-800/80 text-cyan-200' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {cmd.icon}
                    <span className="font-medium">{cmd.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching assets, alerts, incidents, or techniques found for "{query}"
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Global Search Matches ({searchResults.length})
              </div>
              {searchResults.map((res, idx) => (
                <div
                  key={`${res.category}-${res.id}-${idx}`}
                  onClick={() => handleSelect(res)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer text-xs transition-colors ${
                    selectedIndex === idx ? 'bg-cyan-950/80 border border-cyan-800/80 text-cyan-200' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                        {res.category}
                      </span>
                      <span className="font-semibold text-slate-100">{res.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{res.subtitle}</span>
                  </div>
                  {res.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {res.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Role: <strong className="text-cyan-400">{role}</strong></span>
          </div>
          <div>Use ↑ ↓ to navigate, Enter to select, Esc to close</div>
        </div>
      </div>
    </div>
  );
};
