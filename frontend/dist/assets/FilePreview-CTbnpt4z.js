import { a as api, f as formatFileSize, _ as _export_sfc, e as getFilePreviewUrl, h as formatTime, c as getCachedImageUrl } from "./index-TR09GHHj.js";
/* empty css                    */
import { ax as defineStore, r as ref, c as computed, y as defineComponent, l as onMounted, z as createElementBlock, B as createBaseVNode, L as createCommentVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, O as createTextVNode, W as withModifiers, E as normalizeClass, Q as Fragment, a6 as renderList, A as openBlock, I as createBlock, w as watch, U as onUnmounted, D as normalizeStyle } from "./vendor-DT2rKQnu.js";
import { a as ElIcon, h as upload_default, a8 as monitor_default, c as ElButton, v as video_play_default, n as loading_default, z as ElProgress, I as ElMessageBox, E as ElMessage, a9 as clock_default, aa as check_default, ab as close_default, ac as video_pause_default, ad as ElSlider, ae as microphone_default, af as mute_default, y as full_screen_default, p as picture_default, K as refresh_default, o as document_default } from "./element-CUyZSw-d.js";
/* empty css                   */
/* empty css                         */
/* empty css                   */
const useFilesStore = defineStore("files", () => {
  const files = ref([]);
  const folders = ref([]);
  const currentFolder = ref(null);
  const loading = ref(false);
  const uploadProgress = ref([]);
  const selectedFiles = ref([]);
  const viewMode = ref("grid");
  const searchQuery = ref("");
  const fileTypeFilter = ref("all");
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const filteredFiles = computed(() => {
    let result = files.value;
    if (fileTypeFilter.value !== "all") {
      result = result.filter((file) => file.file_type === fileTypeFilter.value);
    }
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (file) => file.original_name.toLowerCase().includes(query) || file.filename.toLowerCase().includes(query)
      );
    }
    return result;
  });
  const selectedFilesData = computed(() => {
    return files.value.filter((file) => selectedFiles.value.includes(file.id));
  });
  const totalSelectedSize = computed(() => {
    return selectedFilesData.value.reduce((total, file) => total + file.file_size, 0);
  });
  const fetchFiles = async (page = 1) => {
    const folderSnapshot = currentFolder.value;
    loading.value = true;
    try {
      const params = {
        page,
        limit: pagination.value.limit
      };
      if (folderSnapshot) {
        params.folder_id = folderSnapshot;
      }
      if (fileTypeFilter.value !== "all") {
        params.file_type = fileTypeFilter.value;
      }
      if (searchQuery.value) {
        params.search = searchQuery.value;
      }
      const response = await api.get("/files", { params });
      if (currentFolder.value !== folderSnapshot) return;
      files.value = response.data.files;
      pagination.value = response.data.pagination;
    } catch (error) {
    } finally {
      if (currentFolder.value === folderSnapshot) {
        loading.value = false;
      }
    }
  };
  const fetchFolders = async () => {
    const folderSnapshot = currentFolder.value;
    try {
      const params = {};
      if (folderSnapshot) {
        params.parent_id = folderSnapshot;
      }
      const response = await api.get("/folders", { params });
      if (currentFolder.value !== folderSnapshot) return;
      folders.value = response.data.folders;
    } catch (error) {
    }
  };
  const fetchFolderPath = async (folderId) => {
    try {
      const response = await api.get(`/folders/path/${folderId}`);
      return response.data.path;
    } catch (error) {
      return [];
    }
  };
  const uploadFiles = async (fileList) => {
    const uploadPromises = Array.from(fileList).map((file) => uploadSingleFile(file));
    await Promise.all(uploadPromises);
    await fetchFiles();
  };
  const uploadSingleFile = async (file) => {
    var _a, _b;
    const progressItem = {
      file,
      progress: 0,
      status: "pending"
    };
    uploadProgress.value.push(progressItem);
    try {
      progressItem.status = "uploading";
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder.value) {
        formData.append("folder_id", currentFolder.value.toString());
      }
      const response = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            progressItem.progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
          }
        }
      });
      progressItem.status = "success";
      progressItem.progress = 100;
    } catch (error) {
      progressItem.status = "error";
      progressItem.error = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "上传失败";
    }
  };
  const deleteFile = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      files.value = files.value.filter((file) => file.id !== fileId);
      selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
    } catch (error) {
      throw error;
    }
  };
  const deleteFiles = async (fileIds) => {
    try {
      await api.delete("/files/batch", { data: { file_ids: fileIds } });
      files.value = files.value.filter((file) => !fileIds.includes(file.id));
      selectedFiles.value = selectedFiles.value.filter((id) => !fileIds.includes(id));
    } catch (error) {
      throw error;
    }
  };
  const deleteSelectedFiles = async () => {
    if (selectedFiles.value.length === 0) return;
    await deleteFiles([...selectedFiles.value]);
    selectedFiles.value = [];
  };
  const createFolder = async (folderName, parentId) => {
    try {
      await api.post("/folders", {
        folder_name: folderName,
        parent_folder_id: parentId
      });
      await fetchFolders();
    } catch (error) {
      throw error;
    }
  };
  const deleteFolder = async (folderId) => {
    try {
      await api.delete(`/folders/${folderId}`);
      await fetchFolders();
    } catch (error) {
      throw error;
    }
  };
  const renameFolder = async (folderId, newName) => {
    try {
      await api.put(`/folders/${folderId}`, {
        folder_name: newName
      });
      await fetchFolders();
    } catch (error) {
      throw error;
    }
  };
  const renameFile = async (fileId, newName) => {
    try {
      await api.put(`/files/${fileId}`, {
        original_name: newName
      });
      await fetchFiles();
    } catch (error) {
      throw error;
    }
  };
  const clearUploadProgress = () => {
    uploadProgress.value = [];
  };
  const selectFile = (fileId) => {
    if (!selectedFiles.value.includes(fileId)) {
      selectedFiles.value.push(fileId);
    }
  };
  const unselectFile = (fileId) => {
    selectedFiles.value = selectedFiles.value.filter((id) => id !== fileId);
  };
  const toggleFileSelection = (fileId) => {
    if (selectedFiles.value.includes(fileId)) {
      unselectFile(fileId);
    } else {
      selectFile(fileId);
    }
  };
  const toggleSelectAll = () => {
    if (selectedFiles.value.length === filteredFiles.value.length) {
      selectedFiles.value = [];
    } else {
      selectedFiles.value = filteredFiles.value.map((file) => file.id);
    }
  };
  const clearSelection = () => {
    selectedFiles.value = [];
  };
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
const _hoisted_2$2 = {
  key: 0,
  class: "drop-content"
};
const _hoisted_3$2 = { class: "upload-tips" };
const _hoisted_4$2 = { class: "tip-item" };
const _hoisted_5$2 = {
  key: 0,
  class: "tip-item tip-android"
};
const _hoisted_6$2 = {
  key: 1,
  class: "tip-item tip-live"
};
const _hoisted_7$2 = {
  key: 1,
  class: "uploading-content"
};
const _hoisted_8$2 = { class: "upload-progress" };
const _hoisted_9$2 = { class: "progress-text" };
const _hoisted_10$2 = ["accept"];
const _hoisted_11$1 = {
  key: 1,
  class: "upload-list"
};
const _hoisted_12 = { class: "upload-list-header" };
const _hoisted_13 = { class: "upload-items" };
const _hoisted_14 = { class: "item-thumbnail" };
const _hoisted_15 = ["src", "alt"];
const _hoisted_16 = {
  key: 1,
  class: "file-icon"
};
const _hoisted_17 = { class: "item-info" };
const _hoisted_18 = { class: "item-name" };
const _hoisted_19 = { class: "item-size" };
const _hoisted_20 = { class: "item-progress" };
const _hoisted_21 = { class: "item-status" };
const _hoisted_22 = { class: "item-actions" };
const _hoisted_23 = {
  key: 2,
  class: "upload-stats"
};
const _hoisted_24 = { class: "stats-item" };
const _hoisted_25 = { class: "stats-value" };
const _hoisted_26 = { class: "stats-item" };
const _hoisted_27 = { class: "stats-value success" };
const _hoisted_28 = { class: "stats-item" };
const _hoisted_29 = { class: "stats-value error" };
const _hoisted_30 = {
  key: 3,
  class: "live-jobs"
};
const _hoisted_31 = { class: "live-jobs-items" };
const _hoisted_32 = { class: "job-info" };
const _hoisted_33 = { class: "job-id" };
const _hoisted_34 = { class: "job-status" };
const _hoisted_35 = { class: "job-actions" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FileUploader",
  emits: ["upload-success"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const filesStore = useFilesStore();
    const dropZoneRef = ref();
    const fileInputRef = ref();
    const liveFileInputRef = ref();
    const androidFileInputRef = ref();
    const isDragOver = ref(false);
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const uploadList = ref([]);
    const liveJobs = ref([]);
    const liveControllers = {};
    const usedMovsInProcess = /* @__PURE__ */ new Set();
    const jobTimers = {};
    ref();
    const { isSupported: photosPickerSupported, isLoading: photosPickerLoading, openPhotosPicker } = useLivePhotoPicker({
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
          if (filesStore.currentFolder) fd.append("folder_id", String(filesStore.currentFolder));
          try {
            const resp = await api.post("/live-media/upload", fd, {
              headers: { "Content-Type": "multipart/form-data" }
            });
            const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
            if (jobId) startJobPolling(jobId);
            else ElMessage.warning("后端未返回 jobId，已受理但无法跟踪进度");
          } catch (err) {
            ElMessage.error(((_c = (_b = err.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "实况图上传失败");
          }
        }
      },
      onError: (msg) => {
        ElMessage.error(msg);
        triggerLiveInput();
      }
    });
    const normalizeJobId = (raw) => {
      if (raw == null) return null;
      const t = typeof raw;
      if (t === "string" || t === "number") return String(raw);
      if (t === "object") {
        if (raw.id != null) return String(raw.id);
        if (raw.jobId != null) return String(raw.jobId);
        if (raw.value != null) return String(raw.value);
        if (raw.data != null) return normalizeJobId(raw.data);
      }
      return null;
    };
    const systemSettings = ref({
      maxFileSize: 100,
      // 默认100MB
      maxUploadFiles: 10,
      // 默认10个文件
      allowedVideoTypes: ["mp4", "webm", "mov"]
    });
    const maxFileSizeMB = computed(() => systemSettings.value.maxFileSize);
    const maxFileSizeBytes = computed(() => systemSettings.value.maxFileSize * 1024 * 1024);
    computed(() => {
      const videoExts = (systemSettings.value.allowedVideoTypes || []).map((v) => `.${v}`);
      const parts = ["image/*", "video/*", ...videoExts, ".heic", ".heif"];
      return parts.join(",");
    });
    computed(() => {
      const videoExts = (systemSettings.value.allowedVideoTypes || []).map((v) => `.${v}`);
      const videoMimes = ["video/*", "video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/x-msvideo"];
      return [...videoMimes, ...videoExts];
    });
    const computedUnifiedAccept = computed(() => {
      if (isDeviceIOS.value) {
        return ["image/*", "image/heic", "image/heif", "video/*", "video/quicktime"].join(",");
      }
      return getDeviceOptimalAccept();
    });
    computed(() => /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    computed(() => /iPhone|iPad|iPod/i.test(navigator.userAgent));
    const {
      isIOS: isDeviceIOS,
      isAndroid: isDeviceAndroid,
      getOptimalAccept: getDeviceOptimalAccept
    } = useDeviceInfo();
    const uploadStats = computed(() => {
      const total = uploadList.value.length;
      const success = uploadList.value.filter((item) => item.status === "success").length;
      const error = uploadList.value.filter((item) => item.status === "error").length;
      return { total, success, error };
    });
    const fetchSystemSettings = async () => {
      try {
        const response = await api.get("/system/info");
        const systemInfo = response.data;
        systemSettings.value = {
          maxFileSize: systemInfo.max_file_size || 100,
          maxUploadFiles: systemInfo.max_upload_files || 10,
          allowedVideoTypes: Array.isArray(systemInfo.allowed_video_types) && systemInfo.allowed_video_types.length ? systemInfo.allowed_video_types : ["mp4", "webm", "mov", "mkv", "m4v", "flv", "wmv", "mpeg", "mpg", "3gp", "ts", "m2ts", "ogv"]
        };
      } catch (error) {
        systemSettings.value = {
          maxFileSize: 100,
          maxUploadFiles: 10
        };
      }
    };
    const generateId = () => {
      return Math.random().toString(36).substr(2, 9);
    };
    const createFilePreview = (file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return "";
    };
    const validateFile = (file) => {
      const maxSize = maxFileSizeBytes.value;
      const imageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/heic",
        "image/heif"
      ];
      const extToMime = {
        mp4: ["video/mp4", "video/x-m4v"],
        m4v: ["video/x-m4v", "video/mp4"],
        webm: ["video/webm"],
        mov: ["video/quicktime"],
        avi: ["video/x-msvideo"],
        mkv: ["video/x-matroska", "video/webm"],
        flv: ["video/x-flv"],
        wmv: ["video/x-ms-wmv"],
        mpeg: ["video/mpeg"],
        mpg: ["video/mpeg"],
        "3gp": ["video/3gpp"],
        ts: ["video/mp2t"],
        m2ts: ["video/mp2t"],
        ogv: ["video/ogg"]
      };
      const videoMimes = /* @__PURE__ */ new Set();
      for (const ext of systemSettings.value.allowedVideoTypes || []) {
        const list = extToMime[ext.toLowerCase()] || [];
        for (const m of list) videoMimes.add(m);
      }
      ["video/mp4", "video/webm", "video/quicktime"].forEach((m) => videoMimes.add(m));
      const allowedTypes = /* @__PURE__ */ new Set([...imageTypes, ...Array.from(videoMimes)]);
      if (file.size > maxSize) {
        ElMessage.error(`文件 ${file.name} 超过${maxFileSizeMB.value}MB限制`);
        return false;
      }
      if (!allowedTypes.has(file.type)) {
        let inferred = file.type;
        if (!inferred || inferred === "" || inferred === "application/octet-stream") {
          const n = (file.name || "").toLowerCase();
          if (/\.gif$/i.test(n)) inferred = "image/gif";
          else if (/\.webp$/i.test(n)) inferred = "image/webp";
          else if (/\.heic$/i.test(n)) inferred = "image/heic";
          else if (/\.heif$/i.test(n)) inferred = "image/heif";
          else if (n.endsWith(".jpg") || n.endsWith(".jpeg")) inferred = "image/jpeg";
          else if (n.endsWith(".png")) inferred = "image/png";
          else if (n.endsWith(".mov")) inferred = "video/quicktime";
          else if (n.endsWith(".mp4") || n.endsWith(".m4v")) inferred = "video/mp4";
          else if (n.endsWith(".webm")) inferred = "video/webm";
        }
        if (!inferred || !allowedTypes.has(inferred)) {
          ElMessage.error(`不支持的文件类型: ${inferred || file.type}`);
          return false;
        }
      }
      return true;
    };
    const handleDragOver = (e) => {
      e.preventDefault();
      isDragOver.value = true;
    };
    const handleDragLeave = (e) => {
      e.preventDefault();
      isDragOver.value = false;
    };
    const handleDrop = async (e) => {
      var _a;
      e.preventDefault();
      isDragOver.value = false;
      const files = Array.from(((_a = e.dataTransfer) == null ? void 0 : _a.files) || []);
      await processFiles(files);
    };
    const triggerFileInput = () => {
      var _a;
      if (isDeviceAndroid.value && androidFileInputRef.value) {
        androidFileInputRef.value.accept = [
          "image/*",
          // 覆盖所有标准图片（JPEG/PNG 等）
          "image/gif",
          // GIF MIME（某些 Android Chrome 版本需要显式声明）
          "video/*",
          // 所有视频
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".heic",
          ".heif",
          // 图片扩展
          ".mp4",
          ".mov",
          ".webm",
          ".mkv",
          ".avi",
          ".3gp",
          ".m4v",
          // 视频扩展
          ".JPG",
          ".JPEG",
          ".PNG",
          ".GIF",
          ".WEBP",
          ".HEIC",
          ".HEIF",
          // 大写扩展（Android 部分机型的 file.name）
          ".MP4",
          ".MOV",
          ".WEBM",
          ".MKV",
          ".AVI",
          ".3GP",
          ".M4V"
          // 大写视频扩展
        ].join(",");
        androidFileInputRef.value.click();
        return;
      }
      if (fileInputRef.value) {
        fileInputRef.value.accept = computedUnifiedAccept.value;
      }
      (_a = fileInputRef.value) == null ? void 0 : _a.click();
    };
    const handleAndroidFileSelect = async (e) => {
      const target = e.target;
      const files = Array.from(target.files || []);
      if (files.length > 0) {
        const hasGif = files.some((f) => /\.(gif)$/i.test(f.name));
        if (hasGif) {
          await processFiles(files);
        } else {
          await processFiles(files);
        }
      }
      target.value = "";
    };
    const triggerLiveInput = () => {
      var _a;
      (_a = liveFileInputRef.value) == null ? void 0 : _a.click();
    };
    const handleFileSelect = async (e) => {
      const target = e.target;
      const files = Array.from(target.files || []);
      if (isDeviceIOS.value && files.length > 0) {
        const names = files.map((f) => (f.name || "").toLowerCase());
        const hasHeicOrJpeg = names.some((n) => n.endsWith(".heic") || n.endsWith(".heif") || n.endsWith(".jpg") || n.endsWith(".jpeg"));
        const hasMov = names.some((n) => n.endsWith(".mov"));
        if (hasHeicOrJpeg && !hasMov) {
          try {
            await ElMessageBox.confirm("检测到选择了 HEIC 图片，是否继续选择对应的实况视频（MOV）以形成实况？", "提示", { type: "info", confirmButtonText: "去选择", cancelButtonText: "先上传图片" });
            triggerLiveInput();
          } catch {
          }
        }
      }
      await processFiles(files);
      target.value = "";
    };
    const handleLiveSelect = async (e) => {
      var _a, _b, _c;
      const target = e.target;
      const files = Array.from(target.files || []);
      if (!files.length) return;
      try {
        isUploading.value = true;
        uploadProgress.value = 0;
        const formData = new FormData();
        for (const f of files) formData.append("files", f);
        if (filesStore.currentFolder) formData.append("folder_id", String(filesStore.currentFolder));
        const resp = await api.post("/live-media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (pe) => {
            if (pe.total) uploadProgress.value = Math.round(pe.loaded * 100 / pe.total);
          }
        });
        const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
        if (jobId) {
          ElMessage.success("实况上传已受理，开始处理...");
          startJobPolling(jobId);
        } else {
          ElMessage.warning("后端未返回 jobId，已受理但无法跟踪进度");
          emit("upload-success");
        }
      } catch (err) {
        ElMessage.error(((_c = (_b = err.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "实况上传失败");
      } finally {
        isUploading.value = false;
        uploadProgress.value = 0;
        target.value = "";
      }
    };
    const createLiveJob = async (batch, pairingId) => {
      var _a, _b, _c;
      try {
        const fd = new FormData();
        for (const f of batch) fd.append("files", f);
        if (filesStore.currentFolder) fd.append("folder_id", String(filesStore.currentFolder));
        if (pairingId) ;
        const controller = new AbortController();
        const resp = await api.post("/live-media/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: controller.signal
        });
        const jobId = normalizeJobId((_a = resp.data) == null ? void 0 : _a.jobId);
        if (jobId) {
          liveControllers[jobId] = controller;
          startJobPolling(jobId);
        } else ElMessage.warning("后端未返回 jobId，已受理但无法跟踪进度");
      } catch (e) {
        ElMessage.error(((_c = (_b = e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "实况任务创建失败");
      }
    };
    const startJobPolling = (jobId) => {
      liveJobs.value.push({ id: jobId, status: "queued", progress: 0 });
      if (jobTimers[jobId]) {
        window.clearInterval(jobTimers[jobId]);
        delete jobTimers[jobId];
      }
      const jobIdEncoded = encodeURIComponent(String(jobId));
      jobTimers[jobId] = window.setInterval(async () => {
        try {
          const { data } = await api.get(`/live-media/jobs/${jobIdEncoded}`);
          const idx = liveJobs.value.findIndex((j) => j.id === jobId);
          if (idx !== -1) liveJobs.value[idx] = { id: data.id, status: data.status, progress: data.progress || 0, assetId: data.assetId };
          if (data.status === "completed") {
            window.clearInterval(jobTimers[jobId]);
            delete jobTimers[jobId];
            ElMessage.success("实况处理完成");
            emit("upload-success");
          } else if (data.status === "failed") {
            window.clearInterval(jobTimers[jobId]);
            delete jobTimers[jobId];
            ElMessage.error("实况处理失败");
          }
        } catch {
        }
      }, 1200);
    };
    const cancelLiveJob = async (jobId) => {
      var _a, _b;
      try {
        const c = liveControllers[jobId];
        if (c) {
          try {
            c.abort();
          } catch {
          }
          delete liveControllers[jobId];
        }
        await api.delete(`/live-media/jobs/${encodeURIComponent(jobId)}`);
        const idx = liveJobs.value.findIndex((j) => j.id === jobId);
        if (idx !== -1) liveJobs.value.splice(idx, 1);
        ElMessage.success("已取消");
        emit("upload-success");
      } catch (e) {
        ElMessage.error(((_b = (_a = e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "取消失败");
      }
    };
    const processFiles = async (files) => {
      if (files.length === 0) return;
      const validFiles = files.filter(validateFile);
      if (validFiles.length === 0) return;
      const heics = [];
      const movs = [];
      const anims = [];
      const mayJpgs = [];
      const others = [];
      for (const f of validFiles) {
        const name = f.name.toLowerCase();
        if (name.endsWith(".heic")) heics.push(f);
        else if (name.endsWith(".mov")) movs.push(f);
        else if (name.endsWith(".gif") || name.endsWith(".webp")) anims.push(f);
        else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) mayJpgs.push(f);
        else others.push(f);
      }
      const toBase = (n) => n.replace(/\.[^.]+$/, "").toLowerCase();
      const movMap = /* @__PURE__ */ new Map();
      movs.forEach((m) => movMap.set(toBase(m.name), m));
      for (const h of heics) {
        const base = toBase(h.name);
        const m = movMap.get(base);
        if (m) {
          createLiveJob([h, m]);
          usedMovsInProcess.add(m.name);
        } else {
          others.push(h);
        }
      }
      movs.forEach((m) => {
        if (!usedMovsInProcess.has(m.name)) others.push(m);
      });
      for (const a of anims) {
        const uploadItem = {
          id: generateId(),
          file: a,
          preview: createFilePreview(a),
          progress: 0,
          status: "pending"
        };
        uploadItem.liveBasename = a.name.replace(/\.[^.]+$/, "");
        uploadList.value.push(uploadItem);
      }
      for (const file of others) {
        const uploadItem = {
          id: generateId(),
          file,
          preview: createFilePreview(file),
          progress: 0,
          status: "pending"
        };
        uploadItem.liveBasename = file.name.replace(/\.[^.]+$/, "");
        uploadList.value.push(uploadItem);
      }
      for (const jpg of mayJpgs) {
        const uploadItem = {
          id: generateId(),
          file: jpg,
          preview: createFilePreview(jpg),
          progress: 0,
          status: "pending"
        };
        uploadItem.liveBasename = jpg.name.replace(/\.[^.]+$/, "");
        uploadList.value.push(uploadItem);
        detectMotionPhotoAsync(jpg, uploadItem);
      }
      startUpload();
    };
    const detectMotionPhotoAsync = (file, item) => {
      detectMotionPhoto(file).then((isMotion) => {
        if (isMotion && item.status === "pending") {
          item.status = "uploading";
          isUploading.value = true;
          createLiveJob([file]).catch(() => {
            item.status = "error";
            item.error = "实况任务创建失败";
          }).finally(() => {
            isUploading.value = false;
          });
        }
      }).catch(() => {
      });
    };
    async function detectMotionPhoto(file) {
      const decoder = new TextDecoder();
      const readChunk = (start, length) => new Promise((resolve, reject) => {
        const blob = file.slice(start, Math.min(file.size, start + length));
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsArrayBuffer(blob);
      });
      const sampleSize = 512 * 1024;
      const positions = [
        0,
        // 文件头
        Math.max(0, Math.floor(file.size * 0.25) - sampleSize / 2),
        Math.max(0, Math.floor(file.size * 0.5) - sampleSize / 2),
        Math.max(0, Math.floor(file.size * 0.75) - sampleSize / 2),
        Math.max(0, file.size - sampleSize)
        // 文件尾
      ];
      try {
        for (const pos of positions) {
          const buf = await readChunk(pos, sampleSize);
          const text = decoder.decode(new Uint8Array(buf));
          if (/G(Camera|Image)|MicroVideo|MotionPhoto/i.test(text)) return true;
          if (text.indexOf("ftyp") !== -1) return true;
        }
      } catch (_) {
      }
      return false;
    }
    const startUpload = async () => {
      uploadList.value.filter((item) => item.status === "pending");
      const CONCURRENCY = 3;
      const drain = async () => {
        const batch = uploadList.value.filter((item) => item.status === "pending").slice(0, CONCURRENCY);
        if (batch.length === 0) return;
        await Promise.all(batch.map((item) => uploadSingleFile(item)));
        await drain();
      };
      await drain();
      const allCompleted = uploadList.value.every(
        (item) => item.status === "success" || item.status === "error"
      );
      if (allCompleted) {
        const successCount = uploadStats.value.success;
        if (successCount > 0) {
          ElMessage.success(`成功上传 ${successCount} 个文件`);
          emit("upload-success");
        }
      }
    };
    const uploadSingleFile = async (item) => {
      var _a, _b;
      try {
        item.status = "uploading";
        isUploading.value = true;
        const formData = new FormData();
        formData.append("file", item.file);
        const isImage = item.file.type.startsWith("image/");
        const isVideo = item.file.type.startsWith("video/");
        if (item.liveBasename && (isImage || isVideo)) {
          formData.append("live_basename", item.liveBasename);
          formData.append("live_role", isImage ? "image" : isVideo ? "video" : "");
        }
        if (filesStore.currentFolder) {
          formData.append("folder_id", filesStore.currentFolder.toString());
        }
        const response = await api.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              item.progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
            }
          }
        });
        item.status = "success";
        item.progress = 100;
      } catch (error) {
        item.status = "error";
        item.error = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || error.message || "上传失败";
      } finally {
        isUploading.value = false;
      }
    };
    const retryUpload = async (item) => {
      item.status = "pending";
      item.progress = 0;
      item.error = void 0;
      await uploadSingleFile(item);
    };
    const removeFromList = (id) => {
      const index = uploadList.value.findIndex((item) => item.id === id);
      if (index > -1) {
        uploadList.value.splice(index, 1);
      }
    };
    const statusText = (s) => {
      if (s === "queued") return "排队中";
      if (s === "processing") return "处理中";
      if (s === "completed") return "已完成";
      if (s === "failed") return "失败";
      return s;
    };
    const clearUploadList = () => {
      uploadList.value = [];
    };
    onMounted(() => {
      fetchSystemSettings();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_progress = ElProgress;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", {
          ref_key: "dropZoneRef",
          ref: dropZoneRef,
          class: normalizeClass(["drop-zone", { "is-dragover": isDragOver.value, "is-uploading": isUploading.value }]),
          onDrop: handleDrop,
          onDragover: handleDragOver,
          onDragleave: handleDragLeave,
          onClick: triggerFileInput
        }, [
          !isUploading.value ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
            createVNode(_component_el_icon, { class: "upload-icon" }, {
              default: withCtx(() => [
                createVNode(unref(upload_default))
              ]),
              _: 1
            }),
            _cache[4] || (_cache[4] = createBaseVNode("h3", { class: "upload-title" }, "拖拽文件到此处上传", -1)),
            _cache[5] || (_cache[5] = createBaseVNode("p", { class: "upload-subtitle" }, "或点击选择文件", -1)),
            createBaseVNode("div", _hoisted_3$2, [
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "tip-item" }, "支持图片、HEIC/HEIF 和 MP4/MOV 视频", -1)),
              createBaseVNode("span", _hoisted_4$2, "单个文件最大" + toDisplayString(maxFileSizeMB.value) + "MB", 1),
              _cache[3] || (_cache[3] = createBaseVNode("span", { class: "tip-item" }, '同名"图片+短视频"将自动识别为实况图（长按预览）', -1)),
              unref(isDeviceAndroid) ? (openBlock(), createElementBlock("span", _hoisted_5$2, [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(monitor_default))
                  ]),
                  _: 1
                }),
                _cache[0] || (_cache[0] = createTextVNode(" Android 设备，已启用 GIF 选择支持 ", -1))
              ])) : createCommentVNode("", true),
              unref(photosPickerSupported) ? (openBlock(), createElementBlock("span", _hoisted_6$2, [
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
                    _cache[1] || (_cache[1] = createTextVNode(" iOS 原生选择实况图（推荐） ", -1))
                  ]),
                  _: 1
                }, 8, ["loading", "onClick"])
              ])) : createCommentVNode("", true)
            ])
          ])) : (openBlock(), createElementBlock("div", _hoisted_7$2, [
            createVNode(_component_el_icon, { class: "loading-icon" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            }),
            _cache[6] || (_cache[6] = createBaseVNode("h3", { class: "uploading-title" }, "正在上传文件...", -1)),
            createBaseVNode("div", _hoisted_8$2, [
              createVNode(_component_el_progress, {
                percentage: uploadProgress.value,
                "stroke-width": 8,
                "show-text": false
              }, null, 8, ["percentage"]),
              createBaseVNode("span", _hoisted_9$2, toDisplayString(uploadProgress.value) + "%", 1)
            ])
          ]))
        ], 34),
        createBaseVNode("input", {
          ref_key: "fileInputRef",
          ref: fileInputRef,
          type: "file",
          multiple: "",
          accept: computedUnifiedAccept.value,
          style: { "display": "none" },
          onChange: handleFileSelect
        }, null, 40, _hoisted_10$2),
        createBaseVNode("input", {
          ref_key: "liveFileInputRef",
          ref: liveFileInputRef,
          type: "file",
          multiple: "",
          accept: ".heic,.heif,.jpg,.jpeg,.mov,.gif,.webp,image/heic,image/heif,image/jpeg,video/quicktime,image/gif,image/webp",
          style: { "display": "none" },
          onChange: handleLiveSelect
        }, null, 544),
        unref(isDeviceAndroid) ? (openBlock(), createElementBlock("input", {
          key: 0,
          ref_key: "androidFileInputRef",
          ref: androidFileInputRef,
          type: "file",
          multiple: "",
          accept: "image/*,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.heic,.heif,video/*,.mp4,.mov,.webm,.mkv",
          style: { "display": "none" },
          onChange: handleAndroidFileSelect
        }, null, 544)) : createCommentVNode("", true),
        uploadList.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_11$1, [
          createBaseVNode("div", _hoisted_12, [
            _cache[8] || (_cache[8] = createBaseVNode("h4", null, "上传队列", -1)),
            createVNode(_component_el_button, {
              type: "text",
              onClick: clearUploadList
            }, {
              default: withCtx(() => [..._cache[7] || (_cache[7] = [
                createTextVNode("清空", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_13, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(uploadList.value, (item) => {
              return openBlock(), createElementBlock("div", {
                key: item.id,
                class: normalizeClass(["upload-item", item.status])
              }, [
                createBaseVNode("div", _hoisted_14, [
                  item.file.type.startsWith("image/") ? (openBlock(), createElementBlock("img", {
                    key: 0,
                    src: item.preview,
                    alt: item.file.name,
                    class: "thumbnail-image"
                  }, null, 8, _hoisted_15)) : (openBlock(), createElementBlock("div", _hoisted_16, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(video_play_default))
                      ]),
                      _: 1
                    })
                  ]))
                ]),
                createBaseVNode("div", _hoisted_17, [
                  createBaseVNode("div", _hoisted_18, toDisplayString(item.file.name), 1),
                  createBaseVNode("div", _hoisted_19, toDisplayString(unref(formatFileSize)(item.file.size)), 1),
                  createBaseVNode("div", _hoisted_20, [
                    createVNode(_component_el_progress, {
                      percentage: item.progress,
                      "stroke-width": 4,
                      "show-text": false
                    }, null, 8, ["percentage"])
                  ])
                ]),
                createBaseVNode("div", _hoisted_21, [
                  item.status === "pending" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 0,
                    class: "status-icon"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(clock_default))
                    ]),
                    _: 1
                  })) : item.status === "uploading" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 1,
                    class: "status-icon uploading"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(loading_default))
                    ]),
                    _: 1
                  })) : item.status === "success" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 2,
                    class: "status-icon success"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(check_default))
                    ]),
                    _: 1
                  })) : item.status === "error" ? (openBlock(), createBlock(_component_el_icon, {
                    key: 3,
                    class: "status-icon error"
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(close_default))
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_22, [
                  item.status === "error" ? (openBlock(), createBlock(_component_el_button, {
                    key: 0,
                    type: "text",
                    size: "small",
                    onClick: ($event) => retryUpload(item)
                  }, {
                    default: withCtx(() => [..._cache[9] || (_cache[9] = [
                      createTextVNode(" 重试 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])) : createCommentVNode("", true),
                  createVNode(_component_el_button, {
                    type: "text",
                    size: "small",
                    onClick: ($event) => removeFromList(item.id)
                  }, {
                    default: withCtx(() => [..._cache[10] || (_cache[10] = [
                      createTextVNode(" 移除 ", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ], 2);
            }), 128))
          ])
        ])) : createCommentVNode("", true),
        uploadStats.value.total > 0 ? (openBlock(), createElementBlock("div", _hoisted_23, [
          createBaseVNode("div", _hoisted_24, [
            _cache[11] || (_cache[11] = createBaseVNode("span", { class: "stats-label" }, "总计:", -1)),
            createBaseVNode("span", _hoisted_25, toDisplayString(uploadStats.value.total), 1)
          ]),
          createBaseVNode("div", _hoisted_26, [
            _cache[12] || (_cache[12] = createBaseVNode("span", { class: "stats-label" }, "成功:", -1)),
            createBaseVNode("span", _hoisted_27, toDisplayString(uploadStats.value.success), 1)
          ]),
          createBaseVNode("div", _hoisted_28, [
            _cache[13] || (_cache[13] = createBaseVNode("span", { class: "stats-label" }, "失败:", -1)),
            createBaseVNode("span", _hoisted_29, toDisplayString(uploadStats.value.error), 1)
          ])
        ])) : createCommentVNode("", true),
        liveJobs.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_30, [
          _cache[15] || (_cache[15] = createBaseVNode("div", { class: "live-jobs-header" }, [
            createBaseVNode("h4", null, "实况处理队列")
          ], -1)),
          createBaseVNode("div", _hoisted_31, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(liveJobs.value, (job) => {
              return openBlock(), createElementBlock("div", {
                key: job.id,
                class: "live-job-item"
              }, [
                createBaseVNode("div", _hoisted_32, [
                  createBaseVNode("div", _hoisted_33, "任务 " + toDisplayString(job.id), 1),
                  createBaseVNode("div", _hoisted_34, toDisplayString(statusText(job.status)), 1)
                ]),
                createVNode(_component_el_progress, {
                  percentage: Math.max(0, Math.min(100, job.progress || 0)),
                  "stroke-width": 6
                }, null, 8, ["percentage"]),
                createBaseVNode("div", _hoisted_35, [
                  createVNode(_component_el_button, {
                    size: "small",
                    type: "danger",
                    onClick: ($event) => cancelLiveJob(job.id)
                  }, {
                    default: withCtx(() => [..._cache[14] || (_cache[14] = [
                      createTextVNode("取消", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ]);
            }), 128))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const FileUploader = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-9115a2be"]]);
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
//# sourceMappingURL=FilePreview-CTbnpt4z.js.map
