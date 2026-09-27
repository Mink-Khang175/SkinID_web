/**
 * Service to interact with the Skin Analysis Edge API (/api/analyze-skin) powered by Google Gemini.
 */

export async function fetchWeatherData() {
  try {
    const res = await fetch('https://wttr.in/?format=j1', { cache: 'no-store' });
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const current = data.current_condition?.[0];
    return {
      tempC: current?.temp_C || null,
      humidity: current?.humidity || null,
      uvIndex: current?.uvIndex || null,
      desc: current?.weatherDesc?.[0]?.value || ''
    };
  } catch {
    return { tempC: null, humidity: null, uvIndex: null, desc: '' };
  }
}

/**
 * Validates that the 3 angle images are provided.
 * @param {{ front?: string, left?: string, right?: string }} images
 */
export function validateCapturedImages(images = {}) {
  const missing = [];
  if (!images.front) missing.push('Chính diện');
  if (!images.left) missing.push('Góc nghiêng trái');
  if (!images.right) missing.push('Góc nghiêng phải');
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Submits captured 3-angle facial images to Cloudflare Worker API.
 * @param {{ images: { front: string, left: string, right: string }, skinType: string }} payload
 */
export async function analyzeSkin({ images, skinType = 'normal' }) {
  const validation = validateCapturedImages(images);
  if (!validation.isValid) {
    throw new Error(`Thiếu ảnh góc chụp: ${validation.missing.join(', ')}`);
  }

  if (typeof window !== 'undefined' && window.authManager?.apiRequest) {
    const response = await window.authManager.apiRequest('/analyze-skin', {
      method: 'POST',
      body: JSON.stringify({ images, skinType }),
      timeoutMs: 60000
    });
    return response?.analysis;
  }

  // Fallback for standalone API call
  const response = await fetch('/api/analyze-skin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images, skinType })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi khi gửi yêu cầu phân tích da');
  }

  const data = await response.json();
  return data?.analysis;
}
