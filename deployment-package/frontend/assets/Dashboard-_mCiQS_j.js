import { u as useAuthStore, f as formatFileSize, j as getAvatarUrl, k as formatPercentage, a as api, l as getStorageUsageColor, _ as _export_sfc } from "./index-CMfjVKWh.js";
/* empty css                    */
/* empty css                  */
/* empty css                 */
/* empty css                  */
/* empty css                    */
/* empty css                   */
import { y as defineComponent, r as ref, c as computed, l as onMounted, U as onUnmounted, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, I as createBlock, L as createCommentVNode, E as normalizeClass, Q as Fragment, a6 as renderList, O as createTextVNode, az as useRouter, A as openBlock, D as normalizeStyle, M as resolveDynamicComponent } from "./vendor-DT2rKQnu.js";
import { p as picture_default, v as video_play_default, $ as circle_check_default, i as folder_default, a0 as ElAvatar, c as ElButton, a as ElIcon, a1 as ElCard, q as ElDialog, A as folder_opened_default, h as upload_default, J as folder_add_default, a2 as setting_default, a3 as trend_charts_default, z as ElProgress, a4 as ElAlert, a5 as pie_chart_default, a6 as ElEmpty, K as refresh_default, L as search_default, x as share_default, w as download_default, a7 as lightning_default, I as ElMessageBox, E as ElMessage } from "./element-CUyZSw-d.js";
import { u as useFilesStore, a as FileUploader, F as FilePreview } from "./FilePreview-nTgKnvxo.js";
/* empty css                   */
/* empty css                         */
/* empty css                   */
const _hoisted_1 = { class: "dashboard" };
const _hoisted_2 = { class: "welcome-section" };
const _hoisted_3 = { class: "welcome-main" };
const _hoisted_4 = { class: "welcome-header" };
const _hoisted_5 = { class: "user-avatar" };
const _hoisted_6 = { class: "welcome-text" };
const _hoisted_7 = { class: "welcome-title" };
const _hoisted_8 = { class: "welcome-subtitle" };
const _hoisted_9 = { class: "welcome-date" };
const _hoisted_10 = { class: "welcome-actions" };
const _hoisted_11 = { class: "welcome-stats" };
const _hoisted_12 = { class: "stat-item" };
const _hoisted_13 = { class: "stat-value" };
const _hoisted_14 = { class: "stat-item" };
const _hoisted_15 = { class: "stat-value" };
const _hoisted_16 = { class: "stat-item" };
const _hoisted_17 = { class: "stat-value" };
const _hoisted_18 = { class: "stats-grid stats-grid-desktop" };
const _hoisted_19 = { class: "stat-card image-card" };
const _hoisted_20 = { class: "card-header" };
const _hoisted_21 = { class: "stat-icon" };
const _hoisted_22 = { class: "stat-trend" };
const _hoisted_23 = { class: "stat-content" };
const _hoisted_24 = { class: "stat-number" };
const _hoisted_25 = { class: "stat-detail" };
const _hoisted_26 = { class: "stat-card video-card" };
const _hoisted_27 = { class: "card-header" };
const _hoisted_28 = { class: "stat-icon" };
const _hoisted_29 = { class: "stat-trend" };
const _hoisted_30 = { class: "stat-content" };
const _hoisted_31 = { class: "stat-number" };
const _hoisted_32 = { class: "stat-detail" };
const _hoisted_33 = { class: "stat-card motion-card" };
const _hoisted_34 = { class: "card-header" };
const _hoisted_35 = { class: "stat-icon" };
const _hoisted_36 = { class: "stat-trend" };
const _hoisted_37 = { class: "stat-content" };
const _hoisted_38 = { class: "stat-number" };
const _hoisted_39 = { class: "stat-detail" };
const _hoisted_40 = { class: "stat-card folder-card" };
const _hoisted_41 = { class: "card-header" };
const _hoisted_42 = { class: "stat-icon" };
const _hoisted_43 = { class: "stat-trend" };
const _hoisted_44 = { class: "stat-content" };
const _hoisted_45 = { class: "stat-number" };
const _hoisted_46 = { class: "stat-detail" };
const _hoisted_47 = { class: "arc-track" };
const _hoisted_48 = ["onClick"];
const _hoisted_49 = { class: "arc-card-inner" };
const _hoisted_50 = { class: "arc-card-header" };
const _hoisted_51 = { class: "arc-number" };
const _hoisted_52 = { class: "arc-label" };
const _hoisted_53 = { class: "arc-detail" };
const _hoisted_54 = { class: "arc-indicators" };
const _hoisted_55 = ["onClick"];
const _hoisted_56 = { class: "main-content" };
const _hoisted_57 = { class: "storage-section" };
const _hoisted_58 = { class: "card-header" };
const _hoisted_59 = { class: "header-left" };
const _hoisted_60 = { class: "header-actions" };
const _hoisted_61 = { class: "storage-content" };
const _hoisted_62 = { class: "storage-overview" };
const _hoisted_63 = { class: "storage-info" };
const _hoisted_64 = { class: "storage-text" };
const _hoisted_65 = { class: "used" };
const _hoisted_66 = { class: "total" };
const _hoisted_67 = { class: "storage-percent" };
const _hoisted_68 = { class: "storage-breakdown" };
const _hoisted_69 = { class: "breakdown-item" };
const _hoisted_70 = { class: "breakdown-icon image" };
const _hoisted_71 = { class: "breakdown-content" };
const _hoisted_72 = { class: "breakdown-value" };
const _hoisted_73 = { class: "breakdown-item" };
const _hoisted_74 = { class: "breakdown-icon video" };
const _hoisted_75 = { class: "breakdown-content" };
const _hoisted_76 = { class: "breakdown-value" };
const _hoisted_77 = { class: "breakdown-item" };
const _hoisted_78 = { class: "breakdown-icon motion" };
const _hoisted_79 = { class: "breakdown-content" };
const _hoisted_80 = { class: "breakdown-value" };
const _hoisted_81 = { class: "storage-tips" };
const _hoisted_82 = { class: "trend-section" };
const _hoisted_83 = { class: "card-header" };
const _hoisted_84 = { class: "header-left" };
const _hoisted_85 = { class: "header-actions" };
const _hoisted_86 = {
  key: 0,
  class: "trend-charts"
};
const _hoisted_87 = { class: "chart-container" };
const _hoisted_88 = { class: "chart-content" };
const _hoisted_89 = { class: "chart-bars" };
const _hoisted_90 = ["title"];
const _hoisted_91 = { class: "bar-value" };
const _hoisted_92 = { class: "chart-labels" };
const _hoisted_93 = { class: "chart-container" };
const _hoisted_94 = { class: "chart-content" };
const _hoisted_95 = { class: "chart-bars" };
const _hoisted_96 = ["title"];
const _hoisted_97 = { class: "bar-value" };
const _hoisted_98 = { class: "chart-labels" };
const _hoisted_99 = {
  key: 1,
  class: "empty-state"
};
const _hoisted_100 = { class: "quick-actions" };
const _hoisted_101 = { class: "card-header" };
const _hoisted_102 = { class: "header-left" };
const _hoisted_103 = { class: "actions-grid" };
const _hoisted_104 = { class: "action-icon" };
const _hoisted_105 = { class: "action-icon" };
const _hoisted_106 = { class: "action-icon" };
const _hoisted_107 = { class: "action-icon" };
const _hoisted_108 = { class: "action-icon" };
const _hoisted_109 = { class: "action-icon" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Dashboard",
  setup(__props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const filesStore = useFilesStore();
    const showUploadDialog = ref(false);
    const showPreviewDialog = ref(false);
    const previewFile = ref(null);
    const loadingTrends = ref(false);
    const carouselRef = ref(null);
    const currentArcIndex = ref(0);
    let touchStartX = 0;
    let touchStartY = 0;
    const statCards = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return [
        { key: "images", label: "图片文件", value: stats.value.imageCount, detail: formatFileSize(stats.value.imageSize), icon: picture_default, color: "#3b82f6", cls: "image-card", percentage: Number((_b = (_a = stats.value.changes) == null ? void 0 : _a.images) == null ? void 0 : _b.percentage) || 0 },
        { key: "videos", label: "视频文件", value: stats.value.videoCount, detail: formatFileSize(stats.value.videoSize), icon: video_play_default, color: "#ef4444", cls: "video-card", percentage: Number((_d = (_c = stats.value.changes) == null ? void 0 : _c.videos) == null ? void 0 : _d.percentage) || 0 },
        { key: "motion", label: "动图/实况", value: stats.value.motionCount || 0, detail: formatFileSize(stats.value.motionSize || 0), icon: circle_check_default, color: "#a855f7", cls: "motion-card", percentage: Number((_f = (_e = stats.value.changes) == null ? void 0 : _e.videos) == null ? void 0 : _f.percentage) || 0 },
        { key: "folders", label: "文件夹", value: stats.value.folderCount, detail: `${stats.value.totalFiles} 个文件`, icon: folder_default, color: "#10b981", cls: "folder-card", percentage: Number((_h = (_g = stats.value.changes) == null ? void 0 : _g.folders) == null ? void 0 : _h.percentage) || 0 }
      ];
    });
    const stats = ref({
      imageCount: 0,
      videoCount: 0,
      folderCount: 0,
      totalFiles: 0,
      totalSize: 0,
      imageSize: 0,
      videoSize: 0,
      motionCount: 0,
      motionSize: 0,
      changes: {
        files: { value: 0, percentage: 0 },
        size: { value: 0, percentage: 0 },
        images: { value: 0, percentage: 0 },
        videos: { value: 0, percentage: 0 },
        folders: { value: 0, percentage: 0 }
      },
      trends: []
    });
    const currentDate = computed(() => {
      const now = /* @__PURE__ */ new Date();
      return now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      });
    });
    const isMobile = computed(() => {
      return window.innerWidth <= 768;
    });
    const getStorageColor = (percentage) => {
      return getStorageUsageColor(percentage);
    };
    const goToFiles = () => {
      router.push("/");
    };
    const goToAdmin = () => {
      router.push("/admin");
    };
    const createNewFolder = async () => {
      try {
        const { value: folderName } = await ElMessageBox.prompt("请输入文件夹名称", "新建文件夹", {
          confirmButtonText: "创建",
          cancelButtonText: "取消",
          inputPattern: /^.{1,50}$/,
          inputErrorMessage: "文件夹名称长度应在1-50个字符之间"
        });
        if (folderName) {
          await filesStore.createFolder(folderName);
          ElMessage.success("文件夹创建成功");
        }
      } catch (error) {
      }
    };
    const handleUploadSuccess = () => {
      showUploadDialog.value = false;
      loadDashboardData();
    };
    const handleFileDeleted = (_fileId) => {
      showPreviewDialog.value = false;
      loadDashboardData();
    };
    const loadDashboardData = async () => {
      try {
        const response = await api.get("/files/stats");
        const data = response.data.data;
        stats.value = {
          imageCount: data.image_count || 0,
          videoCount: data.video_count || 0,
          folderCount: data.folder_count || 0,
          totalFiles: data.total_files || 0,
          totalSize: data.total_size || 0,
          imageSize: data.image_size || 0,
          videoSize: data.video_size || 0,
          motionCount: data.live_count || data.motion_count || 0,
          motionSize: data.motion_size || 0,
          changes: data.changes || {
            files: { value: 0, percentage: 0 },
            size: { value: 0, percentage: 0 },
            images: { value: 0, percentage: 0 },
            videos: { value: 0, percentage: 0 },
            folders: { value: 0, percentage: 0 }
          },
          trends: data.trends || []
        };
      } catch (error) {
        await loadLocalStats();
      }
    };
    const loadLocalStats = async () => {
      try {
        const response = await api.get("/files/stats");
        const data = response.data.data;
        stats.value = {
          imageCount: data.image_count || 0,
          videoCount: data.video_count || 0,
          folderCount: data.folder_count || 0,
          totalFiles: data.total_files || 0,
          totalSize: data.total_size || 0,
          imageSize: data.image_size || 0,
          videoSize: data.video_size || 0,
          motionCount: data.live_count || data.motion_count || 0,
          motionSize: data.motion_size || 0,
          changes: data.changes || {
            files: { value: 0, percentage: 0 },
            size: { value: 0, percentage: 0 },
            images: { value: 0, percentage: 0 },
            videos: { value: 0, percentage: 0 },
            folders: { value: 0, percentage: 0 }
          },
          trends: data.trends || []
        };
      } catch (error) {
        stats.value = {
          imageCount: 0,
          videoCount: 0,
          folderCount: 0,
          totalFiles: 0,
          totalSize: 0,
          imageSize: 0,
          videoSize: 0,
          motionCount: 0,
          motionSize: 0,
          changes: {
            files: { value: 0, percentage: 0 },
            size: { value: 0, percentage: 0 },
            images: { value: 0, percentage: 0 },
            videos: { value: 0, percentage: 0 },
            folders: { value: 0, percentage: 0 }
          },
          trends: []
        };
      }
    };
    const refreshTrends = async () => {
      loadingTrends.value = true;
      try {
        await loadDashboardData();
        ElMessage.success("趋势数据已刷新");
      } catch (error) {
        ElMessage.error("刷新趋势数据失败");
      } finally {
        loadingTrends.value = false;
      }
    };
    const getBarHeight = (value, type) => {
      if (!stats.value.trends.length) return 0;
      const values = stats.value.trends.map((trend) => {
        if (type === "files") return trend.total_files;
        if (type === "size") return trend.total_size;
        return 0;
      });
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      if (maxValue === minValue) return 50;
      return Math.max(10, (value - minValue) / (maxValue - minValue) * 80 + 10);
    };
    const formatTrendDate = (dateStr) => {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    };
    const handleArcTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleArcTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0 && currentArcIndex.value < statCards.value.length - 1) {
          currentArcIndex.value++;
        } else if (dx > 0 && currentArcIndex.value > 0) {
          currentArcIndex.value--;
        }
      }
    };
    onMounted(() => {
      loadDashboardData();
      const el = carouselRef.value;
      if (el) {
        el.addEventListener("touchstart", handleArcTouchStart, { passive: true });
        el.addEventListener("touchend", handleArcTouchEnd, { passive: true });
      }
    });
    onUnmounted(() => {
      const el = carouselRef.value;
      if (el) {
        el.removeEventListener("touchstart", handleArcTouchStart);
        el.removeEventListener("touchend", handleArcTouchEnd);
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H;
      const _component_el_avatar = ElAvatar;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_progress = ElProgress;
      const _component_el_alert = ElAlert;
      const _component_el_card = ElCard;
      const _component_el_empty = ElEmpty;
      const _component_el_dialog = ElDialog;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode("div", _hoisted_5, [
                createVNode(_component_el_avatar, {
                  size: 60,
                  src: unref(getAvatarUrl)((_a = unref(authStore).user) == null ? void 0 : _a.avatar_url)
                }, {
                  default: withCtx(() => {
                    var _a2, _b2;
                    return [
                      createTextVNode(toDisplayString((_b2 = (_a2 = unref(authStore).user) == null ? void 0 : _a2.username) == null ? void 0 : _b2.charAt(0).toUpperCase()), 1)
                    ];
                  }),
                  _: 1
                }, 8, ["src"])
              ]),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("h1", _hoisted_7, " 欢迎回来，" + toDisplayString((_b = unref(authStore).user) == null ? void 0 : _b.username) + "！ ", 1),
                createBaseVNode("p", _hoisted_8, [
                  createBaseVNode("span", _hoisted_9, "今天是 " + toDisplayString(currentDate.value), 1),
                  _cache[4] || (_cache[4] = createBaseVNode("span", { class: "welcome-meta" }, "让我们开始管理您的文件吧", -1))
                ])
              ])
            ]),
            createBaseVNode("div", _hoisted_10, [
              createVNode(_component_el_button, {
                type: "primary",
                size: "large",
                onClick: goToFiles,
                class: "action-btn primary"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(folder_opened_default))
                    ]),
                    _: 1
                  }),
                  _cache[5] || (_cache[5] = createTextVNode(" 浏览文件 ", -1))
                ]),
                _: 1
              }),
              createVNode(_component_el_button, {
                size: "large",
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
                  _cache[6] || (_cache[6] = createTextVNode(" 上传文件 ", -1))
                ]),
                _: 1
              }),
              createVNode(_component_el_button, {
                size: "large",
                onClick: createNewFolder,
                class: "action-btn"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(folder_add_default))
                    ]),
                    _: 1
                  }),
                  _cache[7] || (_cache[7] = createTextVNode(" 新建文件夹 ", -1))
                ]),
                _: 1
              }),
              unref(authStore).isAdmin ? (openBlock(), createBlock(_component_el_button, {
                key: 0,
                size: "large",
                onClick: goToAdmin,
                class: "action-btn admin-btn"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(setting_default))
                    ]),
                    _: 1
                  }),
                  _cache[8] || (_cache[8] = createTextVNode(" 管理控制台 ", -1))
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ])
          ]),
          createBaseVNode("div", _hoisted_11, [
            createBaseVNode("div", _hoisted_12, [
              createBaseVNode("span", _hoisted_13, toDisplayString(stats.value.totalFiles), 1),
              _cache[9] || (_cache[9] = createBaseVNode("span", { class: "stat-label" }, "总文件数", -1))
            ]),
            createBaseVNode("div", _hoisted_14, [
              createBaseVNode("span", _hoisted_15, toDisplayString(unref(formatFileSize)(stats.value.totalSize)), 1),
              _cache[10] || (_cache[10] = createBaseVNode("span", { class: "stat-label" }, "已使用空间", -1))
            ]),
            createBaseVNode("div", _hoisted_16, [
              createBaseVNode("span", _hoisted_17, toDisplayString(unref(formatPercentage)(unref(authStore).storageUsage)), 1),
              _cache[11] || (_cache[11] = createBaseVNode("span", { class: "stat-label" }, "使用率", -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_18, [
            createBaseVNode("div", _hoisted_19, [
              createBaseVNode("div", _hoisted_20, [
                createBaseVNode("div", _hoisted_21, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(picture_default))
                    ]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_22, [
                  createVNode(_component_el_icon, {
                    class: normalizeClass((Number((_d = (_c = stats.value.changes) == null ? void 0 : _c.images) == null ? void 0 : _d.percentage) || 0) >= 0 ? "trend-up" : "trend-down")
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(trend_charts_default))
                    ]),
                    _: 1
                  }, 8, ["class"]),
                  createBaseVNode("span", {
                    class: normalizeClass(["trend-text", (Number((_f = (_e = stats.value.changes) == null ? void 0 : _e.images) == null ? void 0 : _f.percentage) || 0) >= 0 ? "trend-positive" : "trend-negative"])
                  }, toDisplayString((Number((_h = (_g = stats.value.changes) == null ? void 0 : _g.images) == null ? void 0 : _h.percentage) || 0) >= 0 ? "+" : "") + toDisplayString((Number((_j = (_i = stats.value.changes) == null ? void 0 : _i.images) == null ? void 0 : _j.percentage) || 0).toFixed(1)) + "% ", 3)
                ])
              ]),
              createBaseVNode("div", _hoisted_23, [
                createBaseVNode("div", _hoisted_24, toDisplayString(stats.value.imageCount), 1),
                _cache[12] || (_cache[12] = createBaseVNode("div", { class: "stat-label" }, "图片文件", -1)),
                createBaseVNode("div", _hoisted_25, toDisplayString(unref(formatFileSize)(stats.value.imageSize)), 1)
              ])
            ]),
            createBaseVNode("div", _hoisted_26, [
              createBaseVNode("div", _hoisted_27, [
                createBaseVNode("div", _hoisted_28, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(video_play_default))
                    ]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_29, [
                  createVNode(_component_el_icon, {
                    class: normalizeClass((Number((_l = (_k = stats.value.changes) == null ? void 0 : _k.videos) == null ? void 0 : _l.percentage) || 0) >= 0 ? "trend-up" : "trend-down")
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(trend_charts_default))
                    ]),
                    _: 1
                  }, 8, ["class"]),
                  createBaseVNode("span", {
                    class: normalizeClass(["trend-text", (Number((_n = (_m = stats.value.changes) == null ? void 0 : _m.videos) == null ? void 0 : _n.percentage) || 0) >= 0 ? "trend-positive" : "trend-negative"])
                  }, toDisplayString((Number((_p = (_o = stats.value.changes) == null ? void 0 : _o.videos) == null ? void 0 : _p.percentage) || 0) >= 0 ? "+" : "") + toDisplayString((Number((_r = (_q = stats.value.changes) == null ? void 0 : _q.videos) == null ? void 0 : _r.percentage) || 0).toFixed(1)) + "% ", 3)
                ])
              ]),
              createBaseVNode("div", _hoisted_30, [
                createBaseVNode("div", _hoisted_31, toDisplayString(stats.value.videoCount), 1),
                _cache[13] || (_cache[13] = createBaseVNode("div", { class: "stat-label" }, "视频文件", -1)),
                createBaseVNode("div", _hoisted_32, toDisplayString(unref(formatFileSize)(stats.value.videoSize)), 1)
              ])
            ]),
            createBaseVNode("div", _hoisted_33, [
              createBaseVNode("div", _hoisted_34, [
                createBaseVNode("div", _hoisted_35, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(circle_check_default))
                    ]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_36, [
                  createVNode(_component_el_icon, {
                    class: normalizeClass((Number((_t = (_s = stats.value.changes) == null ? void 0 : _s.videos) == null ? void 0 : _t.percentage) || 0) >= 0 ? "trend-up" : "trend-down")
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(trend_charts_default))
                    ]),
                    _: 1
                  }, 8, ["class"]),
                  createBaseVNode("span", {
                    class: normalizeClass(["trend-text", (Number((_v = (_u = stats.value.changes) == null ? void 0 : _u.videos) == null ? void 0 : _v.percentage) || 0) >= 0 ? "trend-positive" : "trend-negative"])
                  }, toDisplayString((Number((_x = (_w = stats.value.changes) == null ? void 0 : _w.videos) == null ? void 0 : _x.percentage) || 0) >= 0 ? "+" : "") + toDisplayString((Number((_z = (_y = stats.value.changes) == null ? void 0 : _y.videos) == null ? void 0 : _z.percentage) || 0).toFixed(1)) + "% ", 3)
                ])
              ]),
              createBaseVNode("div", _hoisted_37, [
                createBaseVNode("div", _hoisted_38, toDisplayString(stats.value.motionCount || 0), 1),
                _cache[14] || (_cache[14] = createBaseVNode("div", { class: "stat-label" }, "动图/实况", -1)),
                createBaseVNode("div", _hoisted_39, toDisplayString(unref(formatFileSize)(stats.value.motionSize || 0)), 1)
              ])
            ]),
            createBaseVNode("div", _hoisted_40, [
              createBaseVNode("div", _hoisted_41, [
                createBaseVNode("div", _hoisted_42, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(folder_default))
                    ]),
                    _: 1
                  })
                ]),
                createBaseVNode("div", _hoisted_43, [
                  createVNode(_component_el_icon, {
                    class: normalizeClass((Number((_B = (_A = stats.value.changes) == null ? void 0 : _A.folders) == null ? void 0 : _B.percentage) || 0) >= 0 ? "trend-up" : "trend-down")
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(trend_charts_default))
                    ]),
                    _: 1
                  }, 8, ["class"]),
                  createBaseVNode("span", {
                    class: normalizeClass(["trend-text", (Number((_D = (_C = stats.value.changes) == null ? void 0 : _C.folders) == null ? void 0 : _D.percentage) || 0) >= 0 ? "trend-positive" : "trend-negative"])
                  }, toDisplayString((Number((_F = (_E = stats.value.changes) == null ? void 0 : _E.folders) == null ? void 0 : _F.percentage) || 0) >= 0 ? "+" : "") + toDisplayString((Number((_H = (_G = stats.value.changes) == null ? void 0 : _G.folders) == null ? void 0 : _H.percentage) || 0).toFixed(1)) + "% ", 3)
                ])
              ]),
              createBaseVNode("div", _hoisted_44, [
                createBaseVNode("div", _hoisted_45, toDisplayString(stats.value.folderCount), 1),
                _cache[15] || (_cache[15] = createBaseVNode("div", { class: "stat-label" }, "文件夹", -1)),
                createBaseVNode("div", _hoisted_46, toDisplayString(stats.value.totalFiles) + " 个文件", 1)
              ])
            ])
          ]),
          createBaseVNode("div", {
            class: "stats-arc-carousel",
            ref_key: "carouselRef",
            ref: carouselRef
          }, [
            createBaseVNode("div", _hoisted_47, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(statCards.value, (card, index) => {
                return openBlock(), createElementBlock("div", {
                  key: card.key,
                  class: normalizeClass([
                    "arc-card",
                    card.cls,
                    {
                      active: currentArcIndex.value === index,
                      [`left-${currentArcIndex.value - index}`]: currentArcIndex.value > index && currentArcIndex.value - index > 0 && currentArcIndex.value - index <= 3,
                      [`right-${index - currentArcIndex.value}`]: currentArcIndex.value < index && index - currentArcIndex.value > 0 && index - currentArcIndex.value <= 3
                    }
                  ]),
                  onClick: ($event) => currentArcIndex.value = index
                }, [
                  createBaseVNode("div", _hoisted_49, [
                    createBaseVNode("div", _hoisted_50, [
                      createBaseVNode("div", {
                        class: "arc-icon",
                        style: normalizeStyle({ color: card.color })
                      }, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            (openBlock(), createBlock(resolveDynamicComponent(card.icon)))
                          ]),
                          _: 2
                        }, 1024)
                      ], 4),
                      createBaseVNode("div", {
                        class: normalizeClass(["arc-trend", (card.percentage || 0) >= 0 ? "trend-positive" : "trend-negative"])
                      }, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(trend_charts_default))
                          ]),
                          _: 1
                        }),
                        createBaseVNode("span", null, toDisplayString((card.percentage || 0) >= 0 ? "+" : "") + toDisplayString((card.percentage || 0).toFixed(1)) + "%", 1)
                      ], 2)
                    ]),
                    createBaseVNode("div", _hoisted_51, toDisplayString(card.value), 1),
                    createBaseVNode("div", _hoisted_52, toDisplayString(card.label), 1),
                    createBaseVNode("div", _hoisted_53, toDisplayString(card.detail), 1)
                  ])
                ], 10, _hoisted_48);
              }), 128))
            ]),
            createBaseVNode("div", _hoisted_54, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(statCards.value, (card, index) => {
                return openBlock(), createElementBlock("span", {
                  key: card.key,
                  class: normalizeClass(["arc-dot", { active: currentArcIndex.value === index }]),
                  onClick: ($event) => currentArcIndex.value = index
                }, null, 10, _hoisted_55);
              }), 128))
            ]),
            _cache[16] || (_cache[16] = createBaseVNode("div", { class: "arc-hint" }, "← 左右滑动 →", -1))
          ], 512)
        ]),
        createBaseVNode("div", _hoisted_56, [
          createBaseVNode("div", _hoisted_57, [
            createVNode(_component_el_card, { class: "storage-card" }, {
              header: withCtx(() => [
                createBaseVNode("div", _hoisted_58, [
                  createBaseVNode("div", _hoisted_59, [
                    createVNode(_component_el_icon, { class: "header-icon" }, {
                      default: withCtx(() => [
                        createVNode(unref(pie_chart_default))
                      ]),
                      _: 1
                    }),
                    _cache[17] || (_cache[17] = createBaseVNode("h3", null, "存储使用情况", -1))
                  ]),
                  createBaseVNode("div", _hoisted_60, [
                    createVNode(_component_el_button, {
                      type: "text",
                      onClick: goToFiles
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(setting_default))
                          ]),
                          _: 1
                        }),
                        _cache[18] || (_cache[18] = createTextVNode(" 管理文件 ", -1))
                      ]),
                      _: 1
                    })
                  ])
                ])
              ]),
              default: withCtx(() => {
                var _a2, _b2;
                return [
                  createBaseVNode("div", _hoisted_61, [
                    createBaseVNode("div", _hoisted_62, [
                      createBaseVNode("div", _hoisted_63, [
                        createBaseVNode("div", _hoisted_64, [
                          createBaseVNode("span", _hoisted_65, toDisplayString(unref(formatFileSize)(((_a2 = unref(authStore).user) == null ? void 0 : _a2.used_storage) || 0)), 1),
                          _cache[19] || (_cache[19] = createBaseVNode("span", { class: "separator" }, "/", -1)),
                          createBaseVNode("span", _hoisted_66, toDisplayString(unref(formatFileSize)(((_b2 = unref(authStore).user) == null ? void 0 : _b2.storage_limit) || 0)), 1)
                        ]),
                        createBaseVNode("div", _hoisted_67, toDisplayString(unref(formatPercentage)(unref(authStore).storageUsage)) + " 已使用 ", 1)
                      ]),
                      createVNode(_component_el_progress, {
                        percentage: unref(authStore).storageUsage,
                        color: getStorageColor(unref(authStore).storageUsage),
                        "stroke-width": 16,
                        class: "storage-progress"
                      }, {
                        default: withCtx(({ percentage }) => [
                          createTextVNode(toDisplayString(unref(formatPercentage)(percentage)), 1)
                        ]),
                        _: 1
                      }, 8, ["percentage", "color"])
                    ]),
                    createBaseVNode("div", _hoisted_68, [
                      createBaseVNode("div", _hoisted_69, [
                        createBaseVNode("div", _hoisted_70, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(picture_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_71, [
                          _cache[20] || (_cache[20] = createBaseVNode("div", { class: "breakdown-label" }, "图片文件", -1)),
                          createBaseVNode("div", _hoisted_72, toDisplayString(unref(formatFileSize)(stats.value.imageSize)), 1)
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_73, [
                        createBaseVNode("div", _hoisted_74, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(video_play_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_75, [
                          _cache[21] || (_cache[21] = createBaseVNode("div", { class: "breakdown-label" }, "视频文件", -1)),
                          createBaseVNode("div", _hoisted_76, toDisplayString(unref(formatFileSize)(stats.value.videoSize)), 1)
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_77, [
                        createBaseVNode("div", _hoisted_78, [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(circle_check_default))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_79, [
                          _cache[22] || (_cache[22] = createBaseVNode("div", { class: "breakdown-label" }, "动图/实况", -1)),
                          createBaseVNode("div", _hoisted_80, toDisplayString(unref(formatFileSize)(stats.value.motionSize || 0)), 1)
                        ])
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_81, [
                      unref(authStore).storageUsage > 90 ? (openBlock(), createBlock(_component_el_alert, {
                        key: 0,
                        title: "存储空间不足",
                        type: "warning",
                        closable: false,
                        "show-icon": ""
                      }, {
                        default: withCtx(() => [..._cache[23] || (_cache[23] = [
                          createTextVNode(" 您的存储空间即将用完，请及时清理不需要的文件或联系管理员扩容 ", -1)
                        ])]),
                        _: 1
                      })) : unref(authStore).storageUsage > 70 ? (openBlock(), createBlock(_component_el_alert, {
                        key: 1,
                        title: "存储空间提醒",
                        type: "info",
                        closable: false,
                        "show-icon": ""
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 您的存储空间已使用 " + toDisplayString(unref(formatPercentage)(unref(authStore).storageUsage)) + "，建议定期清理文件 ", 1)
                        ]),
                        _: 1
                      })) : (openBlock(), createBlock(_component_el_alert, {
                        key: 2,
                        title: "存储空间充足",
                        type: "success",
                        closable: false,
                        "show-icon": ""
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 您的存储空间使用正常，还有 " + toDisplayString(unref(formatPercentage)(100 - unref(authStore).storageUsage)) + " 可用空间 ", 1)
                        ]),
                        _: 1
                      }))
                    ])
                  ])
                ];
              }),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_82, [
            createVNode(_component_el_card, { class: "trend-card" }, {
              header: withCtx(() => [
                createBaseVNode("div", _hoisted_83, [
                  createBaseVNode("div", _hoisted_84, [
                    createVNode(_component_el_icon, { class: "header-icon" }, {
                      default: withCtx(() => [
                        createVNode(unref(trend_charts_default))
                      ]),
                      _: 1
                    }),
                    _cache[24] || (_cache[24] = createBaseVNode("h3", null, "趋势分析", -1))
                  ]),
                  createBaseVNode("div", _hoisted_85, [
                    createVNode(_component_el_button, {
                      type: "text",
                      onClick: refreshTrends,
                      loading: loadingTrends.value
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(refresh_default))
                          ]),
                          _: 1
                        }),
                        _cache[25] || (_cache[25] = createTextVNode(" 刷新数据 ", -1))
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ])
                ])
              ]),
              default: withCtx(() => [
                stats.value.trends.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_86, [
                  createBaseVNode("div", _hoisted_87, [
                    _cache[26] || (_cache[26] = createBaseVNode("div", { class: "chart-title" }, "文件数量趋势", -1)),
                    createBaseVNode("div", _hoisted_88, [
                      createBaseVNode("div", _hoisted_89, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.trends, (trend, index) => {
                          return openBlock(), createElementBlock("div", {
                            key: index,
                            class: "chart-bar",
                            style: normalizeStyle({ height: getBarHeight(trend.total_files, "files") + "%" }),
                            title: `${trend.trend_date}: ${trend.total_files} 个文件`
                          }, [
                            createBaseVNode("span", _hoisted_91, toDisplayString(trend.total_files), 1)
                          ], 12, _hoisted_90);
                        }), 128))
                      ]),
                      createBaseVNode("div", _hoisted_92, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.trends, (trend, index) => {
                          return openBlock(), createElementBlock("span", {
                            key: index,
                            class: "chart-label"
                          }, toDisplayString(formatTrendDate(trend.trend_date)), 1);
                        }), 128))
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_93, [
                    _cache[27] || (_cache[27] = createBaseVNode("div", { class: "chart-title" }, "存储使用趋势", -1)),
                    createBaseVNode("div", _hoisted_94, [
                      createBaseVNode("div", _hoisted_95, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.trends, (trend, index) => {
                          return openBlock(), createElementBlock("div", {
                            key: index,
                            class: "chart-bar storage-bar",
                            style: normalizeStyle({ height: getBarHeight(trend.total_size, "size") + "%" }),
                            title: `${trend.trend_date}: ${unref(formatFileSize)(trend.total_size)}`
                          }, [
                            createBaseVNode("span", _hoisted_97, toDisplayString(unref(formatFileSize)(trend.total_size)), 1)
                          ], 12, _hoisted_96);
                        }), 128))
                      ]),
                      createBaseVNode("div", _hoisted_98, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.trends, (trend, index) => {
                          return openBlock(), createElementBlock("span", {
                            key: index,
                            class: "chart-label"
                          }, toDisplayString(formatTrendDate(trend.trend_date)), 1);
                        }), 128))
                      ])
                    ])
                  ])
                ])) : (openBlock(), createElementBlock("div", _hoisted_99, [
                  createVNode(_component_el_empty, { description: "暂无趋势数据" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        onClick: loadDashboardData
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(refresh_default))
                            ]),
                            _: 1
                          }),
                          _cache[28] || (_cache[28] = createTextVNode(" 刷新数据 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]))
              ]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_100, [
            createVNode(_component_el_card, { class: "actions-card" }, {
              header: withCtx(() => [
                createBaseVNode("div", _hoisted_101, [
                  createBaseVNode("div", _hoisted_102, [
                    createVNode(_component_el_icon, { class: "header-icon" }, {
                      default: withCtx(() => [
                        createVNode(unref(lightning_default))
                      ]),
                      _: 1
                    }),
                    _cache[29] || (_cache[29] = createBaseVNode("h3", null, "快速操作", -1))
                  ])
                ])
              ]),
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_103, [
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: _cache[1] || (_cache[1] = ($event) => showUploadDialog.value = true)
                  }, [
                    createBaseVNode("div", _hoisted_104, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(upload_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[30] || (_cache[30] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "上传文件"),
                      createBaseVNode("span", { class: "action-desc" }, "拖拽或点击上传")
                    ], -1))
                  ]),
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: goToFiles
                  }, [
                    createBaseVNode("div", _hoisted_105, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(folder_opened_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[31] || (_cache[31] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "浏览文件"),
                      createBaseVNode("span", { class: "action-desc" }, "查看所有文件")
                    ], -1))
                  ]),
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: createNewFolder
                  }, [
                    createBaseVNode("div", _hoisted_106, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(folder_add_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[32] || (_cache[32] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "新建文件夹"),
                      createBaseVNode("span", { class: "action-desc" }, "整理您的文件")
                    ], -1))
                  ]),
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: goToFiles
                  }, [
                    createBaseVNode("div", _hoisted_107, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(search_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[33] || (_cache[33] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "搜索文件"),
                      createBaseVNode("span", { class: "action-desc" }, "快速查找文件")
                    ], -1))
                  ]),
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: goToFiles
                  }, [
                    createBaseVNode("div", _hoisted_108, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(share_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[34] || (_cache[34] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "分享文件"),
                      createBaseVNode("span", { class: "action-desc" }, "生成分享链接")
                    ], -1))
                  ]),
                  createBaseVNode("div", {
                    class: "action-item",
                    onClick: goToFiles
                  }, [
                    createBaseVNode("div", _hoisted_109, [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(unref(download_default))
                        ]),
                        _: 1
                      })
                    ]),
                    _cache[35] || (_cache[35] = createBaseVNode("div", { class: "action-content" }, [
                      createBaseVNode("span", { class: "action-text" }, "批量下载"),
                      createBaseVNode("span", { class: "action-desc" }, "下载多个文件")
                    ], -1))
                  ])
                ])
              ]),
              _: 1
            })
          ])
        ]),
        createVNode(_component_el_dialog, {
          modelValue: showUploadDialog.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => showUploadDialog.value = $event),
          title: "上传文件",
          width: isMobile.value ? "95%" : "600px",
          "close-on-click-modal": false,
          class: normalizeClass({ "mobile-upload-dialog": isMobile.value }),
          "modal-class": isMobile.value ? "mobile-modal" : ""
        }, {
          default: withCtx(() => [
            createVNode(FileUploader, { onUploadSuccess: handleUploadSuccess })
          ]),
          _: 1
        }, 8, ["modelValue", "width", "class", "modal-class"]),
        createVNode(_component_el_dialog, {
          modelValue: showPreviewDialog.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => showPreviewDialog.value = $event),
          title: "文件预览",
          width: "80%",
          "close-on-click-modal": true
        }, {
          default: withCtx(() => [
            previewFile.value ? (openBlock(), createBlock(FilePreview, {
              key: 0,
              file: previewFile.value,
              onFileDeleted: handleFileDeleted
            }, null, 8, ["file"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
const Dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-95102d44"]]);
export {
  Dashboard as default
};
//# sourceMappingURL=Dashboard-_mCiQS_j.js.map
