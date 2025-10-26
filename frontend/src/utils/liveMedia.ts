export interface LiveMediaAsset {
  id: number
  kind: 'live_photo' | 'motion_photo' | 'animated'
  poster_url: string | null
  video_mp4_url: string | null
  video_webm_url: string | null
  variants?: Array<{ label: string, width?: number, height?: number, bitrate_k?: number, mp4_url?: string, webm_url?: string }>
  duration_ms?: number | null
  width?: number | null
  height?: number | null
  fps?: number | null
  loopable?: boolean
}

export function pickBestSource(asset: LiveMediaAsset) {
  // 若有多码率变体，根据网络情况选择
  if (asset.variants && asset.variants.length > 0) {
    const eff = (navigator as any).connection?.effectiveType || '4g'
    const targetHeight = eff === '2g' ? 240 : eff === '3g' ? 360 : eff === '4g' ? 720 : 480
    const sorted = [...asset.variants].sort((a, b) => (a.height || 0) - (b.height || 0))
    let chosen = sorted[0]
    for (const v of sorted) {
      if ((v.height || 0) <= targetHeight) chosen = v
    }
    if (chosen?.mp4_url) return { src: chosen.mp4_url, type: 'video/mp4' }
    if (chosen?.webm_url) return { src: chosen.webm_url, type: 'video/webm' }
  }
  // 回退：MP4 优先（iOS/Safari 友好），再 WebM
  if (asset.video_mp4_url) return { src: asset.video_mp4_url, type: 'video/mp4' }
  if (asset.video_webm_url) return { src: asset.video_webm_url, type: 'video/webm' }
  return null
}

export function shouldAutoPlay(reducedMotion = false) {
  if (reducedMotion) return false
  return true
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}


