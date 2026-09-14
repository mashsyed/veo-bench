import React from 'react';
import { X, FileText, Check, Save } from 'lucide-react';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  customRubric, 
  setCustomRubric 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4">
        
        <div className="flex items-center justify-between border-b border-[#2A344A] pb-3">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Custom LLM-as-a-Judge Evaluation Rubric
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-slate-200 font-mono leading-relaxed font-medium">
          Gemini 3.8 Flash applies this exact evaluation rubric when judging generated Veo clips for prompt adherence, camera optical stability, and structural morphing.
        </p>

        <div>
          <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-2 font-bold">
            Active MarTech Evaluation Rubric Prompt:
          </label>
          <textarea
            rows={12}
            value={customRubric}
            onChange={(e) => setCustomRubric(e.target.value)}
            className="w-full bg-[#0B0F19] border border-[#2A344A] text-slate-200 text-sm rounded-lg p-3.5 focus:border-blue-500 focus:outline-none font-mono leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A344A]">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-bold"
          >
            <Check className="w-5 h-5" />
            <span>Save Rubric Criteria</span>
          </button>
        </div>

      </div>
    </div>
  );
}
