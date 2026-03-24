/**
 * useLivePhotoPicker
 *
 * iOS 16.4+ / Safari 16.4+ PhotosPicker API 专用实况图采集组件。
 *
 * 核心问题：
 * iOS Safari 的标准 <input type="file"> 在用户选择 Live Photo 时，只会返回
 * 静态 HEIC/JPEG 图片，不会同时返回关联的 MOV 视频片段——导致后端按文件名
 * 配对 HEIC+MOV 的逻辑永远无法触发，Live Photo 被当作普通图片处理。
 *
 * 解决方案：
 * PhotosPicker API（iOS 16.4+）的 showLivePhotos 选项可以同时访问 Live Photo
 * 的静态主图（image/*）和关联视频（video/*），二者通过 FileSystemHandle
 * 显式关联，无需依赖文件名匹配。
 *
 * 使用方式：
 * const { openPicker, isSupported, isLoading } = useLivePhotoPicker({
 *   onPicked: async (files, pairingId) => {
 *     // files[0] = image Blob, files[1] = video Blob
 *     // pairingId 用于后端显式配对
 *   }
 * })
 * <button @click="openPicker">选择实况图</button>
 */

import { ref } from 'vue'

interface LivePhotoResult {
  /** 静态主图（image/* Blob，始终存在） */
  imageFile: Blob
  /** 关联短视频（video/* Blob，Live Photo 时存在；Android Motion Photo / 普通视频时不存在） */
  videoBlob: Blob | null
  /** 文件名（取自 imageFile.name） */
  filename: string
  /** 显式配对 ID——后端用此 ID 而非文件名配对 image+video */
  pairingId: string
}

interface UseLivePhotoPickerOptions {
  /** 用户选中并成功解析出 Live Photo 内容后的回调 */
  onPicked: (results: LivePhotoResult[]) => void
  /** 最多选择数量，默认 10 */
  max?: number
  /** Live Photo 解析失败时的提示消息回调 */
  onError?: (msg: string) => void
}

/**
 * 检测 PhotosPicker API 是否可用
 * 需要 iOS 16.4+ / Safari 16.4+，且页面必须在安全上下文（HTTPS）下运行
 */
function detectPhotosPickerSupport(): boolean {
  if (typeof window === 'undefined') return false
  return 'showPhotosPicker' in window
}

function generatePairingId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function useLivePhotoPicker(options: UseLivePhotoPickerOptions) {
  const isSupported = ref(detectPhotosPickerSupport())
  const isLoading = ref(false)

  /**
   * 触发 PhotosPicker（iOS 16.4+ / Safari 16.4+）
   *
   * PhotosPicker 的行为（showLivePhotos: true）：
   * - Live Photo 作为两个 FileSystemHandle 返回：image + video
   * - 普通图片：仅返回 image
   * - 普通视频：仅返回 video
   * - 我们把每组 image+video 用同一个 pairingId 绑定
   */
  const openPhotosPicker = async () => {
    if (!isSupported.value) {
      options.onError?.('您的浏览器不支持实况图原生上传，请使用 iOS 16.4+ 或更新版本的 Safari')
      return
    }

    isLoading.value = true
    try {
      const picker = new (window as any).showPhotosPicker({
        types: ['image/*', 'video/*'],
        showLivePhotos: true,
        multiple: true,
        maxSelectionCount: options.max ?? 10,
      })

      const selected: FileSystemHandle[] = await picker

      if (!selected || selected.length === 0) {
        isLoading.value = false
        return
      }

      const results: LivePhotoResult[] = []
      const imageHandleMap = new Map<number, { imageFile: File; pairingId: string }>()
      const videoHandleQueue: Array<{ videoBlob: Blob; pairingId: string; imageFilename: string }> = []

      // 第一轮：把所有 image/* handle 提取为 File 并分配 pairingId
      for (const handle of selected) {
        if (!handle) continue
        const kind: string = handle.kind ?? ''
        const name: string = handle.name ?? ''

        if (kind === 'image') {
          try {
            const file: File = await (handle as any).getFile()
            const pairingId = generatePairingId()
            imageHandleMap.set(handle.uniqueId ?? Math.random(), {
              imageFile: file,
              pairingId,
            })
          } catch (e) {
          }
        } else if (kind === 'video') {
          // 视频暂时放入队列，后面与 image 配对
          try {
            const blob: Blob = await (handle as any).getFile()
            videoHandleQueue.push({
              videoBlob: blob,
              pairingId: '', // 待分配
              imageFilename: name.replace(/\.[^.]+$/, '').toLowerCase(),
            })
          } catch (e) {
          }
        }
      }

      // 第二轮：遍历 imageHandleMap，尝试匹配同 pairingId 的 video
      // PhotosPicker 的 Live Photo 会把 image+video 作为相邻的 handle 返回，
      // video 的文件名（去掉扩展名）与 image 相同——利用这个特征配对
      const imageEntries = Array.from(imageHandleMap.entries())

      for (let i = 0; i < imageEntries.length; i++) {
        const [handleId, { imageFile, pairingId }] = imageEntries[i]
        const imageBase = imageFile.name.replace(/\.[^.]+$/, '').toLowerCase()

        // 尝试从 video 队列中找到同名 video
        const videoIdx = videoHandleQueue.findIndex(v => v.imageFilename === imageBase)
        let videoBlob: Blob | null = null
        if (videoIdx !== -1) {
          videoBlob = videoHandleQueue[videoIdx].videoBlob
          videoHandleQueue.splice(videoIdx, 1) // 已匹配，移除
        }

        results.push({
          imageFile,
          videoBlob,
          filename: imageFile.name,
          pairingId,
        })
      }

      // 剩余未匹配的 video（普通视频，不属于任何 Live Photo）不处理
      // 普通视频走标准文件上传通道，不走 Live Photo 流程

      if (results.length === 0) {
        options.onError?.('未检测到有效的实况图片')
        isLoading.value = false
        return
      }

      options.onPicked(results)
    } catch (e: any) {
      // 用户取消选择不报错
      if (e?.name === 'AbortError' || e?.message?.includes('cancelled')) {
        isLoading.value = false
        return
      }
      console.error('[LivePhotoPicker] 错误:', e)
      options.onError?.(e?.message || '实况图选择失败，请重试')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 备用方案：iOS 旧版本（不支持 PhotosPicker）使用标准文件输入，
   * 但检测用户是否只选了图片（无同名 MOV），并给出明确引导
   */
  const openFallbackPicker = (fileInput: HTMLInputElement | null) => {
    if (fileInput) {
      fileInput.click()
    }
  }

  return {
    isSupported,
    isLoading,
    openPicker: isSupported.value ? openPhotosPicker : openFallbackPicker,
    openPhotosPicker,
  }
}
