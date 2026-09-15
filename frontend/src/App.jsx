import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarNav from './components/SidebarNav';
import ImageIngestion from './components/ImageIngestion';
import ModelControls from './components/ModelControls';
import OutputPlayerScorecard from './components/OutputPlayerScorecard';
import TelemetryTable from './components/TelemetryTable';
import PromptOptimizer from './components/PromptOptimizer';
import ExportModal from './components/ExportModal';
import { DollarSign, Clock, CheckCircle2, BarChart2 } from 'lucide-react';

import { 
  fetchTelemetry, 
  fetchRuns,
  fetchSampleImages, 
  runGenerateVideo, 
  evaluateQuality 
} from './services/api';

const DEFAULT_RUBRIC = `Role: You are an expert AI Media QA Evaluator for Expedia Group MarTech.
Evaluate the generated video against the starting image and prompt using the following 8 Core Evaluation Dimensions (Graded 1 to 5 Stars).
For EVERY single metric below, you MUST provide an explicit 1-2 sentence evaluation rationale explaining your score:

1. Prompt Adherence: Alignment with prompt subjects, actions, setting, and style.
2. Object Deformation: Structural and anatomical stability of key objects and subjects.
3. New Structure Creation (Background): Spatial memory and background/architectural consistency.
4. New Structure Creation (People): Subject count consistency and avoidance of phantom figures.
5. Unintended Camera Motion: Intentionality, stability, and trajectory of camera path.
6. Unnatural Element Motion: Kinematic, physical, and biological realism of movement.
7. Temporal Flickering: Frame-to-frame luminance, texture, and color consistency.
8. Video Quality (Light/Contrast): Photographic rendering, exposure balance, and dynamic range.

Return ONLY a valid JSON object in this exact format:
{
  "stars": 4,
  "video_summary": "A 1-2 sentence detailed visual description of what you actually see happening in the 4-second video clip (e.g. subjects, environment, landscape, camera motion).",
  "reasoning": "Executive Summary: Outstanding camera trajectory adherence with rock-solid architectural memory, though minor temporal flickering was observed on glass reflections.",
  "dimension_scores": {
    "Prompt Adherence": {"score": 5, "reasoning": "Faithfully executes the dolly push-in camera directive with 100% adherence to scene composition."},
    "Object Deformation": {"score": 5, "reasoning": "Zero structural or geometric warping detected on interior walls, furniture, or bedding."},
    "New Structure Creation (Background)": {"score": 5, "reasoning": "Background architecture, ocean horizon, and windows remain rock-solid across all 120 frames."},
    "New Structure Creation (People)": {"score": 5, "reasoning": "No phantom people or unintended human figures materialized in the scene."},
    "Unintended Camera Motion": {"score": 5, "reasoning": "Camera motion is perfectly smooth along the optical axis with zero rotational wobble or jitter."},
    "Unnatural Element Motion": {"score": 5, "reasoning": "All motion strictly obeys real-world physical and optical depth kinematics."},
    "Temporal Flickering": {"score": 4, "reasoning": "Minor high-frequency luminance flickering detected on reflective window surfaces."},
    "Video Quality (Light/Contrast)": {"score": 5, "reasoning": "Exceptional photographic rendering with rich shadow detail and balanced highlight exposure."}
  }
}`;

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('benchmark');

  // Global session telemetry state
  const [telemetry, setTelemetry] = useState(null);
  const [pastRuns, setPastRuns] = useState([]);
  const [sampleImages, setSampleImages] = useState([]);
  
  // Image & Crop state with LocalStorage restoration
  const [selectedImage, setSelectedImage] = useState(() => {
    try {
      const saved = localStorage.getItem('veobench_selectedImage');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [assetClassification, setAssetClassification] = useState('Interior Suite');
  const [zoomPercent, setZoomPercent] = useState(0.06);
  const [lastFrameData, setLastFrameData] = useState(null);
  const [preflightData, setPreflightData] = useState(null);
  const [isPreflighting, setIsPreflighting] = useState(false);
  const [cropLoading, setCropLoading] = useState(false);

  // Model parameters configuration state with LocalStorage restoration
  const [modelConfig, setModelConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('veobench_modelConfig');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      model_name: 'veo-3.1-fast-generate-001',
      resolution: '720p',
      duration_seconds: 4.0,
      aspect_ratio: '16:9',
      seed: 4242,
      seed_locked: false,
      directorial_prompt: '',
      negative_prompt: 'morphing walls, new structures, people appearing, texture flickering, sudden cuts, blur',
      enhance_prompt: true,
      person_generation: 'allow_adult',
      safety_setting: 'BLOCK_ONLY_HIGH',
      use_last_frame: false
    };
  });

  // Custom QA Rubric state
  const [customRubric, setCustomRubric] = useState(DEFAULT_RUBRIC);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);

  // Pipeline execution & results state with LocalStorage restoration
  const [isRunning, setIsRunning] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [videoResult, setVideoResult] = useState(() => {
    try {
      const saved = localStorage.getItem('veobench_videoResult');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [evalScorecard, setEvalScorecard] = useState(() => {
    try {
      const saved = localStorage.getItem('veobench_evalScorecard');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });
  const [telemetryLogs, setTelemetryLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('veobench_telemetryLogs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // Auto-save form and output state to LocalStorage
  useEffect(() => {
    if (selectedImage) localStorage.setItem('veobench_selectedImage', JSON.stringify(selectedImage));
  }, [selectedImage]);

  useEffect(() => {
    if (modelConfig) localStorage.setItem('veobench_modelConfig', JSON.stringify(modelConfig));
  }, [modelConfig]);

  useEffect(() => {
    if (videoResult) localStorage.setItem('veobench_videoResult', JSON.stringify(videoResult));
  }, [videoResult]);

  useEffect(() => {
    if (evalScorecard) localStorage.setItem('veobench_evalScorecard', JSON.stringify(evalScorecard));
  }, [evalScorecard]);

  useEffect(() => {
    if (telemetryLogs && telemetryLogs.length > 0) localStorage.setItem('veobench_telemetryLogs', JSON.stringify(telemetryLogs));
  }, [telemetryLogs]);

  // Load telemetry, past runs & sample images on mount
  useEffect(() => {
    refreshTelemetry();
    fetchSampleImages()
      .then(samples => setSampleImages(samples))
      .catch(err => console.error('Failed to load sample images:', err));
  }, []);

  const refreshTelemetry = () => {
    fetchTelemetry()
      .then(res => setTelemetry(res))
      .catch(err => console.error('Failed to fetch telemetry summary:', err));

    fetchRuns()
      .then(runs => setPastRuns(runs))
      .catch(err => console.error('Failed to fetch past runs:', err));
  };

  // Main Pipeline Execution Handler
  const handleRunBenchmark = async () => {
    if (!selectedImage) {
      alert("⚠️ Keyframe Image Required\n\nPlease drop or upload a 1080p keyframe photo in Section 1 before running the benchmark test.");
      return;
    }

    if (!modelConfig.directorial_prompt || modelConfig.directorial_prompt.trim() === '') {
      alert("⚠️ Directorial Camera Prompt Required\n\nPlease enter a directorial prompt describing the desired camera movement (e.g. 'the camera moves from left to right across the scene') before running the benchmark test.");
      return;
    }

    setIsRunning(true);
    setIsEvaluating(false);
    setVideoResult(null);
    setEvalScorecard(null);
    setTelemetryLogs([]);

    try {
      const generatePayload = {
        start_image_path: selectedImage.abs_path || selectedImage.path,
        last_frame_path: lastFrameData?.last_frame_path || null,
        use_last_frame: modelConfig.use_last_frame,
        asset_classification: assetClassification,
        zoom_percent: zoomPercent,
        model_name: modelConfig.model_name,
        resolution: modelConfig.resolution,
        duration_seconds: modelConfig.duration_seconds,
        aspect_ratio: modelConfig.aspect_ratio,
        seed: modelConfig.seed,
        seed_locked: modelConfig.seed_locked,
        directorial_prompt: modelConfig.directorial_prompt,
        negative_prompt: modelConfig.negative_prompt,
        enhance_prompt: modelConfig.enhance_prompt,
        person_generation: modelConfig.person_generation,
        safety_setting: modelConfig.safety_setting
      };

      // 1. Video Generation + QA Evaluation Pipeline
      const vidRes = await runGenerateVideo(generatePayload);
      setVideoResult(vidRes);
      setTelemetryLogs(vidRes.telemetry_logs || []);

      if (vidRes.eval_scorecard) {
        setEvalScorecard(vidRes.eval_scorecard);
      } else {
        // Fallback for standalone evaluation API
        setIsEvaluating(true);
        const evalPayload = {
          run_id: vidRes.run_id,
          start_image_path: selectedImage.abs_path || selectedImage.path,
          last_frame_path: lastFrameData?.last_frame_path || null,
          video_path: vidRes.video_path,
          prompt: modelConfig.directorial_prompt,
          negative_prompt: modelConfig.negative_prompt,
          custom_rubric: customRubric
        };

        const evalRes = await evaluateQuality(evalPayload);
        setEvalScorecard(evalRes);
      }

      // Refresh telemetry log
      refreshTelemetry();

    } catch (err) {
      console.error('Benchmark execution error:', err);
      alert(`⚠️ Pipeline Execution Error\n\n${err.message || 'An unexpected error occurred while executing the benchmark test. Please try again.'}`);
    } finally {
      setIsRunning(false);
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0B0F19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Status & Header Bar */}
      <Header 
        telemetry={telemetry} 
        onOpenRubricModal={() => setIsRubricModalOpen(true)}
      />

      {/* Main Layout Container: Left Sidebar + Content Area */}
      <div className="flex-1 flex w-full">
        {/* Left Navigation Sidebar */}
        <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Workspace */}
        <main className="flex-1 p-3.5 md:p-4 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar w-full min-w-0">
          {activeTab === 'benchmark' && (
            <div className="flex flex-col gap-3.5 max-w-[1800px] w-full mx-auto">
              {/* Top Row: Section 1 & Section 2 Side-by-Side (Full Width) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                
                {/* Section 1: Keyframe Conditioning (6 cols) */}
                <div className="lg:col-span-6 flex flex-col min-h-0">
                  <ImageIngestion 
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    assetClassification={assetClassification}
                    setAssetClassification={setAssetClassification}
                    zoomPercent={zoomPercent}
                    setZoomPercent={setZoomPercent}
                    lastFrameData={lastFrameData}
                    setLastFrameData={setLastFrameData}
                    sampleImages={sampleImages}
                    preflightData={preflightData}
                    setPreflightData={setPreflightData}
                    isPreflighting={isPreflighting}
                    setIsPreflighting={setIsPreflighting}
                    cropLoading={cropLoading}
                    setCropLoading={setCropLoading}
                  />
                </div>

                {/* Section 2: Model Controls (6 cols) */}
                <div className="lg:col-span-6 flex flex-col min-h-0">
                  <ModelControls 
                    modelConfig={modelConfig}
                    setModelConfig={setModelConfig}
                    onRunBenchmark={handleRunBenchmark}
                    isRunning={isRunning}
                    selectedImage={selectedImage}
                    isPreflighting={isPreflighting}
                    cropLoading={cropLoading}
                    onOpenRubricModal={() => setIsRubricModalOpen(true)}
                  />
                </div>

              </div>

              {/* Second Row: Section 3 - Output Player & Scorecard (Full Width below 1 & 2) */}
              <div className="w-full">
                <OutputPlayerScorecard 
                  selectedImage={selectedImage}
                  videoResult={videoResult}
                  evalScorecard={evalScorecard}
                  isEvaluating={isEvaluating}
                  onOpenRubricModal={() => setIsRubricModalOpen(true)}
                />
              </div>

              {/* Third Row: Section 4 - AI Prompt Optimizer (Full Width) */}
              <div className="w-full">
                <PromptOptimizer 
                  modelConfig={modelConfig}
                  setModelConfig={setModelConfig}
                  evalScorecard={evalScorecard}
                  onApplyAndRerun={handleRunBenchmark}
                />
              </div>
            </div>
          )}

          {activeTab === 'cost_latency' && (
            <div className="flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
              {/* Cost & Latency Top Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#131A2A] border border-[#2A344A] p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">Total Session Spend</span>
                    <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                      ${telemetry?.total_spend_usd ? telemetry.total_spend_usd.toFixed(4) : '0.0000'}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#131A2A] border border-[#2A344A] p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">Mean Execution Latency</span>
                    <span className="text-2xl font-extrabold font-mono text-amber-300 mt-1">
                      {telemetry?.mean_latency_sec ? `${telemetry.mean_latency_sec.toFixed(2)}s` : '0.00s'}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-950/60 border border-amber-800/60 rounded-lg text-amber-300">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#131A2A] border border-[#2A344A] p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">First-Pass Yield</span>
                    <span className="text-2xl font-extrabold font-mono text-blue-400 mt-1">
                      {telemetry?.avg_first_pass_yield_pct ? `${telemetry.avg_first_pass_yield_pct.toFixed(1)}%` : '100.0%'}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-950/60 border border-blue-800/60 rounded-lg text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[#131A2A] border border-[#2A344A] p-4 rounded-xl flex items-center justify-between shadow-md">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">Total Benchmark Runs</span>
                    <span className="text-2xl font-extrabold font-mono text-purple-400 mt-1">
                      {telemetry?.total_runs || 0}
                    </span>
                  </div>
                  <div className="p-3 bg-purple-950/60 border border-purple-800/60 rounded-lg text-purple-400">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Dedicated Cost and Latency Telemetry Table */}
              <TelemetryTable 
                telemetryLogs={telemetryLogs}
                totalLatency={videoResult?.total_latency_sec}
                totalCost={videoResult?.total_cost_usd}
                certificationStatus={evalScorecard?.certification_status}
                pastRuns={pastRuns}
              />
            </div>
          )}
        </main>
      </div>

      {/* Custom Rubric Editor Modal */}
      <ExportModal 
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        customRubric={customRubric}
        setCustomRubric={setCustomRubric}
      />
    </div>
  );
}
