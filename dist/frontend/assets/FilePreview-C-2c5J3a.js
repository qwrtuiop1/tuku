import { a as api, f as formatFileSize, _ as _export_sfc, e as getFilePreviewUrl, h as formatTime, c as getCachedImageUrl } from "./index-CBkf_hqU.js";
/* empty css                    */
import { ax as defineStore, r as ref, c as computed, y as defineComponent, l as onMounted, z as createElementBlock, B as createBaseVNode, L as createCommentVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, W as withModifiers, E as normalizeClass, O as createTextVNode, Q as Fragment, a6 as renderList, A as openBlock, I as createBlock, w as watch, U as onUnmounted, D as normalizeStyle } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, a as ElIcon, h as upload_default, c as ElButton, v as video_play_default, o as document_default, z as ElProgress, a8 as clock_default, n as loading_default, a9 as check_default, aa as close_default, ab as video_pause_default, ac as ElSlider, ad as microphone_default, ae as mute_default, y as full_screen_default, p as picture_default, K as refresh_default } from "./element-Bcpu2TdA.js";
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
  const cosConfig = ref(null);
  const cosCredential = ref(null);
  let credentialExpireTime = 0;
  async function fetchCosConfig() {
    try {
      const { data } = await api.get("/files/cos-config");
      cosConfig.value = data.data;
    } catch {
      cosConfig.value = null;
    }
  }
  async function getCosCredential(fileType = "image") {
    if (cosCredential.value && Date.now() < credentialExpireTime - 6e4) {
      return cosCredential.value;
    }
    try {
      const { data } = await api.get("/files/cos-credential", {
        params: { type: fileType, folder_id: currentFolder.value }
      });
      if (data.success && data.data) {
        cosCredential.value = data.data;
        credentialExpireTime = data.data.expiredTime * 1e3;
        return cosCredential.value;
      }
    } catch (e) {
      console.error("[COS] 获取凭证失败:", e);
    }
    return null;
  }
  function isCosEnabled() {
    return false;
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
      await refreshFiles();
    }
  }
  async function processItem(item) {
    const n = item.file.name.toLowerCase();
    if (/\.(gif|webp)$/i.test(n)) {
      item.fileCategory = "animated";
      item.status = "uploading";
      await uploadSingleFile(item);
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
      item.fileCategory = "image";
      item.status = "uploading";
      await uploadSingleFile(item);
      return;
    }
    item.status = "uploading";
    await uploadSingleFile(item);
  }
  const uploadControllers = {};
  function generateCosSignature(method, key, credential) {
    const now = Math.floor(Date.now() / 1e3);
    const expiredTime = credential.expiredTime;
    const signTime = `${now - 300}-${expiredTime}`;
    const urlString = `${method.toLowerCase()}
/${key}

host=${credential.bucket}.cos.${credential.region}.myqcloud.com
`;
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
  async function uploadSingleFile(item, noCosFallback = false) {
    var _a, _b, _c;
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
      item.status = "success";
      item.progress = 100;
    } catch (e) {
      if (((_a = e.message) == null ? void 0 : _a.includes("canceled")) || e.code === "ERR_CANCELED") {
        item.status = "canceled";
      } else {
        item.status = "error";
        item.error = ((_c = (_b = e.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || e.message || "上传失败";
      }
    } finally {
      delete uploadControllers[item.id];
    }
  }
  async function uploadToCos(item) {
    var _a;
    const fileType = item.fileCategory === "video" ? "video" : "image";
    const credential = await getCosCredential(fileType);
    if (!credential) {
      console.warn("[COS] 获取凭证失败，降级到后端上传");
      return uploadSingleFile(item, true);
    }
    const controller = new AbortController();
    uploadControllers[item.id] = controller;
    try {
      const ext = item.file.name.substring(item.file.name.lastIndexOf("."));
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
      const cosKey = `${credential.uploadPath}/${filename}`;
      const signParams = generateCosSignature("PUT", cosKey, credential);
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
          "x-cos-security-token": credential.sessionToken
        },
        body: item.file,
        signal: controller.signal
      });
      if (resp.ok) {
        item.progress = 100;
        const callbackResp = await api.post("/files/cos-callback", {
          cosKey,
          originalName: item.file.name,
          fileSize: item.file.size,
          mimeType: item.file.type,
          folder_id: currentFolder.value
        });
        if (callbackResp.data.success) {
          item.status = "success";
        } else {
          throw new Error(callbackResp.data.message || "文件注册失败");
        }
      } else {
        let errorMsg = `COS 上传失败: HTTP ${resp.status}`;
        try {
          const errorData = await resp.json();
          if (errorData.Error) {
            errorMsg = errorData.Error.Message || errorMsg;
          } else if (errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {
          const errorText = await resp.text();
          if (errorText) {
            errorMsg += ` - ${errorText.substring(0, 200)}`;
          }
        }
        const requestId = resp.headers.get("x-ci-request-id");
        if (requestId) {
          console.error(`[COS] Request ID: ${requestId}`);
        }
        throw new Error(errorMsg);
      }
    } catch (e) {
      if (e.name === "AbortError" || ((_a = e.message) == null ? void 0 : _a.includes("canceled"))) {
        item.status = "canceled";
      } else {
        console.error("[COS] 上传失败:", e);
        console.log("[COS] 降级到后端上传...");
        return uploadSingleFile(item, true);
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
  async function refreshFiles() {
    await fetchFiles(1);
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
    selectFile,
    unselectFile,
    toggleFileSelection,
    toggleSelectAll,
    clearSelection
  };
});
const _hoisted_1$2 = { class: "file-uploader" };
const _hoisted_2$2 = { class: "drop-content" };
const _hoisted_3$2 = { class: "upload-tips" };
const _hoisted_4$2 = { class: "tip-item" };
const _hoisted_5$2 = ["accept"];
const _hoisted_6$2 = {
  key: 0,
  class: "upload-list"
};
const _hoisted_7$2 = { class: "upload-list-header" };
const _hoisted_8$2 = { class: "stats-summary" };
const _hoisted_9$2 = { class: "s-total" };
const _hoisted_10$2 = { class: "s-done" };
const _hoisted_11$1 = { class: "s-err" };
const _hoisted_12 = { class: "upload-items" };
const _hoisted_13 = { class: "item-thumb" };
const _hoisted_14 = ["src"];
const _hoisted_15 = {
  key: 0,
  class: "live-badge"
};
const _hoisted_16 = { class: "item-info" };
const _hoisted_17 = { class: "item-name" };
const _hoisted_18 = { class: "item-meta" };
const _hoisted_19 = { class: "item-size" };
const _hoisted_20 = {
  key: 0,
  class: "tag tag-animated"
};
const _hoisted_21 = {
  key: 1,
  class: "tag tag-video"
};
const _hoisted_22 = {
  key: 2,
  class: "tag tag-image"
};
const _hoisted_23 = {
  key: 3,
  class: "tag tag-detecting"
};
const _hoisted_24 = {
  key: 0,
  class: "item-progress"
};
const _hoisted_25 = {
  key: 1,
  class: "item-error"
};
const _hoisted_26 = { class: "item-status" };
const _hoisted_27 = { class: "item-actions" };
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FileUploader",
  emits: ["upload-success"],
  setup(__props, { emit: __emit }) {
    const filesStore = useFilesStore();
    const uploadItems = computed(() => filesStore.uploadItems);
    const uploadStats = computed(() => filesStore.uploadStats);
    const maxFileSizeMB = computed(() => filesStore.systemSettings.maxFileSize);
    const computedUnifiedAccept = computed(() => {
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
    const fileInputRef = ref();
    const isDragOver = ref(false);
    const triggerFileInput = () => {
      var _a;
      if (fileInputRef.value)
        fileInputRef.value.accept = computedUnifiedAccept.value;
      (_a = fileInputRef.value) == null ? void 0 : _a.click();
    };
    const handleFileSelect = async (e) => {
      const target = e.target;
      const files = Array.from(target.files || []);
      target.value = "";
      if (!files.length) return;
      filesStore.addFiles(files);
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
      filesStore.addFiles(files);
    };
    const formatSize = (bytes) => formatFileSize(bytes);
    const progressColor = (cat) => {
      if (cat === "animated") return "#f59e0b";
      if (cat === "video") return "#0ea5e9";
      return "#667eea";
    };
    const removeUploadItem = (id) => {
      filesStore.cancelUploadItem(id);
      filesStore.removeUploadItem(id);
    };
    const clearUploadItems = () => filesStore.clearUploadItems();
    const retryUploadItem = (id) => filesStore.retryUploadItem(id);
    onMounted(() => {
      filesStore.fetchSystemSettings();
      filesStore.fetchCosConfig();
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
            _cache[1] || (_cache[1] = createBaseVNode("h3", { class: "upload-title" }, "拖拽文件到此处上传", -1)),
            _cache[2] || (_cache[2] = createBaseVNode("p", { class: "upload-subtitle" }, "或点击选择文件", -1)),
            createBaseVNode("div", _hoisted_3$2, [
              _cache[0] || (_cache[0] = createBaseVNode("span", { class: "tip-item" }, "支持图片、HEIC/HEIF 和 MP4/MOV 视频", -1)),
              createBaseVNode("span", _hoisted_4$2, "单个文件最大" + toDisplayString(maxFileSizeMB.value) + "MB", 1)
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
        }, null, 40, _hoisted_5$2),
        uploadItems.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_6$2, [
          createBaseVNode("div", _hoisted_7$2, [
            _cache[7] || (_cache[7] = createBaseVNode("h4", null, "上传队列", -1)),
            createBaseVNode("span", _hoisted_8$2, [
              createBaseVNode("span", _hoisted_9$2, toDisplayString(uploadStats.value.total), 1),
              _cache[3] || (_cache[3] = createTextVNode(" 个文件 · ", -1)),
              createBaseVNode("span", _hoisted_10$2, toDisplayString(uploadStats.value.success), 1),
              _cache[4] || (_cache[4] = createTextVNode(" 成功 · ", -1)),
              createBaseVNode("span", _hoisted_11$1, toDisplayString(uploadStats.value.error), 1),
              _cache[5] || (_cache[5] = createTextVNode(" 失败 ", -1))
            ]),
            createVNode(_component_el_button, {
              type: "text",
              onClick: clearUploadItems
            }, {
              default: withCtx(() => [..._cache[6] || (_cache[6] = [
                createTextVNode("清空", -1)
              ])]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_12, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(uploadItems.value, (item) => {
              return openBlock(), createElementBlock("div", {
                key: item.id,
                class: normalizeClass(["upload-item", [item.status, `type-${item.fileCategory}`]])
              }, [
                createBaseVNode("div", _hoisted_13, [
                  item.preview ? (openBlock(), createElementBlock("img", {
                    key: 0,
                    src: item.preview,
                    class: "thumb-img"
                  }, null, 8, _hoisted_14)) : (openBlock(), createElementBlock("div", {
                    key: 1,
                    class: normalizeClass(["thumb-icon", item.fileCategory])
                  }, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        item.fileCategory === "video" ? (openBlock(), createBlock(unref(video_play_default), { key: 0 })) : (openBlock(), createBlock(unref(document_default), { key: 1 }))
                      ]),
                      _: 2
                    }, 1024),
                    item.fileCategory === "animated" ? (openBlock(), createElementBlock("span", _hoisted_15, "GIF")) : createCommentVNode("", true)
                  ], 2))
                ]),
                createBaseVNode("div", _hoisted_16, [
                  createBaseVNode("div", _hoisted_17, toDisplayString(item.file.name), 1),
                  createBaseVNode("div", _hoisted_18, [
                    createBaseVNode("span", _hoisted_19, toDisplayString(formatSize(item.file.size)), 1),
                    item.fileCategory === "animated" ? (openBlock(), createElementBlock("span", _hoisted_20, "动图")) : item.fileCategory === "video" ? (openBlock(), createElementBlock("span", _hoisted_21, "视频")) : item.fileCategory === "image" ? (openBlock(), createElementBlock("span", _hoisted_22, "图片")) : createCommentVNode("", true),
                    item.status === "detecting" ? (openBlock(), createElementBlock("span", _hoisted_23, "识别中")) : createCommentVNode("", true)
                  ]),
                  item.status === "uploading" || item.status === "detecting" ? (openBlock(), createElementBlock("div", _hoisted_24, [
                    createVNode(_component_el_progress, {
                      percentage: item.progress,
                      "stroke-width": 4,
                      "show-text": false,
                      color: progressColor(item.fileCategory)
                    }, null, 8, ["percentage", "color"])
                  ])) : createCommentVNode("", true),
                  item.status === "error" ? (openBlock(), createElementBlock("div", _hoisted_25, toDisplayString(item.error), 1)) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_26, [
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
                createBaseVNode("div", _hoisted_27, [
                  item.status === "error" ? (openBlock(), createBlock(_component_el_button, {
                    key: 0,
                    type: "text",
                    size: "small",
                    onClick: ($event) => retryUploadItem(item.id)
                  }, {
                    default: withCtx(() => [..._cache[8] || (_cache[8] = [
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
                    default: withCtx(() => [..._cache[9] || (_cache[9] = [
                      createTextVNode("移除", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ], 2);
            }), 128))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const FileUploader = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-a500d3b4"]]);
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
//# sourceMappingURL=FilePreview-C-2c5J3a.js.map
