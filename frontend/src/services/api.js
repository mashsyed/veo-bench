const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchTelemetry() {
  const res = await fetch(`${API_BASE}/telemetry`);
  if (!res.ok) throw new Error('Failed to fetch telemetry');
  return res.json();
}

export async function fetchSampleImages() {
  const res = await fetch(`${API_BASE}/sample-images`);
  if (!res.ok) throw new Error('Failed to fetch sample images');
  return res.json();
}

export async function runPreflight(formDataOrJson) {
  let options = {};
  if (formDataOrJson instanceof FormData) {
    options = {
      method: 'POST',
      body: formDataOrJson
    };
  } else {
    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataOrJson)
    };
  }
  const res = await fetch(`${API_BASE}/preflight`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Preflight failed' }));
    throw new Error(err.detail || 'Preflight request failed');
  }
  return res.json();
}

export async function generateKeyframeCrop(imagePath, zoomPercent) {
  const res = await fetch(`${API_BASE}/keyframe-crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_path_or_data: imagePath, zoom_percent: zoomPercent })
  });
  if (!res.ok) throw new Error('Keyframe crop request failed');
  return res.json();
}

export async function runGenerateVideo(payload) {
  const res = await fetch(`${API_BASE}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Video generation failed' }));
    throw new Error(err.detail || 'Video generation failed');
  }
  return res.json();
}

export async function evaluateQuality(payload) {
  const res = await fetch(`${API_BASE}/evaluate-quality`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Evaluation request failed');
  return res.json();
}

export async function optimizePrompt(payload) {
  const res = await fetch(`${API_BASE}/optimize-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Prompt optimization failed');
  return res.json();
}

export function getExportCsvUrl() {
  return `${API_BASE}/export/csv`;
}

export function getExportMarkdownUrl() {
  return `${API_BASE}/export/markdown`;
}
