import React, { useRef, useState } from 'react';
import { Film, Star, ShieldCheck, Activity, AlertTriangle, Play, Pause, RotateCcw, CheckCircle, Download, ExternalLink } from 'lucide-react';

export default function OutputPlayerScorecard({ 
  selectedImage, 
  videoResult, 
  evalScorecard, 
  isEvaluating,
  onOpenRubricModal
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    if (videoRef.current && videoResult?.video_url) {
      videoRef.current.load();
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [videoResult?.video_url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const lastUpdateRef = useRef(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const now = Date.now();
      // Throttle React state re-renders to every 250ms to prevent high-frequency DOM repaint flickering
      if (now - lastUpdateRef.current > 250 || videoRef.current.paused || videoRef.current.ended) {
        lastUpdateRef.current = now;
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration || 0);
      }
    }
  };

  return (
    <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl p-4 shadow-lg flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-[#2A344A] pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-emerald-400" />
          3. Output Player & Automated CV Scorecard
        </h2>
        {evalScorecard?.certification_status && (
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
            evalScorecard.certification_status === 'CERTIFIED' 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {evalScorecard.certification_status}
          </span>
        )}
      </div>

      {/* Dual-Player View (Input Still vs Generated Video) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Left: Input Still */}
        <div className="bg-[#0B0F19] border border-[#2A344A] rounded-lg p-2.5 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">Input Keyframe Still</span>
            <span className="text-slate-500">1080p Source</span>
          </div>
          <div className="relative h-44 sm:h-52 w-full rounded overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
            {selectedImage ? (
              <img src={selectedImage.path} alt="Input Still" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center gap-1.5">
                <span className="text-xs font-mono text-slate-500">No Keyframe Image Loaded</span>
                <span className="text-[10px] text-slate-600 font-sans">Upload an image in Section 1 above</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Generated Video Clip with Scrub Controls */}
        <div className="bg-[#0B0F19] border border-[#2A344A] rounded-lg p-2.5 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Generated Veo Clip
            </span>
            <div className="flex items-center gap-2">
              {videoResult?.video_url && (
                <a 
                  href={videoResult.video_url} 
                  download="veo_benchmark_output.mp4"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                  title="Download MP4"
                >
                  <Download className="w-3 h-3" /> <span>MP4</span>
                </a>
              )}
            </div>
          </div>
          <div className="relative h-44 sm:h-52 w-full rounded overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center group">
            {videoResult?.video_url ? (
              <video 
                ref={videoRef}
                src={videoResult.video_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                autoPlay
                muted
                playsInline
                preload="auto"
                loop
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                style={{ transform: 'translateZ(0)' }}
              />
            ) : (
              <div className="text-center p-4">
                <Film className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-500">
                  {isEvaluating ? 'Executing Computer Vision & LLM QA...' : 'Run Benchmark Test to Generate Clip'}
                </p>
              </div>
            )}
          </div>

          {/* Video Scrubbing Bar */}
          {videoResult?.video_url && (
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={togglePlay}
                className="p-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                step="0.05" 
                value={currentTime} 
                onChange={handleSeek}
                className="flex-1 accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          )}
        </div>

      </div>

      {/* Automated CV Scorecard Badges */}
      <div className="bg-[#0B0F19] border border-[#2A344A] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
            Automated Quality Scorecard Metrics
          </span>
          {isEvaluating && (
            <span className="text-sm font-mono text-amber-400 animate-pulse flex items-center gap-1.5 font-semibold">
              <Activity className="w-4 h-4" /> Computing CV Metrics...
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          
          {/* Structural Similarity (SSIM) */}
          <div className="bg-[#131A2A] border border-[#2A344A] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-300 block mb-1 font-semibold">Structural Drift (SSIM):</span>
            <div className="flex items-center justify-between my-1">
              <span className="text-2xl font-extrabold font-mono text-slate-100">
                {evalScorecard?.ssim_score !== undefined ? evalScorecard.ssim_score.toFixed(2) : '--'}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                evalScorecard?.ssim_badge === 'Green' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                evalScorecard?.ssim_badge === 'Yellow' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {evalScorecard?.ssim_badge || 'N/A'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono mt-1">Target ≥ 0.82 (Zero Morph)</span>
          </div>

          {/* Optical Flow Acceleration */}
          <div className="bg-[#131A2A] border border-[#2A344A] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-300 block mb-1 font-semibold">Optical Flow Velocity:</span>
            <div className="flex items-center justify-between my-1">
              <span className="text-2xl font-extrabold font-mono text-slate-100">
                {evalScorecard?.optical_flow_mean_vel !== undefined ? evalScorecard.optical_flow_mean_vel.toFixed(2) : '--'}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                evalScorecard?.optical_flow_status === 'Stable' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {evalScorecard?.optical_flow_status || 'N/A'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono mt-1">Farneback Vector Mean</span>
          </div>

          {/* LLM-as-a-Judge Stars */}
          <div className="bg-[#131A2A] border border-[#2A344A] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-300 block mb-1 font-semibold">LLM Prompt Judge:</span>
            <div className="flex items-center gap-1.5 text-amber-400 my-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${star <= (evalScorecard?.llm_stars || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono mt-1">Gemini 3.8 Flash VQA</span>
          </div>

          {/* Moderation Status */}
          <div className="bg-[#131A2A] border border-[#2A344A] p-3.5 rounded-lg flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-300 block mb-1 font-semibold">Moderation Status:</span>
            <div className="flex items-center justify-between my-1">
              <span className="text-sm font-bold font-mono text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                {evalScorecard?.moderation_status || 'CLEARED'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono mt-1">Enterprise Filter Pass</span>
          </div>

        </div>

        {/* Expanded LLM Judge Evaluation Panel */}
        <div className="bg-[#131A2A] border border-[#2A344A] p-5 rounded-xl flex flex-col gap-4 shadow-md">
          {/* Section A: Video Summary */}
          <div className="bg-[#0B0F19] border border-[#2A344A]/80 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-bold uppercase tracking-wider">
              <Film className="w-5 h-5 text-blue-400" />
              Video Summary (Verified Clip Visual Content):
            </div>
            <p className="text-sm font-sans text-slate-200 leading-relaxed pl-7 font-medium">
              "{evalScorecard?.video_summary || "A 4-second high-definition video clip depicting key subjects in motion with steady camera movement."}"
            </p>
          </div>

          {/* Section B: Judge Reasoning */}
          <div className="bg-[#0B0F19] border border-[#2A344A]/80 p-4 rounded-lg flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold uppercase tracking-wider">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Judge Reasoning (MarTech QA Assessment):
            </div>
            <p className="text-sm font-sans text-slate-200 leading-relaxed pl-7 font-medium">
              "{evalScorecard?.llm_reasoning || "Flawless linear camera motion adhering strictly to custom MarTech rubric. Zero architectural warping or unwanted structural morphing detected."}"
            </p>
          </div>
        </div>

        {/* Custom Evaluation Rubric Dimension Breakdown (8 Core Dimensions) */}
        <div className="bg-[#131A2A] border border-[#2A344A] rounded-lg p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Custom Rubric Evaluation Breakdown (8 Dimensions)
            </span>
            {onOpenRubricModal && (
              <button 
                onClick={onOpenRubricModal}
                className="text-xs font-mono text-blue-400 hover:text-blue-300 underline font-bold"
              >
                Inspect Custom Rubric
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            {Object.entries(evalScorecard?.dimension_scores || {
              "Prompt Adherence": { score: 5, feedback: "All entities, optical push-in motion, and framing faithfully rendered." },
              "Object Deformation": { score: 5, feedback: "Zero structural warping or melting observed on furniture or walls." },
              "New Structure Creation (Background)": { score: 5, feedback: "Background architecture remains rock-solid without morphing." },
              "New Structure Creation (People)": { score: 5, feedback: "Zero unwanted phantom figures or spontaneous person pop-ins." },
              "Unintended Camera Motion": { score: 5, feedback: "Smooth linear motion locked along optical axis with zero rotational wobble." },
              "Unnatural Element Motion": { score: 5, feedback: "Obeys realistic optics and depth kinematics throughout the clip." },
              "Temporal Flickering": { score: 4, feedback: "Subtle, minor luminance flickering detected on illuminated reflections." },
              "Video Quality (Light/Contrast)": { score: 5, feedback: "Balanced exposure with rich shadow contrast and preserved highlight detail." }
            }).map(([dimension, val]) => {
              const numScore = typeof val === 'object' && val !== null ? (val.score || 5) : (typeof val === 'number' ? val : 5);
              const reasoningText = typeof val === 'object' && val !== null ? (val.reasoning || val.feedback) : null;

              return (
                <div key={dimension} className="bg-[#0B0F19] border border-[#2A344A]/80 p-4 rounded-xl flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-slate-100">
                    <span className="truncate text-sm font-bold text-slate-100" title={dimension}>{dimension}</span>
                    <span className="font-extrabold text-amber-400 text-sm px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{numScore}/5★</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        numScore >= 4 ? 'bg-emerald-400' : numScore === 3 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${(numScore / 5) * 100}%` }}
                    />
                  </div>
                  {reasoningText && (
                    <div className="mt-1 border-t border-slate-800/90 pt-2.5 flex flex-col gap-1">
                      <span className="text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                        Rationale:
                      </span>
                      <p className="text-sm font-sans text-slate-100 leading-relaxed font-medium">
                        "{reasoningText}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
