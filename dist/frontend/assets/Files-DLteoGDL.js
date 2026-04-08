import { a as api, g as getFileThumbnailUrl, b as getFilePreviewUrlSmart, c as getCachedImageUrl, _ as _export_sfc, f as formatFileSize, d as downloadFile, e as getFilePreviewUrl, p as preloadImage, u as useAuthStore, h as formatTime, i as copyToClipboard } from "./index-CBkf_hqU.js";
/* empty css                         */
/* empty css                */
/* empty css                   */
/* empty css                      */
/* empty css                   */
/* empty css                    */
/* empty css                    */
/* empty css                       */
/* empty css                         */
/* empty css                            */
/* empty css                          */
import { ax as defineStore, r as ref, y as defineComponent, l as onMounted, z as createElementBlock, A as openBlock, E as normalizeClass, B as createBaseVNode, L as createCommentVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, c as computed, w as watch, I as createBlock, O as createTextVNode, Q as Fragment, a6 as renderList, U as onUnmounted, W as withModifiers, k as reactive, T as Transition, az as useRouter, a4 as withKeys } from "./vendor-DT2rKQnu.js";
import { p as picture_default, a as ElIcon, n as loading_default, v as video_play_default, o as document_default, q as ElDialog, s as arrow_left_default, c as ElButton, t as arrow_right_default, w as download_default, x as share_default, y as full_screen_default, z as ElProgress, E as ElMessage, i as folder_default, A as folder_opened_default, B as edit_default, C as delete_default, e as ElInput, D as ElDropdown, F as ElButtonGroup, G as ElBreadcrumb, H as ElPagination, I as ElMessageBox, h as upload_default, J as folder_add_default, K as refresh_default, L as search_default, M as sort_default, N as ElDropdownMenu, O as ElDropdownItem, P as ElTooltip, Q as grid_default, R as list_default, S as ElBreadcrumbItem, T as house_default, g as ElCheckbox, U as view_default, V as ElTable, W as ElTableColumn, X as ElTag, Y as ElSelect, Z as ElOption, _ as ElInputNumber, b as ElForm, d as ElFormItem } from "./element-Bcpu2TdA.js";
import { u as useFilesStore, F as FilePreview, a as FileUploader } from "./FilePreview-C-2c5J3a.js";
/* empty css                   */
const useSystemStore = defineStore("system", () => {
  const sharingEnabled = ref(true);
  const shareDisabledAt = ref(null);
  const loaded = ref(false);
  const loadShareStatus = async () => {
    try {
      const { data } = await api.get("/system/share-status");
      sharingEnabled.value = (data == null ? void 0 : data.sharing_enabled) !== false;
      shareDisabledAt.value = (data == null ? void 0 : data.share_disabled_at) || null;
    } catch (_) {
      sharingEnabled.value = true;
      shareDisabledAt.value = null;
    } finally {
      loaded.value = true;
    }
  };
  return { sharingEnabled, shareDisabledAt, loaded, loadShareStatus };
});
const _hoisted_1$7 = {
  key: 0,
  class: "image-thumbnail"
};
const _hoisted_2$7 = ["src", "alt"];
const _hoisted_3$5 = {
  key: 1,
  class: "error-placeholder"
};
const _hoisted_4$4 = { class: "file-type-badge image-badge" };
const _hoisted_5$4 = {
  key: 2,
  class: "loading-overlay"
};
const _hoisted_6$4 = {
  key: 1,
  class: "video-thumbnail"
};
const _hoisted_7$4 = ["src", "alt"];
const _hoisted_8$4 = {
  key: 1,
  class: "video-placeholder"
};
const _hoisted_9$4 = { class: "play-button" };
const _hoisted_10$4 = {
  key: 2,
  class: "duration-badge"
};
const _hoisted_11$4 = { class: "file-type-badge video-badge" };
const _hoisted_12$4 = {
  key: 0,
  class: "loading-overlay"
};
const _hoisted_13$4 = { class: "file-type-badge unknown-badge" };
const maxRetries = 2;
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "FileThumbnail",
  props: {
    file: {},
    size: {},
    uniformTile: { type: Boolean }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const loading = ref(true);
    const hasError = ref(false);
    const retryCount = ref(0);
    const thumbnailUrl = ref("");
    const formatDuration = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      } else {
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
      }
    };
    const initializeThumbnailUrl = async () => {
      try {
        loading.value = true;
        hasError.value = false;
        retryCount.value = 0;
        const thumb = getFileThumbnailUrl(props.file);
        if (thumb) {
          thumbnailUrl.value = thumb;
          return;
        }
        const url = props.file.preview_url ? getFilePreviewUrlSmart(props.file) : await getCachedImageUrl(props.file.id);
        thumbnailUrl.value = url;
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
    const onImageLoad = (event) => {
      loading.value = false;
      hasError.value = false;
      retryCount.value = 0;
      const img = event.target;
      if (props.uniformTile && img) {
        img.removeAttribute("data-aspect-ratio");
        return;
      }
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
    const onImageError = (event) => {
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
        }, 1e3 * retryCount.value);
      } else {
        loading.value = false;
        hasError.value = true;
      }
    };
    onMounted(() => {
      initializeThumbnailUrl();
      if (!props.file.thumbnail_path && props.file.file_type === "video") {
        loading.value = false;
      }
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["file-thumbnail", { loading: loading.value, error: hasError.value, "uniform-tile": __props.uniformTile }])
      }, [
        __props.file.file_type === "image" ? (openBlock(), createElementBlock("div", _hoisted_1$7, [
          !hasError.value ? (openBlock(), createElementBlock("img", {
            key: 0,
            src: thumbnailUrl.value,
            alt: __props.file.original_name,
            class: "thumbnail-image",
            loading: "lazy",
            decoding: "async",
            onLoad: onImageLoad,
            onError: onImageError,
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("click", __props.file))
          }, null, 40, _hoisted_2$7)) : (openBlock(), createElementBlock("div", _hoisted_3$5, [
            createVNode(_component_el_icon, { class: "error-icon" }, {
              default: withCtx(() => [
                createVNode(unref(picture_default))
              ]),
              _: 1
            }),
            _cache[3] || (_cache[3] = createBaseVNode("span", { class: "error-text" }, "加载失败", -1))
          ])),
          createBaseVNode("div", _hoisted_4$4, [
            createVNode(_component_el_icon, null, {
              default: withCtx(() => [
                createVNode(unref(picture_default))
              ]),
              _: 1
            })
          ]),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_5$4, [
            createVNode(_component_el_icon, { class: "loading-icon" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            })
          ])) : createCommentVNode("", true)
        ])) : __props.file.file_type === "video" ? (openBlock(), createElementBlock("div", _hoisted_6$4, [
          createBaseVNode("div", {
            class: "video-poster",
            onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("click", __props.file))
          }, [
            __props.file.thumbnail_path && !hasError.value ? (openBlock(), createElementBlock("img", {
              key: 0,
              src: thumbnailUrl.value,
              alt: __props.file.original_name,
              class: "thumbnail-image",
              loading: "lazy",
              decoding: "async",
              onLoad: onImageLoad,
              onError: onImageError
            }, null, 40, _hoisted_7$4)) : (openBlock(), createElementBlock("div", _hoisted_8$4, [
              createVNode(_component_el_icon, { class: "video-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(video_play_default))
                ]),
                _: 1
              })
            ])),
            createBaseVNode("div", _hoisted_9$4, [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(unref(video_play_default))
                ]),
                _: 1
              })
            ]),
            __props.file.duration ? (openBlock(), createElementBlock("div", _hoisted_10$4, toDisplayString(formatDuration(__props.file.duration)), 1)) : createCommentVNode("", true)
          ]),
          createBaseVNode("div", _hoisted_11$4, [
            createVNode(_component_el_icon, null, {
              default: withCtx(() => [
                createVNode(unref(video_play_default))
              ]),
              _: 1
            })
          ]),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_12$4, [
            createVNode(_component_el_icon, { class: "loading-icon" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            })
          ])) : createCommentVNode("", true)
        ])) : (openBlock(), createElementBlock("div", {
          key: 2,
          class: "unknown-thumbnail",
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("click", __props.file))
        }, [
          createVNode(_component_el_icon, { class: "unknown-icon" }, {
            default: withCtx(() => [
              createVNode(unref(document_default))
            ]),
            _: 1
          }),
          createBaseVNode("div", _hoisted_13$4, [
            createVNode(_component_el_icon, null, {
              default: withCtx(() => [
                createVNode(unref(document_default))
              ]),
              _: 1
            })
          ])
        ]))
      ], 2);
    };
  }
});
const FileThumbnail = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-9f684504"]]);
const _hoisted_1$6 = {
  key: 0,
  class: "file-navigation"
};
const _hoisted_2$6 = { class: "file-counter" };
const _hoisted_3$4 = { class: "current-number" };
const _hoisted_4$3 = { class: "total-number" };
const _hoisted_5$3 = { class: "preview-layout" };
const _hoisted_6$3 = {
  key: 0,
  class: "details-panel"
};
const _hoisted_7$3 = { class: "details-header" };
const _hoisted_8$3 = { class: "details-list" };
const _hoisted_9$3 = { class: "detail-item" };
const _hoisted_10$3 = ["title"];
const _hoisted_11$3 = { class: "detail-item" };
const _hoisted_12$3 = { class: "value" };
const _hoisted_13$3 = {
  key: 0,
  class: "detail-item"
};
const _hoisted_14$3 = { class: "value" };
const _hoisted_15$3 = {
  key: 1,
  class: "detail-item"
};
const _hoisted_16$3 = { class: "value" };
const _hoisted_17$3 = {
  key: 2,
  class: "detail-item"
};
const _hoisted_18$2 = { class: "value" };
const _hoisted_19$2 = {
  key: 3,
  class: "detail-item"
};
const _hoisted_20$2 = { class: "value" };
const _hoisted_21$2 = { class: "details-actions" };
const _hoisted_22$2 = { class: "action-item" };
const _hoisted_23$2 = {
  key: 0,
  class: "action-item"
};
const _hoisted_24$2 = { class: "action-item" };
const _hoisted_25$2 = {
  key: 0,
  class: "review-status"
};
const _hoisted_26$1 = { class: "row" };
const _hoisted_27$1 = {
  key: 0,
  class: "reason"
};
const _hoisted_28$1 = {
  key: 1,
  class: "public-url"
};
const PRELOAD_COUNT = 3;
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "EnhancedPreviewDialog",
  props: {
    modelValue: { type: Boolean },
    file: {},
    files: {},
    initialIndex: {}
  },
  emits: ["update:modelValue", "file-deleted", "file-change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const currentIndex = ref(0);
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const files = computed(() => {
      if (props.files && props.files.length > 0) {
        return props.files;
      }
      return props.file ? [props.file] : [];
    });
    const currentFile = computed(() => {
      const file = localFiles.value[currentIndex.value] || null;
      return file;
    });
    const reviewId = ref(null);
    const reviewStatus = ref(null);
    const reviewCreating = ref(false);
    const publicShareUrl = ref("");
    let reviewPoller = null;
    const reviewStatusText = computed(() => {
      if (!reviewStatus.value) return "";
      const s = reviewStatus.value.status;
      return s === "pending_review" ? "审核中" : s === "approved" ? "已通过" : s === "rejected" ? "未通过" : s;
    });
    const hasMultipleFiles = computed(() => localFiles.value.length > 1);
    const dialogTitle = computed(() => {
      return "文件预览";
    });
    const systemStore = useSystemStore();
    onMounted(() => {
      if (!systemStore.loaded) systemStore.loadShareStatus();
    });
    const filesStore = useFilesStore();
    const localFiles = ref([]);
    watch(files, (newFiles) => {
      localFiles.value = [...newFiles];
    }, { immediate: true });
    const previewContainer = ref(null);
    const toggleFullscreen = () => {
      const el = previewContainer.value || document.documentElement;
      const isFs = document.fullscreenElement || document.webkitFullscreenElement;
      if (!isFs) {
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (rfs) rfs.call(el);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exit) exit.call(document);
      }
    };
    const handleClose = () => {
      visible.value = false;
    };
    const previousFile = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
        emit("file-change", currentFile.value, currentIndex.value);
      }
    };
    const nextFile = () => {
      if (currentIndex.value < localFiles.value.length - 1) {
        currentIndex.value++;
        emit("file-change", currentFile.value, currentIndex.value);
      }
    };
    const preloadAdjacentImages = () => {
      const allFiles = localFiles.value;
      if (!allFiles.length) return;
      for (let offset = -PRELOAD_COUNT; offset <= PRELOAD_COUNT; offset++) {
        if (offset === 0) continue;
        const idx = currentIndex.value + offset;
        if (idx < 0 || idx >= allFiles.length) continue;
        const file = allFiles[idx];
        if (file.file_type !== "image") continue;
        const url = getFilePreviewUrl(file.id);
        preloadImage(url);
      }
    };
    watch(currentIndex, () => {
      preloadAdjacentImages();
    }, { immediate: true });
    const downloadCurrentFile = () => {
      if (currentFile.value) {
        try {
          downloadFile(currentFile.value.id, currentFile.value.original_name);
          ElMessage.success("开始下载文件");
        } catch (error) {
          ElMessage.error("下载失败");
        }
      }
    };
    const shareCurrentFile = async () => {
      var _a, _b;
      if (!currentFile.value) return;
      if (!systemStore.sharingEnabled) {
        ElMessage.error("分享功能已关闭");
        return;
      }
      try {
        reviewCreating.value = true;
        reviewStatus.value = null;
        publicShareUrl.value = "";
        const { data } = await api.post("/share/review", {
          file_id: currentFile.value.id,
          allowPreview: true,
          allowDownload: true,
          expireInHours: null
        });
        if (data && data.success && data.review_id) {
          reviewId.value = data.review_id;
          startReviewPolling();
          ElMessage.success("已提交审核，请稍候...");
        } else {
          ElMessage.error("提交审核失败");
        }
      } catch (e) {
        ElMessage.error(((_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "提交审核失败");
      } finally {
        reviewCreating.value = false;
      }
    };
    function startReviewPolling() {
      if (!reviewId.value) return;
      stopReviewPolling();
      reviewPoller = setInterval(async () => {
        try {
          const { data } = await api.get(`/share/review/${reviewId.value}/status`);
          reviewStatus.value = { status: data.status, review_progress: data.review_progress || 0, review_reason: data.review_reason };
          if (data.status === "approved" && data.share_token) {
            publicShareUrl.value = `${window.location.origin}/share/${data.share_token}`;
            stopReviewPolling();
            try {
              await navigator.clipboard.writeText(publicShareUrl.value);
              ElMessage.success("审核通过，公开链接已复制");
            } catch {
              ElMessage.success("审核通过，请复制公开链接");
            }
          } else if (data.status === "rejected") {
            stopReviewPolling();
            ElMessage.error(data.review_reason || "审核未通过");
          }
        } catch (_) {
        }
      }, 1e3);
    }
    function stopReviewPolling() {
      if (reviewPoller) {
        clearInterval(reviewPoller);
        reviewPoller = null;
      }
    }
    watch(visible, (v) => {
      if (!v) stopReviewPolling();
    });
    const handleFileDeleted = async (fileId) => {
      var _a;
      await filesStore.deleteFiles([fileId]);
      ElMessage.success("文件删除成功");
      const idx = localFiles.value.findIndex((f) => f.id === fileId);
      if (idx !== -1) {
        localFiles.value.splice(idx, 1);
        if (currentIndex.value >= localFiles.value.length) {
          currentIndex.value = Math.max(0, localFiles.value.length - 1);
        }
      }
      emit("file-deleted", fileId);
      if (((_a = currentFile.value) == null ? void 0 : _a.id) === fileId) {
        if (localFiles.value.length > 1) {
          if (currentIndex.value < localFiles.value.length - 1) {
            nextFile();
          } else if (currentIndex.value > 0) {
            previousFile();
          } else {
            handleClose();
          }
        } else {
          handleClose();
        }
      }
    };
    watch(() => props.initialIndex, (newIndex) => {
      if (newIndex !== void 0 && newIndex >= 0 && newIndex < localFiles.value.length) {
        currentIndex.value = newIndex;
      }
    }, { immediate: true });
    watch(() => props.file, (newFile) => {
      if (newFile && localFiles.value.length > 0) {
        const index2 = localFiles.value.findIndex((f) => f.id === newFile.id);
        if (index2 !== -1) {
          currentIndex.value = index2;
        }
      }
    }, { immediate: true });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_progress = ElProgress;
      const _component_el_dialog = ElDialog;
      return openBlock(), createBlock(_component_el_dialog, {
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
        title: dialogTitle.value,
        width: "90%",
        "append-to-body": true,
        "close-on-click-modal": true,
        "show-close": true,
        class: "enhanced-preview-dialog",
        onClose: handleClose
      }, {
        default: withCtx(() => {
          var _a;
          return [
            hasMultipleFiles.value ? (openBlock(), createElementBlock("div", _hoisted_1$6, [
              createVNode(_component_el_button, {
                onClick: previousFile,
                disabled: currentIndex.value === 0,
                size: "small"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(arrow_left_default))
                    ]),
                    _: 1
                  }),
                  _cache[1] || (_cache[1] = createTextVNode(" 上一个 ", -1))
                ]),
                _: 1
              }, 8, ["disabled"]),
              createBaseVNode("div", _hoisted_2$6, [
                createBaseVNode("span", _hoisted_3$4, toDisplayString(currentIndex.value + 1), 1),
                _cache[2] || (_cache[2] = createBaseVNode("span", { class: "separator" }, "/", -1)),
                createBaseVNode("span", _hoisted_4$3, toDisplayString(localFiles.value.length), 1)
              ]),
              createVNode(_component_el_button, {
                onClick: nextFile,
                disabled: currentIndex.value === files.value.length - 1,
                size: "small"
              }, {
                default: withCtx(() => [
                  _cache[3] || (_cache[3] = createTextVNode(" 下一个 ", -1)),
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(arrow_right_default))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["disabled"])
            ])) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_5$3, [
              createBaseVNode("div", {
                class: "preview-content",
                ref_key: "previewContainer",
                ref: previewContainer
              }, [
                currentFile.value ? (openBlock(), createBlock(FilePreview, {
                  key: ((_a = currentFile.value) == null ? void 0 : _a.id) || currentIndex.value,
                  file: currentFile.value,
                  onFileDeleted: handleFileDeleted,
                  onClose: handleClose
                }, null, 8, ["file"])) : createCommentVNode("", true)
              ], 512),
              currentFile.value ? (openBlock(), createElementBlock("aside", _hoisted_6$3, [
                createBaseVNode("div", _hoisted_7$3, [
                  _cache[4] || (_cache[4] = createBaseVNode("div", { class: "details-title" }, "文件详情", -1)),
                  createBaseVNode("div", {
                    class: normalizeClass(["details-type", currentFile.value.file_type])
                  }, toDisplayString(currentFile.value.file_type === "image" ? "图片" : "视频"), 3)
                ]),
                createBaseVNode("div", _hoisted_8$3, [
                  createBaseVNode("div", _hoisted_9$3, [
                    _cache[5] || (_cache[5] = createBaseVNode("span", { class: "label" }, "名称", -1)),
                    createBaseVNode("span", {
                      class: "value",
                      title: currentFile.value.original_name
                    }, toDisplayString(currentFile.value.original_name), 9, _hoisted_10$3)
                  ]),
                  createBaseVNode("div", _hoisted_11$3, [
                    _cache[6] || (_cache[6] = createBaseVNode("span", { class: "label" }, "大小", -1)),
                    createBaseVNode("span", _hoisted_12$3, toDisplayString(unref(formatFileSize)(currentFile.value.file_size || 0)), 1)
                  ]),
                  currentFile.value.mime_type ? (openBlock(), createElementBlock("div", _hoisted_13$3, [
                    _cache[7] || (_cache[7] = createBaseVNode("span", { class: "label" }, "类型", -1)),
                    createBaseVNode("span", _hoisted_14$3, toDisplayString(currentFile.value.mime_type), 1)
                  ])) : createCommentVNode("", true),
                  currentFile.value.file_type === "image" && (currentFile.value.width || currentFile.value.height) ? (openBlock(), createElementBlock("div", _hoisted_15$3, [
                    _cache[8] || (_cache[8] = createBaseVNode("span", { class: "label" }, "分辨率", -1)),
                    createBaseVNode("span", _hoisted_16$3, toDisplayString((currentFile.value.width || "?") + " × " + (currentFile.value.height || "?")), 1)
                  ])) : createCommentVNode("", true),
                  currentFile.value.file_type === "video" && currentFile.value.duration ? (openBlock(), createElementBlock("div", _hoisted_17$3, [
                    _cache[9] || (_cache[9] = createBaseVNode("span", { class: "label" }, "时长", -1)),
                    createBaseVNode("span", _hoisted_18$2, toDisplayString(currentFile.value.duration) + "s", 1)
                  ])) : createCommentVNode("", true),
                  currentFile.value.created_at ? (openBlock(), createElementBlock("div", _hoisted_19$2, [
                    _cache[10] || (_cache[10] = createBaseVNode("span", { class: "label" }, "创建时间", -1)),
                    createBaseVNode("span", _hoisted_20$2, toDisplayString(new Date(currentFile.value.created_at).toLocaleString()), 1)
                  ])) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_21$2, [
                  createBaseVNode("div", _hoisted_22$2, [
                    createVNode(_component_el_button, {
                      onClick: downloadCurrentFile,
                      class: "gray-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(download_default))
                          ]),
                          _: 1
                        }),
                        _cache[11] || (_cache[11] = createTextVNode(" 下载 ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  unref(systemStore).sharingEnabled ? (openBlock(), createElementBlock("div", _hoisted_23$2, [
                    createVNode(_component_el_button, {
                      onClick: shareCurrentFile,
                      class: "gray-btn",
                      loading: reviewCreating.value
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(share_default))
                          ]),
                          _: 1
                        }),
                        _cache[12] || (_cache[12] = createTextVNode(" 分享 ", -1))
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_24$2, [
                    createVNode(_component_el_button, {
                      onClick: toggleFullscreen,
                      class: "gray-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(full_screen_default))
                          ]),
                          _: 1
                        }),
                        _cache[13] || (_cache[13] = createTextVNode(" 全屏 ", -1))
                      ]),
                      _: 1
                    })
                  ])
                ]),
                reviewStatus.value ? (openBlock(), createElementBlock("div", _hoisted_25$2, [
                  createBaseVNode("div", _hoisted_26$1, [
                    _cache[14] || (_cache[14] = createBaseVNode("span", { class: "label" }, "审核状态", -1)),
                    createBaseVNode("span", {
                      class: normalizeClass(["value", reviewStatus.value.status])
                    }, toDisplayString(reviewStatusText.value), 3)
                  ]),
                  createVNode(_component_el_progress, {
                    percentage: reviewStatus.value.review_progress || 0,
                    "stroke-width": 8,
                    "show-text": true
                  }, null, 8, ["percentage"]),
                  reviewStatus.value.review_reason ? (openBlock(), createElementBlock("div", _hoisted_27$1, toDisplayString(reviewStatus.value.review_reason), 1)) : createCommentVNode("", true),
                  publicShareUrl.value ? (openBlock(), createElementBlock("div", _hoisted_28$1, toDisplayString(publicShareUrl.value), 1)) : createCommentVNode("", true)
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ])
          ];
        }),
        _: 1
      }, 8, ["modelValue", "title"]);
    };
  }
});
const EnhancedPreviewDialog = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-33b561a1"]]);
const _hoisted_1$5 = { class: "details-body" };
const _hoisted_2$5 = { class: "summary" };
const _hoisted_3$3 = { class: "folder-icon" };
const _hoisted_4$2 = { class: "meta" };
const _hoisted_5$2 = ["title"];
const _hoisted_6$2 = {
  key: 0,
  class: "path"
};
const _hoisted_7$2 = { class: "crumb-name" };
const _hoisted_8$2 = {
  key: 0,
  class: "sep"
};
const _hoisted_9$2 = {
  key: 1,
  class: "created"
};
const _hoisted_10$2 = { class: "stats" };
const _hoisted_11$2 = { class: "stat" };
const _hoisted_12$2 = { class: "value" };
const _hoisted_13$2 = { class: "stat" };
const _hoisted_14$2 = { class: "value" };
const _hoisted_15$2 = { class: "stat" };
const _hoisted_16$2 = { class: "value" };
const _hoisted_17$2 = { class: "actions" };
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "FolderDetailsDialog",
  props: {
    modelValue: { type: Boolean },
    folder: {},
    filesCount: {},
    subfoldersCount: {},
    totalSize: {},
    path: {}
  },
  emits: ["update:modelValue", "enter", "rename", "delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visible = computed({
      get: () => props.modelValue,
      set: (v) => emit("update:modelValue", v)
    });
    const isMobile = computed(() => window.innerWidth <= 768);
    const formatSize = (bytes) => {
      if (!bytes && bytes !== 0) return "—";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      let num = bytes;
      while (num >= 1024 && i < units.length - 1) {
        num /= 1024;
        i++;
      }
      return `${num.toFixed(2)} ${units[i]}`;
    };
    const totalSizeText = computed(() => formatSize(props.totalSize ?? null));
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_dialog = ElDialog;
      return openBlock(), createBlock(_component_el_dialog, {
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => visible.value = $event),
        title: "文件夹详情",
        width: isMobile.value ? "92%" : "640px",
        "append-to-body": true,
        class: "folder-details-dialog"
      }, {
        default: withCtx(() => {
          var _a, _b, _c;
          return [
            createBaseVNode("div", _hoisted_1$5, [
              createBaseVNode("div", _hoisted_2$5, [
                createBaseVNode("div", _hoisted_3$3, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(folder_default))
                    ]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_4$2, [
                  createBaseVNode("div", {
                    class: "name",
                    title: (_a = __props.folder) == null ? void 0 : _a.folder_name
                  }, toDisplayString((_b = __props.folder) == null ? void 0 : _b.folder_name), 9, _hoisted_5$2),
                  __props.path && __props.path.length ? (openBlock(), createElementBlock("div", _hoisted_6$2, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(__props.path, (p, i) => {
                      return openBlock(), createElementBlock("span", {
                        key: p.id,
                        class: "crumb"
                      }, [
                        createBaseVNode("span", _hoisted_7$2, toDisplayString(p.name), 1),
                        i < __props.path.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_8$2, "/")) : createCommentVNode("", true)
                      ]);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  ((_c = __props.folder) == null ? void 0 : _c.created_at) ? (openBlock(), createElementBlock("div", _hoisted_9$2, "创建时间：" + toDisplayString(new Date(__props.folder.created_at).toLocaleString()), 1)) : createCommentVNode("", true)
                ])
              ]),
              createBaseVNode("div", _hoisted_10$2, [
                createBaseVNode("div", _hoisted_11$2, [
                  _cache[4] || (_cache[4] = createBaseVNode("div", { class: "label" }, "子文件夹", -1)),
                  createBaseVNode("div", _hoisted_12$2, toDisplayString(__props.subfoldersCount ?? "—"), 1)
                ]),
                createBaseVNode("div", _hoisted_13$2, [
                  _cache[5] || (_cache[5] = createBaseVNode("div", { class: "label" }, "文件数", -1)),
                  createBaseVNode("div", _hoisted_14$2, toDisplayString(__props.filesCount ?? "—"), 1)
                ]),
                createBaseVNode("div", _hoisted_15$2, [
                  _cache[6] || (_cache[6] = createBaseVNode("div", { class: "label" }, "大小", -1)),
                  createBaseVNode("div", _hoisted_16$2, toDisplayString(totalSizeText.value), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_17$2, [
                createVNode(_component_el_button, {
                  class: "gray-btn",
                  onClick: _cache[0] || (_cache[0] = ($event) => {
                    var _a2;
                    return _ctx.$emit("enter", (_a2 = __props.folder) == null ? void 0 : _a2.id);
                  })
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(folder_opened_default))
                      ]),
                      _: 1
                    }),
                    _cache[7] || (_cache[7] = createTextVNode(" 进入 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  class: "gray-btn",
                  onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("rename", __props.folder))
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(edit_default))
                      ]),
                      _: 1
                    }),
                    _cache[8] || (_cache[8] = createTextVNode(" 重命名 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  class: "gray-btn danger",
                  onClick: _cache[2] || (_cache[2] = ($event) => {
                    var _a2;
                    return _ctx.$emit("delete", (_a2 = __props.folder) == null ? void 0 : _a2.id);
                  })
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    }),
                    _cache[9] || (_cache[9] = createTextVNode(" 删除 ", -1))
                  ]),
                  _: 1
                })
              ])
            ])
          ];
        }),
        _: 1
      }, 8, ["modelValue", "width"]);
    };
  }
});
const FolderDetailsDialog = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-720507dd"]]);
function pickBestSource(asset) {
  var _a;
  if (asset.variants && asset.variants.length > 0) {
    const eff = ((_a = navigator.connection) == null ? void 0 : _a.effectiveType) || "4g";
    const targetHeight = eff === "2g" ? 240 : eff === "3g" ? 360 : eff === "4g" ? 720 : 480;
    const sorted = [...asset.variants].sort((a, b) => (a.height || 0) - (b.height || 0));
    let chosen = sorted[0];
    for (const v of sorted) {
      if ((v.height || 0) <= targetHeight) chosen = v;
    }
    if (chosen == null ? void 0 : chosen.mp4_url) return { src: chosen.mp4_url, type: "video/mp4" };
    if (chosen == null ? void 0 : chosen.webm_url) return { src: chosen.webm_url, type: "video/webm" };
  }
  if (asset.video_mp4_url) return { src: asset.video_mp4_url, type: "video/mp4" };
  if (asset.video_webm_url) return { src: asset.video_webm_url, type: "video/webm" };
  return null;
}
function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
const _hoisted_1$4 = { class: "poster-wrapper" };
const _hoisted_2$4 = ["src"];
const _hoisted_3$2 = ["src", "loop", "poster"];
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LiveMediaCard",
  props: {
    asset: {},
    autoplay: { type: Boolean }
  },
  emits: ["bg-theme"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const previewing = ref(false);
    const videoRef = ref();
    const source = pickBestSource(props.asset);
    const label = `${props.asset.kind}`;
    const isLooping = ref(false);
    const posterTs = ref(0);
    const posterSrc = computed(() => {
      if (!props.asset.poster_url) return "";
      const sep = props.asset.poster_url.includes("?") ? "&" : "?";
      return `${props.asset.poster_url}${sep}t=${posterTs.value}`;
    });
    const emit = __emit;
    let hoverTimer = null;
    const onHover = (enter) => {
      if (prefersReducedMotion()) return;
      if (enter) {
        hoverTimer = window.setTimeout(() => startPreview(), 300);
      } else {
        stopPreview();
        if (hoverTimer) {
          window.clearTimeout(hoverTimer);
          hoverTimer = null;
        }
      }
    };
    const startPreview = () => {
      if (!source) return;
      previewing.value = true;
      requestAnimationFrame(() => {
        var _a;
        return (_a = videoRef.value) == null ? void 0 : _a.play().catch(() => {
        });
      });
    };
    const stopPreview = () => {
      previewing.value = false;
      isLooping.value = false;
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value.currentTime = 0;
      }
      posterTs.value = Date.now();
    };
    const handleEnded = () => {
      if (!isLooping.value) {
        stopPreview();
      }
    };
    const onPosterLoad = (e) => {
      try {
        const img = e.target;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const w = 16, h = 16;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let sum = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const y = 0.299 * r + 0.587 * g + 0.114 * b;
          sum += y;
          count++;
        }
        const avg = sum / count;
        emit("bg-theme", avg > 160 ? "light" : "dark");
      } catch {
      }
    };
    let longPressTimer = null;
    let touching = false;
    const onTouchStart = () => {
      if (prefersReducedMotion()) return;
      touching = true;
      isLooping.value = false;
      startPreview();
      longPressTimer = window.setTimeout(() => {
        if (touching && videoRef.value) {
          isLooping.value = true;
          try {
            if ((videoRef.value.currentTime || 0) >= (videoRef.value.duration || Infinity)) {
              videoRef.value.currentTime = 0;
            }
            videoRef.value.play().catch(() => {
            });
          } catch {
          }
        }
      }, 1e3);
    };
    const onTouchEnd = () => {
      touching = false;
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      stopPreview();
    };
    const inView = ref(false);
    let observer = null;
    onMounted(() => {
      var _a, _b;
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          inView.value = entry.isIntersecting;
          if (!inView.value) {
            stopPreview();
          } else {
            if (props.autoplay && !prefersReducedMotion()) startPreview();
          }
        });
      }, { rootMargin: "100px" });
      ((_b = (_a = document.currentScript) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, ".live-media-card")) || null;
      const root = document.querySelector(".live-media-card:last-child");
      const target = root || void 0;
      try {
        observer.observe(target || document.querySelector(".live-media-card"));
      } catch {
      }
    });
    onUnmounted(() => {
      stopPreview();
      if (observer) observer.disconnect();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "live-media-card",
        onMouseenter: _cache[0] || (_cache[0] = ($event) => onHover(true)),
        onMouseleave: _cache[1] || (_cache[1] = ($event) => onHover(false)),
        onTouchstartPassive: onTouchStart,
        onTouchendPassive: onTouchEnd
      }, [
        createBaseVNode("div", _hoisted_1$4, [
          __props.asset.poster_url ? (openBlock(), createElementBlock("img", {
            key: 0,
            src: posterSrc.value,
            class: "poster",
            alt: label,
            onLoad: onPosterLoad
          }, null, 40, _hoisted_2$4)) : createCommentVNode("", true),
          inView.value && previewing.value && unref(source) ? (openBlock(), createElementBlock("video", {
            key: 1,
            ref_key: "videoRef",
            ref: videoRef,
            class: "preview",
            src: unref(source).src,
            muted: "",
            playsinline: "",
            loop: isLooping.value,
            poster: __props.asset.poster_url,
            onEnded: handleEnded
          }, null, 40, _hoisted_3$2)) : createCommentVNode("", true),
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "badge" }, "LIVE", -1))
        ])
      ], 32);
    };
  }
});
const LiveMediaCard = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-4c42dc8c"]]);
const _hoisted_1$3 = ["src", "poster", "loop"];
const _hoisted_2$3 = ["src", "alt"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "LiveMediaFullscreen",
  props: {
    visible: { type: Boolean },
    asset: {}
  },
  emits: ["update:visible"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const videoRef = ref();
    const source = pickBestSource(props.asset);
    const close = () => emit("update:visible", false);
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    onMounted(() => document.addEventListener("keydown", handleKey));
    onUnmounted(() => document.removeEventListener("keydown", handleKey));
    watch(() => props.asset, () => {
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value.load();
      }
    });
    return (_ctx, _cache) => {
      return __props.visible ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "live-media-fullscreen",
        onClick: withModifiers(close, ["self"])
      }, [
        unref(source) ? (openBlock(), createElementBlock("video", {
          key: 0,
          ref_key: "videoRef",
          ref: videoRef,
          class: "player",
          src: unref(source).src,
          poster: __props.asset.poster_url || void 0,
          playsinline: "",
          controls: "",
          loop: __props.asset.loopable ?? true
        }, null, 8, _hoisted_1$3)) : __props.asset.poster_url ? (openBlock(), createElementBlock("img", {
          key: 1,
          src: __props.asset.poster_url,
          class: "fallback",
          alt: __props.asset.kind
        }, null, 8, _hoisted_2$3)) : createCommentVNode("", true),
        createBaseVNode("button", {
          class: "close-btn",
          onClick: withModifiers(close, ["stop"])
        }, "×")
      ])) : createCommentVNode("", true);
    };
  }
});
const LiveMediaFullscreen = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-3f986f29"]]);
const _hoisted_1$2 = ["src", "poster"];
const _hoisted_2$2 = ["src", "alt"];
const muted = true;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LiveMediaPlayer",
  props: {
    asset: {},
    autoplay: { type: Boolean }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const videoRef = ref();
    const source = pickBestSource(props.asset);
    const showingVideo = ref(false);
    let touchActive = false;
    let longPressTimer = null;
    const playOnce = () => {
      if (!source) return;
      showingVideo.value = true;
      requestAnimationFrame(() => {
        if (videoRef.value) {
          videoRef.value.currentTime = 0;
          videoRef.value.play().catch(() => {
          });
        }
      });
    };
    const handleEnded = () => {
      showingVideo.value = false;
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value.currentTime = 0;
      }
    };
    onMounted(() => {
      if (!prefersReducedMotion() && props.autoplay) {
        playOnce();
      }
    });
    watch(() => props.asset, () => {
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value.load();
      }
    });
    __expose({ playOnce });
    const onTouchStart = () => {
      touchActive = true;
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      longPressTimer = window.setTimeout(() => {
        if (touchActive) {
          playOnce();
        }
      }, 1e3);
    };
    const onTouchEnd = () => {
      touchActive = false;
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (showingVideo.value) {
        showingVideo.value = false;
        if (videoRef.value) {
          try {
            videoRef.value.pause();
            videoRef.value.currentTime = 0;
          } catch {
          }
        }
      }
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "live-media-player",
        onTouchstartPassive: onTouchStart,
        onTouchendPassive: onTouchEnd,
        onTouchcancelPassive: onTouchEnd
      }, [
        unref(source) && showingVideo.value ? (openBlock(), createElementBlock("video", {
          key: 0,
          ref_key: "videoRef",
          ref: videoRef,
          class: "player",
          src: unref(source).src,
          poster: __props.asset.poster_url || void 0,
          playsinline: "",
          muted,
          loop: false,
          onEnded: handleEnded
        }, null, 40, _hoisted_1$2)) : __props.asset.poster_url ? (openBlock(), createElementBlock("img", {
          key: 1,
          src: __props.asset.poster_url,
          class: "fallback",
          alt: __props.asset.kind
        }, null, 8, _hoisted_2$2)) : createCommentVNode("", true)
      ], 32);
    };
  }
});
const LiveMediaPlayer = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-51d083f9"]]);
const _hoisted_1$1 = { class: "preview-body" };
const _hoisted_2$1 = { class: "player-col" };
const _hoisted_3$1 = { class: "info-col" };
const _hoisted_4$1 = { class: "row" };
const _hoisted_5$1 = { class: "value" };
const _hoisted_6$1 = { class: "row" };
const _hoisted_7$1 = { class: "value" };
const _hoisted_8$1 = { class: "row" };
const _hoisted_9$1 = { class: "value" };
const _hoisted_10$1 = { class: "row" };
const _hoisted_11$1 = { class: "value" };
const _hoisted_12$1 = { class: "actions" };
const _hoisted_13$1 = { class: "action-item" };
const _hoisted_14$1 = { class: "action-item" };
const _hoisted_15$1 = { class: "action-item" };
const _hoisted_16$1 = {
  key: 0,
  class: "action-item"
};
const _hoisted_17$1 = {
  key: 0,
  class: "progress-row"
};
const _hoisted_18$1 = {
  key: 1,
  class: "review-status"
};
const _hoisted_19$1 = { class: "row" };
const _hoisted_20$1 = { class: "row" };
const _hoisted_21$1 = { class: "value" };
const _hoisted_22$1 = { class: "row" };
const _hoisted_23$1 = { class: "value" };
const _hoisted_24$1 = {
  key: 2,
  class: "public-url"
};
const _hoisted_25$1 = { class: "value" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LiveMediaPreview",
  props: {
    modelValue: { type: Boolean },
    asset: {}
  },
  emits: ["update:modelValue", "fullscreen"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visible = ref(props.modelValue);
    watch(() => props.modelValue, (v) => visible.value = v);
    watch(visible, (v) => emit("update:modelValue", v));
    const openFullscreen = () => emit("fullscreen", props.asset);
    const playerRef = ref(null);
    const playOnce = () => {
      var _a;
      return ((_a = playerRef.value) == null ? void 0 : _a.playOnce) && playerRef.value.playOnce();
    };
    const downloadAnimated = async () => {
      var _a;
      try {
        downloading.value = true;
        progress.value = 0;
        const asset = props.asset;
        const endpoint = asset.kind === "live_photo" ? `/live-media/${asset.id}/original-video` : `/live-media/${asset.id}/original`;
        const res = await api.get(endpoint, { responseType: "blob", timeout: 6e5, onDownloadProgress: (evt) => {
          if (evt && evt.total) {
            progress.value = Math.round(evt.loaded / evt.total * 100);
          } else {
            progress.value = -1;
          }
        } });
        const disposition = ((_a = res.headers) == null ? void 0 : _a["content-disposition"]) || "";
        let filename = `live_${asset.id}`;
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
        if (match) {
          filename = decodeURIComponent(match[1] || match[2] || filename);
        }
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        ElMessage.success("开始下载动图");
      } catch (e) {
        ElMessage.error("动图下载失败");
      } finally {
        downloading.value = false;
        setTimeout(() => {
          progress.value = 0;
        }, 300);
      }
    };
    const shareAnimated = async () => {
      try {
        if (!systemStore.sharingEnabled) {
          ElMessage.error("分享功能已关闭");
          return;
        }
        reviewCreating.value = true;
        reviewStatus.value = null;
        publicShareUrl.value = "";
        const { data } = await api.post("/share/review-live", {
          asset_id: props.asset.id,
          allowPreview: true,
          allowDownload: true,
          expireInHours: null
        });
        if (data && data.success && data.review_id) {
          reviewId.value = data.review_id;
          startReviewPolling();
          ElMessage.success("已提交审核，请稍候...");
        } else {
          ElMessage.error("提交审核失败");
        }
      } catch (_) {
        ElMessage.error("提交审核失败");
      } finally {
        reviewCreating.value = false;
      }
    };
    const reviewId = ref(null);
    const reviewStatus = ref(null);
    const reviewCreating = ref(false);
    const publicShareUrl = ref("");
    let reviewPoller = null;
    const reviewStatusText = () => reviewStatus.value ? reviewStatus.value.status === "pending_review" ? "审核中" : reviewStatus.value.status === "approved" ? "已通过" : reviewStatus.value.status === "rejected" ? "未通过" : reviewStatus.value.status : "";
    function startReviewPolling() {
      if (!reviewId.value) return;
      stopReviewPolling();
      reviewPoller = setInterval(async () => {
        try {
          const { data } = await api.get(`/share/review-live/${reviewId.value}/status`);
          reviewStatus.value = { status: data.status, review_progress: data.review_progress || 0, review_reason: data.review_reason };
          if (data.status === "approved" && data.share_token) {
            publicShareUrl.value = `${window.location.origin}/share/live/${data.share_token}`;
            stopReviewPolling();
            try {
              await navigator.clipboard.writeText(publicShareUrl.value);
              ElMessage.success("审核通过，公开链接已复制");
            } catch {
              ElMessage.success("审核通过，请复制公开链接");
            }
          } else if (data.status === "rejected") {
            stopReviewPolling();
            ElMessage.error(data.review_reason || "审核未通过");
          }
        } catch (_) {
        }
      }, 1e3);
    }
    function stopReviewPolling() {
      if (reviewPoller) {
        clearInterval(reviewPoller);
        reviewPoller = null;
      }
    }
    const downloading = ref(false);
    const progress = ref(0);
    const systemStore = useSystemStore();
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_progress = ElProgress;
      const _component_el_dialog = ElDialog;
      return openBlock(), createBlock(_component_el_dialog, {
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => visible.value = $event),
        title: "实况预览",
        width: "70%",
        "close-on-click-modal": false
      }, {
        footer: withCtx(() => [
          createVNode(_component_el_button, {
            onClick: _cache[0] || (_cache[0] = ($event) => visible.value = false)
          }, {
            default: withCtx(() => [..._cache[13] || (_cache[13] = [
              createTextVNode("关闭", -1)
            ])]),
            _: 1
          })
        ]),
        default: withCtx(() => [
          createBaseVNode("div", _hoisted_1$1, [
            createBaseVNode("div", _hoisted_2$1, [
              createVNode(LiveMediaPlayer, {
                ref_key: "playerRef",
                ref: playerRef,
                asset: __props.asset,
                autoplay: true
              }, null, 8, ["asset"])
            ]),
            createBaseVNode("div", _hoisted_3$1, [
              createBaseVNode("div", _hoisted_4$1, [
                _cache[2] || (_cache[2] = createBaseVNode("span", { class: "label" }, "类型", -1)),
                createBaseVNode("span", _hoisted_5$1, toDisplayString(__props.asset.kind), 1)
              ]),
              createBaseVNode("div", _hoisted_6$1, [
                _cache[3] || (_cache[3] = createBaseVNode("span", { class: "label" }, "分辨率", -1)),
                createBaseVNode("span", _hoisted_7$1, toDisplayString(__props.asset.width || "-") + " × " + toDisplayString(__props.asset.height || "-"), 1)
              ]),
              createBaseVNode("div", _hoisted_8$1, [
                _cache[4] || (_cache[4] = createBaseVNode("span", { class: "label" }, "时长", -1)),
                createBaseVNode("span", _hoisted_9$1, toDisplayString((__props.asset.duration_ms || 0) / 1e3) + "s", 1)
              ]),
              createBaseVNode("div", _hoisted_10$1, [
                _cache[5] || (_cache[5] = createBaseVNode("span", { class: "label" }, "FPS", -1)),
                createBaseVNode("span", _hoisted_11$1, toDisplayString(__props.asset.fps || "-"), 1)
              ]),
              createBaseVNode("div", _hoisted_12$1, [
                createBaseVNode("div", _hoisted_13$1, [
                  createVNode(_component_el_button, {
                    class: "btn-once",
                    onClick: playOnce,
                    type: "default"
                  }, {
                    default: withCtx(() => [..._cache[6] || (_cache[6] = [
                      createTextVNode("查看动图", -1)
                    ])]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_14$1, [
                  createVNode(_component_el_button, {
                    class: "btn-fullscreen",
                    onClick: openFullscreen,
                    type: "default"
                  }, {
                    default: withCtx(() => [..._cache[7] || (_cache[7] = [
                      createTextVNode("全屏播放", -1)
                    ])]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_15$1, [
                  createVNode(_component_el_button, {
                    class: "btn-download",
                    loading: downloading.value,
                    disabled: downloading.value,
                    onClick: downloadAnimated,
                    type: "default"
                  }, {
                    default: withCtx(() => [
                      !downloading.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                        createTextVNode("下载动图")
                      ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                        createTextVNode("下载中 " + toDisplayString(progress.value >= 0 ? progress.value + "%" : ""), 1)
                      ], 64))
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ]),
                unref(systemStore).sharingEnabled ? (openBlock(), createElementBlock("div", _hoisted_16$1, [
                  createVNode(_component_el_button, {
                    class: "btn-share",
                    onClick: shareAnimated,
                    type: "default"
                  }, {
                    default: withCtx(() => [..._cache[8] || (_cache[8] = [
                      createTextVNode("分享动图", -1)
                    ])]),
                    _: 1
                  })
                ])) : createCommentVNode("", true)
              ]),
              downloading.value ? (openBlock(), createElementBlock("div", _hoisted_17$1, [
                createVNode(_component_el_progress, {
                  percentage: progress.value >= 0 ? progress.value : 0,
                  indeterminate: progress.value < 0,
                  "stroke-width": 6
                }, null, 8, ["percentage", "indeterminate"])
              ])) : createCommentVNode("", true),
              reviewStatus.value ? (openBlock(), createElementBlock("div", _hoisted_18$1, [
                createBaseVNode("div", _hoisted_19$1, [
                  _cache[9] || (_cache[9] = createBaseVNode("span", { class: "label" }, "审核状态", -1)),
                  createBaseVNode("span", {
                    class: normalizeClass(["value", reviewStatus.value.status])
                  }, toDisplayString(reviewStatusText()), 3)
                ]),
                createBaseVNode("div", _hoisted_20$1, [
                  _cache[10] || (_cache[10] = createBaseVNode("span", { class: "label" }, "审核进度", -1)),
                  createBaseVNode("span", _hoisted_21$1, toDisplayString(reviewStatus.value.review_progress) + "%", 1)
                ]),
                createBaseVNode("div", _hoisted_22$1, [
                  _cache[11] || (_cache[11] = createBaseVNode("span", { class: "label" }, "审核原因", -1)),
                  createBaseVNode("span", _hoisted_23$1, toDisplayString(reviewStatus.value.review_reason), 1)
                ])
              ])) : createCommentVNode("", true),
              publicShareUrl.value ? (openBlock(), createElementBlock("div", _hoisted_24$1, [
                _cache[12] || (_cache[12] = createBaseVNode("span", { class: "label" }, "公开链接", -1)),
                createBaseVNode("span", _hoisted_25$1, toDisplayString(publicShareUrl.value), 1)
              ])) : createCommentVNode("", true)
            ])
          ])
        ]),
        _: 1
      }, 8, ["modelValue"]);
    };
  }
});
const LiveMediaPreview = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a93abe80"]]);
const _hoisted_1 = { class: "files-page" };
const _hoisted_2 = { class: "desktop-toolbar" };
const _hoisted_3 = { class: "unified-toolbar" };
const _hoisted_4 = { class: "toolbar-main" };
const _hoisted_5 = { class: "toolbar-search" };
const _hoisted_6 = { class: "toolbar-actions" };
const _hoisted_7 = { class: "mobile-toolbar" };
const _hoisted_8 = { class: "mobile-actions" };
const _hoisted_9 = { class: "mobile-controls" };
const _hoisted_10 = { class: "mobile-search-row" };
const _hoisted_11 = { class: "mobile-toolbar-tools" };
const _hoisted_12 = {
  key: 0,
  class: "mobile-batch-bar"
};
const _hoisted_13 = { class: "batch-info" };
const _hoisted_14 = { class: "batch-actions-mobile" };
const _hoisted_15 = {
  key: 0,
  class: "breadcrumb-nav"
};
const _hoisted_16 = {
  key: 1,
  class: "current-folder"
};
const _hoisted_17 = { class: "file-content" };
const _hoisted_18 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_19 = { class: "empty-content" };
const _hoisted_20 = {
  key: 1,
  class: "loading-state"
};
const _hoisted_21 = ["onContextmenu", "data-item-id"];
const _hoisted_22 = ["onClick"];
const _hoisted_23 = { class: "file-name" };
const _hoisted_24 = { class: "file-meta" };
const _hoisted_25 = ["onClick", "onTouchend", "onContextmenu", "onMousedown", "onMouseup", "data-item-id"];
const _hoisted_26 = {
  key: 0,
  class: "folder-body"
};
const _hoisted_27 = { class: "folder-thumbnail photos-folder-tile" };
const _hoisted_28 = ["src", "onError"];
const _hoisted_29 = {
  key: 1,
  class: "folder-thumbnail-fallback"
};
const _hoisted_30 = {
  key: 2,
  class: "folder-cover-scrim",
  "aria-hidden": "true"
};
const _hoisted_31 = { class: "folder-footer" };
const _hoisted_32 = ["title"];
const _hoisted_33 = {
  key: 1,
  class: "file-body"
};
const _hoisted_34 = { class: "file-thumbnail photos-folder-tile" };
const _hoisted_35 = { class: "file-footer" };
const _hoisted_36 = ["title"];
const _hoisted_37 = { class: "file-meta" };
const _hoisted_38 = { class: "card-thumbnail" };
const _hoisted_39 = ["title"];
const _hoisted_40 = { class: "file-meta" };
const _hoisted_41 = { class: "file-name-cell" };
const _hoisted_42 = { key: 0 };
const _hoisted_43 = { key: 1 };
const _hoisted_44 = { class: "file-actions" };
const _hoisted_45 = {
  key: 5,
  class: "pagination"
};
const _hoisted_46 = {
  key: 0,
  class: "global-upload-bar"
};
const _hoisted_47 = { class: "gub-header" };
const _hoisted_48 = { class: "gub-title" };
const _hoisted_49 = { class: "share-content" };
const _hoisted_50 = { class: "share-info" };
const _hoisted_51 = { class: "share-link" };
const _hoisted_52 = {
  key: 0,
  class: "review-status"
};
const _hoisted_53 = { class: "status-row" };
const _hoisted_54 = {
  key: 0,
  class: "reason"
};
const _hoisted_55 = { class: "share-options" };
const _hoisted_56 = { class: "share-row" };
const _hoisted_57 = { class: "share-row" };
const touchThreshold = 15;
const swipeThreshold = 50;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Files",
  setup(__props) {
    useRouter();
    const systemStore = useSystemStore();
    onMounted(() => {
      if (!systemStore.loaded) systemStore.loadShareStatus();
    });
    const filesStore = useFilesStore();
    useAuthStore();
    const showUploadDialog = ref(false);
    const showCreateFolderDialog = ref(false);
    const showPreviewDialog = ref(false);
    const showShareDialog = ref(false);
    const previewFile = ref(void 0);
    const previewFileIndex = ref(0);
    const shareFile = ref(null);
    const shareUrl = ref("");
    ref(null);
    const showContextMenu = ref(false);
    ref({ x: 0, y: 0 });
    const folderFormRef = ref();
    const sortBy = ref("name");
    const sortOrder = ref("asc");
    const selectedFiles = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const folderCoverFailedIds = ref([]);
    const shouldShowFolderCover = (item) => {
      const raw = item.cover_file_id;
      const id = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(id) || id <= 0) return false;
      return !folderCoverFailedIds.value.includes(id);
    };
    const getFolderCoverUrl = (item) => {
      const raw = item.cover_file_id;
      const id = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(id) || id <= 0) return "";
      return getFilePreviewUrl(id);
    };
    const onFolderCoverImgError = (coverId) => {
      const id = typeof coverId === "number" ? coverId : Number(coverId);
      if (!Number.isFinite(id) || id <= 0) return;
      if (folderCoverFailedIds.value.includes(id)) return;
      folderCoverFailedIds.value = [...folderCoverFailedIds.value, id];
    };
    const showFolderDetailsDialog = ref(false);
    const folderDetails = ref(null);
    const folderFilesCount = computed(() => {
      if (!folderDetails.value) return null;
      if (filesStore.currentFolder === folderDetails.value.id) {
        return filesStore.files.length;
      }
      return null;
    });
    const folderSubfoldersCount = computed(() => {
      if (!folderDetails.value) return null;
      if (filesStore.currentFolder === folderDetails.value.id) {
        return filesStore.folders.length;
      }
      return null;
    });
    const folderTotalSize = computed(() => {
      if (!folderDetails.value) return null;
      if (filesStore.currentFolder === folderDetails.value.id) {
        return filesStore.files.reduce((sum, f) => sum + (f.file_size || 0), 0);
      }
      return null;
    });
    const handleEnterFolderFromDetails = async (folderId) => {
      if (!folderId) return;
      filesStore.loading = true;
      filesStore.files = [];
      filesStore.folders = [];
      filesStore.currentFolder = folderId;
      await updateFolderPath(folderId);
      await Promise.all([filesStore.fetchFiles(1), filesStore.fetchFolders()]);
      showFolderDetailsDialog.value = false;
    };
    const viewMode = ref("grid");
    const loadViewSettings = () => {
      try {
        const savedView = localStorage.getItem("userPreferences");
        if (savedView) {
          const preferences = JSON.parse(savedView);
          if (preferences.defaultView && ["grid", "list"].includes(preferences.defaultView)) {
            viewMode.value = preferences.defaultView;
          }
        }
      } catch (error) {
      }
    };
    const searchQuery = ref("");
    const onlyLive = ref(false);
    const liveAssets = ref([]);
    const showLiveFullscreen = ref(false);
    const currentLiveAsset = ref(null);
    const showLivePreview = ref(false);
    const liveTheme = ref({});
    const setLiveTheme = (id, t) => {
      liveTheme.value[id] = t;
    };
    const globalUploadPercent = computed(() => {
      const items = filesStore.uploadItems;
      if (!items.length) return 0;
      const done = items.filter(
        (i) => i.status === "success" || i.status === "error" || i.status === "canceled"
      ).length;
      return Math.round(done / items.length * 100);
    });
    const globalUploadColor = computed(() => {
      const { success, error } = filesStore.uploadStats;
      const items = filesStore.uploadItems;
      if (!items.length) return "#667eea";
      if (items.every((i) => i.status === "success")) return "#16a34a";
      if (items.some((i) => i.status === "error")) return "#dc2626";
      return "#2563eb";
    });
    const globalBarVisible = ref(false);
    let globalBarTimer = null;
    watch(
      () => filesStore.uploadItems,
      (items) => {
        if (!items.length) {
          globalBarVisible.value = false;
          return;
        }
        const allDone = items.every(
          (i) => i.status === "success" || i.status === "error" || i.status === "canceled"
        );
        const hasError = items.some((i) => i.status === "error");
        if (allDone) {
          if (!hasError) {
            if (globalBarTimer) clearTimeout(globalBarTimer);
            globalBarTimer = setTimeout(() => {
              globalBarVisible.value = false;
            }, 2e3);
          } else {
            globalBarVisible.value = true;
          }
        } else {
          if (globalBarTimer) {
            clearTimeout(globalBarTimer);
            globalBarTimer = null;
          }
          globalBarVisible.value = true;
        }
      },
      { deep: true }
    );
    const parseTypeKeywords = (q) => {
      const s = q.trim().toLowerCase();
      const isImage = /^(.*)(图片|图像|image|img|photo|jpeg|jpg|png|gif|webp)(.*)$/.test(s);
      const isVideo = /^(.*)(视频|video|mp4|webm|mov|avi)(.*)$/.test(s);
      const isLive = /^(.*)(实况|live\s?photo|live|动图|motion)(.*)$/.test(s);
      return { isImage, isVideo, isLive };
    };
    const filteredFiles = computed(() => {
      let files = filesStore.files;
      const q = searchQuery.value.trim().toLowerCase();
      const { isImage, isVideo } = parseTypeKeywords(q);
      if (q) {
        files = files.filter((file) => {
          const nameMatch = (file.original_name || "").toLowerCase().includes(q);
          const typeMatch = isImage && file.file_type === "image" || isVideo && file.file_type === "video";
          return nameMatch || typeMatch;
        });
      }
      if (onlyLive.value) {
        files = files.filter(
          (f) => !f.isFolder && f.file_type === "image" && f.live_video_id
        );
      }
      return files.sort((a, b) => {
        if (sortBy.value === "name") {
          return sortOrder.value === "asc" ? a.original_name.localeCompare(b.original_name) : b.original_name.localeCompare(a.original_name);
        } else if (sortBy.value === "size") {
          return sortOrder.value === "asc" ? a.file_size - b.file_size : b.file_size - a.file_size;
        } else if (sortBy.value === "date") {
          return sortOrder.value === "asc" ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    });
    const filteredLiveAssets = computed(() => {
      const list = liveAssets.value || [];
      const q = searchQuery.value.trim().toLowerCase();
      if (!q) return list;
      const { isLive, isImage, isVideo } = parseTypeKeywords(q);
      return list.filter((a) => {
        const name = (a.kind || "实况").toLowerCase();
        const nameMatch = name.includes(q);
        const typeMatch = isLive || false;
        if (isImage || isVideo) {
          return nameMatch;
        }
        return nameMatch || typeMatch;
      });
    });
    const filteredFolders = computed(() => {
      let folders = filesStore.folders;
      const q = searchQuery.value.trim().toLowerCase();
      if (q) {
        folders = folders.filter(
          (folder) => (folder.folder_name || "").toLowerCase().includes(q)
        );
      }
      return folders.sort((a, b) => {
        if (sortBy.value === "name") {
          return sortOrder.value === "asc" ? a.folder_name.localeCompare(b.folder_name) : b.folder_name.localeCompare(a.folder_name);
        } else if (sortBy.value === "date") {
          return sortOrder.value === "asc" ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    });
    const allItems = computed(() => {
      const items = [];
      filteredFolders.value.forEach((folder) => {
        items.push({
          ...folder,
          isFolder: true,
          original_name: folder.folder_name,
          file_size: 0,
          file_type: "folder"
        });
      });
      filteredFiles.value.forEach((file) => {
        items.push({
          ...file,
          isFolder: false
        });
      });
      if (!onlyLive.value && filteredLiveAssets.value && filteredLiveAssets.value.length > 0) {
        for (const asset of filteredLiveAssets.value) {
          items.push({
            id: `live_${asset.id}`,
            isFolder: false,
            isLive: true,
            liveAsset: asset,
            original_name: asset.kind || "实况",
            file_size: 0,
            file_type: "live"
          });
        }
      }
      return items.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        if (sortBy.value === "name") {
          return sortOrder.value === "asc" ? a.original_name.localeCompare(b.original_name) : b.original_name.localeCompare(a.original_name);
        } else if (sortBy.value === "size") {
          return sortOrder.value === "asc" ? a.file_size - b.file_size : b.file_size - a.file_size;
        } else if (sortBy.value === "date") {
          return sortOrder.value === "asc" ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
    });
    const totalPages = computed(() => {
      return Math.ceil(allItems.value.length / pageSize.value);
    });
    const isMobile = computed(() => {
      return window.innerWidth <= 768;
    });
    const paginatedFiles = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return allItems.value.slice(start, end);
    });
    const refreshFiles = () => {
      folderCoverFailedIds.value = [];
      filesStore.fetchFiles(1);
      filesStore.fetchFolders();
      fetchLiveAssets();
      ElMessage.success("文件列表已刷新");
    };
    const goToRootFolder = () => {
      filesStore.loading = true;
      filesStore.files = [];
      filesStore.folders = [];
      filesStore.currentFolder = null;
      folderPath.value = [];
      filesStore.fetchFiles(1);
      filesStore.fetchFolders();
      ElMessage.info("已返回根目录");
    };
    const goToFolder = async (folderId) => {
      filesStore.loading = true;
      filesStore.files = [];
      filesStore.folders = [];
      filesStore.currentFolder = folderId;
      await updateFolderPath(folderId);
      await Promise.all([filesStore.fetchFiles(1), filesStore.fetchFolders()]);
    };
    const updateFolderPath = async (folderId) => {
      try {
        const path = await filesStore.fetchFolderPath(folderId);
        folderPath.value = path;
        resetLongPressState();
      } catch (error) {
        folderPath.value = [];
      }
    };
    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const touchStartTime = ref(0);
    const isTablet = ref(false);
    const isDesktop = ref(false);
    const checkScreenSize = () => {
      const width = window.innerWidth;
      isTablet.value = width > 768 && width <= 1024;
      isDesktop.value = width > 1024;
    };
    onMounted(() => {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenSize);
    });
    const getLongPressDelay = () => {
      if (isMobile.value) return 1500;
      if (isTablet.value) return 1500;
      return 1e3;
    };
    const longPressTimer = ref(null);
    ref(800);
    const isLongPressing = ref(false);
    const longPressItem = ref(null);
    const touchMoved = ref(false);
    const longPressedCards = ref(/* @__PURE__ */ new Set());
    const handleLongPress = (item) => {
      isLongPressing.value = true;
      longPressItem.value = item;
      if (isMobile.value) {
        longPressedCards.value.add(item.id);
        startAutoResetTimer();
      }
      setTimeout(() => {
        isLongPressing.value = false;
        longPressItem.value = null;
      }, 200);
    };
    const handleTouchStart = (event) => {
      touchStartX.value = event.touches[0].clientX;
      touchStartY.value = event.touches[0].clientY;
      touchStartTime.value = Date.now();
      touchMoved.value = false;
      isLongPressing.value = false;
      longPressItem.value = null;
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
      const target = event.target;
      if (target.closest(".card-checkbox") || target.closest(".card-actions")) {
        return;
      }
      longPressTimer.value = setTimeout(() => {
        if (!touchMoved.value) {
          const currentItem = event.target;
          const fileCard = currentItem.closest(".file-card");
          if (fileCard) {
            const itemId = fileCard.getAttribute("data-item-id");
            const allItems2 = [
              ...filesStore.folders.map((folder) => ({
                ...folder,
                isFolder: true,
                original_name: folder.folder_name
              })),
              ...filesStore.files.map((file) => ({
                ...file,
                isFolder: false
              }))
            ];
            const numericId = Number(itemId);
            const item = allItems2.find((item2) => item2.id === numericId);
            if (item) {
              handleLongPress(item);
            }
          }
        }
      }, getLongPressDelay());
    };
    const handleTouchMove = (event) => {
      if (event.touches.length > 0) {
        const touchCurrentX = event.touches[0].clientX;
        const touchCurrentY = event.touches[0].clientY;
        const deltaX = Math.abs(touchCurrentX - touchStartX.value);
        const deltaY = Math.abs(touchCurrentY - touchStartY.value);
        if (deltaX > touchThreshold || deltaY > touchThreshold) {
          touchMoved.value = true;
          if (isLongPressing.value) {
            isLongPressing.value = false;
            longPressItem.value = null;
          }
          if (longPressTimer.value) {
            clearTimeout(longPressTimer.value);
            longPressTimer.value = null;
          }
        }
      }
    };
    const lastTapTime = ref(0);
    const tapCount = ref(0);
    const handleDoubleTap = (item) => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTapTime.value;
      if (tapLength < 500 && tapLength > 0) {
        tapCount.value++;
        if (tapCount.value === 2) {
          if (!item.isFolder && (item.file_type === "image" || item.file_type === "video")) {
            handleFileClick(item);
          }
          if (showPreviewDialog.value && previewFile.value) {
            resetZoom();
          }
          tapCount.value = 0;
        }
      } else {
        tapCount.value = 1;
      }
      lastTapTime.value = currentTime;
    };
    const handleTouchEnd = (event, item) => {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      const deltaX = Math.abs(touchEndX - touchStartX.value);
      const deltaY = Math.abs(touchEndY - touchStartY.value);
      const deltaTime = touchEndTime - touchStartTime.value;
      if (isLongPressing.value) {
        if (longPressTimer.value) {
          clearTimeout(longPressTimer.value);
          longPressTimer.value = null;
        }
        return;
      }
      if (deltaX < touchThreshold && deltaY < touchThreshold && deltaTime < 300 && !touchMoved.value) {
        const target = event.target;
        if (target.closest(".card-checkbox") || target.closest(".card-actions")) {
          return;
        }
        handleDoubleTap(item);
        setTimeout(() => {
          if (tapCount.value === 1) {
            handleItemClick(item, event);
            tapCount.value = 0;
          }
        }, 300);
      }
      touchMoved.value = false;
    };
    const swipeStartX = ref(0);
    const swipeStartY = ref(0);
    const handleSwipeStart = (event) => {
      swipeStartX.value = event.touches[0].clientX;
      swipeStartY.value = event.touches[0].clientY;
    };
    const handleSwipeEnd = (event) => {
      const swipeEndX = event.changedTouches[0].clientX;
      const swipeEndY = event.changedTouches[0].clientY;
      const deltaX = swipeEndX - swipeStartX.value;
      const deltaY = swipeEndY - swipeStartY.value;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          if (showPreviewDialog.value && previewFile.value) {
            const imageFiles = filesStore.files.filter(
              (f) => f.file_type === "image"
            );
            const currentIndex = imageFiles.findIndex(
              (f) => f.id === previewFile.value.id
            );
            if (currentIndex > 0) {
              previewFile.value = imageFiles[currentIndex - 1];
              previewFileIndex.value = currentIndex - 1;
            }
          }
        } else {
          if (showPreviewDialog.value && previewFile.value) {
            const imageFiles = filesStore.files.filter(
              (f) => f.file_type === "image"
            );
            const currentIndex = imageFiles.findIndex(
              (f) => f.id === previewFile.value.id
            );
            if (currentIndex < imageFiles.length - 1) {
              previewFile.value = imageFiles[currentIndex + 1];
              previewFileIndex.value = currentIndex + 1;
            }
          }
        }
      }
    };
    const scale = ref(1);
    const translateX = ref(0);
    const translateY = ref(0);
    const lastDistance = ref(0);
    const lastScale = ref(1);
    const handlePinchStart = (event) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        lastDistance.value = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        lastScale.value = scale.value;
      }
    };
    const handlePinchMove = (event) => {
      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        const scaleChange = currentDistance / lastDistance.value;
        scale.value = Math.max(0.5, Math.min(3, lastScale.value * scaleChange));
      }
    };
    const handlePinchEnd = () => {
      lastDistance.value = 0;
      lastScale.value = scale.value;
    };
    const resetZoom = () => {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    };
    const handlePreviewTouchStart = (event) => {
      handleSwipeStart(event);
      handlePinchStart(event);
    };
    const handlePreviewTouchMove = (event) => {
      handlePinchMove(event);
    };
    const handlePreviewTouchEnd = (event) => {
      handleSwipeEnd(event);
      handlePinchEnd();
    };
    const handleFileClick = (file) => {
      if (file.file_type === "image") {
        const imageFiles = filesStore.files.filter((f) => f.file_type === "image");
        const index2 = imageFiles.findIndex((f) => f.id === file.id);
        if (index2 !== -1) {
          previewFile.value = imageFiles[index2];
          previewFileIndex.value = index2;
          showPreviewDialog.value = true;
        }
      } else if (file.file_type === "video") {
        const videoFiles = filesStore.files.filter((f) => f.file_type === "video");
        const index2 = videoFiles.findIndex((f) => f.id === file.id);
        if (index2 !== -1) {
          previewFile.value = videoFiles[index2];
          previewFileIndex.value = index2;
          showPreviewDialog.value = true;
        }
      } else {
        downloadFile$1(file);
      }
    };
    const resetLongPressState = () => {
      isLongPressing.value = false;
      longPressItem.value = null;
      longPressedCards.value.clear();
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    };
    const autoResetTimer = ref(null);
    const startAutoResetTimer = () => {
      if (autoResetTimer.value) {
        clearTimeout(autoResetTimer.value);
      }
      autoResetTimer.value = setTimeout(() => {
        resetLongPressState();
      }, 5e3);
    };
    const handleGlobalPointerDown = (event) => {
      const target = event.target;
      if (!longPressedCards.value || longPressedCards.value.size === 0) return;
      if (target.closest(".card-actions")) return;
      resetLongPressState();
    };
    onMounted(() => {
      document.addEventListener("mousedown", handleGlobalPointerDown);
      document.addEventListener("touchstart", handleGlobalPointerDown, {
        passive: true
      });
    });
    onUnmounted(() => {
      document.removeEventListener("mousedown", handleGlobalPointerDown);
      document.removeEventListener("touchstart", handleGlobalPointerDown);
    });
    const handleItemClick = async (item, event) => {
      if (event && event.target.closest(".card-checkbox")) {
        return;
      }
      if (item.isFolder) {
        resetLongPressState();
        filesStore.loading = true;
        filesStore.files = [];
        filesStore.folders = [];
        filesStore.currentFolder = item.id;
        await updateFolderPath(item.id);
        await Promise.all([filesStore.fetchFiles(1), filesStore.fetchFolders()]);
        ElMessage.info(`进入文件夹: ${item.folder_name}`);
      } else {
        handleFileClick(item);
      }
    };
    const renameItem = async (item) => {
      try {
        const currentName = item.isFolder ? item.folder_name : item.original_name;
        const itemType = item.isFolder ? "文件夹" : "文件";
        const { value: newName } = await ElMessageBox.prompt(
          `请输入新的${itemType}名称`,
          `重命名${itemType}`,
          {
            confirmButtonText: "重命名",
            cancelButtonText: "取消",
            inputValue: currentName,
            inputPattern: /^.{1,100}$/,
            inputErrorMessage: `${itemType}名称长度应在1-100个字符之间`
          }
        );
        if (newName && newName !== currentName) {
          if (item.isFolder) {
            await filesStore.renameFolder(item.id, newName);
            ElMessage.success("文件夹重命名成功");
          } else {
            await filesStore.renameFile(item.id, newName);
            ElMessage.success("文件重命名成功");
          }
          refreshFiles();
        }
      } catch (error) {
      }
    };
    const deleteItem = async (item) => {
      var _a, _b, _c;
      if (item.isFolder) {
        try {
          await ElMessageBox.confirm(
            `确定要删除文件夹 "${item.folder_name}" 吗？`,
            "确认删除",
            {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }
          );
          await filesStore.deleteFolder(item.id);
          ElMessage.success("文件夹删除成功");
          await filesStore.fetchFiles(1);
          await filesStore.fetchFolders();
        } catch (error) {
          if (error !== "cancel") {
            ElMessage.error(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "删除文件夹失败");
          }
        }
      } else {
        if (item.isLive && ((_c = item.liveAsset) == null ? void 0 : _c.id)) {
          await deleteLiveAsset(item.liveAsset.id);
        } else {
          deleteFile(item);
        }
      }
    };
    const handleUploadSuccess = () => {
      refreshFiles();
    };
    const handleFileDeleted = (fileId) => {
      showPreviewDialog.value = false;
    };
    const handlePreviewFileChange = (file, index2) => {
      previewFile.value = file;
      previewFileIndex.value = index2;
    };
    const idle = (cb) => {
      const ric = window.requestIdleCallback;
      if (ric) return ric(() => cb(), { timeout: 1200 });
      return window.setTimeout(cb, 200);
    };
    watch(
      paginatedFiles,
      (list) => {
        const files = (list || []).filter((x) => x && !x.isFolder && !x.isLive);
        const thumbs = files.map((f) => getFileThumbnailUrl(f)).filter(Boolean).slice(0, 18);
        for (const u of thumbs) preloadImage(u);
        idle(() => {
          const originals = files.map((f) => getFilePreviewUrlSmart(f)).filter(Boolean).slice(0, 6);
          for (const u of originals) preloadImage(u);
        });
      },
      { immediate: true }
    );
    const handleSearch = () => {
      currentPage.value = 1;
    };
    const handleSortChange = () => {
      currentPage.value = 1;
    };
    const handlePageChange = (page) => {
      currentPage.value = page;
    };
    const handleSelectionChange = (selection) => {
      selectedFiles.value = selection.map((item) => item.id);
    };
    const toggleFileSelection = (fileId, event) => {
      const index2 = selectedFiles.value.indexOf(fileId);
      if (index2 > -1) {
        selectedFiles.value.splice(index2, 1);
      } else {
        selectedFiles.value.push(fileId);
      }
    };
    const getRowClassName = ({ row }) => {
      return selectedFiles.value.includes(row.id) ? "selected-row" : "";
    };
    ref(null);
    const handleMouseDown = (event, item) => {
      return;
    };
    const handleMouseUp = (event, item) => {
      return;
    };
    const showCardActions = (item) => {
      if (isMobile.value) return;
      longPressedCards.value.clear();
      longPressedCards.value.add(item.id);
      startAutoResetTimer();
    };
    const downloadFile$1 = (file) => {
      try {
        if (file.isLive) {
          const asset = file.liveAsset;
          if (asset) {
            downloadLiveOriginal(asset);
            return;
          }
          ElMessage.warning("该资源当前不支持直接下载");
          return;
        }
        downloadFile(file.id, file.original_name);
        ElMessage.success("开始下载文件");
      } catch (error) {
        ElMessage.error("下载失败");
      }
    };
    const downloadLiveOriginal = async (asset) => {
      try {
        if (asset.kind === "live_photo") {
          await downloadFromApi(
            `/live-media/${asset.id}/original-image`,
            `live_${asset.id}`
          );
          await downloadFromApi(
            `/live-media/${asset.id}/original-video`,
            `live_${asset.id}`
          );
          ElMessage.success("已开始下载原件（图像与视频）");
          return;
        }
        await downloadFromApi(
          `/live-media/${asset.id}/original`,
          `${asset.kind}_${asset.id}`
        );
        ElMessage.success("已开始下载原件");
      } catch (_) {
        ElMessage.error("原件下载失败");
      }
    };
    const downloadFromApi = async (endpoint, basename) => {
      const res = await api.get(endpoint, {
        responseType: "blob",
        timeout: 6e5
      });
      const contentType = res.headers["content-type"] || "";
      const disposition = res.headers["content-disposition"] || "";
      let filename = basename;
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(
        disposition
      );
      if (match) {
        filename = decodeURIComponent(match[1] || match[2] || basename);
      } else {
        const ext = contentType.includes("jpeg") ? "jpg" : contentType.includes("heic") ? "heic" : contentType.includes("gif") ? "gif" : contentType.includes("webp") ? "webp" : contentType.includes("quicktime") ? "mov" : "";
        filename = ext ? `${basename}.${ext}` : basename;
      }
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    const shareFileAction = (file) => {
      if (!systemStore.sharingEnabled) {
        ElMessage.error("分享功能已关闭");
        return;
      }
      shareFile.value = file;
      showShareDialog.value = true;
    };
    const deleteFile = async (file) => {
      var _a;
      try {
        await ElMessageBox.confirm(
          `确定要删除文件 "${file.original_name}" 吗？`,
          "删除确认",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        if (file.isLive && ((_a = file.liveAsset) == null ? void 0 : _a.id)) {
          await deleteLiveAsset(file.liveAsset.id);
        } else {
          await filesStore.deleteFile(file.id);
        }
        ElMessage.success("文件删除成功");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败");
        }
      }
    };
    const batchDownload = () => {
      if (selectedFiles.value.length === 0) {
        ElMessage.warning("请先选择要下载的项目");
        return;
      }
      ElMessage.info(`开始下载 ${selectedFiles.value.length} 个项目`);
    };
    const batchDelete = async () => {
      var _a, _b, _c, _d;
      if (selectedFiles.value.length === 0) {
        ElMessage.warning("请先选择要删除的项目");
        return;
      }
      try {
        if (onlyLive.value) {
          const idsToDelete = [];
          for (const idStr of selectedFiles.value) {
            const raw = String(idStr).replace(/^live_/, "").trim();
            const id = Number(raw);
            if (!Number.isNaN(id)) idsToDelete.push(id);
          }
          const results = await Promise.allSettled(
            idsToDelete.map((id) => api.delete(`/live-media/${id}`))
          );
          const failedCount = results.filter((r) => r.status === "rejected").length;
          liveAssets.value = liveAssets.value.filter(
            (a) => !idsToDelete.includes(a.id)
          );
          if (failedCount === 0)
            ElMessage.success(`成功删除 ${idsToDelete.length} 个实况`);
          else ElMessage.warning(`删除完成，${failedCount} 个失败`);
          selectedFiles.value = [];
          return;
        }
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedFiles.value.length} 个项目吗？`,
          "批量删除确认",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        const filesToDelete = [];
        const foldersToDelete = [];
        const liveToDelete = [];
        const allItems2 = [
          ...filesStore.folders.map((folder) => ({
            ...folder,
            isFolder: true,
            original_name: folder.folder_name,
            file_size: 0,
            file_type: "folder"
          })),
          ...filesStore.files.map((file) => ({
            ...file,
            isFolder: false
          }))
        ];
        for (const itemId of selectedFiles.value) {
          const idStr = String(itemId);
          const liveRawId = idStr.replace(/^live_/, "").trim();
          const liveIdNum = Number(liveRawId);
          const isLiveAsset = !Number.isNaN(liveIdNum) && liveAssets.value.some((a) => a.id === liveIdNum);
          if (isLiveAsset) {
            liveToDelete.push(liveIdNum);
            continue;
          }
          const item = allItems2.find(
            (item2) => item2.id === itemId || item2.id === Number(itemId)
          );
          if (item) {
            if (item.isFolder) {
              foldersToDelete.push(item);
            } else {
              filesToDelete.push(item);
            }
          }
        }
        let foldersDeleted = 0;
        let filesDeleted = 0;
        let liveDeleted = 0;
        let lastErrorMsg = "";
        for (const folder of foldersToDelete) {
          try {
            await filesStore.deleteFolder(folder.id);
            foldersDeleted++;
          } catch (e) {
            lastErrorMsg = ((_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || (e == null ? void 0 : e.message) || "删除文件夹失败";
            ElMessage.error(lastErrorMsg);
          }
        }
        if (filesToDelete.length > 0) {
          const fileIds = filesToDelete.map((f) => f.id).filter(
            (id) => typeof id === "number" && !Number.isNaN(id)
          );
          try {
            await filesStore.deleteFiles(fileIds);
            filesDeleted = fileIds.length;
          } catch (e) {
            lastErrorMsg = ((_d = (_c = e == null ? void 0 : e.response) == null ? void 0 : _c.data) == null ? void 0 : _d.message) || (e == null ? void 0 : e.message) || "批量删除文件失败";
            ElMessage.error(lastErrorMsg);
          }
        }
        if (liveToDelete.length > 0) {
          const results = await Promise.allSettled(
            liveToDelete.map((id) => api.delete(`/live-media/${id}`))
          );
          const failedCount = results.filter((r) => r.status === "rejected").length;
          liveDeleted = liveToDelete.length - failedCount;
          if (failedCount > 0) {
            ElMessage.error(`${failedCount} 个实况删除失败`);
          }
          liveAssets.value = liveAssets.value.filter(
            (a) => !liveToDelete.includes(a.id)
          );
        }
        selectedFiles.value = [];
        const totalDeleted = foldersDeleted + filesDeleted + liveDeleted;
        if (totalDeleted > 0) {
          ElMessage.success(`成功删除 ${totalDeleted} 个项目`);
        } else if (!lastErrorMsg) {
          ElMessage.warning("没有找到要删除的项目");
        }
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("批量删除失败");
        }
      }
    };
    const generateShareLink = async () => {
      var _a, _b;
      if (!systemStore.sharingEnabled) {
        ElMessage.error("分享功能已关闭");
        return;
      }
      if (!shareFile.value) return;
      try {
        shareCreating.value = true;
        shareUrl.value = "";
        shareStatus.value = null;
        shareToken.value = null;
        let expireInHours = null;
        if (shareOptions.ttlPreset === "1h") expireInHours = 1;
        else if (shareOptions.ttlPreset === "24h") expireInHours = 24;
        else if (shareOptions.ttlPreset === "7d") expireInHours = 24 * 7;
        else if (shareOptions.ttlPreset === "custom")
          expireInHours = Math.max(1, Number(shareOptions.ttlHours || 0));
        else if (shareOptions.ttlPreset === "never") expireInHours = null;
        const { data } = await api.post("/share", {
          file_id: shareFile.value.id,
          allowPreview: !!shareOptions.allowPreview,
          allowDownload: !!shareOptions.allowDownload,
          expireInHours
        });
        if (data && data.success && data.token) {
          shareToken.value = data.token;
          shareStatus.value = {
            status: data.status || "pending_review",
            review_progress: data.review_progress || 0
          };
          startSharePolling();
          ElMessage.success("已提交审核，请稍候...");
        } else {
          ElMessage.error("生成分享链接失败");
        }
      } catch (e) {
        const msg = ((_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "生成分享链接失败";
        ElMessage.error(msg);
      } finally {
        shareCreating.value = false;
      }
    };
    function startSharePolling() {
      if (!shareToken.value) return;
      stopSharePolling();
      sharePoller = setInterval(async () => {
        try {
          const { data } = await api.get(`/share/${shareToken.value}/status`);
          shareStatus.value = {
            status: data.status,
            review_progress: data.review_progress || 0,
            review_reason: data.review_reason
          };
          if (data.status === "approved") {
            const baseUrl = window.location.origin;
            shareUrl.value = `${baseUrl}/share/${shareToken.value}`;
            stopSharePolling();
            ElMessage.success("审核通过，分享链接已生成");
          } else if (data.status === "rejected") {
            stopSharePolling();
            ElMessage.error(data.review_reason || "审核未通过");
          }
        } catch (_) {
        }
      }, 1e3);
    }
    function stopSharePolling() {
      if (sharePoller) {
        clearInterval(sharePoller);
        sharePoller = null;
      }
    }
    watch(showShareDialog, (v) => {
      if (!v) {
        stopSharePolling();
      }
    });
    const copyShareUrl = async () => {
      if (shareUrl.value) {
        const success = await copyToClipboard(shareUrl.value);
        if (success) {
          ElMessage.success("分享链接已复制到剪贴板");
        } else {
          ElMessage.error("复制失败");
        }
      }
    };
    const createFolder = async () => {
      if (!folderFormRef.value) return;
      try {
        await folderFormRef.value.validate();
        await filesStore.createFolder(
          folderForm.name,
          filesStore.currentFolder || void 0
        );
        ElMessage.success("文件夹创建成功");
        showCreateFolderDialog.value = false;
        folderForm.name = "";
        refreshFiles();
      } catch (error) {
      }
    };
    const handleClickOutside = () => {
      showContextMenu.value = false;
    };
    const handleKeydown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "1") {
        event.preventDefault();
        viewMode.value = "grid";
        ElMessage.success("已切换到网格视图");
      } else if ((event.ctrlKey || event.metaKey) && event.key === "2") {
        event.preventDefault();
        viewMode.value = "list";
        ElMessage.success("已切换到列表视图");
      }
    };
    onMounted(() => {
      filesStore.fetchFiles(1);
      filesStore.fetchFolders();
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeydown);
      loadViewSettings();
      try {
        const v = localStorage.getItem("onlyLive");
        if (v !== null) onlyLive.value = v === "1";
      } catch {
      }
      window.addEventListener("preferencesUpdated", loadViewSettings);
      fetchLiveAssets();
    });
    onUnmounted(() => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("preferencesUpdated", loadViewSettings);
    });
    const fetchLiveAssets = async () => {
      try {
        const params = { page: 1, limit: 60 };
        if (!onlyLive.value && filesStore.currentFolder)
          params.folder_id = filesStore.currentFolder;
        if (onlyLive.value && filesStore.currentFolder)
          params.folder_id = filesStore.currentFolder;
        const { data } = await api.get("/live-media", { params });
        liveAssets.value = data.items || [];
      } catch (e) {
        liveAssets.value = [];
      }
    };
    watch(onlyLive, async (val) => {
      await fetchLiveAssets();
      try {
        localStorage.setItem("onlyLive", val ? "1" : "0");
      } catch {
      }
    });
    watch(
      () => filesStore.currentFolder,
      async () => {
        await fetchLiveAssets();
      }
    );
    const openLiveFullscreen = (asset) => {
      currentLiveAsset.value = asset;
      showLiveFullscreen.value = true;
    };
    const openLivePreview = (asset) => {
      currentLiveAsset.value = asset;
      showLivePreview.value = true;
    };
    const getLiveCreatedAt = (asset) => {
      return (asset == null ? void 0 : asset.created_at) || null;
    };
    const toggleOnlyLive = () => {
      onlyLive.value = !onlyLive.value;
    };
    const handleGridCardClick = (item, event) => {
      if ((item == null ? void 0 : item.isLive) && (item == null ? void 0 : item.liveAsset)) {
        openLivePreview(item.liveAsset);
        return;
      }
      if (!isMobile.value) handleItemClick(item, event);
    };
    const deleteLiveAsset = async (assetId) => {
      try {
        await ElMessageBox.confirm("确定要删除该实况吗？", "删除确认", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning"
        });
        const index2 = liveAssets.value.findIndex((a) => a.id === assetId);
        const snapshot2 = index2 !== -1 ? liveAssets.value[index2] : null;
        if (index2 !== -1) liveAssets.value.splice(index2, 1);
        const selectedKey = `live_${assetId}`;
        const selIndex = selectedFiles.value.indexOf(selectedKey);
        if (selIndex !== -1) selectedFiles.value.splice(selIndex, 1);
        await api.delete(`/live-media/${assetId}`);
        ElMessage.success("实况已删除");
      } catch (e) {
        if (e !== "cancel") {
          if (snapshot) liveAssets.value.splice(index, 0, snapshot);
          ElMessage.error("删除失败");
        }
      }
    };
    const folderPath = ref([]);
    const shareOptions = reactive({
      allowDownload: true,
      allowPreview: true,
      ttlPreset: "24h",
      ttlHours: 24
    });
    const folderForm = reactive({ name: "" });
    const folderRules = {
      name: [
        { required: true, message: "请输入文件夹名称", trigger: "blur" },
        {
          min: 1,
          max: 50,
          message: "文件夹名称长度应在1-50个字符之间",
          trigger: "blur"
        }
      ]
    };
    const shareCreating = ref(false);
    const shareToken = ref(null);
    const shareStatus = ref(null);
    let sharePoller = null;
    const canCopyShare = computed(
      () => !!shareUrl.value && !!shareStatus.value && shareStatus.value.status === "approved"
    );
    const shareStatusText = computed(() => {
      if (!shareStatus.value) return "";
      const s = shareStatus.value.status;
      if (s === "pending_review") return "审核中";
      if (s === "approved") return "已通过";
      if (s === "rejected") return "未通过";
      return s;
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_input = ElInput;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      const _component_el_tooltip = ElTooltip;
      const _component_el_button_group = ElButtonGroup;
      const _component_el_breadcrumb_item = ElBreadcrumbItem;
      const _component_el_breadcrumb = ElBreadcrumb;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_table_column = ElTableColumn;
      const _component_el_tag = ElTag;
      const _component_el_table = ElTable;
      const _component_el_pagination = ElPagination;
      const _component_el_dialog = ElDialog;
      const _component_el_progress = ElProgress;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_input_number = ElInputNumber;
      const _component_el_form_item = ElFormItem;
      return openBlock(), createElementBlock(Fragment, null, [
        createBaseVNode("div", _hoisted_1, [
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("div", _hoisted_3, [
              createBaseVNode("div", _hoisted_4, [
                createVNode(_component_el_button, {
                  type: "primary",
                  onClick: _cache[0] || (_cache[0] = ($event) => showUploadDialog.value = true),
                  class: "action-btn"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(upload_default))
                      ]),
                      _: 1
                    }),
                    _cache[44] || (_cache[44] = createBaseVNode("span", null, "上传", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  onClick: _cache[1] || (_cache[1] = ($event) => showCreateFolderDialog.value = true),
                  class: "action-btn"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(folder_add_default))
                      ]),
                      _: 1
                    }),
                    _cache[45] || (_cache[45] = createBaseVNode("span", null, "新建", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  onClick: refreshFiles,
                  class: "action-btn"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(refresh_default))
                      ]),
                      _: 1
                    }),
                    _cache[46] || (_cache[46] = createBaseVNode("span", null, "刷新", -1))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_5, [
                createVNode(_component_el_input, {
                  modelValue: searchQuery.value,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => searchQuery.value = $event),
                  placeholder: "搜索文件...",
                  clearable: "",
                  onInput: handleSearch,
                  size: "small",
                  class: "search-input"
                }, {
                  prefix: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(search_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"]),
                createVNode(_component_el_dropdown, {
                  onCommand: handleSortChange,
                  class: "sort-dropdown"
                }, {
                  dropdown: withCtx(() => [
                    createVNode(_component_el_dropdown_menu, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_dropdown_item, { command: "name" }, {
                          default: withCtx(() => [..._cache[48] || (_cache[48] = [
                            createTextVNode("按名称", -1)
                          ])]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, { command: "size" }, {
                          default: withCtx(() => [..._cache[49] || (_cache[49] = [
                            createTextVNode("按大小", -1)
                          ])]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, { command: "date" }, {
                          default: withCtx(() => [..._cache[50] || (_cache[50] = [
                            createTextVNode("按时间", -1)
                          ])]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      size: "small",
                      class: "sort-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(sort_default))
                          ]),
                          _: 1
                        }),
                        _cache[47] || (_cache[47] = createBaseVNode("span", null, "排序", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_6, [
                createVNode(_component_el_button, {
                  size: "small",
                  type: onlyLive.value ? "primary" : "",
                  class: "filter-live-btn",
                  onClick: toggleOnlyLive,
                  round: ""
                }, {
                  default: withCtx(() => [..._cache[51] || (_cache[51] = [
                    createTextVNode(" 仅实况 ", -1)
                  ])]),
                  _: 1
                }, 8, ["type"]),
                createVNode(_component_el_button_group, { class: "view-toggle" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_tooltip, {
                      content: "网格视图",
                      placement: "bottom"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: viewMode.value === "grid" ? "primary" : "",
                          onClick: _cache[3] || (_cache[3] = ($event) => viewMode.value = "grid"),
                          size: "small",
                          class: "view-btn"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(grid_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["type"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_tooltip, {
                      content: "列表视图",
                      placement: "bottom"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: viewMode.value === "list" ? "primary" : "",
                          onClick: _cache[4] || (_cache[4] = ($event) => viewMode.value = "list"),
                          size: "small",
                          class: "view-btn"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(list_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["type"])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                selectedFiles.value.length > 0 ? (openBlock(), createBlock(_component_el_button_group, {
                  key: 0,
                  class: "batch-actions"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      onClick: batchDownload,
                      size: "small",
                      class: "batch-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(download_default))
                          ]),
                          _: 1
                        }),
                        _cache[52] || (_cache[52] = createBaseVNode("span", null, "下载", -1))
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_button, {
                      onClick: batchDelete,
                      size: "small",
                      type: "danger",
                      class: "batch-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(delete_default))
                          ]),
                          _: 1
                        }),
                        _cache[53] || (_cache[53] = createBaseVNode("span", null, "删除", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_7, [
            createBaseVNode("div", _hoisted_8, [
              createVNode(_component_el_button, {
                type: "primary",
                onClick: _cache[5] || (_cache[5] = ($event) => showUploadDialog.value = true),
                class: "mobile-upload-btn"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(upload_default))
                    ]),
                    _: 1
                  }),
                  _cache[54] || (_cache[54] = createBaseVNode("span", null, "上传", -1))
                ]),
                _: 1
              }),
              createVNode(_component_el_button, {
                onClick: _cache[6] || (_cache[6] = ($event) => showCreateFolderDialog.value = true),
                class: "mobile-folder-btn"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(folder_add_default))
                    ]),
                    _: 1
                  }),
                  _cache[55] || (_cache[55] = createBaseVNode("span", null, "新建", -1))
                ]),
                _: 1
              }),
              createVNode(_component_el_button, {
                onClick: refreshFiles,
                class: "mobile-refresh-btn"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(refresh_default))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("div", _hoisted_10, [
                createVNode(_component_el_input, {
                  modelValue: searchQuery.value,
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => searchQuery.value = $event),
                  placeholder: "搜索文件...",
                  clearable: "",
                  onInput: handleSearch,
                  size: "small",
                  class: "mobile-search-input"
                }, {
                  prefix: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(search_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              createBaseVNode("div", _hoisted_11, [
                createVNode(_component_el_dropdown, {
                  onCommand: handleSortChange,
                  class: "mobile-sort-dropdown",
                  trigger: "click"
                }, {
                  dropdown: withCtx(() => [
                    createVNode(_component_el_dropdown_menu, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_dropdown_item, { command: "name" }, {
                          default: withCtx(() => [..._cache[56] || (_cache[56] = [
                            createTextVNode("按名称", -1)
                          ])]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, { command: "size" }, {
                          default: withCtx(() => [..._cache[57] || (_cache[57] = [
                            createTextVNode("按大小", -1)
                          ])]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, { command: "date" }, {
                          default: withCtx(() => [..._cache[58] || (_cache[58] = [
                            createTextVNode("按时间", -1)
                          ])]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      size: "small",
                      class: "mobile-sort-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(sort_default))
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button_group, { class: "mobile-view-toggle" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: viewMode.value === "grid" ? "primary" : "",
                      onClick: _cache[8] || (_cache[8] = ($event) => viewMode.value = "grid"),
                      size: "small",
                      class: "mobile-view-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(grid_default))
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["type"]),
                    createVNode(_component_el_button, {
                      type: viewMode.value === "list" ? "primary" : "",
                      onClick: _cache[9] || (_cache[9] = ($event) => viewMode.value = "list"),
                      size: "small",
                      class: "mobile-view-btn"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(list_default))
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["type"])
                  ]),
                  _: 1
                })
              ])
            ]),
            selectedFiles.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_12, [
              createBaseVNode("div", _hoisted_13, "已选择 " + toDisplayString(selectedFiles.value.length) + " 个项目", 1),
              createBaseVNode("div", _hoisted_14, [
                createVNode(_component_el_button, {
                  onClick: batchDownload,
                  size: "small",
                  class: "mobile-batch-btn"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(download_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  onClick: batchDelete,
                  size: "small",
                  type: "danger",
                  class: "mobile-batch-btn"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ])
            ])) : createCommentVNode("", true)
          ])
        ]),
        unref(filesStore).currentFolder ? (openBlock(), createElementBlock("div", _hoisted_15, [
          createVNode(_component_el_breadcrumb, { separator: "/" }, {
            default: withCtx(() => [
              createVNode(_component_el_breadcrumb_item, null, {
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "text",
                    onClick: goToRootFolder,
                    class: "breadcrumb-btn"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(house_default))
                        ]),
                        _: 1
                      }),
                      _cache[59] || (_cache[59] = createTextVNode(" 根目录 ", -1))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              (openBlock(true), createElementBlock(Fragment, null, renderList(folderPath.value, (folder, index2) => {
                return openBlock(), createBlock(_component_el_breadcrumb_item, {
                  key: folder.id
                }, {
                  default: withCtx(() => [
                    index2 < folderPath.value.length - 1 ? (openBlock(), createBlock(_component_el_button, {
                      key: 0,
                      type: "text",
                      onClick: ($event) => goToFolder(folder.id),
                      class: "breadcrumb-btn"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(folder.name), 1)
                      ]),
                      _: 2
                    }, 1032, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_16, toDisplayString(folder.name), 1))
                  ]),
                  _: 2
                }, 1024);
              }), 128))
            ]),
            _: 1
          })
        ])) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_17, [
          allItems.value.length === 0 && !unref(filesStore).loading ? (openBlock(), createElementBlock("div", _hoisted_18, [
            createBaseVNode("div", _hoisted_19, [
              createVNode(_component_el_icon, { class: "empty-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(picture_default))
                ]),
                _: 1
              }),
              _cache[61] || (_cache[61] = createBaseVNode("h3", { class: "empty-title" }, "暂无文件", -1)),
              _cache[62] || (_cache[62] = createBaseVNode("p", { class: "empty-description" }, "上传您的第一张图片或视频开始使用", -1)),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: _cache[10] || (_cache[10] = ($event) => showUploadDialog.value = true)
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(upload_default))
                    ]),
                    _: 1
                  }),
                  _cache[60] || (_cache[60] = createBaseVNode("span", null, "上传文件", -1))
                ]),
                _: 1
              })
            ])
          ])) : unref(filesStore).loading ? (openBlock(), createElementBlock("div", _hoisted_20, [
            createVNode(_component_el_icon, { class: "loading-icon" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            }),
            _cache[63] || (_cache[63] = createBaseVNode("p", { class: "loading-text" }, "正在加载文件...", -1))
          ])) : viewMode.value === "grid" && onlyLive.value ? (openBlock(), createBlock(Transition, {
            key: 2,
            name: "fade-fast",
            mode: "out-in"
          }, {
            default: withCtx(() => [
              (openBlock(), createElementBlock("div", {
                class: "file-grid",
                key: `live-${unref(filesStore).currentFolder || "root"}`
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(filteredLiveAssets.value, (asset) => {
                  return openBlock(), createElementBlock("div", {
                    key: asset.id,
                    class: normalizeClass(["file-card", {
                      selected: selectedFiles.value.includes(asset.id),
                      "is-live": true
                    }]),
                    onContextmenu: withModifiers(($event) => showCardActions({ id: asset.id, isFolder: false, isLive: true }), ["prevent"]),
                    "data-item-id": asset.id
                  }, [
                    createBaseVNode("div", {
                      class: "card-checkbox",
                      onClick: _cache[12] || (_cache[12] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchstart: _cache[13] || (_cache[13] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchend: _cache[14] || (_cache[14] = withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      createVNode(_component_el_checkbox, {
                        "model-value": selectedFiles.value.includes(asset.id),
                        onChange: () => toggleFileSelection(asset.id),
                        onClick: _cache[11] || (_cache[11] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 8, ["model-value", "onChange"])
                    ], 32),
                    createBaseVNode("div", {
                      class: "card-thumbnail",
                      onClick: ($event) => openLivePreview(asset)
                    }, [
                      createVNode(LiveMediaCard, {
                        asset,
                        autoplay: true,
                        onBgTheme: (t) => setLiveTheme(asset.id, t)
                      }, null, 8, ["asset", "onBgTheme"])
                    ], 8, _hoisted_22),
                    createBaseVNode("div", {
                      class: normalizeClass([
                        "card-info",
                        liveTheme.value[asset.id] === "light" ? "theme-light" : "theme-dark"
                      ])
                    }, [
                      createBaseVNode("div", _hoisted_23, toDisplayString(asset.kind), 1),
                      createBaseVNode("div", _hoisted_24, [
                        createBaseVNode("span", null, [
                          createTextVNode(toDisplayString(asset.duration_ms ? Math.round(asset.duration_ms / 1e3) + "s" : "实况") + " ", 1),
                          getLiveCreatedAt(asset) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                            createTextVNode(" • " + toDisplayString(unref(formatTime)(getLiveCreatedAt(asset))), 1)
                          ], 64)) : createCommentVNode("", true)
                        ])
                      ])
                    ], 2),
                    createBaseVNode("div", {
                      class: "card-actions",
                      onTouchstart: _cache[15] || (_cache[15] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchmove: _cache[16] || (_cache[16] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchend: _cache[17] || (_cache[17] = withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      createVNode(_component_el_button, {
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => openLivePreview(asset), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(view_default))
                            ]),
                            _: 1
                          }),
                          _cache[64] || (_cache[64] = createBaseVNode("span", null, "预览", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_el_button, {
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => downloadLiveOriginal(asset), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(download_default))
                            ]),
                            _: 1
                          }),
                          _cache[65] || (_cache[65] = createBaseVNode("span", null, "下载原件", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_el_button, {
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => deleteLiveAsset(asset.id), ["stop"]),
                        class: "action-btn danger"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(delete_default))
                            ]),
                            _: 1
                          }),
                          _cache[66] || (_cache[66] = createBaseVNode("span", null, "删除", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ], 32)
                  ], 42, _hoisted_21);
                }), 128))
              ]))
            ]),
            _: 1
          })) : viewMode.value === "grid" ? (openBlock(), createBlock(Transition, {
            key: 3,
            name: "fade-fast",
            mode: "out-in"
          }, {
            default: withCtx(() => [
              (openBlock(), createElementBlock("div", {
                class: "file-grid",
                key: `grid-${unref(filesStore).currentFolder || "root"}`
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(paginatedFiles.value, (item) => {
                  var _a, _b, _c;
                  return openBlock(), createElementBlock("div", {
                    key: item.id,
                    class: normalizeClass(["file-card", {
                      selected: selectedFiles.value.includes(item.id),
                      "folder-card": item.isFolder,
                      "file-body-card": !item.isFolder && !item.isLive,
                      "long-pressed": longPressedCards.value.has(item.id),
                      "is-live": item.isLive
                    }]),
                    onClick: ($event) => handleGridCardClick(item, $event),
                    onTouchstart: handleTouchStart,
                    onTouchmove: handleTouchMove,
                    onTouchend: (event) => handleTouchEnd(event, item),
                    onContextmenu: withModifiers(($event) => showCardActions(item), ["prevent"]),
                    onMousedown: (event) => handleMouseDown(event, item),
                    onMouseup: (event) => handleMouseUp(event, item),
                    "data-item-id": item.id
                  }, [
                    createBaseVNode("div", {
                      class: "card-checkbox",
                      onClick: _cache[19] || (_cache[19] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchstart: _cache[20] || (_cache[20] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchend: _cache[21] || (_cache[21] = withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      createVNode(_component_el_checkbox, {
                        "model-value": selectedFiles.value.includes(item.id),
                        onChange: () => toggleFileSelection(item.id),
                        onClick: _cache[18] || (_cache[18] = withModifiers(() => {
                        }, ["stop"]))
                      }, null, 8, ["model-value", "onChange"])
                    ], 32),
                    item.isFolder ? (openBlock(), createElementBlock("div", _hoisted_26, [
                      createBaseVNode("div", _hoisted_27, [
                        shouldShowFolderCover(item) ? (openBlock(), createElementBlock("img", {
                          key: 0,
                          class: "folder-cover-image",
                          src: getFolderCoverUrl(item),
                          loading: "lazy",
                          decoding: "async",
                          alt: "",
                          onError: ($event) => onFolderCoverImgError(item.cover_file_id)
                        }, null, 40, _hoisted_28)) : (openBlock(), createElementBlock("div", _hoisted_29, [
                          createVNode(_component_el_icon, { class: "folder-icon" }, {
                            default: withCtx(() => [
                              createVNode(unref(folder_default))
                            ]),
                            _: 1
                          })
                        ])),
                        shouldShowFolderCover(item) ? (openBlock(), createElementBlock("div", _hoisted_30)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("div", _hoisted_31, [
                        createBaseVNode("div", {
                          class: "file-name",
                          title: item.original_name
                        }, toDisplayString(item.original_name), 9, _hoisted_32),
                        _cache[67] || (_cache[67] = createBaseVNode("div", { class: "file-meta" }, [
                          createBaseVNode("span", null, "文件夹")
                        ], -1))
                      ])
                    ])) : !item.isLive ? (openBlock(), createElementBlock("div", _hoisted_33, [
                      createBaseVNode("div", _hoisted_34, [
                        createVNode(FileThumbnail, {
                          file: item,
                          size: "medium",
                          "uniform-tile": ""
                        }, null, 8, ["file"])
                      ]),
                      createBaseVNode("div", _hoisted_35, [
                        createBaseVNode("div", {
                          class: "file-name",
                          title: item.original_name
                        }, toDisplayString(item.original_name), 9, _hoisted_36),
                        createBaseVNode("div", _hoisted_37, [
                          createBaseVNode("span", null, toDisplayString(unref(formatFileSize)(item.file_size)) + " • " + toDisplayString(unref(formatTime)(item.created_at)), 1)
                        ])
                      ])
                    ])) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                      createBaseVNode("div", _hoisted_38, [
                        createVNode(LiveMediaCard, {
                          asset: item.liveAsset,
                          autoplay: true,
                          onBgTheme: (t) => setLiveTheme(item.liveAsset.id, t)
                        }, null, 8, ["asset", "onBgTheme"])
                      ]),
                      createBaseVNode("div", {
                        class: normalizeClass([
                          "card-info",
                          liveTheme.value[item.liveAsset.id] === "light" ? "theme-light" : "theme-dark"
                        ])
                      }, [
                        createBaseVNode("div", {
                          class: "file-name",
                          title: item.original_name
                        }, toDisplayString(((_a = item.liveAsset) == null ? void 0 : _a.kind) || "实况"), 9, _hoisted_39),
                        createBaseVNode("div", _hoisted_40, [
                          createBaseVNode("span", null, [
                            createTextVNode(toDisplayString(((_b = item.liveAsset) == null ? void 0 : _b.duration_ms) ? Math.round(item.liveAsset.duration_ms / 1e3) + "s" : "实况") + " ", 1),
                            ((_c = item.liveAsset) == null ? void 0 : _c.created_at) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                              createTextVNode(" • " + toDisplayString(unref(formatTime)(item.liveAsset.created_at)), 1)
                            ], 64)) : createCommentVNode("", true)
                          ])
                        ])
                      ], 2)
                    ], 64)),
                    createBaseVNode("div", {
                      class: "card-actions",
                      onTouchstart: _cache[22] || (_cache[22] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchmove: _cache[23] || (_cache[23] = withModifiers(() => {
                      }, ["stop"])),
                      onTouchend: _cache[24] || (_cache[24] = withModifiers(() => {
                      }, ["stop"]))
                    }, [
                      !item.isFolder && !item.isLive ? (openBlock(), createBlock(_component_el_button, {
                        key: 0,
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => downloadFile$1(item), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(download_default))
                            ]),
                            _: 1
                          }),
                          _cache[68] || (_cache[68] = createBaseVNode("span", null, "下载", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : item.isLive ? (openBlock(), createBlock(_component_el_button, {
                        key: 1,
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => downloadLiveOriginal(item.liveAsset), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(download_default))
                            ]),
                            _: 1
                          }),
                          _cache[69] || (_cache[69] = createBaseVNode("span", null, "下载原件", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : createCommentVNode("", true),
                      unref(systemStore).sharingEnabled && !item.isFolder && !item.isLive ? (openBlock(), createBlock(_component_el_button, {
                        key: 2,
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => shareFileAction(item), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(share_default))
                            ]),
                            _: 1
                          }),
                          _cache[70] || (_cache[70] = createBaseVNode("span", null, "分享", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : createCommentVNode("", true),
                      createVNode(_component_el_button, {
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => renameItem(item), ["stop"]),
                        class: "action-btn"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(edit_default))
                            ]),
                            _: 1
                          }),
                          _cache[71] || (_cache[71] = createBaseVNode("span", null, "重命名", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_el_button, {
                        type: "text",
                        size: "small",
                        onClick: withModifiers(($event) => deleteItem(item), ["stop"]),
                        class: "action-btn danger"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(delete_default))
                            ]),
                            _: 1
                          }),
                          _cache[72] || (_cache[72] = createBaseVNode("span", null, "删除", -1))
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ], 32)
                  ], 42, _hoisted_25);
                }), 128))
              ]))
            ]),
            _: 1
          })) : viewMode.value === "list" ? (openBlock(), createBlock(Transition, {
            key: 4,
            name: "fade-fast",
            mode: "out-in"
          }, {
            default: withCtx(() => [
              (openBlock(), createElementBlock("div", {
                class: "file-list",
                key: `list-${unref(filesStore).currentFolder || "root"}`
              }, [
                createVNode(_component_el_table, {
                  data: paginatedFiles.value,
                  onRowClick: handleItemClick,
                  onSelectionChange: handleSelectionChange,
                  "row-class-name": getRowClassName
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_table_column, {
                      type: "selection",
                      width: "55"
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "original_name",
                      label: "名称",
                      "min-width": "200"
                    }, {
                      default: withCtx(({ row }) => [
                        createBaseVNode("div", _hoisted_41, [
                          createVNode(_component_el_icon, { class: "file-type-icon" }, {
                            default: withCtx(() => [
                              row.isFolder ? (openBlock(), createBlock(unref(folder_default), { key: 0 })) : row.file_type === "image" ? (openBlock(), createBlock(unref(picture_default), { key: 1 })) : (openBlock(), createBlock(unref(video_play_default), { key: 2 }))
                            ]),
                            _: 2
                          }, 1024),
                          createBaseVNode("span", null, toDisplayString(row.original_name), 1),
                          !row.isFolder && row.file_type === "image" && row.live_video_id ? (openBlock(), createBlock(_component_el_tag, {
                            key: 0,
                            size: "small",
                            type: "info",
                            class: "live-inline-tag"
                          }, {
                            default: withCtx(() => [..._cache[73] || (_cache[73] = [
                              createTextVNode("LIVE", -1)
                            ])]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "file_size",
                      label: "大小",
                      width: "120"
                    }, {
                      default: withCtx(({ row }) => [
                        row.isFolder ? (openBlock(), createElementBlock("span", _hoisted_42, "-")) : (openBlock(), createElementBlock("span", _hoisted_43, toDisplayString(unref(formatFileSize)(row.file_size)), 1))
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "created_at",
                      label: "创建时间",
                      width: "180"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(unref(formatTime)(row.created_at)), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "操作",
                      width: "200",
                      fixed: "right"
                    }, {
                      default: withCtx(({ row }) => [
                        createBaseVNode("div", _hoisted_44, [
                          !row.isFolder ? (openBlock(), createBlock(_component_el_button, {
                            key: 0,
                            type: "text",
                            size: "small",
                            onClick: ($event) => downloadFile$1(row),
                            class: "action-btn"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(download_default))
                                ]),
                                _: 1
                              }),
                              _cache[74] || (_cache[74] = createTextVNode(" 下载 ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : createCommentVNode("", true),
                          unref(systemStore).sharingEnabled && !row.isFolder ? (openBlock(), createBlock(_component_el_button, {
                            key: 1,
                            type: "text",
                            size: "small",
                            onClick: ($event) => shareFileAction(row),
                            class: "action-btn"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(share_default))
                                ]),
                                _: 1
                              }),
                              _cache[75] || (_cache[75] = createTextVNode(" 分享 ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : createCommentVNode("", true),
                          createVNode(_component_el_button, {
                            type: "text",
                            size: "small",
                            onClick: ($event) => renameItem(row),
                            class: "action-btn"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(edit_default))
                                ]),
                                _: 1
                              }),
                              _cache[76] || (_cache[76] = createTextVNode(" 重命名 ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          createVNode(_component_el_button, {
                            type: "text",
                            size: "small",
                            onClick: ($event) => deleteItem(row),
                            class: "action-btn danger"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(delete_default))
                                ]),
                                _: 1
                              }),
                              _cache[77] || (_cache[77] = createTextVNode(" 删除 ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["data"])
              ]))
            ]),
            _: 1
          })) : createCommentVNode("", true),
          allItems.value.length > 0 && totalPages.value > 1 ? (openBlock(), createElementBlock("div", _hoisted_45, [
            createVNode(_component_el_pagination, {
              "current-page": currentPage.value,
              "onUpdate:currentPage": _cache[25] || (_cache[25] = ($event) => currentPage.value = $event),
              "page-size": pageSize.value,
              total: allItems.value.length,
              layout: "prev, pager, next, total",
              onCurrentChange: handlePageChange
            }, null, 8, ["current-page", "page-size", "total"])
          ])) : createCommentVNode("", true)
        ]),
        showLiveFullscreen.value ? (openBlock(), createBlock(LiveMediaFullscreen, {
          key: 1,
          visible: showLiveFullscreen.value,
          "onUpdate:visible": _cache[26] || (_cache[26] = ($event) => showLiveFullscreen.value = $event),
          asset: currentLiveAsset.value
        }, null, 8, ["visible", "asset"])) : createCommentVNode("", true),
        showLivePreview.value ? (openBlock(), createBlock(LiveMediaPreview, {
          key: 2,
          modelValue: showLivePreview.value,
          "onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => showLivePreview.value = $event),
          asset: currentLiveAsset.value,
          onFullscreen: openLiveFullscreen
        }, null, 8, ["modelValue", "asset"])) : createCommentVNode("", true),
        createVNode(_component_el_dialog, {
          modelValue: showUploadDialog.value,
          "onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => showUploadDialog.value = $event),
          title: "上传文件",
          width: isMobile.value ? "95%" : "600px",
          "close-on-click-modal": true,
          class: normalizeClass({ "mobile-upload-dialog": isMobile.value }),
          "modal-class": isMobile.value ? "mobile-modal" : ""
        }, {
          default: withCtx(() => [
            createVNode(FileUploader, { onUploadSuccess: handleUploadSuccess })
          ]),
          _: 1
        }, 8, ["modelValue", "width", "class", "modal-class"]),
        createVNode(Transition, { name: "slide-up" }, {
          default: withCtx(() => [
            !showUploadDialog.value && globalBarVisible.value ? (openBlock(), createElementBlock("div", _hoisted_46, [
              createBaseVNode("div", _hoisted_47, [
                createBaseVNode("span", _hoisted_48, [
                  createVNode(_component_el_icon, { class: "gub-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(upload_default))
                    ]),
                    _: 1
                  }),
                  createTextVNode(" " + toDisplayString(unref(filesStore).uploadStats.error > 0 ? `完成 · ${unref(filesStore).uploadStats.success} 成功，${unref(filesStore).uploadStats.error} 失败` : unref(filesStore).uploadItems.every((i) => i.status === "success") ? `已完成 · ${unref(filesStore).uploadStats.success} 个文件` : `上传中 · ${unref(filesStore).uploadStats.success}/${unref(filesStore).uploadItems.length} 完成`), 1)
                ]),
                createVNode(_component_el_button, {
                  size: "small",
                  type: "text",
                  onClick: _cache[29] || (_cache[29] = ($event) => showUploadDialog.value = true)
                }, {
                  default: withCtx(() => [..._cache[78] || (_cache[78] = [
                    createTextVNode("查看详情", -1)
                  ])]),
                  _: 1
                })
              ]),
              createVNode(_component_el_progress, {
                percentage: globalUploadPercent.value,
                "stroke-width": 4,
                "show-text": false,
                color: globalUploadColor.value
              }, null, 8, ["percentage", "color"])
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        }),
        createVNode(EnhancedPreviewDialog, {
          modelValue: showPreviewDialog.value,
          "onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => showPreviewDialog.value = $event),
          file: previewFile.value,
          files: filteredFiles.value,
          "initial-index": previewFileIndex.value,
          onFileDeleted: handleFileDeleted,
          onFileChange: handlePreviewFileChange,
          onTouchstart: handlePreviewTouchStart,
          onTouchend: handlePreviewTouchEnd,
          onTouchmove: handlePreviewTouchMove
        }, null, 8, ["modelValue", "file", "files", "initial-index"]),
        createVNode(FolderDetailsDialog, {
          modelValue: showFolderDetailsDialog.value,
          "onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => showFolderDetailsDialog.value = $event),
          folder: folderDetails.value,
          "files-count": folderFilesCount.value,
          "subfolders-count": folderSubfoldersCount.value,
          "total-size": folderTotalSize.value,
          path: folderPath.value,
          onEnter: handleEnterFolderFromDetails,
          onRename: _cache[32] || (_cache[32] = (f) => renameItem({ ...f, isFolder: true })),
          onDelete: _cache[33] || (_cache[33] = (id) => id && deleteItem({ id, isFolder: true }))
        }, null, 8, ["modelValue", "folder", "files-count", "subfolders-count", "total-size", "path"]),
        createVNode(_component_el_dialog, {
          modelValue: showShareDialog.value,
          "onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => showShareDialog.value = $event),
          title: "分享文件",
          width: "500px"
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[39] || (_cache[39] = ($event) => showShareDialog.value = false)
            }, {
              default: withCtx(() => [..._cache[84] || (_cache[84] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: generateShareLink,
              loading: shareCreating.value
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(shareStatus.value ? "重新提交" : "生成链接"), 1)
              ]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => {
            var _a, _b;
            return [
              createBaseVNode("div", _hoisted_49, [
                createBaseVNode("div", _hoisted_50, [
                  createBaseVNode("h4", null, toDisplayString((_a = shareFile.value) == null ? void 0 : _a.original_name), 1),
                  createBaseVNode("p", null, "文件大小: " + toDisplayString(unref(formatFileSize)(((_b = shareFile.value) == null ? void 0 : _b.file_size) || 0)), 1)
                ]),
                createBaseVNode("div", _hoisted_51, [
                  createVNode(_component_el_input, {
                    modelValue: shareUrl.value,
                    "onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => shareUrl.value = $event),
                    readonly: "",
                    placeholder: "生成分享链接..."
                  }, {
                    append: withCtx(() => [
                      createVNode(_component_el_button, {
                        onClick: copyShareUrl,
                        disabled: !canCopyShare.value
                      }, {
                        default: withCtx(() => [..._cache[79] || (_cache[79] = [
                          createTextVNode("复制", -1)
                        ])]),
                        _: 1
                      }, 8, ["disabled"])
                    ]),
                    _: 1
                  }, 8, ["modelValue"]),
                  shareStatus.value && shareStatus.value.status !== "approved" ? (openBlock(), createElementBlock("div", _hoisted_52, [
                    createBaseVNode("div", _hoisted_53, [
                      _cache[80] || (_cache[80] = createBaseVNode("span", { class: "label" }, "审核状态：", -1)),
                      createBaseVNode("span", {
                        class: normalizeClass(["value", shareStatus.value.status])
                      }, toDisplayString(shareStatusText.value), 3)
                    ]),
                    createVNode(_component_el_progress, {
                      percentage: shareStatus.value.review_progress || 0,
                      "stroke-width": 8,
                      "show-text": true
                    }, null, 8, ["percentage"]),
                    shareStatus.value.review_reason ? (openBlock(), createElementBlock("div", _hoisted_54, toDisplayString(shareStatus.value.review_reason), 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ]),
                createBaseVNode("div", _hoisted_55, [
                  createBaseVNode("div", _hoisted_56, [
                    createVNode(_component_el_checkbox, {
                      modelValue: shareOptions.allowDownload,
                      "onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => shareOptions.allowDownload = $event)
                    }, {
                      default: withCtx(() => [..._cache[81] || (_cache[81] = [
                        createTextVNode("允许下载", -1)
                      ])]),
                      _: 1
                    }, 8, ["modelValue"]),
                    createVNode(_component_el_checkbox, {
                      modelValue: shareOptions.allowPreview,
                      "onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => shareOptions.allowPreview = $event)
                    }, {
                      default: withCtx(() => [..._cache[82] || (_cache[82] = [
                        createTextVNode("允许预览", -1)
                      ])]),
                      _: 1
                    }, 8, ["modelValue"])
                  ]),
                  createBaseVNode("div", _hoisted_57, [
                    _cache[83] || (_cache[83] = createBaseVNode("span", { class: "ttl-label" }, "生存时间", -1)),
                    createVNode(_component_el_select, {
                      modelValue: shareOptions.ttlPreset,
                      "onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => shareOptions.ttlPreset = $event),
                      placeholder: "请选择"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "1 小时",
                          value: "1h"
                        }),
                        createVNode(_component_el_option, {
                          label: "24 小时",
                          value: "24h"
                        }),
                        createVNode(_component_el_option, {
                          label: "7 天",
                          value: "7d"
                        }),
                        createVNode(_component_el_option, {
                          label: "自定义(小时)",
                          value: "custom"
                        }),
                        createVNode(_component_el_option, {
                          label: "永不过期",
                          value: "never"
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"]),
                    shareOptions.ttlPreset === "custom" ? (openBlock(), createBlock(_component_el_input_number, {
                      key: 0,
                      modelValue: shareOptions.ttlHours,
                      "onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => shareOptions.ttlHours = $event),
                      min: 1,
                      max: 24 * 365
                    }, null, 8, ["modelValue"])) : createCommentVNode("", true)
                  ])
                ])
              ])
            ];
          }),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showCreateFolderDialog.value,
          "onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => showCreateFolderDialog.value = $event),
          title: "新建文件夹",
          width: isMobile.value ? "90%" : "400px",
          class: normalizeClass({ "mobile-folder-dialog": isMobile.value }),
          "modal-class": isMobile.value ? "mobile-modal" : ""
        }, {
          footer: withCtx(() => [
            createBaseVNode("div", {
              class: normalizeClass({ "mobile-footer": isMobile.value })
            }, [
              createVNode(_component_el_button, {
                onClick: _cache[42] || (_cache[42] = ($event) => showCreateFolderDialog.value = false),
                class: normalizeClass({ "mobile-btn": isMobile.value })
              }, {
                default: withCtx(() => [..._cache[85] || (_cache[85] = [
                  createTextVNode("取消", -1)
                ])]),
                _: 1
              }, 8, ["class"]),
              createVNode(_component_el_button, {
                type: "primary",
                onClick: createFolder,
                class: normalizeClass({ "mobile-btn": isMobile.value })
              }, {
                default: withCtx(() => [..._cache[86] || (_cache[86] = [
                  createTextVNode("创建", -1)
                ])]),
                _: 1
              }, 8, ["class"])
            ], 2)
          ]),
          default: withCtx(() => [
            createVNode(unref(ElForm), {
              model: folderForm,
              rules: folderRules,
              ref_key: "folderFormRef",
              ref: folderFormRef
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { prop: "name" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: folderForm.name,
                      "onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => folderForm.name = $event),
                      placeholder: "请输入文件夹名称",
                      onKeyup: withKeys(createFolder, ["enter"]),
                      class: normalizeClass({ "mobile-input": isMobile.value })
                    }, null, 8, ["modelValue", "class"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"])
          ]),
          _: 1
        }, 8, ["modelValue", "width", "class", "modal-class"])
      ], 64);
    };
  }
});
const Files = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-af428c02"]]);
export {
  Files as default
};
//# sourceMappingURL=Files-DLteoGDL.js.map
