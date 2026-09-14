import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Sliders, Tag, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { generateKeyframeCrop, runPreflight } from '../services/api';

export default function ImageIngestion({ 
  selectedImage, 
  setSelectedImage, 
  assetClassification, 
  setAssetClassification, 
  zoomPercent, 
  setZoomPercent, 
  lastFrameData, 
  setLastFrameData,
  sampleImages,
  preflightData,
  setPreflightData,
  isPreflighting,
  setIsPreflighting,
  cropLoading,
  setCropLoading
}) {

  const [isDragging, setIsDragging] = useState(false);

  // Trigger keyframe crop API on image or zoom change
  useEffect(() => {
    if (!selectedImage?.path) return;
    
    let isMounted = true;
    setCropLoading(true);

    const targetPath = selectedImage.abs_path || selectedImage.path;
    generateKeyframeCrop(targetPath, zoomPercent)
      .then(res => {
        if (isMounted) {
          setLastFrameData(res);
          setCropLoading(false);
        }
      })
      .catch(err => {
        console.error('Keyframe crop error:', err);
        if (isMounted) setCropLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedImage, zoomPercent]);

  // Core File Processor for Both Drop & Click File Dialog
  const processFile = async (file) => {
    if (!file) return;

    setIsPreflighting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const pfRes = await runPreflight(formData);
      setPreflightData(pfRes);
      
      const fileUrl = pfRes.relative_url || URL.createObjectURL(file);
      setSelectedImage({
        id: `upload-${Date.now()}`,
        name: file.name,
        path: fileUrl,
        abs_path: pfRes.saved_path || fileUrl
      });
      
      if (pfRes.details?.asset_type) {
        setAssetClassification(pfRes.details.asset_type);
      }
    } catch (err) {
      console.error('Upload preflight failed:', err);
    } finally {
      setIsPreflighting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleSelectSample = async (sample) => {
    setSelectedImage(sample);
    if (sample.classification) {
      setAssetClassification(sample.classification);
    }
    setIsPreflighting(true);
    try {
      const pfRes = await runPreflight({ image_path: sample.abs_path });
      setPreflightData(pfRes);
    } catch (err) {
      console.error('Sample preflight failed:', err);
    } finally {
      setIsPreflighting(false);
    }
  };

  return (
    <div className="bg-[#131A2A] border border-[#2A344A] rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#2A344A] pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-blue-400" />
          1. Keyframe Conditioning
        </h2>
        <span className="text-sm font-mono text-slate-300 font-semibold">Optical Push-In Axis</span>
      </div>

      {/* File Upload & Drag-and-Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed transition-all rounded-xl p-5 text-center cursor-pointer group ${
          isDragging 
            ? 'border-blue-400 bg-blue-500/20 scale-[1.01]' 
            : 'border-[#2A344A] hover:border-blue-500/50 bg-[#0B0F19]/50'
        }`}
      >
        <input 
          type="file" 
          accept="image/jpeg,image/png" 
          onChange={handleFileUpload} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center gap-2 py-2 pointer-events-none">
          <div className="p-3.5 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-100">
              {isPreflighting 
                ? 'Auditing Image Preflight...' 
                : isDragging 
                  ? 'Drop Photo to Audit' 
                  : 'Drop 1080p Hospitality Photo or Click'}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">JPG / PNG (Min 1080p resolution)</p>
          </div>
        </div>
      </div>

      {/* Preflight Audit Badge */}
      {preflightData && (
        <div className={`border p-3.5 rounded-lg text-sm font-mono flex items-center justify-between ${
          preflightData.is_hospitality_sensitive 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {preflightData.is_hospitality_sensitive ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-semibold">Pre-Flight: {preflightData.is_hospitality_sensitive ? 'Sensitive Pool/Skin Scene' : 'Clean Architecture'}</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-black/40 border border-current font-bold">
            {preflightData.recommended_safety_threshold}
          </span>
        </div>
      )}

      {/* Push-In Depth Slider */}
      <div className="bg-[#0B0F19] border border-[#2A344A] p-4 rounded-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-sm font-mono">
          <span className="text-slate-200 flex items-center gap-2 font-semibold">
            <Sliders className="w-4 h-4 text-blue-400" />
            Optical Push-In Depth:
          </span>
          <span className="text-blue-400 font-extrabold font-mono text-base">{(zoomPercent * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" 
          min="0.03" 
          max="0.15" 
          step="0.01" 
          value={zoomPercent} 
          onChange={(e) => setZoomPercent(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded"
        />
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>3% (Subtle)</span>
          <span>6% (Recommended)</span>
          <span>15% (Deep)</span>
        </div>
      </div>

      {/* Visual Keyframe Preview (Start Frame vs End Frame) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Visual Keyframe Preview (Start Frame vs End Frame):
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Start Frame with Crop Overlay */}
          <div className="bg-[#0B0F19] border border-[#2A344A] rounded-lg p-2.5 flex flex-col gap-2 relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-slate-200 flex justify-between">
              <span>Start Frame</span>
              <span className="text-slate-400 font-normal">Input Still</span>
            </span>
            <div className="relative h-44 sm:h-52 w-full rounded overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
              {selectedImage ? (
                <>
                  <img src={selectedImage.path} alt="Start Frame" className="w-full h-full object-contain" />
                  {/* Dynamic Crop Overlay Canvas Box */}
                  <div 
                    className="absolute border-2 border-emerald-400 bg-emerald-500/15 pointer-events-none transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    style={{
                      inset: `${(zoomPercent * 100) / 2}%`
                    }}
                  >
                    <span className="absolute top-1 left-1 bg-emerald-500/90 text-black text-xs font-mono font-extrabold px-1.5 py-0.5 rounded">
                      End Frame Crop
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
                  <ImageIcon className="w-9 h-9 text-slate-700" />
                  <span className="text-xs font-mono text-slate-400 font-semibold">No Start Frame Uploaded</span>
                  <span className="text-xs text-slate-500 font-sans">Drop photo above or pick sample below</span>
                </div>
              )}
            </div>
          </div>

          {/* End Frame Preview */}
          <div className="bg-[#0B0F19] border border-[#2A344A] rounded-lg p-2.5 flex flex-col gap-2 relative overflow-hidden">
            <span className="text-xs font-mono font-bold text-slate-200 flex justify-between">
              <span>End Frame Preview</span>
              <span className="text-emerald-400 font-mono font-bold">{(zoomPercent * 100).toFixed(0)}% Push-In</span>
            </span>
            <div className="relative h-44 sm:h-52 w-full rounded overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
              {!selectedImage ? (
                <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
                  <Eye className="w-9 h-9 text-slate-700" />
                  <span className="text-xs font-mono text-slate-400 font-semibold">End Frame Preview Blank</span>
                  <span className="text-xs text-slate-500 font-sans">Appears after Start Frame upload</span>
                </div>
              ) : cropLoading ? (
                <div className="text-xs font-mono text-slate-300 animate-pulse">Processing Optical Axis...</div>
              ) : lastFrameData?.last_frame_base64 ? (
                <img src={lastFrameData.last_frame_base64} alt="End Frame" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400 font-mono">Generating Crop...</span>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
