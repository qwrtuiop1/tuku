import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import api from "@/utils/api";

// COS 配置接口
interface CosConfig {
  enable: boolean;
  bucket: string;
  region: string;
  host: string;
}

// COS 临时凭证接口
interface CosCredential {
  bucket: string;
  region: string;
  host: string;
  tmpSecretId: string;
  tmpSecretKey: string;
  sessionToken: string;
  expiredTime: number;
  uploadPath: string;
  allowPrefix: string;
  maxSize: number;
  allowExts: string[];
  callbackUrl: string;
}

export interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: "image" | "video";
  file_size: number;
  file_path: string;
  thumbnail_path?: string;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  file_url?: string | null;
  folder_id?: number;
  mime_type: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
  folder_name?: string;
}

export interface Folder {
  id: number;
  folder_name: string;
  parent_folder_id?: number;
  created_at: string;
  children?: Folder[];
  cover_file_id?: number | null;
}

export type UploadCategory =
  | "image"
  | "video"
  | "animated"
  | "unknown";

export interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status:
    | "pending"
    | "uploading"
    | "success"
    | "error"
    | "canceled";
  error?: string;
  fileCategory: UploadCategory;
  retryCount?: number;
}

export const useFilesStore = defineStore("files", () => {
  const files = ref<FileItem[]>([]);
  const folders = ref<Folder[]>([]);
  const currentFolder = ref<number | null>(null);
  const loading = ref(false);
  const selectedFiles = ref<number[]>([]);
  const viewMode = ref<"grid" | "list">("grid");
  const searchQuery = ref("");
  const fileTypeFilter = ref<"all" | "image" | "video">("all");
  const favorites = ref<any[]>([]); // 收藏列表

  // 分页信息
  const pagination = ref({ page: 1, limit: 20, total: 0, pages: 0 });

  // ── 上传队列（全局状态，弹窗关闭后继续运行）─────────────────────────
  const uploadItems = ref<UploadItem[]>([]);
  const uploadActive = ref(false); // 队列是否正在处理中

  const uploadStats = computed(() => ({
    total: uploadItems.value.filter((i) => i.status !== "canceled").length,
    success: uploadItems.value.filter((i) => i.status === "success").length,
    error: uploadItems.value.filter((i) => i.status === "error").length,
    pending: uploadItems.value.filter((i) => i.status === "pending").length,
    detecting: uploadItems.value.filter((i) => i.status === "detecting").length,
    uploading: uploadItems.value.filter((i) => i.status === "uploading").length,
  }));

  // ── 文件选择后：加入队列并开始处理 ──────────────────────────────
  function addFiles(newFiles: File[]) {
    for (const file of newFiles) {
      const item: UploadItem = {
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
        progress: 0,
        status: "pending",
        fileCategory: inferCategory(file),
        retryCount: 0,
      };
      uploadItems.value.push(item);
    }
    if (!uploadActive.value) processUploadQueue();
  }

  function inferCategory(file: File): UploadCategory {
    const n = file.name.toLowerCase();
    if (n.endsWith(".gif") || n.endsWith(".webp")) return "animated";
    if (n.endsWith(".mov")) return "video";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "unknown";
  }

  function removeUploadItem(id: string) {
    const idx = uploadItems.value.findIndex((i) => i.id === id);
    if (idx !== -1) uploadItems.value.splice(idx, 1);
  }

  function clearUploadItems() {
    uploadItems.value = [];
  }

  // ── 系统设置（用于文件大小验证）───────────────────────────────
  const systemSettings = ref({ maxFileSize: 100 });
  const maxFileSizeBytes = computed(
    () => systemSettings.value.maxFileSize * 1024 * 1024,
  );

  async function fetchSystemSettings() {
    try {
      const { data } = await api.get("/system/info");
      systemSettings.value.maxFileSize = data.max_file_size || 100;
    } catch {}
  }

  // ── COS 前端直传配置 ─────────────────────────────────────
  const cosConfig = ref<CosConfig | null>(null);
  const cosCredential = ref<CosCredential | null>(null);
  let credentialExpireTime = 0;

  async function fetchCosConfig() {
    try {
      const { data } = await api.get("/files/cos-config");
      cosConfig.value = data.data;
    } catch {
      cosConfig.value = null;
    }
  }

  async function getCosCredential(fileType: "image" | "video" = "image") {
    // 如果凭证还有效，直接返回
    if (cosCredential.value && Date.now() < credentialExpireTime - 60000) {
      return cosCredential.value;
    }

    try {
      const { data } = await api.get("/files/cos-credential", {
        params: { type: fileType, folder_id: currentFolder.value },
      });

      if (data.success && data.data) {
        cosCredential.value = data.data;
        credentialExpireTime = data.data.expiredTime * 1000; // 转换为毫秒
        return cosCredential.value;
      }
    } catch (e) {
      console.error("[COS] 获取凭证失败:", e);
    }
    return null;
  }

  function isCosEnabled() {
    // TODO: 如果需要禁用 COS 前端直传，返回 false
    // 暂时强制禁用，使用后端上传
    return false;
    // return cosConfig.value?.enable === true;
  }

  // ── 类型识别 + 上传（串行，逐文件）────────────────────────────
  async function processUploadQueue() {
    uploadActive.value = true;
    while (true) {
      const item = uploadItems.value.find((i) => i.status === "pending");
      if (!item) break;
      await processItem(item);

      // 自动重试逻辑：上传失败且未超过最大重试次数
      if (item.status === "error" && (item.retryCount || 0) < 3) {
        const delay = Math.pow(2, item.retryCount || 0) * 1000; // 指数退避: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
        item.retryCount = (item.retryCount || 0) + 1;
        item.status = "pending";
        item.progress = 0;
        item.error = undefined;
      }
    }
    uploadActive.value = false;
    const { success } = uploadStats.value;
    if (success > 0) {
      ElMessage.success(`成功上传 ${success} 个文件`);
      // 上传成功后自动刷新文件列表
      await refreshFiles();
    }
  }

  async function processItem(item: UploadItem) {
    const n = item.file.name.toLowerCase();

    // ── GIF / WebP → animated ────────────────────────────
    if (/\.(gif|webp)$/i.test(n)) {
      item.fileCategory = "animated";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── MOV → video ─────────────────────────────
    if (n.endsWith(".mov")) {
      item.fileCategory = "video";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── HEIC → image ───────────────────────────
    if (n.endsWith(".heic")) {
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── JPG / JPEG → image ──────────────
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) {
      item.fileCategory = "image";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── 其他图片 / 视频 ───────────────────────────────────
    item.status = "uploading";
    await uploadSingleFile(item);
  }

  // ── 普通文件上传 ──────────────────────────────────────────
  const uploadControllers: Record<string, AbortController> = {};

  // 生成 COS 上传签名（简化版）
  function generateCosSignature(method: string, key: string, credential: CosCredential) {
    const now = Math.floor(Date.now() / 1000);
    const expiredTime = credential.expiredTime;
    const signTime = `${now - 300}-${expiredTime}`;

    const urlString = `${method.toLowerCase()}\n/${key}\n\nhost=${credential.bucket}.cos.${credential.region}.myqcloud.com\n`;
    const signature = CryptoJS.HmacSHA1(urlString, credential.tmpSecretKey).toString(CryptoJS.enc.Base64);

    const signParams = [
      `q-sign-algorithm=sha1`,
      `q-ak=${credential.tmpSecretId}`,
      `q-sign-time=${signTime}`,
      `q-key-time=${signTime}`,
      `q-header-list=host`,
      `q-url-param-list=`,
      `q-signature=${signature}`
    ].join("&");

    return signParams;
  }

  async function uploadSingleFile(item: UploadItem, noCosFallback = false) {
    // 优先使用 COS 前端直传（除非明确禁止）
    if (isCosEnabled() && !noCosFallback) {
      return await uploadToCos(item);
    }

    // 降级到后端上传
    const fd = new FormData();
    fd.append("file", item.file);
    if (currentFolder.value)
      fd.append("folder_id", String(currentFolder.value));

    const controller = new AbortController();
    uploadControllers[item.id] = controller;

    try {
      const resp = await api.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (e) => {
          if (e.total) item.progress = Math.round((e.loaded * 100) / e.total);
        },
      });
      console.log('[Upload] Success:', resp.data);
      item.status = "success";
      item.progress = 100;
    } catch (e: any) {
      console.error('[Upload] Error:', e);
      if (e.message?.includes("canceled") || e.code === "ERR_CANCELED") {
        item.status = "canceled";
      } else {
        item.status = "error";
        item.error = e.response?.data?.message || e.message || "上传失败";
      }
    } finally {
      delete uploadControllers[item.id];
    }
  }

  // ── COS 前端直传 ──────────────────────────────────────
  async function uploadToCos(item: UploadItem) {
    const fileType = item.fileCategory === "video" ? "video" : "image";
    const credential = await getCosCredential(fileType);

    if (!credential) {
      console.warn("[COS] 获取凭证失败，降级到后端上传");
      return uploadSingleFile(item, true); // 传递标志，禁止递归使用 COS
    }

    const controller = new AbortController();
    uploadControllers[item.id] = controller;

    try {
      // 生成唯一的文件名
      const ext = item.file.name.substring(item.file.name.lastIndexOf("."));
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
      const cosKey = `${credential.uploadPath}/${filename}`;

      // 生成签名
      const signParams = generateCosSignature("PUT", cosKey, credential);

      // 上传到 COS（使用 fetch API）
      const uploadUrl = `${credential.host}/${cosKey}?${signParams}`;
      const host = `${credential.bucket}.cos.${credential.region}.myqcloud.com`;

      item.progress = 0;

      const resp = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Host": host,
          "Content-Type": item.file.type || "application/octet-stream",
          "Content-Length": String(item.file.size),
          // 安全令牌（临时密钥必传）
          "x-cos-security-token": credential.sessionToken,
        },
        body: item.file,
        signal: controller.signal,
      });

      // 检查响应状态
      // 成功：200 OK, 201 Created
      if (resp.ok) {
        item.progress = 100;

        // 上传成功后，通知后端注册文件
        const callbackResp = await api.post("/files/cos-callback", {
          cosKey,
          originalName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type,
          folder_id: currentFolder.value,
        });

        if (callbackResp.data.success) {
          item.status = "success";
        } else {
          throw new Error(callbackResp.data.message || "文件注册失败");
        }
      } else {
        // 解析错误信息
        let errorMsg = `COS 上传失败: HTTP ${resp.status}`;
        try {
          const errorData = await resp.json();
          // 尝试从 CI 错误响应中提取信息
          if (errorData.Error) {
            errorMsg = errorData.Error.Message || errorMsg;
          } else if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {
          // 响应不是 JSON，尝试获取文本
          const errorText = await resp.text();
          if (errorText) {
            errorMsg += ` - ${errorText.substring(0, 200)}`;
          }
        }

        // 获取 request-id 用于调试
        const requestId = resp.headers.get("x-ci-request-id");
        if (requestId) {
          console.error(`[COS] Request ID: ${requestId}`);
        }

        throw new Error(errorMsg);
      }
    } catch (e: any) {
      if (e.name === "AbortError" || e.message?.includes("canceled")) {
        item.status = "canceled";
      } else {
        console.error("[COS] 上传失败:", e);
        // COS 上传失败，降级到后端（禁止递归使用 COS）
        console.log("[COS] 降级到后端上传...");
        return uploadSingleFile(item, true);
      }
    } finally {
      delete uploadControllers[item.id];
    }
  }

  // ── 重试 ─────────────────────────────────────────────────
  function retryUploadItem(id: string) {
    const item = uploadItems.value.find((i) => i.id === id);
    if (!item) return;
    item.status = "pending";
    item.progress = 0;
    item.error = undefined;
    if (!uploadActive.value) processUploadQueue();
  }

  // ── 取消单个 ─────────────────────────────────────────────
  function cancelUploadItem(id: string) {
    const ctrl = uploadControllers[id];
    if (ctrl) {
      ctrl.abort();
      delete uploadControllers[id];
    }
    const item = uploadItems.value.find((i) => i.id === id);
    if (item) {
      item.status = "canceled";
    }
  }

  // ── 文件列表 ──────────────────────────────────────────────
  async function refreshFiles() {
    await fetchFiles(1);
  }

  const filteredFiles = computed(() => {
    let result = files.value;
    if (fileTypeFilter.value !== "all")
      result = result.filter((f) => f.file_type === fileTypeFilter.value);
    return result;
  });

  const selectedFilesData = computed(() =>
    files.value.filter((f) => selectedFiles.value.includes(f.id)),
  );
  const totalSelectedSize = computed(() =>
    selectedFilesData.value.reduce((t, f) => t + f.file_size, 0),
  );

  async function fetchFiles(page = 1) {
    const folderSnapshot = currentFolder.value;
    loading.value = true;
    try {
      const params: any = { page, limit: pagination.value.limit };
      if (folderSnapshot) params.folder_id = folderSnapshot;
      if (fileTypeFilter.value !== "all")
        params.file_type = fileTypeFilter.value;
      if (searchQuery.value) params.search = searchQuery.value;
      const resp = await api.get("/files", { params });
      if (currentFolder.value !== folderSnapshot) return;
      files.value = resp.data.files || [];
      pagination.value = resp.data.pagination;
    } catch {
    } finally {
      if (currentFolder.value === folderSnapshot) loading.value = false;
    }
  }

  async function fetchFolders() {
    const folderSnapshot = currentFolder.value;
    try {
      const params: any = {};
      if (folderSnapshot) params.parent_id = folderSnapshot;
      const resp = await api.get("/folders", { params });
      if (currentFolder.value !== folderSnapshot) return;
      folders.value = resp.data.folders;
    } catch {}
  }

  async function fetchFolderPath(folderId: number) {
    try {
      const { data } = await api.get(`/folders/path/${folderId}`);
      return data.path;
    } catch {
      return [];
    }
  }

  async function deleteFile(fileId: number) {
    await api.delete(`/files/${fileId}`);
    files.value = files.value.filter((f) => f.id !== fileId);
    selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
  }

  async function deleteFiles(fileIds: number[]) {
    try {
      await api.delete("/files/batch", { data: { file_ids: fileIds } });
      files.value = files.value.filter((f) => !fileIds.includes(f.id));
      selectedFiles.value = selectedFiles.value.filter(
        (id) => !fileIds.includes(id),
      );
    } catch (e: any) {
      const msg =
        e.response?.data?.message || e.message || "批量删除失败";
      ElMessage.error(msg);
      throw e;
    }
  }

  async function deleteSelectedFiles() {
    if (!selectedFiles.value.length) return;
    await deleteFiles([...selectedFiles.value]);
    selectedFiles.value = [];
  }

  async function createFolder(folderName: string, parentId?: number) {
    await api.post("/folders", {
      folder_name: folderName,
      parent_folder_id: parentId,
    });
    await fetchFolders();
  }

  async function deleteFolder(folderId: number) {
    await api.delete(`/folders/${folderId}`);
    await fetchFolders();
  }

  async function renameFolder(folderId: number, newName: string) {
    await api.put(`/folders/${folderId}`, { folder_name: newName });
    await fetchFolders();
  }

  async function renameFile(fileId: number, newName: string) {
    await api.put(`/files/${fileId}`, { original_name: newName });
    await fetchFiles();
  }

  // 回收站相关
  async function restoreFromRecycle(fileIds: number[]) {
    await api.post('/recycle/restore', { file_ids: fileIds });
  }

  async function permanentlyDelete(fileIds: number[]) {
    await api.delete('/recycle', { data: { file_ids: fileIds } });
  }

  // 获取收藏列表
  async function fetchFavorites() {
    try {
      const { data } = await api.get("/favorites");
      favorites.value = data.favorites || [];
    } catch {
      favorites.value = [];
    }
  }

  // 切换收藏状态
  async function toggleFavorite(fileId: number): Promise<boolean> {
    try {
      const resp = await api.get(`/favorites/check/${fileId}`);
      if (resp.data.isFavorite) {
        await api.delete(`/favorites/${fileId}`);
      } else {
        await api.post("/favorites", { file_id: fileId });
      }
      await fetchFavorites();
      return !resp.data.isFavorite;
    } catch {
      return false;
    }
  }

  // 检查文件是否已收藏
  function isFavorited(fileId: number): boolean {
    return favorites.value.some((f) => f.file_id === fileId);
  }

  function selectFile(fileId: number) {
    if (!selectedFiles.value.includes(fileId)) selectedFiles.value.push(fileId);
  }
  function unselectFile(fileId: number) {
    selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
  }
  function toggleFileSelection(fileId: number) {
    if (selectedFiles.value.includes(fileId)) unselectFile(fileId);
    else selectFile(fileId);
  }
  function toggleSelectAll() {
    if (selectedFiles.value.length === filteredFiles.value.length)
      selectedFiles.value = [];
    else selectedFiles.value = filteredFiles.value.map((f) => f.id);
  }
  function clearSelection() {
    selectedFiles.value = [];
  }

  return {
    files,
    folders,
    currentFolder,
    loading,
    selectedFiles,
    viewMode,
    searchQuery,
    fileTypeFilter,
    favorites,
    pagination,
    filteredFiles,
    selectedFilesData,
    totalSelectedSize,
    uploadItems,
    uploadActive,
    uploadStats,
    fetchFiles,
    fetchFolders,
    fetchFolderPath,
    addFiles,
    removeUploadItem,
    clearUploadItems,
    retryUploadItem,
    cancelUploadItem,
    uploadSingleFile,
    uploadToCos,
    fetchSystemSettings,
    systemSettings,
    cosConfig,
    cosCredential,
    fetchCosConfig,
    getCosCredential,
    isCosEnabled,
    deleteFile,
    deleteFiles,
    deleteSelectedFiles,
    createFolder,
    deleteFolder,
    renameFolder,
    renameFile,
    restoreFromRecycle,
    permanentlyDelete,
    fetchFavorites,
    toggleFavorite,
    isFavorited,
    selectFile,
    unselectFile,
    toggleFileSelection,
    toggleSelectAll,
    clearSelection,
  };
});
