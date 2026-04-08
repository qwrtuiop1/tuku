import { a as api, f as formatFileSize, _ as _export_sfc, e as getFilePreviewUrl, h as formatTime, c as getCachedImageUrl } from "./index-BrSJuu_a.js";
/* empty css                    */
import { ax as defineStore, r as ref, c as computed, y as defineComponent, l as onMounted, z as createElementBlock, B as createBaseVNode, L as createCommentVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, W as withModifiers, O as createTextVNode, E as normalizeClass, Q as Fragment, a6 as renderList, A as openBlock, I as createBlock, w as watch, U as onUnmounted, D as normalizeStyle } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, a as ElIcon, h as upload_default, c as ElButton, v as video_play_default, I as ElMessageBox, o as document_default, z as ElProgress, a8 as clock_default, n as loading_default, a9 as check_default, aa as close_default, ab as video_pause_default, ac as ElSlider, ad as microphone_default, ae as mute_default, y as full_screen_default, p as picture_default, K as refresh_default } from "./element-Bcpu2TdA.js";
/* empty css                   */
/* empty css                         */
/* empty css                   */
const useFilesStore = defineStore("files", () => {
  const files = ref([]);
  const folders = ref([]);
  const currentFolder = ref(null);
  const loading = ref(false);
  const selectedFiles = ref([]);
  const viewMode = ref("grid");
  const searchQuery = ref("");
  const fileTypeFilter = ref("all");
  const pagination = ref({ page: 1, limit: 20, total: 0, pages: 0 });
  const uploadItems = ref([]);
  const uploadActive = ref(false);
  const uploadStats = computed(() => ({
    total: uploadItems.value.filter((i) => i.status !== "canceled").length,
    success: uploadItems.value.filter((i) => i.status === "success").length,
    error: uploadItems.value.filter((i) => i.status === "error").length,
    pending: uploadItems.value.filter((i) => i.status === "pending").length,
    detecting: uploadItems.value.filter((i) => i.status === "detecting").length,
    uploading: uploadItems.value.filter((i) => i.status === "uploading").length
  }));
  function addFiles(newFiles) {
    for (const file of newFiles) {
      const item = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        progress: 0,
        status: "pending",
        fileCategory: inferCategory(file)
      };
      uploadItems.value.push(item);
    }
    if (!uploadActive.value) processUploadQueue();
  }
  function inferCategory(file) {
    const n = file.name.toLowerCase();
    if (n.endsWith(".gif") || n.endsWith(".webp")) return "animated";
    if (n.endsWith(".mov")) return "video";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    return "unknown";
  }
  function removeUploadItem(id) {
    const idx = uploadItems.value.findIndex((i) => i.id === id);
    if (idx !== -1) uploadItems.value.splice(idx, 1);
  }
  function clearUploadItems() {
    uploadItems.value = [];
  }
  const systemSettings = ref({ maxFileSize: 100 });
  computed(
    () => systemSettings.value.maxFileSize * 1024 * 1024
  );
  async function fetchSystemSettings() {
    try {
      const { data } = await api.get("/system/info");
      systemSettings.value.maxFileSize = data.max_file_size || 100;
    } catch {
    }
  }
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
  async function processItem(item) {
    const n = item.file.name.toLowerCase();
    if (n.endsWith(".heic") && movPairMap.has(n)) {
      const paired = movPairMap.get(n);
      pairedConsumed.add(paired.name);
      item.status = "uploading";
      const ok = await createLiveJob([item.file, paired], item.id);
      if (ok) {
        item.status = "success";
        item.progress = 100;
      }
      return;
    }
    if (/\.(gif|webp)$/i.test(n)) {
      item.fileCategory = "animated";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }
    if (n.endsWith(".mov") && pairedConsumed.has(item.file.name)) {
      removeUploadItem(item.id);
      return;
    }
    if (n.endsWith(".mov")) {
      item.fileCategory = "video";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }
    if (n.endsWith(".heic")) {
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) {
      item.status = "detecting";
      const isMotion = await detectMotionPhoto(item.file);
      if (isMotion) {
        item.fileCategory = "live";
        item.status = "uploading";
        const ok = await createLiveJob([item.file], item.id);
        if (!ok) return;
      } else {
        item.fileCategory = "image";
        item.status = "uploading";
        await uploadSingleFile(item);
      }
      return;
    }
    item.status = "uploading";
    await uploadSingleFile(item);
  }
  const movPairMap = /* @__PURE__ */ new Map();
  const pairedConsumed = /* @__PURE__ */ new Set();
  function rebuildMovPairs(files2) {
    movPairMap.clear();
    pairedConsumed.clear();
    for (const f of files2) {
      if (f.name.toLowerCase().endsWith(".mov")) {
        movPairMap.set(f.name.toLowerCase(), f);
      }
    }
    const toBase = (n) => n.replace(/\.[^.]+$/, "").toLowerCase();
    for (const f of files2) {
      if (f.name.toLowerCase().endsWith(".heic")) {
        const base = toBase(f.name.toLowerCase());
        if (movPairMap.has(base)) {
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
  async function detectMotionPhoto(file) {
    const readChunk = (start, len) => new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsArrayBuffer(
        file.slice(start, Math.min(file.size, start + len))
      );
    });
    const validateFtyp = (bytes, idx) => {
      if (idx < 4) return false;
      const boxLen = bytes[idx - 4] << 24 | bytes[idx - 3] << 16 | bytes[idx - 2] << 8 | bytes[idx - 1];
      const remaining = bytes.length - (idx - 4);
      if (boxLen < 8 || boxLen > 1024 * 1024 || boxLen > remaining) return false;
      if (idx + 8 > bytes.length) return false;
      const brand = String.fromCharCode(
        bytes[idx + 4],
        bytes[idx + 5],
        bytes[idx + 6],
        bytes[idx + 7]
      );
      return /^(isom|iso2|mp41|mp42|avc1|MSNV|M4V |qt  |dash|fmp4|3gp4|3gp5|3gp6|3g2a|M4A |M4B )$/i.test(
        brand
      );
    };
    const findFtypIndex = (bytes, start = 0) => {
      for (let j = start; j <= bytes.length - 4; j++) {
        if (bytes[j] === 102 && bytes[j + 1] === 116 && bytes[j + 2] === 121 && bytes[j + 3] === 112) {
          return j;
        }
      }
      return -1;
    };
    try {
      if (file.size < 16) return false;
      const MAX_HEAD = 20 * 1024 * 1024;
      const MAX_TAIL = 5 * 1024 * 1024;
      const MAX_MIDDLE_SCAN = 50 * 1024 * 1024;
      const headSize = Math.min(MAX_HEAD, file.size);
      const headBytes = new Uint8Array(await readChunk(0, headSize));
      let pos = 0;
      for (; ; ) {
        const idx = findFtypIndex(headBytes, pos);
        if (idx === -1) break;
        if (validateFtyp(headBytes, idx)) {
          let eoiBefore = -1;
          for (let i = idx - 1; i >= 1; i--) {
            if (headBytes[i - 1] === 255 && headBytes[i] === 217) {
              eoiBefore = i + 1;
              break;
            }
          }
          if (eoiBefore > 0 && eoiBefore < idx) return true;
        }
        pos = idx + 4;
      }
      const tailSize = Math.min(MAX_TAIL, file.size);
      const tailBytes = new Uint8Array(
        await readChunk(file.size - tailSize, tailSize)
      );
      let eoiAfter = -1;
      for (let i = tailBytes.length - 2; i >= 0; i--) {
        if (tailBytes[i] === 255 && tailBytes[i + 1] === 217) {
          eoiAfter = i + 2;
          break;
        }
      }
      if (eoiAfter >= 0 && eoiAfter < tailBytes.length - 8) {
        const after = tailBytes.subarray(eoiAfter);
        pos = 0;
        for (; ; ) {
          const idx = findFtypIndex(after, pos);
          if (idx === -1) break;
          if (idx >= 4 && validateFtyp(after, idx)) return true;
          pos = idx + 4;
        }
      }
      if (headSize < file.size) {
        const middleStart = MAX_HEAD;
        const middleSize = Math.min(MAX_MIDDLE_SCAN, file.size - middleStart);
        if (middleSize > 0) {
          const middleBytes = new Uint8Array(await readChunk(middleStart, middleSize));
          pos = 0;
          for (; ; ) {
            const idx = findFtypIndex(middleBytes, pos);
            if (idx === -1) break;
            if (validateFtyp(middleBytes, idx)) return true;
            pos = idx + 4;
          }
        }
      }
    } catch {
    }
    return false;
  }
  const liveJobControllers = {};
  const liveJobs = ref(
    []
  );
  const liveJobItemMap = {};
  async function createLiveJob(batch, itemId, pairingId) {
    var _a, _b, _c;
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
        timeout: 12e4
      });
      const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
      if (jobId) {
        liveJobControllers[jobId] = controller;
        liveJobItemMap[jobId] = itemId ?? "";
        startLiveJobPolling(jobId);
      }
      return true;
    } catch (e) {
      if (itemId) {
        const item = uploadItems.value.find((i) => i.id === itemId);
        if (item) {
          item.status = "error";
          item.error = ((_c = (_b = e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "动图上传失败";
          item.progress = 0;
        }
      }
      return false;
    }
  }
  function normalizeJobId(raw) {
    if (raw == null) return null;
    if (typeof raw === "string" || typeof raw === "number") return String(raw);
    if (typeof raw === "object") {
      if (raw.id != null) return String(raw.id);
      if (raw.jobId != null) return String(raw.jobId);
    }
    return null;
  }
  function startLiveJobPolling(jobId) {
    const itemId = liveJobItemMap[jobId];
    const item = itemId ? uploadItems.value.find((i) => i.id === itemId) : null;
    liveJobs.value.push({ id: jobId, status: "queued", progress: 0 });
    const poll = async () => {
      try {
        const { data } = await api.get(
          `/live-media/jobs/${encodeURIComponent(String(jobId))}`
        );
        const idx = liveJobs.value.findIndex((j) => j.id === jobId);
        if (idx !== -1) {
          liveJobs.value[idx] = {
            id: jobId,
            status: data.status,
            progress: data.progress || 0
          };
        }
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
  const uploadControllers = {};
  async function uploadSingleFile(item) {
    var _a, _b, _c, _d, _e;
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
          if (e.total) item.progress = Math.round(e.loaded * 100 / e.total);
        }
      });
      if (resp.status === 202) {
        const jobId = normalizeJobId(
          (_a = resp.data) == null ? void 0 : _a.jobId
        );
        if (jobId) {
          liveJobItemMap[jobId] = item.id;
          item.status = "uploading";
          startLiveJobPolling(jobId);
        } else {
          item.status = "error";
          item.error = ((_b = resp.data) == null ? void 0 : _b.message) || "未返回处理任务 ID";
          item.progress = 0;
        }
      } else {
        item.status = "success";
        item.progress = 100;
      }
    } catch (e) {
      if (((_c = e.message) == null ? void 0 : _c.includes("canceled")) || e.code === "ERR_CANCELED") {
        item.status = "canceled";
      } else {
        item.status = "error";
        item.error = ((_e = (_d = e.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || e.message || "上传失败";
      }
    } finally {
      delete uploadControllers[item.id];
    }
  }
  function retryUploadItem(id) {
    const item = uploadItems.value.find((i) => i.id === id);
    if (!item) return;
    item.status = "pending";
    item.progress = 0;
    item.error = void 0;
    if (!uploadActive.value) processUploadQueue();
  }
  function cancelUploadItem(id) {
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
  const filteredFiles = computed(() => {
    let result = files.value;
    if (fileTypeFilter.value !== "all")
      result = result.filter((f) => f.file_type === fileTypeFilter.value);
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(
        (f) => f.original_name.toLowerCase().includes(q) || f.filename.toLowerCase().includes(q)
      );
    }
    return result;
  });
  const selectedFilesData = computed(
    () => files.value.filter((f) => selectedFiles.value.includes(f.id))
  );
  const totalSelectedSize = computed(
    () => selectedFilesData.value.reduce((t, f) => t + f.file_size, 0)
  );
  async function fetchFiles(page = 1) {
    const folderSnapshot = currentFolder.value;
    loading.value = true;
    try {
      const params = { page, limit: pagination.value.limit };
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
      const params = {};
      if (folderSnapshot) params.parent_id = folderSnapshot;
      const resp = await api.get("/folders", { params });
      if (currentFolder.value !== folderSnapshot) return;
      folders.value = resp.data.folders;
    } catch {
    }
  }
  async function fetchFolderPath(folderId) {
    try {
      const { data } = await api.get(`/folders/path/${folderId}`);
      return data.path;
    } catch {
      return [];
    }
  }
  async function deleteFile(fileId) {
    await api.delete(`/files/${fileId}`);
    files.value = files.value.filter((f) => f.id !== fileId);
    selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
  }
  async function deleteFiles(fileIds) {
    var _a, _b;
    try {
      await api.delete("/files/batch", { data: { file_ids: fileIds } });
      files.value = files.value.filter((f) => !fileIds.includes(f.id));
      selectedFiles.value = selectedFiles.value.filter(
        (id) => !fileIds.includes(id)
      );
    } catch (e) {
      const msg = ((_b = (_a = e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || e.message || "批量删除失败";
      ElMessage.error(msg);
      throw e;
    }
  }
  async function deleteSelectedFiles() {
    if (!selectedFiles.value.length) return;
    await deleteFiles([...selectedFiles.value]);
    selectedFiles.value = [];
  }
  async function createFolder(folderName, parentId) {
    await api.post("/folders", {
      folder_name: folderName,
      parent_folder_id: parentId
    });
    await fetchFolders();
  }
  async function deleteFolder(folderId) {
    await api.delete(`/folders/${folderId}`);
    await fetchFolders();
  }
  async function renameFolder(folderId, newName) {
    await api.put(`/folders/${folderId}`, { folder_name: newName });
    await fetchFolders();
  }
  async function renameFile(fileId, newName) {
    await api.put(`/files/${fileId}`, { original_name: newName });
    await fetchFiles();
  }
  function selectFile(fileId) {
    if (!selectedFiles.value.includes(fileId)) selectedFiles.value.push(fileId);
  }
  function unselectFile(fileId) {
    selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
  }
  function toggleFileSelection(fileId) {
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
    clearSelection
  };
});
function detectPhotosPickerSupport() {
  if (typeof window === "undefined") return false;
  return "showPhotosPicker" in window;
}
function generatePairingId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function useLivePhotoPicker(options) {
  const isSupported = ref(detectPhotosPickerSupport());
  const isLoading = ref(false);
  const openPhotosPicker = async () => {
    var _a, _b, _c, _d;
    if (!isSupported.value) {
      (_a = options.onError) == null ? void 0 : _a.call(options, "您的浏览器不支持实况图原生上传，请使用 iOS 16.4+ 或更新版本的 Safari");
      return;
    }
    isLoading.value = true;
    try {
      const picker = new window.showPhotosPicker({
        types: ["image/*", "video/*"],
        showLivePhotos: true,
        multiple: true,
        maxSelectionCount: options.max ?? 10
      });
      const selected = await picker;
      if (!selected || selected.length === 0) {
        isLoading.value = false;
        return;
      }
      const results = [];
      const imageHandleMap = /* @__PURE__ */ new Map();
      const videoHandleQueue = [];
      for (const handle of selected) {
        if (!handle) continue;
        const kind = handle.kind ?? "";
        const name = handle.name ?? "";
        if (kind === "image") {
          try {
            const file = await handle.getFile();
            const pairingId = generatePairingId();
            imageHandleMap.set(handle.uniqueId ?? Math.random(), {
              imageFile: file,
              pairingId
            });
          } catch (e) {
          }
        } else if (kind === "video") {
          try {
            const blob = await handle.getFile();
            videoHandleQueue.push({
              videoBlob: blob,
              pairingId: "",
              // 待分配
              imageFilename: name.replace(/\.[^.]+$/, "").toLowerCase()
            });
          } catch (e) {
          }
        }
      }
      const imageEntries = Array.from(imageHandleMap.entries());
      for (let i = 0; i < imageEntries.length; i++) {
        const [handleId, { imageFile, pairingId }] = imageEntries[i];
        const imageBase = imageFile.name.replace(/\.[^.]+$/, "").toLowerCase();
        const videoIdx = videoHandleQueue.findIndex((v) => v.imageFilename === imageBase);
        let videoBlob = null;
        if (videoIdx !== -1) {
          videoBlob = videoHandleQueue[videoIdx].videoBlob;
          videoHandleQueue.splice(videoIdx, 1);
        }
        results.push({
          imageFile,
          videoBlob,
          filename: imageFile.name,
          pairingId
        });
      }
      if (results.length === 0) {
        (_b = options.onError) == null ? void 0 : _b.call(options, "未检测到有效的实况图片");
        isLoading.value = false;
        return;
      }
      options.onPicked(results);
    } catch (e) {
      if ((e == null ? void 0 : e.name) === "AbortError" || ((_c = e == null ? void 0 : e.message) == null ? void 0 : _c.includes("cancelled"))) {
        isLoading.value = false;
        return;
      }
      (_d = options.onError) == null ? void 0 : _d.call(options, (e == null ? void 0 : e.message) || "实况图选择失败，请重试");
    } finally {
      isLoading.value = false;
    }
  };
  const openFallbackPicker = (fileInput) => {
    if (fileInput) {
      fileInput.click();
    }
  };
  return {
    isSupported,
    isLoading,
    openPicker: isSupported.value ? openPhotosPicker : openFallbackPicker,
    openPhotosPicker
  };
}
const useDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isWechat = /MicroMessenger/i.test(ua);
  const isQQ = /QQ\//i.test(ua);
  const isChrome = /Chrome\/\d/i.test(ua);
  const isSafari = /Safari\/\d/i.test(ua) && !isChrome;
  const isAndroidChrome = isAndroid && isChrome;
  const isAndroidQQ = isAndroid && isQQ;
  const isAndroidWechat = isAndroid && isWechat;
  const deviceLabel = (() => {
    if (isAndroidQQ) return "Android QQ";
    if (isAndroidWechat) return "Android Wechat";
    if (isAndroidChrome) return "Android Chrome";
    if (isAndroid) return "Android";
    if (isIOS) return "iOS";
    return "Desktop";
  })();
  const getOptimalAccept = () => {
    if (isIOS) {
      return "image/*,image/heic,image/heif,video/*,video/quicktime";
    }
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif", ".bmp", ".tiff"];
    const videoExts = [".mp4", ".webm", ".mov", ".mkv", ".avi", ".3gp", ".m4v"];
    const mimes = [
      "image/*",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
      "video/*",
      "video/mp4",
      "video/quicktime",
      "video/webm"
    ];
    const exts = [...imageExts, ...videoExts];
    return [...mimes, ...exts].join(",");
  };
  const supportsFileSystemAccess = "showOpenFilePicker" in window;
  const getCaptureAttr = () => {
    if (isAndroid) return 'implementation="filesystem"';
    return void 0;
  };
  return {
    ua,
    isIOS,
    isAndroid,
    isMobile,
    isWechat,
    isQQ,
    isChrome,
    isSafari,
    isAndroidChrome,
    isAndroidQQ,
    isAndroidWechat,
    deviceLabel,
    getOptimalAccept,
    supportsFileSystemAccess,
    getCaptureAttr
  };
};
const _hoisted_1$2 = { class: "file-uploader" };
const _hoisted_2$2 = { class: "drop-content" };
const _hoisted_3$2 = { class: "upload-tips" };
const _hoisted_4$2 = { class: "tip-item" };
const _hoisted_5$2 = {
  key: 0,
  class: "tip-item tip-live"
};
const _hoisted_6$2 = ["accept"];
const _hoisted_7$2 = {
  key: 0,
  class: "upload-list"
};
const _hoisted_8$2 = { class: "upload-list-header" };
const _hoisted_9$2 = { class: "stats-summary" };
const _hoisted_10$2 = { class: "s-total" };
const _hoisted_11$1 = { class: "s-done" };
const _hoisted_12 = { class: "s-err" };
const _hoisted_13 = { class: "upload-items" };
const _hoisted_14 = { class: "item-thumb" };
const _hoisted_15 = ["src"];
const _hoisted_16 = {
  key: 0,
  class: "live-badge"
};
const _hoisted_17 = {
  key: 1,
  class: "live-badge"
};
const _hoisted_18 = { class: "item-info" };
const _hoisted_19 = { class: "item-name" };
const _hoisted_20 = { class: "item-meta" };
const _hoisted_21 = { class: "item-size" };
const _hoisted_22 = {
  key: 0,
  class: "tag tag-live"
};
const _hoisted_23 = {
  key: 1,
  class: "tag tag-animated"
};
const _hoisted_24 = {
  key: 2,
  class: "tag tag-video"
};
const _hoisted_25 = {
  key: 3,
  class: "tag tag-image"
};
const _hoisted_26 = {
  key: 4,
  class: "tag tag-detecting"
};
const _hoisted_27 = {
  key: 0,
  class: "item-progress"
};
const _hoisted_28 = {
  key: 1,
  class: "item-error"
};
const _hoisted_29 = { class: "item-status" };
const _hoisted_30 = { class: "item-actions" };
const _hoisted_31 = {
  key: 1,
  class: "live-jobs"
};
const _hoisted_32 = { class: "job-info" };
const _hoisted_33 = { class: "job-id" };
const _hoisted_34 = { class: "job-status" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FileUploader",
  emits: ["upload-success"],
  setup(__props, { emit: __emit }) {
    const filesStore = useFilesStore();
    const uploadItems = computed(() => filesStore.uploadItems);
    const uploadStats = computed(() => filesStore.uploadStats);
    const liveJobs = computed(() => filesStore.liveJobs);
    const maxFileSizeMB = computed(() => filesStore.systemSettings.maxFileSize);
    const { isIOS: isDeviceIOS } = useDeviceInfo();
    const computedUnifiedAccept = computed(() => {
      if (isDeviceIOS) {
        return "image/*,image/heic,image/heif,video/*,video/quicktime";
      }
      const imageExts = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".heic",
        ".heif",
        ".bmp"
      ];
      const videoExts = [".mp4", ".webm", ".mov", ".mkv", ".avi", ".3gp", ".m4v"];
      return [
        "image/*",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/heic",
        "image/heif",
        "video/*",
        "video/mp4",
        "video/quicktime",
        "video/webm",
        ...imageExts,
        ...videoExts,
        ...imageExts.map((e) => e.toUpperCase()),
        ...videoExts.map((e) => e.toUpperCase())
      ].join(",");
    });
    const {
      isSupported: photosPickerSupported,
      isLoading: photosPickerLoading,
      openPhotosPicker
    } = useLivePhotoPicker({
      onPicked: async (results) => {
        var _a, _b, _c;
        for (const result of results) {
          const fd = new FormData();
          fd.append("files", result.imageFile, result.filename);
          if (result.videoBlob) {
            const videoExt = result.filename.replace(/\.[^.]+$/, ".mov");
            fd.append("files", result.videoBlob, videoExt);
          }
          fd.append("pairing_id", result.pairingId);
          if (filesStore.currentFolder)
            fd.append("folder_id", String(filesStore.currentFolder));
          try {
            const resp = await api.post("/live-media/upload", fd, {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 12e4
            });
            const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
            if (jobId) filesStore.startLiveJobPolling(jobId);
          } catch (e) {
            ElMessage.error(((_c = (_b = e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "实况图上传失败");
          }
        }
      },
      onError: (msg) => {
        ElMessage.error(msg);
        triggerLiveInput();
      }
    });
    const fileInputRef = ref();
    const liveFileInputRef = ref();
    const isDragOver = ref(false);
    const triggerFileInput = () => {
      var _a;
      if (fileInputRef.value)
        fileInputRef.value.accept = computedUnifiedAccept.value;
      (_a = fileInputRef.value) == null ? void 0 : _a.click();
    };
    const triggerLiveInput = () => {
      var _a;
      (_a = liveFileInputRef.value) == null ? void 0 : _a.click();
    };
    const handleFileSelect = async (e) => {
      const target = e.target;
      const files = Array.from(target.files || []);
      target.value = "";
      if (!files.length) return;
      if (isDeviceIOS) {
        const names = files.map((f) => f.name.toLowerCase());
        const hasImg = names.some((n) => /\.(heic|heif|jpg|jpeg)$/.test(n));
        const hasMov = names.some((n) => n.endsWith(".mov"));
        if (hasImg && !hasMov) {
          try {
            await ElMessageBox.confirm(
              "检测到选择了图片，是否继续选择对应的实况视频（MOV）以形成实况？",
              "提示",
              {
                type: "info",
                confirmButtonText: "去选择",
                cancelButtonText: "先上传图片"
              }
            );
            triggerLiveInput();
          } catch {
          }
        }
      }
      filesStore.rebuildMovPairs(files);
      filesStore.addFiles(files);
    };
    const handleLiveSelect = async (e) => {
      var _a, _b, _c;
      const target = e.target;
      const files = Array.from(target.files || []);
      target.value = "";
      if (!files.length) return;
      try {
        const fd = new FormData();
        for (const f of files) fd.append("files", f);
        if (filesStore.currentFolder)
          fd.append("folder_id", String(filesStore.currentFolder));
        const resp = await api.post("/live-media/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 12e4
        });
        const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
        if (jobId) {
          ElMessage.success("实况上传已受理，开始处理...");
          filesStore.startLiveJobPolling(jobId);
        }
      } catch (e2) {
        ElMessage.error(((_c = (_b = e2.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "实况上传失败");
      }
    };
    const handleDragOver = () => {
      isDragOver.value = true;
    };
    const handleDragLeave = () => {
      isDragOver.value = false;
    };
    const handleDrop = async (e) => {
      var _a;
      isDragOver.value = false;
      const files = Array.from(((_a = e.dataTransfer) == null ? void 0 : _a.files) || []);
      if (!files.length) return;
      filesStore.rebuildMovPairs(files);
      filesStore.addFiles(files);
    };
    const formatSize = (bytes) => formatFileSize(bytes);
    const progressColor = (cat) => {
      if (cat === "animated") return "#f59e0b";
      if (cat === "live") return "#ec4899";
      if (cat === "video") return "#0ea5e9";
      return "#667eea";
    };
    const jobStatusText = (s) => {
      if (s === "queued") return "排队中";
      if (s === "processing") return "处理中";
      if (s === "completed") return "已完成";
      if (s === "failed") return "失败";
      return s;
    };
    function normalizeJobId(raw) {
      if (raw == null) return null;
      if (typeof raw === "string" || typeof raw === "number") return String(raw);
      if (typeof raw === "object") {
        if (raw.id != null) return String(raw.id);
        if (raw.jobId != null) return String(raw.jobId);
      }
      return null;
    }
    const removeUploadItem = (id) => {
      filesStore.cancelUploadItem(id);
      filesStore.removeUploadItem(id);
    };
    const clearUploadItems = () => filesStore.clearUploadItems();
    const retryUploadItem = (id) => filesStore.retryUploadItem(id);
    onMounted(() => {
      filesStore.fetchSystemSettings();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_progress = ElProgress;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", {
          ref: "dropZoneRef",
          class: normalizeClass(["drop-zone", { "is-dragover": isDragOver.value }]),
          onDrop: withModifiers(handleDrop, ["prevent"]),
          onDragover: withModifiers(handleDragOver, ["prevent"]),
          onDragleave: withModifiers(handleDragLeave, ["prevent"]),
          onClick: triggerFileInput
        }, [
          createBaseVNode("div", _hoisted_2$2, [
            createVNode(_component_el_icon, { class: "upload-icon" }, {
              default: withCtx(() => [
                createVNode(unref(upload_default))
              ]),
              _: 1
            }),
            _cache[3] || (_cache[3] = createBaseVNode("h3", { class: "upload-title" }, "拖拽文件到此处上传", -1)),
            _cache[4] || (_cache[4] = createBaseVNode("p", { class: "upload-subtitle" }, "或点击选择文件", -1)),
            createBaseVNode("div", _hoisted_3$2, [
              _cache[1] || (_cache[1] = createBaseVNode("span", { class: "tip-item" }, "支持图片、HEIC/HEIF 和 MP4/MOV 视频", -1)),
              createBaseVNode("span", _hoisted_4$2, "单个文件最大" + toDisplayString(maxFileSizeMB.value) + "MB", 1),
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "tip-item" }, '同名"图片+短视频"将自动识别为实况图', -1)),
              unref(photosPickerSupported) ? (openBlock(), createElementBlock("span", _hoisted_5$2, [
                createVNode(_component_el_button, {
                  type: "primary",
                  size: "small",
                  link: "",
                  loading: unref(photosPickerLoading),
                  onClick: withModifiers(unref(openPhotosPicker), ["stop"])
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(video_play_default))
                      ]),
                      _: 1
                    }),
                    _cache[0] || (_cache[0] = createTextVNode(" iOS 原生选择实况图（推荐） ", -1))
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"])
              ])) : createCommentVNode("", true)
            ])
          ])
        ], 34),
        createBaseVNode("input", {
          ref_key: "fileInputRef",
          ref: fileInputRef,
          type: "file",
          multiple: "",
          accept: computedUnifiedAccept.value,
          style: { "display": "none" },
          onChange: handleFileSelect
        }, null, 40, _hoisted_6$2),
        createBaseVNode("input", {
          ref_key: "liveFileInputRef",
          ref: liveFileInputRef,
          type: "file",
          multiple: "",
          accept: ".heic,.heif,.jpg,.jpeg,.mov,.gif,.webp,image/heic,image/heif,image/jpeg,video/quicktime,image/gif,image/webp",
          style: { "display": "none" },
          onChange: handleLiveSelect
        }, null, 544),
        uploadItems.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_7$2, [
          createBaseVNode("div", _hoisted_8$2, [
            _cache[9] || (_cache[9] = createBaseVNode("h4", null, "上传队列", -1)),
            createBaseVNode("span", _hoisted_9$2, [
              createBaseVNode("span", _hoisted_10$2, toDisplayString(uploadStats.value.total), 1),
              _cache[5] || (_cache[5] = createTextVNode(" 个文件 · ", -1)),
              createBaseVNode("span", _hoisted_11$1, toDisplayString(uploadStats.value.success), 1),
              _cache[6] || (_cache[6] = createTextVNode(" 成功 · ", -1)),
              createBaseVNode("span", _hoisted_12, toDisplayString(uploadStats.value.error), 1),
              _cache[7] || (_cache[7] = createTextVNode(" 失败 ", -1))
            ]),
            createVNode(_component_el_button, {
              type: "text",
              onClick: clearUploadItems
            }, {
              default: withCtx(() => [..._cache[8] || (_cache[8] = [
                createTextVNode("清空", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_13, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(uploadItems.value, (item) => {
              return openBlock(), createElementBlock("div", {
                key: item.id,
                class: normalizeClass(["upload-item", [item.status, `type-${item.fileCategory}`]])
              }, [
                createBaseVNode("div", _hoisted_14, [
                  item.preview ? (openBlock(), createElementBlock("img", {
                    key: 0,
                    src: item.preview,
                    class: "thumb-img"
                  }, null, 8, _hoisted_15)) : (openBlock(), createElementBlock("div", {
                    key: 1,
                    class: normalizeClass(["thumb-icon", item.fileCategory])
                  }, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        item.fileCategory === "live" || item.fileCategory === "video" ? (openBlock(), createBlock(unref(video_play_default), { key: 0 })) : (openBlock(), createBlock(unref(document_default), { key: 1 }))
                      ]),
                      _: 2
                    }, 1024),
                    item.fileCategory === "live" ? (openBlock(), createElementBlock("span", _hoisted_16, "LIVE")) : createCommentVNode("", true),
                    item.fileCategory === "animated" ? (openBlock(), createElementBlock("span", _hoisted_17, "GIF")) : createCommentVNode("", true)
                  ], 2))
                ]),
                createBaseVNode("div", _hoisted_18, [
                  createBaseVNode("div", _hoisted_19, toDisplayString(item.file.name), 1),
                  createBaseVNode("div", _hoisted_20, [
                    createBaseVNode("span", _hoisted_21, toDisplayString(formatSize(item.file.size)), 1),
                    item.fileCategory === "live" ? (openBlock(), createElementBlock("span", _hoisted_22, "实况")) : item.fileCategory === "animated" ? (openBlock(), createElementBlock("span", _hoisted_23, "动图")) : item.fileCategory === "video" ? (openBlock(), createElementBlock("span", _hoisted_24, "视频")) : item.fileCategory === "image" ? (openBlock(), createElementBlock("span", _hoisted_25, "图片")) : createCommentVNode("", true),
                    item.status === "detecting" ? (openBlock(), createElementBlock("span", _hoisted_26, "识别中")) : createCommentVNode("", true)
                  ]),
                  item.status === "uploading" || item.status === "detecting" ? (openBlock(), createElementBlock("div", _hoisted_27, [
                    createVNode(_component_el_progress, {
                      percentage: item.progress,
                      "stroke-width": 4,
                      "show-text": false,
                      color: progressColor(item.fileCategory)
                    }, null, 8, ["percentage", "color"])
                  ])) : createCommentVNode("", true),
                  item.status === "error" ? (openBlock(), createElementBlock("div", _hoisted_28, toDisplayString(item.error), 1)) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_29, [
                  item.status === "pending" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 0,
                    class: "ic ic-pending"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(clock_default))
                    ]),
                    _: 1
                  })) : item.status === "detecting" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 1,
                    class: "ic ic-detecting"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(loading_default))
                    ]),
                    _: 1
                  })) : item.status === "uploading" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 2,
                    class: "ic ic-uploading"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(loading_default))
                    ]),
                    _: 1
                  })) : item.status === "success" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 3,
                    class: "ic ic-success"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(check_default))
                    ]),
                    _: 1
                  })) : item.status === "error" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 4,
                    class: "ic ic-error"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(close_default))
                    ]),
                    _: 1
                  })) : item.status === "canceled" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 5,
                    class: "ic ic-canceled"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(close_default))
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_30, [
                  item.status === "error" ? (openBlock(), createBlock(_component_el_button, {
                    key: 0,
                    type: "text",
                    size: "small",
                    onClick: ($event) => retryUploadItem(item.id)
                  }, {
                    default: withCtx(() => [..._cache[10] || (_cache[10] = [
                      createTextVNode("重试", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])) : createCommentVNode("", true),
                  createVNode(_component_el_button, {
                    type: "text",
                    size: "small",
                    class: "rm-btn",
                    onClick: ($event) => removeUploadItem(item.id)
                  }, {
                    default: withCtx(() => [..._cache[11] || (_cache[11] = [
                      createTextVNode("移除", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ], 2);
            }), 128))
          ])
        ])) : createCommentVNode("", true),
        liveJobs.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_31, [
          _cache[12] || (_cache[12] = createBaseVNode("div", { class: "live-jobs-header" }, [
            createBaseVNode("h4", null, "实况处理中")
          ], -1)),
          (openBlock(true), createElementBlock(Fragment, null, renderList(liveJobs.value, (job) => {
            return openBlock(), createElementBlock("div", {
              key: job.id,
              class: "live-job-item"
            }, [
              createBaseVNode("div", _hoisted_32, [
                createBaseVNode("span", _hoisted_33, "任务 " + toDisplayString(job.id.slice(0, 12)) + "…", 1),
                createBaseVNode("span", _hoisted_34, toDisplayString(jobStatusText(job.status)), 1)
              ]),
              createVNode(_component_el_progress, {
                percentage: job.progress,
                "stroke-width": 4,
                "show-text": false,
                color: "#ec4899"
              }, null, 8, ["percentage"])
            ]);
          }), 128))
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const FileUploader = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-c9830778"]]);
const _hoisted_1$1 = { class: "video-container" };
const _hoisted_2$1 = ["src", "poster"];
const _hoisted_3$1 = {
  key: 0,
  class: "loading-overlay"
};
const _hoisted_4$1 = {
  key: 1,
  class: "error-overlay"
};
const _hoisted_5$1 = {
  key: 2,
  class: "custom-controls"
};
const _hoisted_6$1 = { class: "progress-bar" };
const _hoisted_7$1 = { class: "controls-bar" };
const _hoisted_8$1 = { class: "controls-left" };
const _hoisted_9$1 = { class: "time-display" };
const _hoisted_10$1 = { class: "controls-center" };
const _hoisted_11 = { class: "controls-right" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VideoPlayer",
  props: {
    video: {},
    showCustomControls: { type: Boolean }
  },
  emits: ["close", "video-end", "load", "error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const loading = ref(true);
    const hasError = ref(false);
    const isFullscreen = ref(false);
    const isPlaying = ref(false);
    const isMuted = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(100);
    const progressPercent = ref(0);
    const videoRef = ref();
    const videoUrl = computed(() => getFilePreviewUrl(props.video.id));
    const posterUrl = computed(() => props.video.thumbnail_path ? getFilePreviewUrl(props.video.id) : void 0);
    const onLoadStart = () => {
      loading.value = true;
      hasError.value = false;
    };
    const onLoadedMetadata = () => {
      var _a;
      loading.value = false;
      duration.value = ((_a = videoRef.value) == null ? void 0 : _a.duration) || 0;
      emit("load");
    };
    const onCanPlay = () => {
      loading.value = false;
      emit("load");
    };
    const onPlay = () => {
      isPlaying.value = true;
    };
    const onPause = () => {
      isPlaying.value = false;
    };
    const onEnded = () => {
      isPlaying.value = false;
      emit("video-end");
    };
    const onError = () => {
      loading.value = false;
      hasError.value = true;
      emit("error");
    };
    const onTimeUpdate = () => {
      if (videoRef.value) {
        currentTime.value = videoRef.value.currentTime;
        progressPercent.value = currentTime.value / duration.value * 100;
      }
    };
    const onVolumeChange = () => {
      if (videoRef.value) {
        videoRef.value.volume = volume.value / 100;
        isMuted.value = videoRef.value.muted;
      }
    };
    const retryLoad = () => {
      loading.value = true;
      hasError.value = false;
      if (videoRef.value) {
        videoRef.value.load();
      }
    };
    const togglePlay = () => {
      if (videoRef.value) {
        if (isPlaying.value) {
          videoRef.value.pause();
        } else {
          videoRef.value.play();
        }
      }
    };
    const toggleMute = () => {
      if (videoRef.value) {
        videoRef.value.muted = !videoRef.value.muted;
        isMuted.value = videoRef.value.muted;
      }
    };
    const toggleFullscreen = () => {
      if (videoRef.value) {
        if (videoRef.value.requestFullscreen) {
          videoRef.value.requestFullscreen();
        } else if (videoRef.value.webkitRequestFullscreen) {
          videoRef.value.webkitRequestFullscreen();
        } else if (videoRef.value.msRequestFullscreen) {
          videoRef.value.msRequestFullscreen();
        }
      }
    };
    const seekTo = (event) => {
      if (videoRef.value && duration.value > 0) {
        const rect = event.target.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const newTime = percent * duration.value;
        videoRef.value.currentTime = newTime;
      }
    };
    const handleKeydown = (event) => {
      if (!videoRef.value) return;
      switch (event.key) {
        case " ":
        case "Space":
          event.preventDefault();
          togglePlay();
          break;
        case "Escape":
          emit("close");
          break;
        case "ArrowLeft":
          videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10);
          break;
        case "ArrowRight":
          videoRef.value.currentTime = Math.min(duration.value, videoRef.value.currentTime + 10);
          break;
        case "ArrowUp":
          volume.value = Math.min(100, volume.value + 10);
          onVolumeChange();
          break;
        case "ArrowDown":
          volume.value = Math.max(0, volume.value - 10);
          onVolumeChange();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    watch(() => props.video, () => {
      loading.value = true;
      hasError.value = false;
      isPlaying.value = false;
      currentTime.value = 0;
      duration.value = 0;
      progressPercent.value = 0;
    });
    onMounted(() => {
      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("fullscreenchange", () => {
        isFullscreen.value = !!document.fullscreenElement;
      });
    });
    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("fullscreenchange", () => {
        isFullscreen.value = !!document.fullscreenElement;
      });
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value.src = "";
      }
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_slider = ElSlider;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["video-player", { "fullscreen": isFullscreen.value }])
      }, [
        createBaseVNode("div", _hoisted_1$1, [
          createBaseVNode("video", {
            ref_key: "videoRef",
            ref: videoRef,
            src: videoUrl.value,
            poster: posterUrl.value,
            class: "player-video",
            controls: "",
            preload: "metadata",
            onLoadstart: onLoadStart,
            onLoadedmetadata: onLoadedMetadata,
            onCanplay: onCanPlay,
            onPlay,
            onPause,
            onEnded,
            onError,
            onTimeupdate: onTimeUpdate,
            onVolumechange: onVolumeChange
          }, " 您的浏览器不支持视频播放 ", 40, _hoisted_2$1),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_3$1, [
            createVNode(_component_el_icon, { class: "loading-icon" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            }),
            _cache[1] || (_cache[1] = createBaseVNode("p", null, "正在加载视频...", -1))
          ])) : createCommentVNode("", true),
          hasError.value ? (openBlock(), createElementBlock("div", _hoisted_4$1, [
            createVNode(_component_el_icon, { class: "error-icon" }, {
              default: withCtx(() => [
                createVNode(unref(video_play_default))
              ]),
              _: 1
            }),
            _cache[3] || (_cache[3] = createBaseVNode("p", null, "视频加载失败", -1)),
            createVNode(_component_el_button, { onClick: retryLoad }, {
              default: withCtx(() => [..._cache[2] || (_cache[2] = [
                createTextVNode("重试", -1)
              ])]),
              _: 1
            })
          ])) : createCommentVNode("", true),
          __props.showCustomControls ? (openBlock(), createElementBlock("div", _hoisted_5$1, [
            createBaseVNode("div", _hoisted_6$1, [
              createBaseVNode("div", {
                class: "progress-track",
                onClick: seekTo
              }, [
                createBaseVNode("div", {
                  class: "progress-fill",
                  style: normalizeStyle({ width: progressPercent.value + "%" })
                }, null, 4),
                createBaseVNode("div", {
                  class: "progress-handle",
                  style: normalizeStyle({ left: progressPercent.value + "%" })
                }, null, 4)
              ])
            ]),
            createBaseVNode("div", _hoisted_7$1, [
              createBaseVNode("div", _hoisted_8$1, [
                createVNode(_component_el_button, {
                  onClick: togglePlay,
                  class: "play-button"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        !isPlaying.value ? (openBlock(), createBlock(unref(video_play_default), { key: 0 })) : (openBlock(), createBlock(unref(video_pause_default), { key: 1 }))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createBaseVNode("div", _hoisted_9$1, toDisplayString(unref(formatTime)(currentTime.value)) + " / " + toDisplayString(unref(formatTime)(duration.value)), 1)
              ]),
              createBaseVNode("div", _hoisted_10$1, [
                createVNode(_component_el_slider, {
                  modelValue: volume.value,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => volume.value = $event),
                  min: 0,
                  max: 100,
                  "show-tooltip": false,
                  class: "volume-slider",
                  onChange: onVolumeChange
                }, null, 8, ["modelValue"]),
                createVNode(_component_el_button, {
                  onClick: toggleMute,
                  class: "volume-button"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        !isMuted.value ? (openBlock(), createBlock(unref(microphone_default), { key: 0 })) : (openBlock(), createBlock(unref(mute_default), { key: 1 }))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_11, [
                createVNode(_component_el_button, {
                  onClick: toggleFullscreen,
                  class: "fullscreen-button"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(full_screen_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ])
            ])
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const VideoPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-6742fbf0"]]);
const _hoisted_1 = { class: "file-preview" };
const _hoisted_2 = {
  key: 0,
  class: "image-preview"
};
const _hoisted_3 = { class: "preview-image-container" };
const _hoisted_4 = ["src", "alt"];
const _hoisted_5 = {
  key: 1,
  class: "error-state"
};
const _hoisted_6 = {
  key: 2,
  class: "loading-overlay"
};
const _hoisted_7 = { key: 0 };
const _hoisted_8 = { key: 1 };
const _hoisted_9 = {
  key: 1,
  class: "video-preview"
};
const _hoisted_10 = {
  key: 2,
  class: "unknown-preview"
};
const maxRetries = 3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FilePreview",
  props: {
    file: {}
  },
  emits: ["file-deleted", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useFilesStore();
    const loading = ref(true);
    const isZoomed = ref(false);
    const videoElement = ref();
    const retryCount = ref(0);
    const hasError = ref(false);
    const previewImageUrl = ref("");
    const initializePreviewUrl = async () => {
      try {
        loading.value = true;
        hasError.value = false;
        retryCount.value = 0;
        const url = await getCachedImageUrl(props.file.id);
        previewImageUrl.value = url;
        if (url) {
          return;
        } else {
          loading.value = false;
          hasError.value = true;
        }
      } catch (error) {
        loading.value = false;
        hasError.value = true;
      }
    };
    const handleImageLoad = (event) => {
      loading.value = false;
      hasError.value = false;
      retryCount.value = 0;
      const img = event.target;
      if (img) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        img.removeAttribute("data-aspect-ratio");
        if (aspectRatio > 1.5) {
          img.setAttribute("data-aspect-ratio", "landscape");
        } else if (aspectRatio < 0.67) {
          img.setAttribute("data-aspect-ratio", "portrait");
        } else {
          img.setAttribute("data-aspect-ratio", "square");
        }
      }
    };
    const handleImageError = (event) => {
      retryCount.value++;
      if (retryCount.value <= maxRetries) {
        setTimeout(() => {
          const img = event.target;
          if (img) {
            const originalSrc = img.src;
            const separator = originalSrc.includes("?") ? "&" : "?";
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            img.src = originalSrc + separator + `retry=${timestamp}&r=${random}`;
          }
        }, 2e3 * retryCount.value);
      } else {
        loading.value = false;
        hasError.value = true;
        const img = event.target;
        if (img && img.src.includes("token=null")) {
          ElMessage.error("认证已过期，请重新登录");
        } else {
          ElMessage.error(`图片 "${props.file.original_name}" 加载失败，请检查文件是否损坏或网络连接`);
        }
      }
    };
    const handleVideoLoad = () => {
      loading.value = false;
    };
    const handleVideoError = () => {
      loading.value = false;
    };
    const retryLoadImage = () => {
      hasError.value = false;
      loading.value = true;
      retryCount.value = 0;
      const img = document.querySelector(".preview-image");
      if (img) {
        const originalSrc = img.src;
        const separator = originalSrc.includes("?") ? "&" : "?";
        img.src = originalSrc + separator + "retry=" + Date.now();
      }
    };
    onMounted(() => {
      if (props.file.file_type === "image") {
        initializePreviewUrl();
      } else {
        loading.value = false;
      }
    });
    onUnmounted(() => {
      if (videoElement.value) {
        videoElement.value.pause();
        videoElement.value.src = "";
      }
    });
    watch(
      () => props.file,
      (newFile) => {
        loading.value = true;
        hasError.value = false;
        retryCount.value = 0;
        previewImageUrl.value = "";
        isZoomed.value = false;
        if (newFile.file_type === "image") {
          initializePreviewUrl();
        } else {
          loading.value = false;
        }
      }
    );
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        __props.file.file_type === "image" ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            !hasError.value ? (openBlock(), createElementBlock("img", {
              key: 0,
              src: previewImageUrl.value,
              alt: __props.file.original_name,
              class: "preview-image",
              onLoad: handleImageLoad,
              onError: handleImageError
            }, null, 40, _hoisted_4)) : createCommentVNode("", true),
            hasError.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
              createVNode(_component_el_icon, { class: "error-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(picture_default))
                ]),
                _: 1
              }),
              _cache[2] || (_cache[2] = createBaseVNode("h3", null, "图片加载失败", -1)),
              createBaseVNode("p", null, toDisplayString(__props.file.original_name), 1),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: retryLoadImage
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(refresh_default))
                    ]),
                    _: 1
                  }),
                  _cache[1] || (_cache[1] = createTextVNode(" 重新加载 ", -1))
                ]),
                _: 1
              })
            ])) : createCommentVNode("", true),
            loading.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
              createVNode(_component_el_icon, { class: "loading-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(loading_default))
                ]),
                _: 1
              }),
              retryCount.value > 0 ? (openBlock(), createElementBlock("p", _hoisted_7, "正在重试加载... (" + toDisplayString(retryCount.value) + "/" + toDisplayString(maxRetries) + ")", 1)) : (openBlock(), createElementBlock("p", _hoisted_8, "正在加载预览..."))
            ])) : createCommentVNode("", true)
          ])
        ])) : __props.file.file_type === "video" ? (openBlock(), createElementBlock("div", _hoisted_9, [
          createVNode(VideoPlayer, {
            video: __props.file,
            onClose: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close")),
            onLoad: handleVideoLoad,
            onError: handleVideoError
          }, null, 8, ["video"])
        ])) : (openBlock(), createElementBlock("div", _hoisted_10, [
          createVNode(_component_el_icon, { class: "unknown-icon" }, {
            default: withCtx(() => [
              createVNode(unref(document_default))
            ]),
            _: 1
          }),
          _cache[3] || (_cache[3] = createBaseVNode("h3", null, "不支持的文件类型", -1)),
          _cache[4] || (_cache[4] = createBaseVNode("p", null, "无法预览此类型的文件", -1))
        ]))
      ]);
    };
  }
});
const FilePreview = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3ec83421"]]);
export {
  FilePreview as F,
  FileUploader as a,
  useFilesStore as u
};
//# sourceMappingURL=FilePreview-Cpe5bJBR.js.map
