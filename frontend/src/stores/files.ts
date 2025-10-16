import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export interface FileItem {
  id: number
  filename: string
  original_name: string
  file_type: 'image' | 'video'
  file_size: number
  file_path: string
  thumbnail_path?: string
  folder_id?: number
  mime_type: string
  width?: number
  height?: number
  duration?: number
  created_at: string
  folder_name?: string
}

export interface Folder {
  id: number
  folder_name: string
  parent_folder_id?: number
  created_at: string
  children?: Folder[]
}

export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export const useFilesStore = defineStore('files', () => {
  const files = ref<FileItem[]>([])
  const folders = ref<Folder[]>([])
  const currentFolder = ref<number | null>(null)
  const loading = ref(false)
  const uploadProgress = ref<UploadProgress[]>([])
  const selectedFiles = ref<number[]>([])
  const viewMode = ref<'grid' | 'list'>('grid')
  const searchQuery = ref('')
  const fileTypeFilter = ref<'all' | 'image' | 'video'>('all')
  
  // 分页信息
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // 计算属性
  const filteredFiles = computed(() => {
    let result = files.value

    if (fileTypeFilter.value !== 'all') {
      result = result.filter(file => file.file_type === fileTypeFilter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(file => 
        file.original_name.toLowerCase().includes(query) ||
        file.filename.toLowerCase().includes(query)
      )
    }

    return result
  })

  const selectedFilesData = computed(() => {
    return files.value.filter(file => selectedFiles.value.includes(file.id))
  })

  const totalSelectedSize = computed(() => {
    return selectedFilesData.value.reduce((total, file) => total + file.file_size, 0)
  })

  // 获取文件列表
  const fetchFiles = async (page = 1) => {
    loading.value = true
    try {
      const params: any = {
        page,
        limit: pagination.value.limit
      }

      if (currentFolder.value) {
        params.folder_id = currentFolder.value
      }

      if (fileTypeFilter.value !== 'all') {
        params.file_type = fileTypeFilter.value
      }

      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      const response = await api.get('/files', { params })
      files.value = response.data.files
      pagination.value = response.data.pagination
    } catch (error: any) {
      console.error('获取文件列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取文件夹树
  const fetchFolders = async () => {
    try {
      const params: any = {}
      if (currentFolder.value) {
        params.parent_id = currentFolder.value
      }
      const response = await api.get('/folders', { params })
      folders.value = response.data.folders
    } catch (error: any) {
      console.error('获取文件夹列表失败:', error)
    }
  }

  // 获取文件夹路径
  const fetchFolderPath = async (folderId: number) => {
    try {
      const response = await api.get(`/folders/path/${folderId}`)
      return response.data.path
    } catch (error: any) {
      console.error('获取文件夹路径失败:', error)
      return []
    }
  }

  // 上传文件
  const uploadFiles = async (fileList: FileList) => {
    const uploadPromises = Array.from(fileList).map(file => uploadSingleFile(file))
    await Promise.all(uploadPromises)
    await fetchFiles()
  }

  // 上传单个文件
  const uploadSingleFile = async (file: File) => {
    const progressItem: UploadProgress = {
      file,
      progress: 0,
      status: 'pending'
    }
    uploadProgress.value.push(progressItem)

    try {
      progressItem.status = 'uploading'
      
      const formData = new FormData()
      formData.append('file', file)
      if (currentFolder.value) {
        formData.append('folder_id', currentFolder.value.toString())
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            progressItem.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      })

      progressItem.status = 'success'
      progressItem.progress = 100
    } catch (error: any) {
      progressItem.status = 'error'
      progressItem.error = error.response?.data?.message || '上传失败'
    }
  }

  // 删除文件
  const deleteFile = async (fileId: number) => {
    try {
      await api.delete(`/files/${fileId}`)
      files.value = files.value.filter(file => file.id !== fileId)
      selectedFiles.value = selectedFiles.value.filter(id => id !== fileId)
      // 重新获取文件列表以确保数据同步
      await fetchFiles(1)
    } catch (error: any) {
      console.error('删除文件失败:', error)
      throw error
    }
  }

  // 批量删除文件
  const deleteSelectedFiles = async () => {
    const deletePromises = selectedFiles.value.map(id => deleteFile(id))
    await Promise.all(deletePromises)
    selectedFiles.value = []
    // 重新获取文件列表以确保数据同步
    await fetchFiles(1)
  }

  // 创建文件夹
  const createFolder = async (folderName: string, parentId?: number) => {
    try {
      await api.post('/folders', {
        folder_name: folderName,
        parent_folder_id: parentId
      })
      await fetchFolders()
    } catch (error: any) {
      console.error('创建文件夹失败:', error)
      throw error
    }
  }

  // 删除文件夹
  const deleteFolder = async (folderId: number) => {
    try {
      await api.delete(`/folders/${folderId}`)
      await fetchFolders()
    } catch (error: any) {
      console.error('删除文件夹失败:', error)
      throw error
    }
  }

  // 重命名文件夹
  const renameFolder = async (folderId: number, newName: string) => {
    try {
      await api.put(`/folders/${folderId}`, {
        folder_name: newName
      })
      await fetchFolders()
    } catch (error: any) {
      console.error('重命名文件夹失败:', error)
      throw error
    }
  }

  const renameFile = async (fileId: number, newName: string) => {
    try {
      await api.put(`/files/${fileId}`, {
        original_name: newName
      })
      await fetchFiles()
    } catch (error: any) {
      console.error('重命名文件失败:', error)
      throw error
    }
  }

  // 清空上传进度
  const clearUploadProgress = () => {
    uploadProgress.value = []
  }

  // 选择文件
  const selectFile = (fileId: number) => {
    if (!selectedFiles.value.includes(fileId)) {
      selectedFiles.value.push(fileId)
    }
  }

  // 取消选择文件
  const unselectFile = (fileId: number) => {
    selectedFiles.value = selectedFiles.value.filter(id => id !== fileId)
  }

  // 切换文件选择状态
  const toggleFileSelection = (fileId: number) => {
    if (selectedFiles.value.includes(fileId)) {
      unselectFile(fileId)
    } else {
      selectFile(fileId)
    }
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.value.length === filteredFiles.value.length) {
      selectedFiles.value = []
    } else {
      selectedFiles.value = filteredFiles.value.map(file => file.id)
    }
  }

  // 清空选择
  const clearSelection = () => {
    selectedFiles.value = []
  }

  return {
    files,
    folders,
    currentFolder,
    loading,
    uploadProgress,
    selectedFiles,
    viewMode,
    searchQuery,
    fileTypeFilter,
    pagination,
    filteredFiles,
    selectedFilesData,
    totalSelectedSize,
    fetchFiles,
    fetchFolders,
    fetchFolderPath,
    uploadFiles,
    deleteFile,
    deleteSelectedFiles,
    createFolder,
    deleteFolder,
    renameFolder,
    renameFile,
    clearUploadProgress,
    selectFile,
    unselectFile,
    toggleFileSelection,
    toggleSelectAll,
    clearSelection
  }
})




