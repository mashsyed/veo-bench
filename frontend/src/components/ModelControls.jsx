import React from 'react';
import { Settings, Dices, Lock, Unlock, AlertTriangle, Play, HelpCircle, Shield, FileText } from 'lucide-react';

export default function ModelControls({ 
  modelConfig, 
  setModelConfig, 
  onRunBenchmark, 
  isRunning,
  selectedImage,
  isPreflighting,
  cropLoading,
  onOpenRubricModal
}) {
  
  const handleRandomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 89999) + 1000;
    setModelConfig(prev => ({ ...prev, seed: randomSeed }));
  };

  const isPromptEmpty = !modelConfig.directorial_prompt || modelConfig.directorial_prompt.trim() === '';
  const isDisabled = isRunning || isPreflighting || cropLoading || !selectedImage || isPromptEmpty;

  const renderButtonContent = () => {
    if (isRunning) {
      return (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Executing Veo Certification Test...</span>
        </>
      );
    }
    if (!selectedImage) {
      return (
        <>
          <AlertTriangle className="w-4 h-4 text-slate-400" />
          <span>Upload Keyframe Image to Enable Test</span>
        </>
      );
    }
    if (isPreflighting) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          <span>Auditing Image Preflight...</span>
        </>
      );
    }
    if (cropLoading) {
      return (
        <>
          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
          <span>Processing Optical Axis Crop...</span>
        </>
      );
    }
    if (isPromptEmpty) {
      return (
        <>
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Enter Directorial Camera Prompt to Run</span>
        </>
      );
    }
    return (
      <>
        <Play className="w-5 h-5 fill-current text-white" />
        <span>🚀 RUN BENCHMARK TEST</span>
      </>
    );
  };

  return (
    <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#2A344A] pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          2. Mechanical Model Controls
        </h2>
        <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/30">
          Veo 3.1 Specification
        </span>
      </div>

      {/* Model & Resolution Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1.5 font-bold">Model Variant:</label>
          <select 
            value={modelConfig.model_name}
            onChange={(e) => setModelConfig(prev => ({ ...prev, model_name: e.target.value }))}
            className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-3 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="veo-3.1-fast-generate-001">veo-3.1-fast-generate-001 (Veo 3.1 Fast)</option>
            <option value="veo-3.1-generate-001">veo-3.1-generate-001 (Veo 3.1 Standard)</option>
            <option value="veo-3.1-lite-generate-001">veo-3.1-lite-generate-001 (Veo 3.1 Lite)</option>
            <option value="gemini-omni-1.1-flash-preview">gemini-omni-1.1-flash-preview (Omni Flash)</option>
            <option value="veo-3.0-generate-001">veo-3.0-generate-001 (Veo 3.0)</option>
            <option value="veo-2.0-generate-001">veo-2.0-generate-001 (Veo 2.0 Legacy)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1.5 font-bold">Resolution:</label>
          <div className="grid grid-cols-2 gap-2 bg-[#0B0F19] p-1 rounded-lg border border-[#2A344A]">
            {['720p', '1080p'].map(res => (
              <button
                key={res}
                type="button"
                onClick={() => setModelConfig(prev => ({ ...prev, resolution: res }))}
                className={`py-2 text-sm font-mono font-bold rounded transition-all ${
                  modelConfig.resolution === res 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration, Aspect Ratio, Seed Row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1 font-bold">
            Duration: <span className="text-blue-400 font-extrabold">{modelConfig.duration_seconds}s</span>
          </label>
          <input 
            type="range"
            min="3.0"
            max="8.0"
            step="0.5"
            value={modelConfig.duration_seconds}
            onChange={(e) => setModelConfig(prev => ({ ...prev, duration_seconds: parseFloat(e.target.value) }))}
            className="w-full accent-blue-500 cursor-pointer mt-1 h-2 bg-slate-800 rounded"
          />
        </div>

        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1 font-bold">Aspect Ratio:</label>
          <select 
            value={modelConfig.aspect_ratio}
            onChange={(e) => setModelConfig(prev => ({ ...prev, aspect_ratio: e.target.value }))}
            className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Vertical)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1 font-bold">Seed:</label>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={modelConfig.seed}
              disabled={modelConfig.seed_locked}
              onChange={(e) => setModelConfig(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))}
              className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleRandomizeSeed}
              disabled={modelConfig.seed_locked}
              title="Randomize Seed"
              className="p-2.5 bg-[#0B0F19] border border-[#2A344A] hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-mono disabled:opacity-40"
            >
              <Dices className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setModelConfig(prev => ({ ...prev, seed_locked: !prev.seed_locked }))}
              title={modelConfig.seed_locked ? 'Unlock Seed' : 'Lock Seed'}
              className={`p-2.5 border rounded-lg text-sm font-mono transition-colors ${
                modelConfig.seed_locked 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-[#0B0F19] border-[#2A344A] text-slate-400 hover:text-slate-200'
              }`}
            >
              {modelConfig.seed_locked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Directorial Prompt */}
      <div>
        <label className="text-sm font-mono text-slate-200 block mb-1.5 font-bold">Directorial Camera Prompt:</label>
        <textarea 
          rows={2}
          value={modelConfig.directorial_prompt}
          placeholder="e.g. The camera moves from left to right across the scene..."
          onChange={(e) => setModelConfig(prev => ({ ...prev, directorial_prompt: e.target.value }))}
          className={`w-full bg-[#0B0F19] border text-slate-200 text-sm rounded-lg p-3 focus:border-blue-500 focus:outline-none font-mono leading-relaxed transition-all ${
            !modelConfig.directorial_prompt || modelConfig.directorial_prompt.trim() === ''
              ? 'border-amber-500/60 ring-1 ring-amber-500/20'
              : 'border-[#2A344A]'
          }`}
        />
      </div>

      {/* Negative Prompt */}
      <div>
        <label className="text-sm font-mono text-slate-200 block mb-1.5 font-bold text-rose-300 flex items-center justify-between">
          <span>Dedicated Negative Constraints:</span>
          <span className="text-xs text-slate-400 font-mono">Anti-Morphing Safeguard</span>
        </label>
        <textarea 
          rows={2}
          value={modelConfig.negative_prompt}
          onChange={(e) => setModelConfig(prev => ({ ...prev, negative_prompt: e.target.value }))}
          className="w-full bg-[#0B0F19] border border-rose-500/30 text-rose-200 text-sm rounded-lg p-3 focus:border-rose-500 focus:outline-none font-mono leading-relaxed"
        />
      </div>

      {/* Prompt Expansion & End-Frame Conditioning Toggles */}
      <div className="grid grid-cols-2 gap-4 bg-[#0B0F19] p-3.5 rounded-lg border border-[#2A344A]">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input 
            type="checkbox"
            checked={modelConfig.enhance_prompt}
            onChange={(e) => setModelConfig(prev => ({ ...prev, enhance_prompt: e.target.checked }))}
            className="w-4 h-4 rounded border-[#2A344A] bg-slate-900 text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-mono text-slate-200 group-hover:text-white font-medium">Prompt Expansion</span>
            <div title="Prevents model rewriter from adding erratic camera movements" className="text-slate-500 hover:text-slate-300">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input 
            type="checkbox"
            checked={modelConfig.use_last_frame}
            onChange={(e) => setModelConfig(prev => ({ ...prev, use_last_frame: e.target.checked }))}
            className="w-4 h-4 rounded border-[#2A344A] bg-slate-900 text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer"
          />
          <span className="text-sm font-mono text-slate-200 group-hover:text-white font-medium">
            Use <code className="text-emerald-400 font-bold">last_frame</code> Conditioning
          </span>
        </label>
      </div>

      {/* Safety & Persona Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1 font-bold">Person Generation:</label>
          <select 
            value={modelConfig.person_generation}
            onChange={(e) => setModelConfig(prev => ({ ...prev, person_generation: e.target.value }))}
            className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="dont_allow">dont_allow (Enterprise)</option>
            <option value="allow_adult">allow_adult</option>
            <option value="allow_all">allow_all</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-mono text-slate-200 block mb-1 font-bold">Safety Threshold Mode:</label>
          <select 
            value={modelConfig.safety_setting}
            onChange={(e) => setModelConfig(prev => ({ ...prev, safety_setting: e.target.value }))}
            className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-2.5 focus:border-blue-500 focus:outline-none font-mono"
          >
            <option value="BLOCK_ONLY_HIGH">BLOCK_ONLY_HIGH (Hospitality)</option>
            <option value="BLOCK_MEDIUM_AND_ABOVE">BLOCK_MEDIUM_AND_ABOVE</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={onRunBenchmark}
          disabled={isDisabled}
          className={`w-full font-extrabold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-base tracking-wide ${
            isDisabled 
              ? 'bg-[#1E293B] border border-slate-700/60 text-slate-400 cursor-not-allowed opacity-75 shadow-none' 
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25 cursor-pointer'
          }`}
        >
          {renderButtonContent()}
        </button>
      </div>

    </div>
  );
}
