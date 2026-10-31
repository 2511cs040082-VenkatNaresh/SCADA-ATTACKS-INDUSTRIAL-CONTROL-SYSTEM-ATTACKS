import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Server, ArrowLeft, Activity, ShieldAlert, CheckCircle, Tag, FileText, Send, Radio } from 'lucide-react';
import { cn } from '../utils/cn';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  const fetchAssetDetail = () => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:5050/api/v1/assets/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setAsset(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssetDetail();
  }, [id]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !id) return;

    fetch(`http://localhost:5050/api/v1/assets/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote })
    })
      .then((res) => res.json())
      .then(() => {
        setNewNote('');
        fetchAssetDetail();
      })
      .catch(() => {});
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !id) return;

    fetch(`http://localhost:5050/api/v1/assets/${id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_name: newTag })
    })
      .then((res) => res.json())
      .then(() => {
        setNewTag('');
        fetchAssetDetail();
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-soc-textMuted">
        Loading asset profile details...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 text-center font-mono text-rose-400 space-y-4">
        <div>Asset not found or unavailable.</div>
        <Link to="/assets" className="px-4 py-2 bg-soc-panel border border-soc-panelBorder text-soc-textPrimary rounded text-xs">
          Back to Asset Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-soc-panelBorder pb-4">
        <div className="flex items-center space-x-3 font-mono">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-soc-textPrimary flex items-center gap-3">
              <Server className="w-5 h-5 text-soc-telemetry" />
              {asset.asset_name}
            </h1>
            <p className="text-xs text-soc-textMuted mt-0.5">
              IP: {asset.ip_address} • Purdue Level 1 Asset • Status: {asset.status}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className={cn(
            'px-2.5 py-1 rounded border font-bold',
            asset.health_state === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
          )}>
            HEALTH: {asset.health_state} ({asset.health_score}%)
          </span>
          <span className={cn(
            'px-2.5 py-1 rounded border font-bold',
            asset.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-slate-800 text-soc-textMuted border-soc-panelBorder'
          )}>
            RISK: {asset.risk_level} ({asset.risk_score})
          </span>
        </div>
      </div>

      {/* Grid Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Left Col: Identity & Metadata */}
        <div className="space-y-6">
          <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded space-y-3">
            <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2">
              IDENTITY & HARDWARE
            </div>
            <div className="space-y-1.5 text-soc-textSecondary">
              <div className="flex justify-between">
                <span className="text-soc-textMuted">Hostname:</span>
                <span className="text-soc-textPrimary font-semibold">{asset.hostname || asset.asset_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">IP Address:</span>
                <span className="text-soc-textPrimary font-semibold">{asset.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">MAC Address:</span>
                <span>{asset.mac_address || '00:1A:2B:3C:4D:5E'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">Vendor:</span>
                <span>{asset.vendor || 'Siemens Industrial'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">Model:</span>
                <span>{asset.model || 'SIMATIC S7-1500'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">Purdue Zone:</span>
                <span>{asset.zone_name || 'CONTROL_ZONE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-soc-textMuted">Criticality:</span>
                <span className="font-bold text-amber-400">{asset.criticality}</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded space-y-3">
            <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2 flex items-center justify-between">
              <span>ASSET TAGS</span>
              <Tag className="w-4 h-4 text-soc-telemetry" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {asset.tags?.length === 0 ? (
                <span className="text-soc-textMuted">No tags assigned.</span>
              ) : (
                asset.tags?.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 bg-slate-800 border border-soc-panelBorder text-soc-telemetry rounded text-[10px] font-bold">
                    #{t}
                  </span>
                ))
              )}
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add tag (e.g. CRITICAL_PUMP)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="bg-soc-bg border border-soc-panelBorder px-2.5 py-1 rounded text-soc-textPrimary focus:outline-none flex-1 text-xs"
              />
              <button type="submit" className="px-3 py-1 bg-soc-telemetry text-slate-950 font-bold rounded hover:bg-cyan-400 transition">
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Center & Right Col: Communication Baseline & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Protocols & Communications */}
          <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded space-y-4">
            <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2 flex items-center justify-between">
              <span>OBSERVED PROTOCOLS & COMMUNICATION BASELINE</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-soc-panelBorder p-3 rounded">
                <div className="font-bold text-soc-textMuted mb-2">OBSERVED PROTOCOLS</div>
                {asset.protocols?.length === 0 ? (
                  <div className="text-soc-textMuted">No protocols recorded yet.</div>
                ) : (
                  asset.protocols?.map((p: any) => (
                    <div key={p.protocol_name} className="flex justify-between py-1 border-b border-slate-800 text-soc-textPrimary font-semibold">
                      <span>{p.protocol_name}</span>
                      <span className="text-soc-textMuted font-normal">{p.observation_count || 1} observations</span>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-slate-900 border border-soc-panelBorder p-3 rounded">
                <div className="font-bold text-soc-textMuted mb-2">COMMUNICATION PARTNERS</div>
                {asset.communications?.length === 0 ? (
                  <div className="text-soc-textMuted">No baseline communication links.</div>
                ) : (
                  asset.communications?.map((c: any) => (
                    <div key={c.id} className="py-1 border-b border-slate-800 text-soc-textSecondary flex justify-between">
                      <span>{c.source_name} → {c.destination_name}</span>
                      <span className="text-emerald-400 font-bold">{c.protocol}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Analyst Notes Section */}
          <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded space-y-4">
            <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2 flex items-center justify-between">
              <span>ANALYST NOTES</span>
              <FileText className="w-4 h-4 text-sky-400" />
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                placeholder="Add analyst observation note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-soc-bg border border-soc-panelBorder p-2.5 rounded text-soc-textPrimary focus:outline-none focus:border-soc-telemetry text-xs min-h-[70px]"
              />
              <button type="submit" className="px-3 py-1.5 bg-soc-telemetry text-slate-950 font-bold rounded hover:bg-cyan-400 transition flex items-center gap-1.5 ml-auto">
                <Send className="w-3.5 h-3.5" /> Save Note
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {asset.notes?.length === 0 ? (
                <div className="text-soc-textMuted">No analyst notes recorded.</div>
              ) : (
                asset.notes?.map((n: any) => (
                  <div key={n.id} className="bg-slate-900 border border-soc-panelBorder p-3 rounded space-y-1">
                    <div className="flex justify-between text-soc-textMuted text-[10px]">
                      <span className="font-bold text-soc-textPrimary">{n.author_name}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-soc-textSecondary">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
