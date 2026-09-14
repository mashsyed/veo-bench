import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle, RefreshCw, AlertCircle, Wand2, Copy, Check } from 'lucide-react';
import { optimizePrompt } from '../services/api';

export default function PromptOptimizer({ 
  modelConfig, 
  setModelConfig, 
  evalScorecard, 
  onApplyAndRerun 
}) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(type);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setIsApplied(false);
    try {
      const payload = {
        original_prompt: modelConfig.directorial_prompt,
        original_negative_prompt: modelConfig.negative_prompt,
        dimension_scores: evalScorecard?.dimension_scores || null,
        llm_reasoning: evalScorecard?.llm_reasoning || null
      };
      const res = await optimizePrompt(payload);
      setOptimizationResult(res);
    } catch (err) {
      console.error('Prompt optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyPrompt = () => {
    if (!optimizationResult) return;
    setModelConfig(prev => ({
      ...prev,
      directorial_prompt: optimizationResult.optimized_prompt,
      negative_prompt: optimizationResult.optimized_negative_prompt
    }));
    setIsApplied(true);
  };

  return (
    <div className="bg-[#0F1623] border border-[#2A344A] rounded-xl p-4 md:p-5 shadow-lg flex flex-col gap-4">
      {/* Section 4 Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-400" />
            Section 4: AI Prompt Optimizer & MarTech Refinement Loop
          </span>
        </div>
        <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-full font-bold">
          Closed-Loop Optimization
        </span>
      </div>

      {!evalScorecard && (
        <div className="text-sm text-slate-300 font-mono italic py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          Run a benchmark test first to generate QA metric rationales for AI prompt optimization.
        </div>
      )}

      {evalScorecard && !optimizationResult && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#131A2A] border border-[#2A344A] p-4 rounded-lg">
          <div className="text-sm font-sans text-slate-200 leading-relaxed">
            <span className="font-bold text-purple-300">Closed-Loop AI Prompt Optimization:</span> Gemini Flash will analyze the 8 metric rationales from Section 3 to synthesize an enhanced prompt engineered for Google Veo.
          </div>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-sm font-extrabold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                Synthesizing Prompt...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                ✨ Optimize Prompt with AI
              </>
            )}
          </button>
        </div>
      )}

      {optimizationResult && (
        <div className="flex flex-col gap-3 bg-[#131A2A] border border-purple-900/60 p-4 rounded-lg">
          {/* Optimization Rationale */}
          <div className="bg-[#0B0F19] border border-purple-800/40 p-3.5 rounded-lg flex flex-col gap-1">
            <span className="font-bold text-amber-400 font-mono text-xs uppercase tracking-wider">
              Optimization Rationale:
            </span>
            <p className="text-sm font-sans text-slate-100 leading-relaxed font-medium">
              "{optimizationResult.optimization_rationale}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Optimized Directorial Prompt */}
            <div className="bg-[#0B0F19] border border-[#2A344A] p-3 rounded-md flex flex-col gap-1.5 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Refined Directorial Prompt:
                </span>
                <button
                  onClick={() => handleCopy(optimizationResult.optimized_prompt, 'prompt')}
                  className="p-1.5 text-slate-300 hover:text-emerald-300 hover:bg-[#1E293B] rounded transition-colors flex items-center gap-1 font-mono text-xs font-semibold"
                  title="Copy prompt to clipboard"
                >
                  {copiedField === 'prompt' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-slate-100 text-xs leading-relaxed pr-2 font-medium">
                {optimizationResult.optimized_prompt}
              </p>
            </div>

            {/* Enhanced Negative Prompt */}
            <div className="bg-[#0B0F19] border border-[#2A344A] p-3 rounded-md flex flex-col gap-1.5 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-rose-400" />
                  Enhanced Anti-Artifact Negative Constraints:
                </span>
                <button
                  onClick={() => handleCopy(optimizationResult.optimized_negative_prompt, 'negative')}
                  className="p-1.5 text-slate-300 hover:text-rose-300 hover:bg-[#1E293B] rounded transition-colors flex items-center gap-1 font-mono text-xs font-semibold"
                  title="Copy negative prompt to clipboard"
                >
                  {copiedField === 'negative' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-slate-200 text-xs leading-relaxed pr-2 font-medium">
                {optimizationResult.optimized_negative_prompt}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="px-3.5 py-2 bg-[#1E293B] hover:bg-[#334155] text-slate-200 font-mono text-xs font-semibold rounded-md transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin text-purple-400' : ''}`} />
              Re-Synthesize
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyPrompt}
                className={`px-4 py-2 font-mono text-xs font-extrabold rounded-md transition-all flex items-center gap-2 shadow-sm ${
                  isApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-white" />
                    Applied to Model Controls!
                  </>
                ) : (
                  <>
                    ⚡ Apply Optimized Prompt to Controls
                  </>
                )}
              </button>

              {isApplied && onApplyAndRerun && (
                <button
                  onClick={onApplyAndRerun}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-extrabold rounded-md transition-all shadow-md flex items-center gap-2"
                >
                  🚀 Run Pass 2 Benchmark
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
