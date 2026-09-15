import React, { useState } from 'react';
import { Activity, Download, CheckCircle2, AlertTriangle, Clock, DollarSign, Zap, BarChart2, History, ListFilter } from 'lucide-react';
import { getExportCsvUrl, getExportMarkdownUrl } from '../services/api';

export default function TelemetryTable({ telemetryLogs, totalLatency, totalCost, certificationStatus, pastRuns = [] }) {
  const [viewMode, setViewMode] = useState('history'); // 'history' or 'trace'

  return (
    <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl p-5 shadow-lg flex flex-col gap-4">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#2A344A] pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Cost and Latency Analytics
          </h2>
          <p className="text-sm text-slate-300 font-mono mt-1">
            Historical Run Records & Granular API Telemetry Logs
          </p>
        </div>

        {/* View Switcher & Export CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sub-tab Switcher */}
          <div className="flex items-center bg-[#0B0F19] border border-[#2A344A] p-1 rounded-lg">
            <button
              onClick={() => setViewMode('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                viewMode === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Run History ({pastRuns.length})</span>
            </button>
            <button
              onClick={() => setViewMode('trace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                viewMode === 'trace'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Current Run Trace ({telemetryLogs?.length || 0})</span>
            </button>
          </div>

          {/* Export CSV / Markdown */}
          <a
            href={getExportCsvUrl()}
            download="veobench_report.csv"
            className="bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#2A344A] text-xs font-mono font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </a>
          <a
            href={getExportMarkdownUrl()}
            download="veobench_report.md"
            className="bg-[#0B0F19] hover:bg-slate-800 text-slate-200 border border-[#2A344A] text-xs font-mono font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export MD</span>
          </a>
        </div>
      </div>

      {/* VIEW 1: HISTORICAL BENCHMARK RUNS TABLE */}
      {viewMode === 'history' && (
        <div className="overflow-x-auto rounded-lg border border-[#2A344A] bg-[#0B0F19]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#131A2A] border-b border-[#2A344A] text-slate-300 uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Run ID / Time</th>
                <th className="py-3 px-3">Asset Classification</th>
                <th className="py-3 px-3">Model Variant</th>
                <th className="py-3 px-3">Directorial Camera Prompt</th>
                <th className="py-3 px-3 text-center">Scorecard</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Latency (s)</th>
                <th className="py-3 px-3 text-right">Cost ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A344A]/60 text-slate-200">
              {pastRuns && pastRuns.length > 0 ? (
                pastRuns.map((run, idx) => {
                  const createdDate = run.created_at 
                    ? new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '--';
                  return (
                    <tr key={run.run_id || idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-400">{run.run_id}</span>
                          <span className="text-[10px] text-slate-400">{createdDate}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300">
                          {run.asset_classification || 'Hotel Media'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-bold">
                        {run.model_name}
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-[280px] truncate" title={run.directorial_prompt}>
                        "{run.directorial_prompt}"
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-amber-400 font-bold">
                            {'★'.repeat(run.llm_stars || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (SSIM: {run.ssim_score ? run.ssim_score.toFixed(2) : '--'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                          run.certification_status === 'CERTIFIED' || run.certification_status === 'PASS'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {run.certification_status === 'CERTIFIED' || run.certification_status === 'PASS' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {run.certification_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-bold">
                        {typeof run.total_latency_sec === 'number' ? `${run.total_latency_sec.toFixed(2)}s` : run.total_latency_sec}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                        {typeof run.total_cost_usd === 'number' ? `$${run.total_cost_usd.toFixed(4)}` : run.total_cost_usd}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-mono text-xs">
                    No run history recorded yet. Execute benchmark tests to populate run history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: GRANULAR CURRENT RUN STEP TRACE TABLE */}
      {viewMode === 'trace' && (
        <div className="overflow-x-auto rounded-lg border border-[#2A344A] bg-[#0B0F19]">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#131A2A] border-b border-[#2A344A] text-slate-300 uppercase tracking-wider font-bold">
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
                      className={isTotal ? 'bg-blue-950/40 font-bold border-t-2 border-blue-500/50 text-white text-sm' : 'hover:bg-slate-900/50'}
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
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded border ${
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No active run logs loaded yet. Click "Run Benchmark Test" to initiate telemetry recording.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
