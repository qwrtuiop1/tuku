import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useSystemStore = defineStore('system', () => {
  const sharingEnabled = ref<boolean>(true)
  const shareDisabledAt = ref<string | null>(null)
  const loaded = ref(false)

  const loadShareStatus = async () => {
    try {
      const { data } = await api.get('/system/share-status')
      sharingEnabled.value = data?.sharing_enabled !== false
      shareDisabledAt.value = data?.share_disabled_at || null
    } catch (_) {
      sharingEnabled.value = true
      shareDisabledAt.value = null
    } finally {
      loaded.value = true
    }
  }

  return { sharingEnabled, shareDisabledAt, loaded, loadShareStatus }
})


