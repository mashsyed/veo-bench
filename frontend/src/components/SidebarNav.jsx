import React from 'react';
import { Film, DollarSign, Activity, Sparkles, ChevronRight, Layers, Cpu } from 'lucide-react';

export default function SidebarNav({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: 'benchmark',
      label: 'Veo Benchmark',
      description: 'Image-to-Video & Quality QA',
      icon: Film,
      badge: 'Core Studio',
      color: 'blue'
    },
    {
      id: 'cost_latency',
      label: 'Cost and Latency',
      description: 'Pipeline Telemetry & Analytics',
      icon: Activity,
      badge: 'Telemetry',
      color: 'emerald'
    }
  ];

  return (
    <aside className="w-72 bg-[#0F1623] border-r border-[#2A344A] flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="flex flex-col gap-6">
        {/* Brand / Pipeline Badge */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#131A2A] border border-[#2A344A] rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-100 font-mono tracking-tight">VeoBench v1.0</span>
            <span className="text-xs text-slate-400 font-mono">Expedia MarTech Platform</span>
          </div>
        </div>

        {/* Navigation Section Label */}
        <div className="flex flex-col gap-2">
          <span className="px-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Pipeline Navigation
          </span>

          {/* Nav Items */}
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1E293B] to-[#131A2A] border-blue-500/60 text-white shadow-md'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#131A2A]/80 hover:border-[#2A344A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg transition-colors ${
                        isActive
                          ? item.color === 'blue'
                            ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                            : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#1E293B]/60 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-mono font-bold ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                      <span className="text-xs font-sans text-slate-400 group-hover:text-slate-300">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-blue-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#131A2A]/60 border border-[#2A344A]/60 rounded-xl flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span>Target Model:</span>
          <span className="text-blue-400 font-bold">Veo 3.1</span>
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span>Judge Model:</span>
          <span className="text-purple-400 font-bold">Gemini 3.8</span>
        </div>
      </div>
    </aside>
  );
}
