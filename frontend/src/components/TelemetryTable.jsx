import React from 'react';
import { Activity, Download, CheckCircle2, AlertTriangle, Clock, DollarSign, Zap, BarChart2 } from 'lucide-react';
import { getExportCsvUrl, getExportMarkdownUrl } from '../services/api';

export default function TelemetryTable({ telemetryLogs, totalLatency, totalCost, certificationStatus }) {
  
  return (
    <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2A344A] pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Cost and Latency Analytics
          </h2>
          <p className="text-sm text-slate-300 font-mono mt-1">Granular API Cost & Execution Latency Trace per Pipeline Step</p>
        </div>

        {/* Download Benchmark Report CTA Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={getExportCsvUrl()}
            download="veobench_report.csv"
            className="bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#2A344A] text-sm font-mono font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportMarkdownUrl()}
            download="veobench_report.md"
            className="bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#2A344A] text-sm font-mono font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export Markdown</span>
          </a>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="overflow-x-auto rounded-lg border border-[#2A344A] bg-[#0B0F19]">
        <table className="w-full text-left border-collapse font-mono text-sm">
          <thead>
            <tr className="bg-[#131A2A] border-b border-[#2A344A] text-slate-300 uppercase tracking-wider text-xs font-bold">
              <th className="py-3 px-4">Pipeline Step</th>
              <th className="py-3 px-4">Model / Component</th>
              <th className="py-3 px-4 text-right">Latency (s)</th>
              <th className="py-3 px-4 text-right">Estimated Cost ($)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Execution Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A344A]/60 text-slate-200">
            {telemetryLogs && telemetryLogs.length > 0 ? (
              telemetryLogs.map((log, idx) => {
                const isTotal = log.step_name === 'TOTAL PIPELINE';
                return (
                  <tr 
                    key={idx} 
                    className={isTotal ? 'bg-blue-950/40 font-bold border-t-2 border-blue-500/50 text-white text-base' : 'hover:bg-slate-900/50'}
                  >
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                      {isTotal ? '🚀 ' + log.step_name : log.step_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{log.component}</td>
                    <td className="py-3 px-4 text-right text-amber-300 font-bold">
                      {typeof log.latency_sec === 'number' ? `${log.latency_sec.toFixed(2)}s` : log.latency_sec}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      {typeof log.cost_usd === 'number' ? `$${log.cost_usd.toFixed(4)}` : log.cost_usd}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border ${
                        log.status === 'PASS' || log.status === 'CERTIFIED' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : log.status === 'WARN' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {log.status === 'PASS' || log.status === 'CERTIFIED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{log.details}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-sm">
                  No execution logs yet. Click "Run Benchmark Test" to initiate telemetry recording.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
