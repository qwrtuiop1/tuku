import { u as useAuthStore, f as formatFileSize, k as formatPercentage, l as getStorageUsageColor, a as api, _ as _export_sfc } from "./index-DbxwNbHT.js";
/* empty css                    */
/* empty css                      */
/* empty css                    */
/* empty css                   */
/* empty css                            */
/* empty css                          */
/* empty css                   */
/* empty css                      */
import { y as defineComponent, r as ref, c as computed, aD as useRoute, w as watch, l as onMounted, U as onUnmounted, z as createElementBlock, L as createCommentVNode, B as createBaseVNode, R as createVNode, I as createBlock, J as withCtx, u as unref, E as normalizeClass, O as createTextVNode, P as toDisplayString, Q as Fragment, a6 as renderList, T as Transition, M as resolveDynamicComponent, al as resolveComponent, D as normalizeStyle, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { aQ as fold_default, a as ElIcon, c as ElButton, aj as ElMenuItem, i as folder_default, T as house_default, f as user_default, a2 as setting_default, ai as ElMenu, a0 as ElAvatar, as as more_filled_default, N as ElDropdownMenu, O as ElDropdownItem, aR as switch_button_default, D as ElDropdown, aS as menu_default, S as ElBreadcrumbItem, G as ElBreadcrumb, z as ElProgress, P as ElTooltip, ap as arrow_down_default, aF as bell_default, aT as ElScrollbar, q as ElDialog, E as ElMessage, I as ElMessageBox } from "./element-CUyZSw-d.js";
const _imports_0 = "/logo.png";
const _hoisted_1 = { class: "main-layout" };
const _hoisted_2 = { class: "sidebar-header" };
const _hoisted_3 = {
  key: 0,
  class: "logo-text"
};
const _hoisted_4 = { class: "sidebar-nav" };
const _hoisted_5 = {
  key: 0,
  class: "user-details"
};
const _hoisted_6 = { class: "username" };
const _hoisted_7 = { class: "user-role" };
const _hoisted_8 = { class: "top-header" };
const _hoisted_9 = { class: "header-left" };
const _hoisted_10 = { class: "header-right" };
const _hoisted_11 = { class: "storage-text" };
const _hoisted_12 = {
  key: 0,
  class: "mobile-storage"
};
const _hoisted_13 = { class: "desktop-user-info" };
const _hoisted_14 = { class: "user-details" };
const _hoisted_15 = { class: "username" };
const _hoisted_16 = { class: "user-role" };
const _hoisted_17 = {
  key: 0,
  class: "global-notifications banner"
};
const _hoisted_18 = { class: "summary-text" };
const _hoisted_19 = { class: "page-content" };
const _hoisted_20 = {
  key: 0,
  class: "page-wrapper"
};
const _hoisted_21 = { class: "notifications-dialog-body" };
const _hoisted_22 = { class: "notifications-list-panel" };
const _hoisted_23 = { class: "list-header" };
const _hoisted_24 = { class: "notification-count" };
const _hoisted_25 = {
  key: 0,
  class: "empty-list"
};
const _hoisted_26 = ["onClick"];
const _hoisted_27 = { class: "notification-content" };
const _hoisted_28 = { class: "notification-title" };
const _hoisted_29 = { class: "notification-meta" };
const _hoisted_30 = { class: "notification-type" };
const _hoisted_31 = { class: "notification-priority priority-{{ n.priority }}" };
const _hoisted_32 = {
  key: 0,
  class: "read-badge"
};
const _hoisted_33 = { class: "notification-time" };
const _hoisted_34 = { class: "notification-indicator" };
const _hoisted_35 = {
  key: 0,
  class: "unread-dot"
};
const _hoisted_36 = { class: "notifications-detail-panel" };
const _hoisted_37 = {
  key: 0,
  class: "detail-content"
};
const _hoisted_38 = { class: "detail-header" };
const _hoisted_39 = { class: "detail-title" };
const _hoisted_40 = { class: "detail-badges" };
const _hoisted_41 = { class: "detail-type" };
const _hoisted_42 = { class: "detail-priority priority-{{ detailNotification.priority }}" };
const _hoisted_43 = {
  key: 0,
  class: "read-badge"
};
const _hoisted_44 = {
  key: 1,
  class: "unread-badge"
};
const _hoisted_45 = { class: "detail-body" };
const _hoisted_46 = { class: "detail-text" };
const _hoisted_47 = { class: "detail-footer" };
const _hoisted_48 = { class: "detail-time" };
const _hoisted_49 = {
  key: 0,
  class: "read-time"
};
const _hoisted_50 = { class: "detail-actions" };
const _hoisted_51 = {
  key: 1,
  class: "detail-empty"
};
const _hoisted_52 = {
  key: 1,
  class: "mobile-bottom-nav"
};
const _hoisted_53 = { class: "nav-items" };
const _hoisted_54 = ["onClick"];
const _hoisted_55 = { class: "nav-text" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MainLayout",
  setup(__props) {
    const iconMap = {
      Folder: folder_default,
      House: house_default,
      Setting: setting_default,
      User: user_default
    };
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const sidebarCollapsed = ref(false);
    const isMobile = ref(false);
    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const isDragging = ref(false);
    ref(false);
    const animationEnabled = ref(true);
    const mobileUserMenuVisible = ref(false);
    const globalNotifications = ref([]);
    const allNotifications = ref([]);
    const notificationCheckInterval = ref(null);
    const notificationsDialogVisible = ref(false);
    const detailNotification = ref(null);
    const eventSource = ref(null);
    const configVersion = ref(null);
    let configPoller = null;
    const checkScreenSize = () => {
      const width = window.innerWidth;
      isMobile.value = width < 768;
      if (width < 768) {
        sidebarCollapsed.value = true;
      } else if (width < 1024) {
        sidebarCollapsed.value = true;
      } else {
        sidebarCollapsed.value = false;
      }
    };
    const activeMenu = computed(() => route.path);
    const navItems = computed(() => {
      var _a;
      const items = [
        { path: "/", label: "文件", iconKey: "Folder" },
        { path: "/dashboard", label: "仪表盘", iconKey: "House" },
        { path: "/user-center", label: "我的", iconKey: "User" }
      ];
      if (((_a = authStore.user) == null ? void 0 : _a.role) === "admin") {
        items.splice(2, 0, { path: "/admin", label: "管理", iconKey: "Setting" });
      }
      return items;
    });
    const activeIndex = computed(() => {
      const idx = navItems.value.findIndex((item) => isActive(item.path));
      return idx >= 0 ? idx : 0;
    });
    const indicatorStyle = computed(() => {
      const itemWidth = 100 / navItems.value.length;
      const left = activeIndex.value * itemWidth + itemWidth / 2;
      return {
        width: `${itemWidth - 12}%`,
        left: `${left}%`
      };
    });
    const isActive = (path) => route.path === path;
    const breadcrumbs = computed(() => {
      const breadcrumbMap = {
        "/": { name: "文件管理", path: "/" },
        "/dashboard": { name: "仪表盘", path: "/dashboard" },
        "/admin": { name: "管理控制台", path: "/admin" },
        "/user-center": { name: "个人资料", path: "/user-center" },
        "/settings": { name: "系统设置", path: "/settings" }
      };
      return breadcrumbMap[route.path] ? [breadcrumbMap[route.path]] : [];
    });
    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };
    const expandSidebar = () => {
      if (sidebarCollapsed.value) {
        sidebarCollapsed.value = false;
      }
    };
    const closeSidebar = () => {
      if (isMobile.value) {
        sidebarCollapsed.value = true;
      }
    };
    const getStorageColor = (percentage) => {
      return getStorageUsageColor(percentage);
    };
    const handleMenuSelect = () => {
      if (isMobile.value) {
        sidebarCollapsed.value = true;
      }
    };
    const handleUserCommand = async (command) => {
      mobileUserMenuVisible.value = false;
      switch (command) {
        case "profile":
          router.push("/user-center");
          break;
        case "settings":
          if (authStore.isAdmin) {
            router.push("/settings");
          } else {
            ElMessage.warning("需要管理员权限");
          }
          break;
        case "notifications":
          if (authStore.isAdmin) {
            router.push("/notifications");
          } else {
            ElMessage.warning("需要管理员权限");
          }
          break;
        case "logout":
          try {
            await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            });
            authStore.logout();
            router.push("/login");
          } catch {
          }
          break;
      }
    };
    const toggleMobileUserMenu = () => {
      mobileUserMenuVisible.value = !mobileUserMenuVisible.value;
    };
    const handleMobileUserMenuVisibleChange = async (visible) => {
      mobileUserMenuVisible.value = visible;
      if (visible) {
        try {
          await authStore.checkAuth();
        } catch {
        }
      }
    };
    const handleDesktopUserMenuVisibleChange = async (visible) => {
      if (visible) {
        try {
          await authStore.checkAuth();
        } catch {
        }
      }
    };
    const handleTouchStart = (e) => {
      if (!isMobile.value) return;
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
      isDragging.value = false;
    };
    const handleTouchMove = (e) => {
      if (!isMobile.value) return;
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - touchStartX.value;
      const deltaY = touchY - touchStartY.value;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isDragging.value = true;
      }
    };
    const handleTouchEnd = (e) => {
      if (!isMobile.value || !isDragging.value) return;
      const touchX = e.changedTouches[0].clientX;
      const deltaX = touchX - touchStartX.value;
      if (deltaX > 50 && touchStartX.value < 20) {
        sidebarCollapsed.value = false;
      } else if (deltaX < -50 && sidebarCollapsed.value === false) {
        sidebarCollapsed.value = true;
      }
      isDragging.value = false;
    };
    watch(route, () => {
    }, { immediate: true });
    const handleResize = () => {
      checkScreenSize();
    };
    const fetchSystemSettings = async () => {
      try {
        const response = await api.get("/system/info");
        const systemInfo = response.data;
        if (systemInfo == null ? void 0 : systemInfo.config_version) {
          const prev = sessionStorage.getItem("config_version");
          configVersion.value = String(systemInfo.config_version);
          sessionStorage.setItem("config_version", configVersion.value);
          if (prev && prev !== configVersion.value) {
            window.location.reload();
          }
        }
        animationEnabled.value = true;
      } catch (error) {
        animationEnabled.value = true;
      }
    };
    const handleSystemSettingsChange = (event) => {
      const settings = event.detail;
      if (settings.enable_animation !== void 0) {
        animationEnabled.value = settings.enable_animation;
      }
    };
    const formatDateTime = (dateString) => {
      if (!dateString) return "未知时间";
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - date.getTime();
      if (diff < 6e4) {
        return "刚刚";
      }
      if (diff < 36e5) {
        const minutes = Math.floor(diff / 6e4);
        return `${minutes}分钟前`;
      }
      if (diff < 864e5) {
        const hours = Math.floor(diff / 36e5);
        return `${hours}小时前`;
      }
      if (diff < 6048e5) {
        const days = Math.floor(diff / 864e5);
        return `${days}天前`;
      }
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const getNotificationTypeText = (type) => {
      const typeMap = {
        "system": "系统通知",
        "maintenance": "系统维护",
        "security_alert": "安全提醒",
        "storage_warning": "存储警告",
        "email": "邮件通知",
        "user": "用户通知"
      };
      return typeMap[type] || type || "未知类型";
    };
    const getPriorityText = (priority) => {
      const priorityMap = {
        "low": "低",
        "normal": "普通",
        "high": "高",
        "urgent": "紧急"
      };
      return priorityMap[priority] || priority || "普通";
    };
    const fetchAllNotifications = async () => {
      var _a, _b;
      if (!authStore.user) return;
      try {
        const response = await api.get("/auth/notifications/all");
        if (response.data.success) {
          allNotifications.value = response.data.notifications || [];
        } else {
          ElMessage.error("获取通知失败: " + response.data.message);
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 401) ;
        else if (((_b = error.response) == null ? void 0 : _b.status) === 404) {
          ElMessage.error("通知服务暂不可用");
        } else {
          ElMessage.error("获取通知失败，请稍后重试");
        }
      }
    };
    const fetchGlobalNotifications = async () => {
      if (!authStore.user) return;
      try {
        const response = await api.get("/auth/notifications/unread");
        if (response.data.success) {
          globalNotifications.value = response.data.notifications || [];
        }
      } catch (error) {
      }
    };
    const markNotificationAsRead = async (notificationId) => {
      try {
        await api.put(`/auth/notifications/${notificationId}/read`);
        globalNotifications.value = globalNotifications.value.filter((n) => n.id !== notificationId);
        ElMessage.success("通知已标记为已读");
      } catch (error) {
        ElMessage.error("标记通知为已读失败");
      }
    };
    const closeNotification = (notificationId) => {
      globalNotifications.value = globalNotifications.value.filter((n) => n.id !== notificationId);
      if (detailNotification.value && detailNotification.value.id === notificationId) {
        detailNotification.value = null;
      }
      if (globalNotifications.value.length === 0) {
        closeNotificationsDialog();
      }
    };
    const unreadNotificationCount = computed(() => {
      return globalNotifications.value.length;
    });
    const hasUnreadNotifications = computed(() => {
      return unreadNotificationCount.value > 0;
    });
    const highestPriorityClass = computed(() => {
      if (globalNotifications.value.length === 0) return "";
      const p = globalNotifications.value.reduce((max, n) => {
        const rank = { low: 1, normal: 2, high: 3, urgent: 4 }[n.priority] || 2;
        return rank > max ? rank : max;
      }, 0);
      return p === 4 ? "priority-urgent" : p === 3 ? "priority-high" : p === 2 ? "priority-normal" : "priority-low";
    });
    const onDialogOpened = () => {
    };
    const onDialogClosed = () => {
      detailNotification.value = null;
    };
    const closeNotificationsDialog = () => {
      notificationsDialogVisible.value = false;
      detailNotification.value = null;
    };
    const openNotificationDetail = async (n) => {
      detailNotification.value = n;
      if (!n.is_read) {
        try {
          await api.put(`/auth/notifications/${n.id}/read`);
          n.is_read = 1;
          n.read_at = (/* @__PURE__ */ new Date()).toISOString();
          const notificationIndex = allNotifications.value.findIndex((notif) => notif.id === n.id);
          if (notificationIndex !== -1) {
            allNotifications.value[notificationIndex].is_read = 1;
            allNotifications.value[notificationIndex].read_at = n.read_at;
          }
          globalNotifications.value = globalNotifications.value.filter((notif) => notif.id !== n.id);
          allNotifications.value = [...allNotifications.value];
          globalNotifications.value = [...globalNotifications.value];
        } catch (error) {
        }
      }
      if (!notificationsDialogVisible.value) {
        notificationsDialogVisible.value = true;
      }
    };
    const openNotificationsDialog = async () => {
      notificationsDialogVisible.value = true;
      await fetchAllNotifications();
    };
    const startNotificationPolling = () => {
      notificationCheckInterval.value = setInterval(() => {
        fetchGlobalNotifications();
      }, 1e4);
    };
    const stopNotificationPolling = () => {
      if (notificationCheckInterval.value) {
        clearInterval(notificationCheckInterval.value);
        notificationCheckInterval.value = null;
      }
    };
    const setupSSE = () => {
      if (eventSource.value) {
        eventSource.value.close();
      }
      const token = localStorage.getItem("token");
      if (!token) return;
      eventSource.value = new EventSource(`${api.defaults.baseURL}/auth/notifications/stream?token=${encodeURIComponent(token)}`);
      eventSource.value.onmessage = () => {
      };
      eventSource.value.addEventListener("notification:new", () => {
        fetchGlobalNotifications();
      });
      eventSource.value.onerror = () => {
        var _a;
        (_a = eventSource.value) == null ? void 0 : _a.close();
        setTimeout(setupSSE, 5e3);
      };
    };
    const closeSSE = () => {
      if (eventSource.value) {
        eventSource.value.close();
        eventSource.value = null;
      }
    };
    onMounted(() => {
      checkScreenSize();
      window.addEventListener("resize", handleResize);
      if (isMobile.value) {
        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: true });
        document.addEventListener("touchend", handleTouchEnd, { passive: true });
      }
      fetchSystemSettings();
      fetchGlobalNotifications();
      startNotificationPolling();
      setupSSE();
      window.addEventListener("system-settings-changed", handleSystemSettingsChange);
      configPoller = setInterval(fetchSystemSettings, 3e4);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("system-settings-changed", handleSystemSettingsChange);
      stopNotificationPolling();
      closeSSE();
      if (configPoller) {
        clearInterval(configPoller);
        configPoller = null;
      }
      if (isMobile.value) {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      }
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_menu_item = ElMenuItem;
      const _component_el_menu = ElMenu;
      const _component_el_avatar = ElAvatar;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      const _component_el_breadcrumb_item = ElBreadcrumbItem;
      const _component_el_breadcrumb = ElBreadcrumb;
      const _component_el_progress = ElProgress;
      const _component_el_tooltip = ElTooltip;
      const _component_router_view = resolveComponent("router-view");
      const _component_el_scrollbar = ElScrollbar;
      const _component_el_dialog = ElDialog;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        isMobile.value && !sidebarCollapsed.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "mobile-overlay",
          onClick: closeSidebar
        })) : createCommentVNode("", true),
        createBaseVNode("aside", {
          class: normalizeClass(["sidebar", {
            collapsed: sidebarCollapsed.value,
            "mobile-sidebar": isMobile.value,
            "mobile-open": isMobile.value && !sidebarCollapsed.value
          }])
        }, [
          createBaseVNode("div", _hoisted_2, [
            createBaseVNode("div", {
              class: "logo",
              onClick: expandSidebar
            }, [
              _cache[3] || (_cache[3] = createBaseVNode("img", {
                src: _imports_0,
                alt: "图库系统",
                class: "logo-image"
              }, null, -1)),
              !sidebarCollapsed.value ? (openBlock(), createElementBlock("span", _hoisted_3, "图库系统")) : createCommentVNode("", true)
            ]),
            !sidebarCollapsed.value ? (openBlock(), createBlock(_component_el_button, {
              key: 0,
              type: "text",
              class: "collapse-btn",
              onClick: toggleSidebar
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(fold_default))
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ]),
          createBaseVNode("nav", _hoisted_4, [
            createVNode(_component_el_menu, {
              "default-active": activeMenu.value,
              collapse: sidebarCollapsed.value,
              "unique-opened": true,
              router: "",
              onSelect: handleMenuSelect
            }, {
              default: withCtx(() => [
                createVNode(_component_el_menu_item, { index: "/" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(folder_default))
                      ]),
                      _: 1
                    }),
                    _cache[4] || (_cache[4] = createBaseVNode("span", null, "文件管理", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_menu_item, { index: "/dashboard" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(house_default))
                      ]),
                      _: 1
                    }),
                    _cache[5] || (_cache[5] = createBaseVNode("span", null, "仪表盘", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_menu_item, { index: "/user-center" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[6] || (_cache[6] = createBaseVNode("span", null, "个人资料", -1))
                  ]),
                  _: 1
                }),
                unref(authStore).isAdmin ? (openBlock(), createBlock(_component_el_menu_item, {
                  key: 0,
                  index: "/admin"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(setting_default))
                      ]),
                      _: 1
                    }),
                    _cache[7] || (_cache[7] = createBaseVNode("span", null, "管理中心", -1))
                  ]),
                  _: 1
                })) : createCommentVNode("", true)
              ]),
              _: 1
            }, 8, ["default-active", "collapse"])
          ]),
          createBaseVNode("div", {
            class: normalizeClass(["sidebar-footer", { collapsed: sidebarCollapsed.value }])
          }, [
            createBaseVNode("div", {
              class: normalizeClass(["user-info", { collapsed: sidebarCollapsed.value }])
            }, [
              createVNode(_component_el_avatar, {
                size: 32,
                src: (_a = unref(authStore).user) == null ? void 0 : _a.avatar_url
              }, {
                default: withCtx(() => {
                  var _a2, _b2;
                  return [
                    createTextVNode(toDisplayString((_b2 = (_a2 = unref(authStore).user) == null ? void 0 : _a2.username) == null ? void 0 : _b2.charAt(0).toUpperCase()), 1)
                  ];
                }),
                _: 1
              }, 8, ["src"]),
              !sidebarCollapsed.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
                createBaseVNode("div", _hoisted_6, toDisplayString((_b = unref(authStore).user) == null ? void 0 : _b.username), 1),
                createBaseVNode("div", _hoisted_7, toDisplayString(((_c = unref(authStore).user) == null ? void 0 : _c.role) === "admin" ? "管理员" : "用户"), 1)
              ])) : createCommentVNode("", true)
            ], 2),
            createVNode(_component_el_dropdown, {
              onCommand: handleUserCommand,
              placement: "top-end"
            }, {
              dropdown: withCtx(() => [
                createVNode(_component_el_dropdown_menu, null, {
                  default: withCtx(() => [
                    createVNode(_component_el_dropdown_item, { command: "profile" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(user_default))
                          ]),
                          _: 1
                        }),
                        _cache[8] || (_cache[8] = createTextVNode(" 个人资料 ", -1))
                      ]),
                      _: 1
                    }),
                    unref(authStore).isAdmin ? (openBlock(), createBlock(_component_el_dropdown_item, {
                      key: 0,
                      command: "settings"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(setting_default))
                          ]),
                          _: 1
                        }),
                        _cache[9] || (_cache[9] = createTextVNode(" 设置 ", -1))
                      ]),
                      _: 1
                    })) : createCommentVNode("", true),
                    createVNode(_component_el_dropdown_item, {
                      divided: "",
                      command: "logout"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(switch_button_default))
                          ]),
                          _: 1
                        }),
                        _cache[10] || (_cache[10] = createTextVNode(" 退出登录 ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              default: withCtx(() => [
                createVNode(_component_el_button, {
                  type: "text",
                  class: normalizeClass(["user-menu-btn", { collapsed: sidebarCollapsed.value }])
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(more_filled_default))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["class"])
              ]),
              _: 1
            })
          ], 2)
        ], 2),
        createBaseVNode("div", {
          class: normalizeClass(["main-content", { "sidebar-collapsed": sidebarCollapsed.value }])
        }, [
          createBaseVNode("header", _hoisted_8, [
            createBaseVNode("div", _hoisted_9, [
              isMobile.value ? (openBlock(), createBlock(_component_el_button, {
                key: 0,
                type: "text",
                class: "mobile-menu-btn",
                onClick: toggleSidebar
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(menu_default))
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : createCommentVNode("", true),
              createVNode(_component_el_breadcrumb, {
                separator: "/",
                class: "breadcrumb-nav"
              }, {
                default: withCtx(() => [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(breadcrumbs.value, (item) => {
                    return openBlock(), createBlock(_component_el_breadcrumb_item, {
                      key: item.path,
                      to: item.path
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(item.name), 1)
                      ]),
                      _: 2
                    }, 1032, ["to"]);
                  }), 128))
                ]),
                _: 1
              })
            ]),
            createBaseVNode("div", _hoisted_10, [
              createBaseVNode("div", {
                class: normalizeClass(["storage-info", { "mobile-hidden": isMobile.value }])
              }, [
                createVNode(_component_el_progress, {
                  percentage: unref(authStore).storageUsage,
                  color: getStorageColor(unref(authStore).storageUsage),
                  "stroke-width": 6,
                  "show-text": false,
                  class: "storage-progress"
                }, null, 8, ["percentage", "color"]),
                createBaseVNode("span", _hoisted_11, toDisplayString(unref(formatFileSize)(((_d = unref(authStore).user) == null ? void 0 : _d.used_storage) || 0)) + " / " + toDisplayString(unref(formatFileSize)(((_e = unref(authStore).user) == null ? void 0 : _e.storage_limit) || 0)), 1)
              ], 2),
              isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_12, [
                createVNode(_component_el_tooltip, {
                  content: `存储使用: ${unref(formatPercentage)(unref(authStore).storageUsage)}`,
                  placement: "bottom"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_progress, {
                      percentage: unref(authStore).storageUsage,
                      color: getStorageColor(unref(authStore).storageUsage),
                      "stroke-width": 12,
                      "show-text": false,
                      class: "mobile-storage-progress"
                    }, null, 8, ["percentage", "color"])
                  ]),
                  _: 1
                }, 8, ["content"])
              ])) : createCommentVNode("", true),
              !isMobile.value ? (openBlock(), createBlock(_component_el_dropdown, {
                key: 1,
                onCommand: handleUserCommand,
                placement: "bottom-end",
                onVisibleChange: handleDesktopUserMenuVisibleChange
              }, {
                dropdown: withCtx(() => [
                  createVNode(_component_el_dropdown_menu, null, {
                    default: withCtx(() => [
                      unref(authStore).isAdmin ? (openBlock(), createBlock(_component_el_dropdown_item, {
                        key: 0,
                        command: "notifications"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(bell_default))
                            ]),
                            _: 1
                          }),
                          _cache[11] || (_cache[11] = createTextVNode(" 通知 ", -1))
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_el_dropdown_item, {
                        divided: "",
                        command: "logout"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(switch_button_default))
                            ]),
                            _: 1
                          }),
                          _cache[12] || (_cache[12] = createTextVNode(" 退出登录 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => {
                  var _a2, _b2, _c2;
                  return [
                    createBaseVNode("div", _hoisted_13, [
                      createVNode(_component_el_avatar, {
                        size: 32,
                        src: (_a2 = unref(authStore).user) == null ? void 0 : _a2.avatar_url
                      }, {
                        default: withCtx(() => {
                          var _a3, _b3;
                          return [
                            createTextVNode(toDisplayString((_b3 = (_a3 = unref(authStore).user) == null ? void 0 : _a3.username) == null ? void 0 : _b3.charAt(0).toUpperCase()), 1)
                          ];
                        }),
                        _: 1
                      }, 8, ["src"]),
                      createBaseVNode("div", _hoisted_14, [
                        createBaseVNode("div", _hoisted_15, toDisplayString((_b2 = unref(authStore).user) == null ? void 0 : _b2.username), 1),
                        createBaseVNode("div", _hoisted_16, toDisplayString(((_c2 = unref(authStore).user) == null ? void 0 : _c2.role) === "admin" ? "管理员" : "用户"), 1)
                      ]),
                      createVNode(_component_el_icon, { class: "dropdown-arrow" }, {
                        default: withCtx(() => [
                          createVNode(unref(arrow_down_default))
                        ]),
                        _: 1
                      })
                    ])
                  ];
                }),
                _: 1
              })) : createCommentVNode("", true),
              isMobile.value ? (openBlock(), createBlock(_component_el_dropdown, {
                key: 2,
                onCommand: handleUserCommand,
                placement: "bottom-end",
                visible: mobileUserMenuVisible.value,
                onVisibleChange: handleMobileUserMenuVisibleChange
              }, {
                dropdown: withCtx(() => [
                  createVNode(_component_el_dropdown_menu, null, {
                    default: withCtx(() => [
                      unref(authStore).isAdmin ? (openBlock(), createBlock(_component_el_dropdown_item, {
                        key: 0,
                        command: "notifications"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(bell_default))
                            ]),
                            _: 1
                          }),
                          _cache[13] || (_cache[13] = createTextVNode(" 通知 ", -1))
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_el_dropdown_item, {
                        divided: "",
                        command: "logout"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(switch_button_default))
                            ]),
                            _: 1
                          }),
                          _cache[14] || (_cache[14] = createTextVNode(" 退出登录 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                default: withCtx(() => [
                  createVNode(_component_el_button, {
                    type: "text",
                    class: "mobile-user-btn",
                    onClick: toggleMobileUserMenu
                  }, {
                    default: withCtx(() => {
                      var _a2;
                      return [
                        createVNode(_component_el_avatar, {
                          size: 24,
                          src: (_a2 = unref(authStore).user) == null ? void 0 : _a2.avatar_url
                        }, {
                          default: withCtx(() => {
                            var _a3, _b2;
                            return [
                              createTextVNode(toDisplayString((_b2 = (_a3 = unref(authStore).user) == null ? void 0 : _a3.username) == null ? void 0 : _b2.charAt(0).toUpperCase()), 1)
                            ];
                          }),
                          _: 1
                        }, 8, ["src"])
                      ];
                    }),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["visible"])) : createCommentVNode("", true)
            ])
          ]),
          hasUnreadNotifications.value ? (openBlock(), createElementBlock("div", _hoisted_17, [
            createBaseVNode("div", {
              class: normalizeClass(["notification-summary", highestPriorityClass.value]),
              onClick: openNotificationsDialog
            }, [
              createBaseVNode("span", _hoisted_18, "有 " + toDisplayString(unreadNotificationCount.value) + " 条通知", 1),
              createVNode(_component_el_icon, { class: "summary-arrow" }, {
                default: withCtx(() => [
                  createVNode(unref(arrow_down_default))
                ]),
                _: 1
              })
            ], 2)
          ])) : createCommentVNode("", true),
          createBaseVNode("main", _hoisted_19, [
            createVNode(_component_router_view, null, {
              default: withCtx(({ Component }) => [
                createVNode(Transition, {
                  name: "page-slide",
                  mode: "out-in",
                  duration: animationEnabled.value ? 300 : 0
                }, {
                  default: withCtx(() => [
                    Component ? (openBlock(), createElementBlock("div", _hoisted_20, [
                      (openBlock(), createBlock(resolveDynamicComponent(Component)))
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["duration"])
              ]),
              _: 1
            })
          ])
        ], 2),
        createVNode(_component_el_dialog, {
          modelValue: notificationsDialogVisible.value,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => notificationsDialogVisible.value = $event),
          title: "通知",
          width: isMobile.value ? "95%" : "700px",
          "close-on-click-modal": false,
          "destroy-on-close": false,
          "append-to-body": true,
          class: "notifications-dialog",
          onOpened: onDialogOpened,
          onClosed: onDialogClosed
        }, {
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_21, [
              createBaseVNode("div", _hoisted_22, [
                createBaseVNode("div", _hoisted_23, [
                  _cache[15] || (_cache[15] = createBaseVNode("h3", { class: "list-title" }, "通知列表", -1)),
                  createBaseVNode("span", _hoisted_24, toDisplayString(allNotifications.value.length) + " 条通知", 1)
                ]),
                createVNode(_component_el_scrollbar, { class: "notifications-scrollbar" }, {
                  default: withCtx(() => [
                    allNotifications.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_25, [..._cache[16] || (_cache[16] = [
                      createBaseVNode("div", { class: "empty-icon" }, "📭", -1),
                      createBaseVNode("p", { class: "empty-text" }, "暂无通知", -1)
                    ])])) : createCommentVNode("", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(allNotifications.value, (n) => {
                      return openBlock(), createElementBlock("div", {
                        key: n.id,
                        class: normalizeClass(["notification-item", `priority-${n.priority}`, {
                          active: detailNotification.value && detailNotification.value.id === n.id,
                          "is-read": n.is_read
                        }]),
                        onClick: ($event) => openNotificationDetail(n)
                      }, [
                        createBaseVNode("div", _hoisted_27, [
                          createBaseVNode("div", _hoisted_28, toDisplayString(n.title || "无标题"), 1),
                          createBaseVNode("div", _hoisted_29, [
                            createBaseVNode("span", _hoisted_30, toDisplayString(getNotificationTypeText(n.notification_type)), 1),
                            createBaseVNode("span", _hoisted_31, toDisplayString(getPriorityText(n.priority)), 1),
                            n.is_read ? (openBlock(), createElementBlock("span", _hoisted_32, "已读")) : createCommentVNode("", true)
                          ]),
                          createBaseVNode("div", _hoisted_33, toDisplayString(formatDateTime(n.created_at)), 1)
                        ]),
                        createBaseVNode("div", _hoisted_34, [
                          !n.is_read ? (openBlock(), createElementBlock("div", _hoisted_35)) : createCommentVNode("", true)
                        ])
                      ], 10, _hoisted_26);
                    }), 128))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_36, [
                detailNotification.value ? (openBlock(), createElementBlock("div", _hoisted_37, [
                  createBaseVNode("div", _hoisted_38, [
                    createBaseVNode("h3", _hoisted_39, toDisplayString(detailNotification.value.title || "无标题"), 1),
                    createBaseVNode("div", _hoisted_40, [
                      createBaseVNode("span", _hoisted_41, toDisplayString(getNotificationTypeText(detailNotification.value.notification_type)), 1),
                      createBaseVNode("span", _hoisted_42, toDisplayString(getPriorityText(detailNotification.value.priority)), 1),
                      detailNotification.value.is_read ? (openBlock(), createElementBlock("span", _hoisted_43, "已读")) : (openBlock(), createElementBlock("span", _hoisted_44, "未读"))
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_45, [
                    createBaseVNode("div", _hoisted_46, toDisplayString(detailNotification.value.content || "暂无内容"), 1)
                  ]),
                  createBaseVNode("div", _hoisted_47, [
                    createBaseVNode("div", _hoisted_48, [
                      _cache[17] || (_cache[17] = createBaseVNode("i", { class: "el-icon-time" }, null, -1)),
                      createTextVNode(" " + toDisplayString(formatDateTime(detailNotification.value.created_at)) + " ", 1),
                      detailNotification.value.read_at ? (openBlock(), createElementBlock("span", _hoisted_49, " · 已读于 " + toDisplayString(formatDateTime(detailNotification.value.read_at)), 1)) : createCommentVNode("", true)
                    ]),
                    createBaseVNode("div", _hoisted_50, [
                      !detailNotification.value.is_read ? (openBlock(), createBlock(_component_el_button, {
                        key: 0,
                        type: "primary",
                        size: "small",
                        onClick: _cache[0] || (_cache[0] = ($event) => markNotificationAsRead(detailNotification.value.id))
                      }, {
                        default: withCtx(() => [..._cache[18] || (_cache[18] = [
                          createTextVNode(" 标记为已读 ", -1)
                        ])]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_el_button, {
                        size: "small",
                        onClick: _cache[1] || (_cache[1] = ($event) => closeNotification(detailNotification.value.id))
                      }, {
                        default: withCtx(() => [..._cache[19] || (_cache[19] = [
                          createTextVNode(" 关闭 ", -1)
                        ])]),
                        _: 1
                      })
                    ])
                  ])
                ])) : (openBlock(), createElementBlock("div", _hoisted_51, [..._cache[20] || (_cache[20] = [
                  createBaseVNode("div", { class: "empty-icon" }, "👆", -1),
                  createBaseVNode("h3", { class: "empty-title" }, "选择通知查看详情", -1),
                  createBaseVNode("p", { class: "empty-description" }, "点击左侧通知列表中的任意一条通知，即可查看详细内容", -1)
                ])]))
              ])
            ])
          ]),
          _: 1
        }, 8, ["modelValue", "width"]),
        isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_52, [
          createBaseVNode("div", {
            class: "nav-indicator",
            style: normalizeStyle(indicatorStyle.value)
          }, null, 4),
          createBaseVNode("div", _hoisted_53, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(navItems.value, (item) => {
              return openBlock(), createElementBlock("div", {
                key: item.path,
                class: normalizeClass(["nav-item", { active: isActive(item.path) }]),
                onClick: ($event) => _ctx.$router.push(item.path)
              }, [
                createVNode(_component_el_icon, { class: "nav-icon" }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock(resolveDynamicComponent(iconMap[item.iconKey])))
                  ]),
                  _: 2
                }, 1024),
                createBaseVNode("span", _hoisted_55, toDisplayString(item.label), 1)
              ], 10, _hoisted_54);
            }), 128))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const MainLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e91cc6db"]]);
export {
  MainLayout as default
};
//# sourceMappingURL=MainLayout-CQnw-UfT.js.map
