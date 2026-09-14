import React from 'react';
import { ShieldCheck, Activity, DollarSign, Zap, Server, Database, Sparkles } from 'lucide-react';

export default function Header({ telemetry, onOpenRubricModal }) {
  return (
    <header className="bg-[#131A2A] border-b border-[#2A344A] px-6 py-3 sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-2.5 rounded-lg shadow-md border border-blue-400/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                VeoBench <span className="text-xs px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 font-semibold">v1.0 MarTech</span>
              </h1>
              {telemetry?.mock_mode ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  MOCK TELEMETRY
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE VERTEX AI
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 flex items-center gap-3 mt-1 font-mono">
              <span className="flex items-center gap-1.5"><Server className="w-4 h-4 text-slate-400" /> {telemetry?.gcp_project_id || 'expedia-martech-genai'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-slate-400" /> {telemetry?.gcp_region || 'us-central1'}</span>
            </p>
          </div>
        </div>

        {/* Global Cumulative Session Telemetry */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          
          <div className="bg-[#0B0F19] border border-[#2A344A] px-4 py-2 rounded-lg flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs uppercase font-mono text-slate-400 tracking-wider font-semibold">Total Runs</p>
              <p className="text-base font-bold font-mono text-slate-100">{telemetry?.total_runs ?? 0}</p>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-[#2A344A] px-4 py-2 rounded-lg flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs uppercase font-mono text-slate-400 tracking-wider font-semibold">Total Spend</p>
              <p className="text-base font-bold font-mono text-emerald-400">${(telemetry?.total_spend_usd ?? 0.0).toFixed(4)}</p>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-[#2A344A] px-4 py-2 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs uppercase font-mono text-slate-400 tracking-wider font-semibold">First-Pass Yield</p>
              <p className="text-base font-bold font-mono text-purple-300">{telemetry?.avg_first_pass_yield_pct ?? 100}%</p>
            </div>
          </div>

          <div className="bg-[#0B0F19] border border-[#2A344A] px-4 py-2 rounded-lg flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs uppercase font-mono text-slate-400 tracking-wider font-semibold">Mean Latency</p>
              <p className="text-base font-bold font-mono text-amber-300">{telemetry?.mean_latency_sec ?? 0.0}s</p>
            </div>
          </div>

          <button 
            onClick={onOpenRubricModal}
            className="ml-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-sm px-4 py-2.5 rounded-lg transition-colors font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <span>📜 QA Rubric</span>
          </button>

        </div>

      </div>
    </header>
  );
}
