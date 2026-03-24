import { a as api, _ as _export_sfc } from "./index-DfUEOATv.js";
/* empty css                              */
/* empty css                       */
/* empty css                */
/* empty css                   */
/* empty css                      */
/* empty css                   */
/* empty css                  */
/* empty css                    */
/* empty css                        */
/* empty css                 */
/* empty css                          */
import { y as defineComponent, r as ref, k as reactive, c as computed, l as onMounted, U as onUnmounted, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, O as createTextVNode, u as unref, K as withDirectives, L as createCommentVNode, Q as Fragment, a6 as renderList, E as normalizeClass, I as createBlock, M as resolveDynamicComponent, P as toDisplayString, W as withModifiers, A as openBlock } from "./vendor-DT2rKQnu.js";
import { a as ElIcon, an as plus_default, c as ElButton, K as refresh_default, aa as check_default, C as delete_default, as as more_filled_default, N as ElDropdownMenu, O as ElDropdownItem, D as ElDropdown, Y as ElSelect, Z as ElOption, am as ElDatePicker, e as ElInput, L as search_default, a1 as ElCard, ao as vLoading, a6 as ElEmpty, X as ElTag, f as user_default, H as ElPagination, q as ElDialog, b as ElForm, d as ElFormItem, az as ElRadioGroup, aW as ElRadio, E as ElMessage, I as ElMessageBox, aF as bell_default, m as message_default, ax as tools_default, l as lock_default, aJ as warning_default, h as upload_default, aN as info_filled_default } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "notification-history-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-content" };
const _hoisted_4 = { class: "header-actions" };
const _hoisted_5 = { class: "desktop-actions" };
const _hoisted_6 = { class: "mobile-actions" };
const _hoisted_7 = { class: "filter-section" };
const _hoisted_8 = { class: "desktop-filter" };
const _hoisted_9 = { class: "filter-content" };
const _hoisted_10 = { class: "filter-left" };
const _hoisted_11 = { class: "filter-right" };
const _hoisted_12 = { class: "mobile-filter" };
const _hoisted_13 = { class: "mobile-filter-row" };
const _hoisted_14 = { class: "mobile-filter-row" };
const _hoisted_15 = { class: "mobile-filter-row" };
const _hoisted_16 = { class: "mobile-filter-row" };
const _hoisted_17 = { class: "notifications-section" };
const _hoisted_18 = { class: "card-header" };
const _hoisted_19 = { class: "header-stats" };
const _hoisted_20 = { class: "dialog-footer" };
const _hoisted_21 = { class: "dialog-button-group" };
const _hoisted_22 = { class: "dialog-button-item" };
const _hoisted_23 = { class: "dialog-button-item" };
const _hoisted_24 = { class: "notifications-list" };
const _hoisted_25 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_26 = {
  key: 1,
  class: "notification-items"
};
const _hoisted_27 = ["onClick"];
const _hoisted_28 = { class: "notification-icon" };
const _hoisted_29 = { class: "notification-content" };
const _hoisted_30 = { class: "notification-header" };
const _hoisted_31 = { class: "notification-title" };
const _hoisted_32 = { class: "notification-meta" };
const _hoisted_33 = { class: "notification-time" };
const _hoisted_34 = { class: "notification-body" };
const _hoisted_35 = { class: "notification-text" };
const _hoisted_36 = { class: "notification-footer" };
const _hoisted_37 = { class: "notification-user" };
const _hoisted_38 = { class: "notification-status" };
const _hoisted_39 = {
  key: 2,
  class: "read-time"
};
const _hoisted_40 = { class: "notification-actions" };
const _hoisted_41 = {
  key: 0,
  class: "pagination-section"
};
const _hoisted_42 = {
  key: 0,
  class: "notification-detail"
};
const _hoisted_43 = { class: "detail-header" };
const _hoisted_44 = { class: "detail-meta" };
const _hoisted_45 = { class: "detail-time" };
const _hoisted_46 = { class: "detail-content" };
const _hoisted_47 = { class: "detail-footer" };
const _hoisted_48 = { class: "detail-user" };
const _hoisted_49 = { class: "detail-status" };
const _hoisted_50 = {
  key: 2,
  class: "read-time"
};
const _hoisted_51 = { class: "dialog-footer" };
const _hoisted_52 = { class: "dialog-button-group" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NotificationHistory",
  setup(__props) {
    const loading = ref(false);
    const saving = ref(false);
    const isMobile = ref(false);
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < 768;
    };
    const handleMobileAction = (command) => {
      switch (command) {
        case "create":
          showCreateNotificationDialog();
          break;
        case "refresh":
          refreshNotifications();
          break;
        case "markAll":
          markAllAsRead();
          break;
        case "clean":
          cleanExpiredNotifications();
          break;
      }
    };
    const notifications = ref([]);
    const totalCount = ref(0);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const detailDialogVisible = ref(false);
    const selectedNotification = ref(null);
    const notificationDialogVisible = ref(false);
    const isEditing = ref(false);
    const notificationFormRef = ref();
    const notificationForm = reactive({
      id: null,
      title: "",
      content: "",
      type: "system",
      priority: "normal",
      sendAt: "",
      deleteAt: "",
      target: "all"
    });
    const notificationRules = {
      title: [
        { required: true, message: "请输入通知标题", trigger: "blur" },
        { min: 1, max: 100, message: "标题长度在1到100个字符", trigger: "blur" }
      ],
      content: [
        { required: true, message: "请输入通知内容", trigger: "blur" },
        { min: 1, max: 500, message: "内容长度在1到500个字符", trigger: "blur" }
      ],
      type: [
        { required: true, message: "请选择通知类型", trigger: "change" }
      ],
      priority: [
        { required: true, message: "请选择优先级", trigger: "change" }
      ],
      sendAt: [
        { required: true, message: "请选择发送时间", trigger: "change" }
      ]
    };
    const filters = reactive({
      type: "",
      status: "",
      dateRange: null,
      // 桌面端仍使用范围
      startDate: "",
      // 移动端开始日期
      endDate: "",
      // 移动端结束日期
      keyword: ""
    });
    const unreadCount = computed(() => {
      return notifications.value.filter((n) => !n.is_read).length;
    });
    const hasUnreadNotifications = computed(() => {
      return unreadCount.value > 0;
    });
    const fetchNotifications = async () => {
      loading.value = true;
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          offset: (currentPage.value - 1) * pageSize.value
        };
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.dateRange && Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
          params.startDate = filters.dateRange[0];
          params.endDate = filters.dateRange[1];
        } else {
          if (filters.startDate) params.startDate = filters.startDate;
          if (filters.endDate) params.endDate = filters.endDate;
        }
        const response = await api.get("/admin/notifications", { params });
        notifications.value = response.data.notifications;
        totalCount.value = response.data.total;
      } catch (error) {
        ElMessage.error("获取通知列表失败");
      } finally {
        loading.value = false;
      }
    };
    const refreshNotifications = () => {
      fetchNotifications();
    };
    const handleFilterChange = () => {
      currentPage.value = 1;
      fetchNotifications();
    };
    const handleSearch = () => {
      currentPage.value = 1;
      fetchNotifications();
    };
    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
      fetchNotifications();
    };
    const handleCurrentChange = (page) => {
      currentPage.value = page;
      fetchNotifications();
    };
    const handleNotificationClick = (notification) => {
      selectedNotification.value = notification;
      detailDialogVisible.value = true;
      if (!notification.is_read) {
        markAsRead(notification.id);
      }
    };
    const markAsRead = async (notificationId) => {
      try {
        await api.put(`/auth/notifications/${notificationId}/read`);
        const notification = notifications.value.find((n) => n.id === notificationId);
        if (notification) {
          notification.is_read = true;
          notification.read_at = (/* @__PURE__ */ new Date()).toISOString();
        }
        ElMessage.success("通知已标记为已读");
      } catch (error) {
        ElMessage.error("标记通知为已读失败");
      }
    };
    const markAllAsRead = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要将所有未读通知标记为已读吗？",
          "确认操作",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        const unreadNotifications = notifications.value.filter((n) => !n.is_read);
        for (const notification of unreadNotifications) {
          await markAsRead(notification.id);
        }
        ElMessage.success("所有通知已标记为已读");
      } catch (error) {
      }
    };
    const deleteNotification = async (notificationId) => {
      try {
        await ElMessageBox.confirm(
          "确定要删除这条通知吗？此操作不可恢复。",
          "确认删除",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        await api.delete(`/admin/notifications/${notificationId}`);
        const index = notifications.value.findIndex((n) => n.id === notificationId);
        if (index > -1) {
          notifications.value.splice(index, 1);
          totalCount.value--;
        }
        ElMessage.success("通知已删除");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除通知失败");
        }
      }
    };
    const cleanExpiredNotifications = async () => {
      try {
        await ElMessageBox.confirm(
          "确定要清理过期通知吗？此操作将删除超过保留期限的通知记录。",
          "确认清理",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        const response = await api.delete("/admin/notifications/cleanup");
        ElMessage.success(response.data.message);
        fetchNotifications();
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("清理过期通知失败");
        }
      }
    };
    const getNotificationIcon = (type) => {
      const iconMap = {
        login: "login-icon",
        upload: "upload-icon",
        storage_warning: "warning-icon",
        security_alert: "security-icon",
        maintenance: "maintenance-icon",
        email: "email-icon",
        system: "system-icon"
      };
      return iconMap[type] || "default-icon";
    };
    const getNotificationIconComponent = (type) => {
      const iconMap = {
        login: user_default,
        upload: upload_default,
        storage_warning: warning_default,
        security_alert: lock_default,
        maintenance: tools_default,
        email: message_default,
        system: bell_default
      };
      return iconMap[type] || info_filled_default;
    };
    const getNotificationTypeName = (type) => {
      const nameMap = {
        login: "登录通知",
        upload: "文件上传通知",
        storage_warning: "存储空间警告",
        security_alert: "安全提醒",
        maintenance: "系统维护通知",
        email: "邮件通知",
        system: "系统通知"
      };
      return nameMap[type] || "未知类型";
    };
    const getNotificationTypeTag = (type) => {
      const tagMap = {
        login: "primary",
        upload: "success",
        storage_warning: "warning",
        security_alert: "danger",
        maintenance: "info",
        email: "primary",
        system: "info"
      };
      return tagMap[type] || "info";
    };
    const formatTime = (time) => {
      return new Date(time).toLocaleString("zh-CN");
    };
    const showCreateNotificationDialog = () => {
      isEditing.value = false;
      resetNotificationForm();
      notificationDialogVisible.value = true;
    };
    const showEditNotificationDialog = (notification) => {
      isEditing.value = true;
      notificationForm.id = notification.id;
      notificationForm.title = notification.title;
      notificationForm.content = notification.content;
      notificationForm.type = notification.notification_type;
      notificationForm.priority = notification.priority || "normal";
      notificationForm.sendAt = notification.send_at;
      notificationForm.deleteAt = notification.delete_at;
      notificationForm.target = notification.target || "all";
      notificationDialogVisible.value = true;
    };
    const resetNotificationForm = () => {
      notificationForm.id = null;
      notificationForm.title = "";
      notificationForm.content = "";
      notificationForm.type = "system";
      notificationForm.priority = "normal";
      notificationForm.sendAt = "";
      notificationForm.deleteAt = "";
      notificationForm.target = "all";
    };
    const saveNotification = async () => {
      if (!notificationFormRef.value) return;
      try {
        await notificationFormRef.value.validate();
        saving.value = true;
        const data = {
          title: notificationForm.title,
          content: notificationForm.content,
          notification_type: notificationForm.type,
          priority: notificationForm.priority,
          send_at: notificationForm.sendAt,
          delete_at: notificationForm.deleteAt || null,
          target: notificationForm.target
        };
        if (isEditing.value) {
          await api.put(`/admin/notifications/${notificationForm.id}`, data);
          ElMessage.success("通知更新成功");
        } else {
          await api.post("/admin/notifications", data);
          ElMessage.success("通知创建成功");
        }
        notificationDialogVisible.value = false;
        fetchNotifications();
      } catch (error) {
        ElMessage.error(isEditing.value ? "更新通知失败" : "创建通知失败");
      } finally {
        saving.value = false;
      }
    };
    onMounted(() => {
      checkScreenSize();
      fetchNotifications();
      window.addEventListener("resize", checkScreenSize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", checkScreenSize);
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_date_picker = ElDatePicker;
      const _component_el_input = ElInput;
      const _component_el_card = ElCard;
      const _component_el_tag = ElTag;
      const _component_el_form_item = ElFormItem;
      const _component_el_radio = ElRadio;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_form = ElForm;
      const _component_el_dialog = ElDialog;
      const _component_el_empty = ElEmpty;
      const _component_el_pagination = ElPagination;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[32] || (_cache[32] = createBaseVNode("div", { class: "header-left" }, [
              createBaseVNode("h1", { class: "page-title" }, "通知管理"),
              createBaseVNode("p", { class: "page-subtitle" }, "查看和管理系统通知记录")
            ], -1)),
            createBaseVNode("div", _hoisted_4, [
              createBaseVNode("div", _hoisted_5, [
                createVNode(_component_el_button, {
                  type: "primary",
                  onClick: showCreateNotificationDialog
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(plus_default))
                      ]),
                      _: 1
                    }),
                    _cache[23] || (_cache[23] = createTextVNode(" 编辑通知 ", -1))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_button, {
                  onClick: refreshNotifications,
                  loading: loading.value
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(refresh_default))
                      ]),
                      _: 1
                    }),
                    _cache[24] || (_cache[24] = createTextVNode(" 刷新 ", -1))
                  ]),
                  _: 1
                }, 8, ["loading"]),
                createVNode(_component_el_button, {
                  onClick: markAllAsRead,
                  disabled: !hasUnreadNotifications.value
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(check_default))
                      ]),
                      _: 1
                    }),
                    _cache[25] || (_cache[25] = createTextVNode(" 全部标记为已读 ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled"]),
                createVNode(_component_el_button, {
                  onClick: cleanExpiredNotifications,
                  type: "danger"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(delete_default))
                      ]),
                      _: 1
                    }),
                    _cache[26] || (_cache[26] = createTextVNode(" 清理过期通知 ", -1))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_6, [
                createVNode(_component_el_dropdown, {
                  onCommand: handleMobileAction,
                  placement: "bottom-end"
                }, {
                  dropdown: withCtx(() => [
                    createVNode(_component_el_dropdown_menu, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_dropdown_item, { command: "create" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(plus_default))
                              ]),
                              _: 1
                            }),
                            _cache[28] || (_cache[28] = createTextVNode(" 编辑通知 ", -1))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, { command: "refresh" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(refresh_default))
                              ]),
                              _: 1
                            }),
                            _cache[29] || (_cache[29] = createTextVNode(" 刷新 ", -1))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_dropdown_item, {
                          command: "markAll",
                          disabled: !hasUnreadNotifications.value
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(check_default))
                              ]),
                              _: 1
                            }),
                            _cache[30] || (_cache[30] = createTextVNode(" 全部标记为已读 ", -1))
                          ]),
                          _: 1
                        }, 8, ["disabled"]),
                        createVNode(_component_el_dropdown_item, {
                          command: "clean",
                          divided: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(delete_default))
                              ]),
                              _: 1
                            }),
                            _cache[31] || (_cache[31] = createTextVNode(" 清理过期通知 ", -1))
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: "primary",
                      size: "small"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(more_filled_default))
                          ]),
                          _: 1
                        }),
                        _cache[27] || (_cache[27] = createTextVNode(" 操作 ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ])
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_7, [
          createVNode(_component_el_card, { class: "filter-card" }, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_8, [
                createBaseVNode("div", _hoisted_9, [
                  createBaseVNode("div", _hoisted_10, [
                    createVNode(_component_el_select, {
                      modelValue: filters.type,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.type = $event),
                      placeholder: "通知类型",
                      clearable: "",
                      onChange: handleFilterChange
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "全部",
                          value: ""
                        }),
                        createVNode(_component_el_option, {
                          label: "登录通知",
                          value: "login"
                        }),
                        createVNode(_component_el_option, {
                          label: "文件上传通知",
                          value: "upload"
                        }),
                        createVNode(_component_el_option, {
                          label: "存储空间警告",
                          value: "storage_warning"
                        }),
                        createVNode(_component_el_option, {
                          label: "安全提醒",
                          value: "security_alert"
                        }),
                        createVNode(_component_el_option, {
                          label: "系统维护通知",
                          value: "maintenance"
                        }),
                        createVNode(_component_el_option, {
                          label: "邮件通知",
                          value: "email"
                        }),
                        createVNode(_component_el_option, {
                          label: "系统通知",
                          value: "system"
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"]),
                    createVNode(_component_el_select, {
                      modelValue: filters.status,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.status = $event),
                      placeholder: "状态",
                      clearable: "",
                      onChange: handleFilterChange
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "全部",
                          value: ""
                        }),
                        createVNode(_component_el_option, {
                          label: "未读",
                          value: "unread"
                        }),
                        createVNode(_component_el_option, {
                          label: "已读",
                          value: "read"
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"]),
                    createVNode(_component_el_date_picker, {
                      modelValue: filters.dateRange,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.dateRange = $event),
                      type: "daterange",
                      "range-separator": "至",
                      "start-placeholder": "开始日期",
                      "end-placeholder": "结束日期",
                      format: "YYYY-MM-DD",
                      "value-format": "YYYY-MM-DD",
                      onChange: handleFilterChange
                    }, null, 8, ["modelValue"])
                  ]),
                  createBaseVNode("div", _hoisted_11, [
                    createVNode(_component_el_input, {
                      modelValue: filters.keyword,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => filters.keyword = $event),
                      placeholder: "搜索通知内容",
                      clearable: "",
                      onInput: handleSearch,
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
                    }, 8, ["modelValue"])
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_12, [
                createBaseVNode("div", _hoisted_13, [
                  createVNode(_component_el_input, {
                    modelValue: filters.keyword,
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => filters.keyword = $event),
                    placeholder: "搜索通知内容",
                    clearable: "",
                    onInput: handleSearch
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
                createBaseVNode("div", _hoisted_14, [
                  createVNode(_component_el_select, {
                    modelValue: filters.type,
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => filters.type = $event),
                    placeholder: "通知类型",
                    clearable: "",
                    onChange: handleFilterChange
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "全部",
                        value: ""
                      }),
                      createVNode(_component_el_option, {
                        label: "登录通知",
                        value: "login"
                      }),
                      createVNode(_component_el_option, {
                        label: "文件上传通知",
                        value: "upload"
                      }),
                      createVNode(_component_el_option, {
                        label: "存储空间警告",
                        value: "storage_warning"
                      }),
                      createVNode(_component_el_option, {
                        label: "安全提醒",
                        value: "security_alert"
                      }),
                      createVNode(_component_el_option, {
                        label: "系统维护通知",
                        value: "maintenance"
                      }),
                      createVNode(_component_el_option, {
                        label: "邮件通知",
                        value: "email"
                      }),
                      createVNode(_component_el_option, {
                        label: "系统通知",
                        value: "system"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"]),
                  createVNode(_component_el_select, {
                    modelValue: filters.status,
                    "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => filters.status = $event),
                    placeholder: "状态",
                    clearable: "",
                    onChange: handleFilterChange
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_option, {
                        label: "全部",
                        value: ""
                      }),
                      createVNode(_component_el_option, {
                        label: "未读",
                        value: "unread"
                      }),
                      createVNode(_component_el_option, {
                        label: "已读",
                        value: "read"
                      })
                    ]),
                    _: 1
                  }, 8, ["modelValue"])
                ]),
                createBaseVNode("div", _hoisted_15, [
                  createVNode(_component_el_date_picker, {
                    modelValue: filters.startDate,
                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => filters.startDate = $event),
                    type: "date",
                    placeholder: "开始日期",
                    format: "YYYY-MM-DD",
                    "value-format": "YYYY-MM-DD",
                    onChange: handleFilterChange,
                    style: { "width": "100%" }
                  }, null, 8, ["modelValue"])
                ]),
                createBaseVNode("div", _hoisted_16, [
                  createVNode(_component_el_date_picker, {
                    modelValue: filters.endDate,
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => filters.endDate = $event),
                    type: "date",
                    placeholder: "结束日期",
                    format: "YYYY-MM-DD",
                    "value-format": "YYYY-MM-DD",
                    onChange: handleFilterChange,
                    style: { "width": "100%" }
                  }, null, 8, ["modelValue"])
                ])
              ])
            ]),
            _: 1
          })
        ]),
        createBaseVNode("div", _hoisted_17, [
          createVNode(_component_el_card, { class: "notifications-card" }, {
            header: withCtx(() => [
              createBaseVNode("div", _hoisted_18, [
                _cache[37] || (_cache[37] = createBaseVNode("div", { class: "header-left" }, [
                  createBaseVNode("span", { class: "card-title" }, "通知列表")
                ], -1)),
                createBaseVNode("div", _hoisted_19, [
                  createVNode(_component_el_tag, {
                    type: "info",
                    size: "small"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("总计: " + toDisplayString(totalCount.value), 1)
                    ]),
                    _: 1
                  }),
                  unreadCount.value > 0 ? (openBlock(), createBlock(_component_el_tag, {
                    key: 0,
                    type: "warning",
                    size: "small"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("未读: " + toDisplayString(unreadCount.value), 1)
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                createVNode(_component_el_dialog, {
                  modelValue: notificationDialogVisible.value,
                  "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => notificationDialogVisible.value = $event),
                  title: isEditing.value ? "编辑通知" : "创建通知",
                  width: isMobile.value ? "95%" : "600px",
                  "close-on-click-modal": false,
                  class: "notification-dialog"
                }, {
                  footer: withCtx(() => [
                    createBaseVNode("div", _hoisted_20, [
                      createBaseVNode("div", _hoisted_21, [
                        createBaseVNode("div", _hoisted_22, [
                          createVNode(_component_el_button, {
                            onClick: _cache[16] || (_cache[16] = ($event) => notificationDialogVisible.value = false)
                          }, {
                            default: withCtx(() => [..._cache[36] || (_cache[36] = [
                              createTextVNode("取消", -1)
                            ])]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_23, [
                          createVNode(_component_el_button, {
                            type: "primary",
                            onClick: saveNotification,
                            loading: saving.value
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(isEditing.value ? "更新" : "创建"), 1)
                            ]),
                            _: 1
                          }, 8, ["loading"])
                        ])
                      ])
                    ])
                  ]),
                  default: withCtx(() => [
                    createVNode(_component_el_form, {
                      ref_key: "notificationFormRef",
                      ref: notificationFormRef,
                      model: notificationForm,
                      rules: notificationRules,
                      "label-width": "100px"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_form_item, {
                          label: "通知标题",
                          prop: "title"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_input, {
                              modelValue: notificationForm.title,
                              "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => notificationForm.title = $event),
                              placeholder: "请输入通知标题",
                              maxlength: "100",
                              "show-word-limit": ""
                            }, null, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, {
                          label: "通知内容",
                          prop: "content"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_input, {
                              modelValue: notificationForm.content,
                              "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => notificationForm.content = $event),
                              type: "textarea",
                              rows: 4,
                              placeholder: "请输入通知内容",
                              maxlength: "500",
                              "show-word-limit": ""
                            }, null, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, {
                          label: "通知类型",
                          prop: "type"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_select, {
                              modelValue: notificationForm.type,
                              "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => notificationForm.type = $event),
                              placeholder: "请选择通知类型"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_option, {
                                  label: "系统通知",
                                  value: "system"
                                }),
                                createVNode(_component_el_option, {
                                  label: "维护通知",
                                  value: "maintenance"
                                }),
                                createVNode(_component_el_option, {
                                  label: "安全提醒",
                                  value: "security_alert"
                                }),
                                createVNode(_component_el_option, {
                                  label: "存储警告",
                                  value: "storage_warning"
                                }),
                                createVNode(_component_el_option, {
                                  label: "邮件通知",
                                  value: "email"
                                })
                              ]),
                              _: 1
                            }, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, {
                          label: "优先级",
                          prop: "priority"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_select, {
                              modelValue: notificationForm.priority,
                              "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => notificationForm.priority = $event),
                              placeholder: "请选择优先级"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_option, {
                                  label: "低",
                                  value: "low"
                                }),
                                createVNode(_component_el_option, {
                                  label: "普通",
                                  value: "normal"
                                }),
                                createVNode(_component_el_option, {
                                  label: "高",
                                  value: "high"
                                }),
                                createVNode(_component_el_option, {
                                  label: "紧急",
                                  value: "urgent"
                                })
                              ]),
                              _: 1
                            }, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, {
                          label: "发送时间",
                          prop: "sendAt"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_date_picker, {
                              modelValue: notificationForm.sendAt,
                              "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => notificationForm.sendAt = $event),
                              type: "datetime",
                              placeholder: "选择发送时间",
                              format: "YYYY-MM-DD HH:mm:ss",
                              "value-format": "YYYY-MM-DD HH:mm:ss"
                            }, null, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, {
                          label: "删除时间",
                          prop: "deleteAt"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_date_picker, {
                              modelValue: notificationForm.deleteAt,
                              "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => notificationForm.deleteAt = $event),
                              type: "datetime",
                              placeholder: "选择删除时间（可选）",
                              format: "YYYY-MM-DD HH:mm:ss",
                              "value-format": "YYYY-MM-DD HH:mm:ss"
                            }, null, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_form_item, { label: "发送范围" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_radio_group, {
                              modelValue: notificationForm.target,
                              "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => notificationForm.target = $event)
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_radio, { label: "all" }, {
                                  default: withCtx(() => [..._cache[33] || (_cache[33] = [
                                    createTextVNode("所有用户", -1)
                                  ])]),
                                  _: 1
                                }),
                                createVNode(_component_el_radio, { label: "admin" }, {
                                  default: withCtx(() => [..._cache[34] || (_cache[34] = [
                                    createTextVNode("仅管理员", -1)
                                  ])]),
                                  _: 1
                                }),
                                createVNode(_component_el_radio, { label: "user" }, {
                                  default: withCtx(() => [..._cache[35] || (_cache[35] = [
                                    createTextVNode("仅普通用户", -1)
                                  ])]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }, 8, ["modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["model"])
                  ]),
                  _: 1
                }, 8, ["modelValue", "title", "width"])
              ])
            ]),
            default: withCtx(() => [
              withDirectives((openBlock(), createElementBlock("div", _hoisted_24, [
                notifications.value.length === 0 && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_25, [
                  createVNode(_component_el_empty, { description: "暂无通知记录" })
                ])) : (openBlock(), createElementBlock("div", _hoisted_26, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(notifications.value, (notification) => {
                    return openBlock(), createElementBlock("div", {
                      key: notification.id,
                      class: normalizeClass(["notification-item", { "unread": !notification.is_read }]),
                      onClick: ($event) => handleNotificationClick(notification)
                    }, [
                      createBaseVNode("div", _hoisted_28, [
                        createVNode(_component_el_icon, {
                          class: normalizeClass(getNotificationIcon(notification.notification_type))
                        }, {
                          default: withCtx(() => [
                            (openBlock(), createBlock(resolveDynamicComponent(getNotificationIconComponent(notification.notification_type))))
                          ]),
                          _: 2
                        }, 1032, ["class"])
                      ]),
                      createBaseVNode("div", _hoisted_29, [
                        createBaseVNode("div", _hoisted_30, [
                          createBaseVNode("h4", _hoisted_31, toDisplayString(notification.title), 1),
                          createBaseVNode("div", _hoisted_32, [
                            createVNode(_component_el_tag, {
                              type: getNotificationTypeTag(notification.notification_type),
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(getNotificationTypeName(notification.notification_type)), 1)
                              ]),
                              _: 2
                            }, 1032, ["type"]),
                            createBaseVNode("span", _hoisted_33, toDisplayString(formatTime(notification.created_at)), 1)
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_34, [
                          createBaseVNode("p", _hoisted_35, toDisplayString(notification.content), 1)
                        ]),
                        createBaseVNode("div", _hoisted_36, [
                          createBaseVNode("div", _hoisted_37, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(user_default))
                              ]),
                              _: 1
                            }),
                            createBaseVNode("span", null, toDisplayString(notification.username), 1)
                          ]),
                          createBaseVNode("div", _hoisted_38, [
                            !notification.is_read ? (openBlock(), createBlock(_component_el_tag, {
                              key: 0,
                              type: "warning",
                              size: "small"
                            }, {
                              default: withCtx(() => [..._cache[38] || (_cache[38] = [
                                createTextVNode("未读", -1)
                              ])]),
                              _: 1
                            })) : (openBlock(), createBlock(_component_el_tag, {
                              key: 1,
                              type: "success",
                              size: "small"
                            }, {
                              default: withCtx(() => [..._cache[39] || (_cache[39] = [
                                createTextVNode("已读", -1)
                              ])]),
                              _: 1
                            })),
                            notification.read_at ? (openBlock(), createElementBlock("span", _hoisted_39, " 阅读时间: " + toDisplayString(formatTime(notification.read_at)), 1)) : createCommentVNode("", true)
                          ])
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_40, [
                        createVNode(_component_el_button, {
                          type: "text",
                          size: "small",
                          onClick: withModifiers(($event) => showEditNotificationDialog(notification), ["stop"])
                        }, {
                          default: withCtx(() => [..._cache[40] || (_cache[40] = [
                            createTextVNode(" 编辑 ", -1)
                          ])]),
                          _: 1
                        }, 8, ["onClick"]),
                        !notification.is_read ? (openBlock(), createBlock(_component_el_button, {
                          key: 0,
                          type: "primary",
                          size: "small",
                          onClick: withModifiers(($event) => markAsRead(notification.id), ["stop"])
                        }, {
                          default: withCtx(() => [..._cache[41] || (_cache[41] = [
                            createTextVNode(" 标记已读 ", -1)
                          ])]),
                          _: 1
                        }, 8, ["onClick"])) : createCommentVNode("", true),
                        createVNode(_component_el_button, {
                          type: "danger",
                          size: "small",
                          onClick: withModifiers(($event) => deleteNotification(notification.id), ["stop"])
                        }, {
                          default: withCtx(() => [..._cache[42] || (_cache[42] = [
                            createTextVNode(" 删除 ", -1)
                          ])]),
                          _: 1
                        }, 8, ["onClick"])
                      ])
                    ], 10, _hoisted_27);
                  }), 128))
                ]))
              ])), [
                [_directive_loading, loading.value]
              ]),
              totalCount.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_41, [
                createVNode(_component_el_pagination, {
                  "current-page": currentPage.value,
                  "onUpdate:currentPage": _cache[18] || (_cache[18] = ($event) => currentPage.value = $event),
                  "page-size": pageSize.value,
                  "onUpdate:pageSize": _cache[19] || (_cache[19] = ($event) => pageSize.value = $event),
                  "page-sizes": [10, 20, 50, 100],
                  total: totalCount.value,
                  layout: "total, sizes, prev, pager, next, jumper",
                  onSizeChange: handleSizeChange,
                  onCurrentChange: handleCurrentChange
                }, null, 8, ["current-page", "page-size", "total"])
              ])) : createCommentVNode("", true)
            ]),
            _: 1
          })
        ]),
        createVNode(_component_el_dialog, {
          modelValue: detailDialogVisible.value,
          "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => detailDialogVisible.value = $event),
          title: "通知详情",
          width: isMobile.value ? "95%" : "600px",
          "close-on-click-modal": false,
          class: "notification-detail-dialog",
          "append-to-body": true
        }, {
          footer: withCtx(() => [
            createBaseVNode("div", _hoisted_51, [
              createBaseVNode("div", _hoisted_52, [
                createVNode(_component_el_button, {
                  onClick: _cache[20] || (_cache[20] = ($event) => detailDialogVisible.value = false),
                  size: "default"
                }, {
                  default: withCtx(() => [..._cache[45] || (_cache[45] = [
                    createTextVNode(" 关闭 ", -1)
                  ])]),
                  _: 1
                }),
                selectedNotification.value && !selectedNotification.value.is_read ? (openBlock(), createBlock(_component_el_button, {
                  key: 0,
                  type: "primary",
                  onClick: _cache[21] || (_cache[21] = ($event) => markAsRead(selectedNotification.value.id)),
                  size: "default"
                }, {
                  default: withCtx(() => [..._cache[46] || (_cache[46] = [
                    createTextVNode(" 标记已读 ", -1)
                  ])]),
                  _: 1
                })) : createCommentVNode("", true)
              ])
            ])
          ]),
          default: withCtx(() => [
            selectedNotification.value ? (openBlock(), createElementBlock("div", _hoisted_42, [
              createBaseVNode("div", _hoisted_43, [
                createBaseVNode("h3", null, toDisplayString(selectedNotification.value.title), 1),
                createBaseVNode("div", _hoisted_44, [
                  createVNode(_component_el_tag, {
                    type: getNotificationTypeTag(selectedNotification.value.notification_type)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(getNotificationTypeName(selectedNotification.value.notification_type)), 1)
                    ]),
                    _: 1
                  }, 8, ["type"]),
                  createBaseVNode("span", _hoisted_45, toDisplayString(formatTime(selectedNotification.value.created_at)), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_46, [
                createBaseVNode("p", null, toDisplayString(selectedNotification.value.content), 1)
              ]),
              createBaseVNode("div", _hoisted_47, [
                createBaseVNode("div", _hoisted_48, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(user_default))
                    ]),
                    _: 1
                  }),
                  createBaseVNode("span", null, "用户: " + toDisplayString(selectedNotification.value.username), 1)
                ]),
                createBaseVNode("div", _hoisted_49, [
                  !selectedNotification.value.is_read ? (openBlock(), createBlock(_component_el_tag, {
                    key: 0,
                    type: "warning"
                  }, {
                    default: withCtx(() => [..._cache[43] || (_cache[43] = [
                      createTextVNode("未读", -1)
                    ])]),
                    _: 1
                  })) : (openBlock(), createBlock(_component_el_tag, {
                    key: 1,
                    type: "success"
                  }, {
                    default: withCtx(() => [..._cache[44] || (_cache[44] = [
                      createTextVNode("已读", -1)
                    ])]),
                    _: 1
                  })),
                  selectedNotification.value.read_at ? (openBlock(), createElementBlock("span", _hoisted_50, " 阅读时间: " + toDisplayString(formatTime(selectedNotification.value.read_at)), 1)) : createCommentVNode("", true)
                ])
              ])
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["modelValue", "width"])
      ]);
    };
  }
});
const NotificationHistory = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3e48c06a"]]);
export {
  NotificationHistory as default
};
//# sourceMappingURL=NotificationHistory-koqA91Yj.js.map
