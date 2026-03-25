import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import api from "@/utils/api";

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
  | "live"
  | "unknown";

export interface UploadItem {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status:
    | "pending"
    | "detecting"
    | "uploading"
    | "success"
    | "error"
    | "canceled";
  error?: string;
  fileCategory: UploadCategory;
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
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
        progress: 0,
        status: "pending",
        fileCategory: inferCategory(file),
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

  // ── 类型识别 + 上传（串行，逐文件）────────────────────────────
  async function processUploadQueue() {
    uploadActive.value = true;
    while (true) {
      const item = uploadItems.value.find((i) => i.status === "pending");
      if (!item) break;
      await processItem(item);
    }
    uploadActive.value = false;
    const { success } = uploadStats.value;
    if (success > 0) {
      ElMessage.success(`成功上传 ${success} 个文件`);
    }
  }

  async function processItem(item: UploadItem) {
    const n = item.file.name.toLowerCase();

    // ── HEIC：有同名 MOV 配对 → Live ─────────────────────
    if (n.endsWith(".heic") && movPairMap.has(n)) {
      const paired = movPairMap.get(n)!;
      pairedConsumed.add(paired.name);
      item.status = "uploading";
      const ok = await createLiveJob([item.file, paired], item.id);
      if (ok) {
        item.status = "success";
        item.progress = 100;
      }
      return;
    }

    // ── GIF / WebP → animated ────────────────────────────
    if (/\.(gif|webp)$/i.test(n)) {
      item.fileCategory = "animated";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── MOV（已配对）→ 跳过 ─────────────────────────────
    if (n.endsWith(".mov") && pairedConsumed.has(item.file.name)) {
      removeUploadItem(item.id);
      return;
    }

    // ── MOV（未配对）→ video ─────────────────────────────
    if (n.endsWith(".mov")) {
      item.fileCategory = "video";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── HEIC（无配对）→ image ───────────────────────────
    if (n.endsWith(".heic")) {
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }

    // ── JPG / JPEG：必须先检测 Motion Photo ──────────────
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) {
      item.status = "detecting";
      const isMotion = await detectMotionPhoto(item.file);
      if (isMotion) {
        item.fileCategory = "live";
        item.status = "uploading";
        const ok = await createLiveJob([item.file], item.id);
        if (!ok) return; // 上传失败已在 createLiveJob 中处理
      } else {
        item.fileCategory = "image";
        item.status = "uploading";
        await uploadSingleFile(item);
      }
      return;
    }

    // ── 其他图片 / 视频 ───────────────────────────────────
    item.status = "uploading";
    await uploadSingleFile(item);
  }

  // ── MOV 配对表（每次 addFiles 时重建）──────────────────────
  const movPairMap = new Map<string, File>();
  const pairedConsumed = new Set<string>();

  function rebuildMovPairs(files: File[]) {
    movPairMap.clear();
    pairedConsumed.clear();
    for (const f of files) {
      if (f.name.toLowerCase().endsWith(".mov")) {
        movPairMap.set(f.name.toLowerCase(), f);
      }
    }
    // 给 HEIC 配对查询（base 名）
    const toBase = (n: string) => n.replace(/\.[^.]+$/, "").toLowerCase();
    for (const f of files) {
      if (f.name.toLowerCase().endsWith(".heic")) {
        const base = toBase(f.name.toLowerCase());
        if (movPairMap.has(base)) {
          // movPairMap 里存的是 .mov，需要映射
          // base = "IMG_123"，查找名为 "IMG_123.mov" 的文件
          for (const [k, v] of movPairMap) {
            if (k === base + ".mov") {
              movPairMap.set(base, v);
              break;
            }
          }
        }
      }
    }
  }

  // ── Motion Photo 检测（客户端）─────────────────────────────
  // 增强版：扩大搜索范围，支持微信等国产厂商 Motion Photo 格式
  async function detectMotionPhoto(file: File): Promise<boolean> {
    const readChunk = (start: number, len: number): Promise<ArrayBuffer> =>
      new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as ArrayBuffer);
        fr.onerror = reject;
        fr.readAsArrayBuffer(
          file.slice(start, Math.min(file.size, start + len)),
        );
      });

    const validateFtyp = (bytes: Uint8Array, idx: number) => {
      if (idx < 4) return false;
      const boxLen =
        (bytes[idx - 4]! << 24) |
        (bytes[idx - 3]! << 16) |
        (bytes[idx - 2]! << 8) |
        bytes[idx - 1]!;
      const remaining = bytes.length - (idx - 4);
      // 放宽限制以支持某些厂商格式
      return boxLen >= 8 && boxLen <= 1024 * 1024 && boxLen <= remaining;
    };

    const findFtypIndex = (bytes: Uint8Array, start: number = 0): number => {
      for (let j = start; j <= bytes.length - 4; j++) {
        if (
          bytes[j] === 0x66 &&
          bytes[j + 1] === 0x74 &&
          bytes[j + 2] === 0x79 &&
          bytes[j + 3] === 0x70
        ) {
          return j;
        }
      }
      return -1;
    };

    try {
      if (file.size < 16) return false;
      // 扩大搜索范围以支持微信等国产厂商格式
      const MAX_HEAD = 20 * 1024 * 1024; // 从 10MB 扩大到 20MB
      const MAX_TAIL = 5 * 1024 * 1024;  // 从 2MB 扩大到 5MB
      const MAX_MIDDLE_SCAN = 50 * 1024 * 1024; // 新增：中间区域扫描 50MB

      // 前部：JPEG 在前、ftyp 在中部（标准 Android Motion Photo）
      const headSize = Math.min(MAX_HEAD, file.size);
      const headBytes = new Uint8Array(await readChunk(0, headSize));
      let pos = 0;
      for (;;) {
        const idx = findFtypIndex(headBytes, pos);
        if (idx === -1) break;
        if (validateFtyp(headBytes, idx)) {
          let eoiBefore = -1;
          for (let i = idx - 1; i >= 1; i--) {
            if (headBytes[i - 1] === 0xff && headBytes[i] === 0xd9) {
              eoiBefore = i + 1;
              break;
            }
          }
          if (eoiBefore > 0 && eoiBefore < idx) return true;
        }
        pos = idx + 4;
      }

      // 尾部：JPEG 在后、MP4 紧跟 EOI（微信、部分三星格式）
      const tailSize = Math.min(MAX_TAIL, file.size);
      const tailBytes = new Uint8Array(
        await readChunk(file.size - tailSize, tailSize),
      );
      let eoiAfter = -1;
      for (let i = tailBytes.length - 2; i >= 0; i--) {
        if (tailBytes[i] === 0xff && tailBytes[i + 1] === 0xd9) {
          eoiAfter = i + 2;
          break;
        }
      }
      if (eoiAfter >= 0 && eoiAfter < tailBytes.length - 8) {
        const after = tailBytes.subarray(eoiAfter);
        pos = 0;
        for (;;) {
          const idx = findFtypIndex(after, pos);
          if (idx === -1) break;
          if (idx >= 4 && validateFtyp(after, idx)) return true;
          pos = idx + 4;
        }
      }

      // 微信特殊格式：JPEG 和 MP4 可能完全分离，扫描中间区域
      if (headSize < file.size) {
        const middleStart = MAX_HEAD;
        const middleSize = Math.min(MAX_MIDDLE_SCAN, file.size - middleStart);
        if (middleSize > 0) {
          const middleBytes = new Uint8Array(await readChunk(middleStart, middleSize));
          pos = 0;
          for (;;) {
            const idx = findFtypIndex(middleBytes, pos);
            if (idx === -1) break;
            // 微信格式可能没有前面的 JPEG EOI，找到即返回
            if (validateFtyp(middleBytes, idx)) return true;
            pos = idx + 4;
          }
        }
      }
    } catch {}
    return false;
  }

  // ── Live Job ─────────────────────────────────────────────
  const liveJobControllers: Record<string, AbortController> = {};
  const liveJobs = ref<Array<{ id: string; status: string; progress: number }>>(
    [],
  );

  // item → jobId 映射（用于轮询时找到 UploadItem 并更新状态）
  const liveJobItemMap: Record<string, string> = {};

  async function createLiveJob(
    batch: File[],
    itemId?: string,
    pairingId?: string,
  ): Promise<boolean> {
    const fd = new FormData();
    for (const f of batch) fd.append("files", f);
    if (currentFolder.value)
      fd.append("folder_id", String(currentFolder.value));
    if (pairingId) fd.append("pairing_id", pairingId);
    const controller = new AbortController();
    try {
      const resp = await api.post("/live-media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
      });
      const jobId = normalizeJobId(resp.data?.jobId);
      if (jobId) {
        liveJobControllers[jobId] = controller;
        liveJobItemMap[jobId] = itemId ?? "";
        startLiveJobPolling(jobId);
      }
      return true;
    } catch (e: any) {
      // 上传请求本身失败（如网络错误、服务器 500），由轮询的 failed 状态统一处理错误提示，
      // 此处不再弹 ElMessage 避免同一错误弹两次。
      if (itemId) {
        const item = uploadItems.value.find((i) => i.id === itemId);
        if (item) {
          item.status = "error";
          item.error = e.response?.data?.message || "动图上传失败";
          item.progress = 0;
        }
      }
      return false;
    }
  }

  function normalizeJobId(raw: any): string | null {
    if (raw == null) return null;
    if (typeof raw === "string" || typeof raw === "number") return String(raw);
    if (typeof raw === "object") {
      if (raw.id != null) return String(raw.id);
      if (raw.jobId != null) return String(raw.jobId);
    }
    return null;
  }

  function startLiveJobPolling(jobId: string) {
    const itemId = liveJobItemMap[jobId];
    const item = itemId ? uploadItems.value.find((i) => i.id === itemId) : null;

    liveJobs.value.push({ id: jobId, status: "queued", progress: 0 });
    const poll = async () => {
      try {
        const { data } = await api.get(
          `/live-media/jobs/${encodeURIComponent(String(jobId))}`,
        );
        const idx = liveJobs.value.findIndex((j) => j.id === jobId);
        if (idx !== -1) {
          liveJobs.value[idx] = {
            id: jobId,
            status: data.status,
            progress: data.progress || 0,
          };
        }
        // 同步进度到 UploadItem
        if (item && data.progress != null) {
          item.progress = data.progress;
        }
        if (data.status === "completed") {
          ElMessage.success("实况处理完成");
          if (item) {
            item.status = "success";
            item.progress = 100;
          }
          liveJobs.value.splice(idx, 1);
          delete liveJobItemMap[jobId];
          delete liveJobControllers[jobId];
        } else if (data.status === "failed") {
          const msg = data.error || "实况处理失败";
          if (item) {
            item.status = "error";
            item.error = msg;
            item.progress = 0;
          }
          liveJobs.value.splice(idx, 1);
          delete liveJobItemMap[jobId];
          delete liveJobControllers[jobId];
        } else {
          setTimeout(poll, 1200);
        }
      } catch {
        setTimeout(poll, 1200);
      }
    };
    setTimeout(poll, 1200);
  }

  // ── 普通文件上传 ──────────────────────────────────────────
  const uploadControllers: Record<string, AbortController> = {};

  async function uploadSingleFile(item: UploadItem) {
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
      // 后端检测为 Motion Photo（返回 202），已在 processItem 通过 live 通道处理
      if (resp.status === 202) {
        item.status = "success";
        item.progress = 100;
      } else {
        item.status = "success";
        item.progress = 100;
      }
    } catch (e: any) {
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
  const filteredFiles = computed(() => {
    let result = files.value;
    if (fileTypeFilter.value !== "all")
      result = result.filter((f) => f.file_type === fileTypeFilter.value);
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (f) =>
          f.original_name.toLowerCase().includes(q) ||
          f.filename.toLowerCase().includes(q),
      );
    }
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
      files.value = resp.data.files;
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
    await api.delete("/files/batch", { data: { file_ids: fileIds } });
    files.value = files.value.filter((f) => !fileIds.includes(f.id));
    selectedFiles.value = selectedFiles.value.filter(
      (id) => !fileIds.includes(id),
    );
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
    pagination,
    filteredFiles,
    selectedFilesData,
    totalSelectedSize,
    uploadItems,
    uploadActive,
    uploadStats,
    liveJobs,
    fetchFiles,
    fetchFolders,
    fetchFolderPath,
    addFiles,
    rebuildMovPairs,
    removeUploadItem,
    clearUploadItems,
    retryUploadItem,
    cancelUploadItem,
    uploadSingleFile,
    createLiveJob,
    startLiveJobPolling,
    fetchSystemSettings,
    systemSettings,
    deleteFile,
    deleteFiles,
    deleteSelectedFiles,
    createFolder,
    deleteFolder,
    renameFolder,
    renameFile,
    selectFile,
    unselectFile,
    toggleFileSelection,
    toggleSelectAll,
    clearSelection,
  };
});
