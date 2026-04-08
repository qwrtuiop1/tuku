import { u as useAuthStore, m as useEmailCode, k as formatPercentage, f as formatFileSize, a as api, _ as _export_sfc } from "./index-CBkf_hqU.js";
/* empty css                   */
/* empty css                    */
/* empty css                     */
/* empty css                        */
/* empty css                    */
/* empty css                   */
/* empty css                */
/* empty css                 */
/* empty css                */
/* empty css                   */
import { y as defineComponent, r as ref, k as reactive, c as computed, w as watch, l as onMounted, U as onUnmounted, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, O as createTextVNode, u as unref, P as toDisplayString, L as createCommentVNode, E as normalizeClass, I as createBlock, T as Transition, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, a as ElIcon, a9 as check_default, c as ElButton, aj as ElCol, a1 as ElCard, a0 as ElAvatar, aS as ElUpload, aT as camera_default, X as ElTag, K as refresh_default, z as ElProgress, C as delete_default, au as ElSwitch, aC as ElTabs, aH as ElTabPane, b as ElForm, d as ElFormItem, e as ElInput, ag as ElRow, P as ElTooltip, ay as ElRadioGroup, aU as ElRadio, aI as warning_default, aM as info_filled_default, aV as success_filled_default, q as ElDialog, av as ElCheckboxGroup, g as ElCheckbox, I as ElMessageBox } from "./element-Bcpu2TdA.js";
const _hoisted_1 = { class: "user-center-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-content" };
const _hoisted_4 = { class: "header-actions" };
const _hoisted_5 = { class: "user-center-content" };
const _hoisted_6 = { class: "user-avatar-section" };
const _hoisted_7 = { class: "avatar-container" };
const _hoisted_8 = { class: "avatar-overlay" };
const _hoisted_9 = { class: "user-basic-info" };
const _hoisted_10 = { class: "username" };
const _hoisted_11 = { class: "user-role" };
const _hoisted_12 = { class: "user-email" };
const _hoisted_13 = { class: "storage-header" };
const _hoisted_14 = { class: "storage-progress" };
const _hoisted_15 = { class: "storage-info" };
const _hoisted_16 = { class: "used" };
const _hoisted_17 = { class: "total" };
const _hoisted_18 = { class: "storage-details" };
const _hoisted_19 = { class: "storage-item" };
const _hoisted_20 = { class: "value" };
const _hoisted_21 = { class: "storage-item" };
const _hoisted_22 = { class: "value" };
const _hoisted_23 = { class: "storage-item" };
const _hoisted_24 = { class: "value" };
const _hoisted_25 = { class: "storage-actions" };
const _hoisted_26 = { class: "action-button-wrapper" };
const _hoisted_27 = { class: "action-button-wrapper" };
const _hoisted_28 = { class: "quick-settings" };
const _hoisted_29 = { class: "setting-item" };
const _hoisted_30 = { class: "setting-control" };
const _hoisted_31 = {
  key: 0,
  class: "setting-status"
};
const _hoisted_32 = { class: "setting-item" };
const _hoisted_33 = { class: "setting-control" };
const _hoisted_34 = {
  key: 0,
  class: "setting-status"
};
const _hoisted_35 = {
  key: 1,
  class: "setting-status"
};
const _hoisted_36 = {
  key: 2,
  class: "setting-status success"
};
const _hoisted_37 = { class: "profile-section" };
const _hoisted_38 = { class: "profile-section" };
const _hoisted_39 = { class: "stat-card" };
const _hoisted_40 = { class: "stat-number" };
const _hoisted_41 = { class: "stat-card" };
const _hoisted_42 = { class: "stat-number" };
const _hoisted_43 = { class: "stat-card" };
const _hoisted_44 = { class: "stat-number" };
const _hoisted_45 = { class: "security-section" };
const _hoisted_46 = { class: "verification-code-input" };
const _hoisted_47 = { class: "form-hint" };
const _hoisted_48 = { class: "password-actions" };
const _hoisted_49 = { class: "security-section" };
const _hoisted_50 = { class: "bindings-list" };
const _hoisted_51 = { class: "binding-item" };
const _hoisted_52 = { class: "binding-info" };
const _hoisted_53 = { class: "binding-actions" };
const _hoisted_54 = { class: "binding-item" };
const _hoisted_55 = { class: "binding-info" };
const _hoisted_56 = { class: "binding-actions" };
const _hoisted_57 = {
  key: 0,
  class: "email-bind-panel"
};
const _hoisted_58 = { class: "code-row" };
const _hoisted_59 = { class: "email-bind-actions" };
const _hoisted_60 = { class: "binding-item" };
const _hoisted_61 = { class: "binding-info" };
const _hoisted_62 = { class: "binding-actions" };
const _hoisted_63 = { class: "security-section danger-zone" };
const _hoisted_64 = { class: "preferences-section" };
const _hoisted_65 = { class: "preferences-section" };
const _hoisted_66 = { class: "storage-analysis" };
const _hoisted_67 = { class: "analysis-section" };
const _hoisted_68 = { class: "type-card" };
const _hoisted_69 = { class: "type-info" };
const _hoisted_70 = { class: "type-size" };
const _hoisted_71 = { class: "type-count" };
const _hoisted_72 = { class: "type-card" };
const _hoisted_73 = { class: "type-info" };
const _hoisted_74 = { class: "type-size" };
const _hoisted_75 = { class: "type-count" };
const _hoisted_76 = { class: "type-card" };
const _hoisted_77 = { class: "type-info" };
const _hoisted_78 = { class: "type-size" };
const _hoisted_79 = { class: "type-count" };
const _hoisted_80 = { class: "analysis-section" };
const _hoisted_81 = { class: "storage-suggestions" };
const _hoisted_82 = {
  key: 0,
  class: "suggestion warning"
};
const _hoisted_83 = {
  key: 1,
  class: "suggestion caution"
};
const _hoisted_84 = {
  key: 2,
  class: "suggestion good"
};
const _hoisted_85 = { class: "storage-cleanup" };
const _hoisted_86 = { class: "cleanup-preview" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserCenter",
  setup(__props) {
    const authStore = useAuthStore();
    const router = useRouter();
    const activeTab = ref("profile");
    const saving = ref(false);
    const changingPassword = ref(false);
    const profileFormRef = ref();
    const passwordFormRef = ref();
    const { isSending: emailCodeSending, emailCodeCooldown, sendEmailCodeWithHuman } = useEmailCode();
    const refreshingStorage = ref(false);
    const showStorageDetails = ref(false);
    const showStorageCleanup = ref(false);
    const cleaning = ref(false);
    const cleanupOptions = ref([]);
    const storageDetails = reactive({
      imageSize: 0,
      videoSize: 0,
      otherSize: 0,
      imageCount: 0,
      videoCount: 0,
      otherCount: 0
    });
    const userInfo = reactive({
      username: "",
      email: "",
      display_name: "",
      bio: "",
      avatar_url: "",
      used_storage: 0,
      storage_limit: 0,
      created_at: "",
      last_login: ""
    });
    const userStats = reactive({
      totalFiles: 0,
      totalFolders: 0,
      loginCount: 0
    });
    const profileForm = reactive({
      username: "",
      email: "",
      display_name: "",
      bio: ""
    });
    const passwordForm = reactive({
      newPassword: "",
      confirmPassword: "",
      emailCode: ""
    });
    const preferences = reactive({
      defaultView: "grid",
      emailNotifications: true,
      storageWarnings: true,
      securityAlerts: true
    });
    const quickSettings = reactive({
      autoRefresh: true,
      notifications: true
    });
    const bindings = reactive({
      qq: false,
      qqOpenId: null,
      qqUnionId: null,
      qqNickname: "",
      qqAvatar: "",
      qqNumber: null,
      epass: false,
      epassId: null,
      email: null,
      hasPassword: true
    });
    const showEmailBindPanel = ref(false);
    const emailBind = reactive({
      email: "",
      code: "",
      binding: false
    });
    const sendEmailBindCode = async () => {
      if (!emailBind.email) {
        ElMessage.warning("请先输入邮箱");
        return;
      }
      await sendEmailCodeWithHuman(emailBind.email, "change_email");
    };
    const confirmEmailBind = async () => {
      var _a, _b, _c;
      if (!emailBind.email || !emailBind.code) {
        ElMessage.error("请填写邮箱和验证码");
        return;
      }
      emailBind.binding = true;
      try {
        const resp = await api.put("/auth/profile", { email: emailBind.email, emailCode: emailBind.code });
        if (((_a = resp.data) == null ? void 0 : _a.user) || ((_b = resp.data) == null ? void 0 : _b.success)) {
          ElMessage.success("邮箱绑定成功");
          showEmailBindPanel.value = false;
          emailBind.email = "";
          emailBind.code = "";
          await loadBindings();
          await loadUserSettingsFromServer();
        } else {
          ElMessage.error(((_c = resp.data) == null ? void 0 : _c.message) || "绑定失败");
        }
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "绑定失败");
      } finally {
        emailBind.binding = false;
      }
    };
    const loadBindings = async () => {
      var _a;
      try {
        const res = await api.get("/auth/bindings");
        if ((_a = res.data) == null ? void 0 : _a.success) {
          Object.assign(bindings, res.data.bindings || {});
        }
      } catch {
      }
    };
    const bindQQ = async () => {
      var _a, _b;
      try {
        const resp = await api.get("/auth/qq/auth");
        if (((_a = resp.data) == null ? void 0 : _a.success) && resp.data.authUrl) {
          window.location.href = resp.data.authUrl;
        } else {
          ElMessage.error(((_b = resp.data) == null ? void 0 : _b.message) || "QQ绑定暂不可用");
        }
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "QQ绑定失败");
      }
    };
    const unbindQQ = async () => {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const ok = await ElMessageBox.confirm("确定要解绑 QQ 吗？", "确认操作", { type: "warning" }).then(() => true).catch(() => false);
        if (!ok) return;
        const resp = await api.post("/auth/qq/unbind");
        if ((_a = resp.data) == null ? void 0 : _a.success) {
          ElMessage.success("QQ已解绑");
          await loadBindings();
        } else {
          if (((_b = resp.data) == null ? void 0 : _b.code) === "NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER") {
            ElMessageBox.alert("请先在本页设置登录密码，再解绑最后一个第三方登录。", "操作受限", { type: "warning" });
          } else {
            ElMessage.error(((_c = resp.data) == null ? void 0 : _c.message) || "解绑失败");
          }
        }
      } catch (e) {
        const msg = ((_e = (_d = e == null ? void 0 : e.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || (e == null ? void 0 : e.message);
        if (((_g = (_f = e == null ? void 0 : e.response) == null ? void 0 : _f.data) == null ? void 0 : _g.code) === "NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER") {
          ElMessageBox.alert("请先在本页设置登录密码，再解绑最后一个第三方登录。", "操作受限", { type: "warning" });
        } else {
          ElMessage.error(msg || "解绑失败");
        }
      }
    };
    const bindEPass = () => {
      try {
        const state = "bind";
        try {
          sessionStorage.setItem("epass_state", state);
        } catch {
        }
        const clientId = "euser-gallery";
        const redirectUri = `${window.location.origin}/auth/callback`;
        const scope = "read";
        const params = new URLSearchParams({
          client_id: clientId,
          response_type: "token",
          redirect_uri: redirectUri,
          scope,
          state
        });
        const authorizeUrl = `https://account.emoera.com/oauth/authorize?${params.toString()}`;
        window.location.href = authorizeUrl;
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "E通行证绑定失败");
      }
    };
    const unbindEPass = async () => {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const ok = await ElMessageBox.confirm("确定要解绑 E通行证 吗？", "确认操作", { type: "warning" }).then(() => true).catch(() => false);
        if (!ok) return;
        const resp = await api.post("/auth/epass/unbind");
        if ((_a = resp.data) == null ? void 0 : _a.success) {
          ElMessage.success("已解绑 E通行证");
          await loadBindings();
        } else {
          if (((_b = resp.data) == null ? void 0 : _b.code) === "NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER") {
            ElMessageBox.alert("请先在本页设置登录密码，再解绑最后一个第三方登录。", "操作受限", { type: "warning" });
          } else {
            ElMessage.error(((_c = resp.data) == null ? void 0 : _c.message) || "解绑失败");
          }
        }
      } catch (e) {
        const msg = ((_e = (_d = e == null ? void 0 : e.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || (e == null ? void 0 : e.message);
        if (((_g = (_f = e == null ? void 0 : e.response) == null ? void 0 : _f.data) == null ? void 0 : _g.code) === "NEED_PASSWORD_TO_UNBIND_LAST_PROVIDER") {
          ElMessageBox.alert("请先在本页设置登录密码，再解绑最后一个第三方登录。", "操作受限", { type: "warning" });
        } else {
          ElMessage.error(msg || "解绑失败");
        }
      }
    };
    const thirdPartyBoundCount = computed(() => (bindings.qq ? 1 : 0) + (bindings.epass ? 1 : 0));
    const lastProviderAndNoPassword = computed(() => thirdPartyBoundCount.value === 1 && !bindings.hasPassword);
    const unbindEmail = async () => {
      var _a, _b;
      try {
        const ok = await ElMessageBox.confirm("确定要解绑邮箱吗？", "确认操作", { type: "warning" }).then(() => true).catch(() => false);
        if (!ok) return;
        const resp = await api.post("/auth/email/unbind");
        if ((_a = resp.data) == null ? void 0 : _a.success) {
          ElMessage.success("邮箱已解绑");
          await loadBindings();
          await loadUserSettingsFromServer();
        } else {
          ElMessage.error(((_b = resp.data) == null ? void 0 : _b.message) || "解绑失败");
        }
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "解绑失败");
      }
    };
    const refreshInterval = ref(null);
    const refreshIntervalTime = ref(3e4);
    const notificationPermission = ref("default");
    const notificationSupported = ref(false);
    const startAutoRefresh = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }
      if (quickSettings.autoRefresh) {
        refreshInterval.value = setInterval(() => {
          refreshStorageInfo(false);
          loadUserStats();
        }, refreshIntervalTime.value);
      }
    };
    const stopAutoRefresh = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
    };
    const checkNotificationSupport = () => {
      notificationSupported.value = "Notification" in window;
      if (notificationSupported.value) {
        notificationPermission.value = Notification.permission;
      }
    };
    const requestNotificationPermission = async () => {
      if (!notificationSupported.value) {
        ElMessage.warning("您的浏览器不支持通知功能");
        return false;
      }
      if (Notification.permission === "granted") {
        notificationPermission.value = "granted";
        return true;
      }
      if (Notification.permission === "denied") {
        notificationPermission.value = "denied";
        ElMessage.error("通知权限已被拒绝，请在浏览器设置中手动开启");
        return false;
      }
      try {
        const permission = await Notification.requestPermission();
        notificationPermission.value = permission;
        if (permission === "granted") {
          ElMessage.success("通知权限已开启");
          return true;
        } else {
          ElMessage.warning("通知权限被拒绝");
          return false;
        }
      } catch (error) {
        ElMessage.error("请求通知权限失败");
        notificationPermission.value = "denied";
        return false;
      }
    };
    const showNotification = (title, options) => {
      if (!notificationSupported.value || Notification.permission !== "granted") {
        return;
      }
      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options
        });
        setTimeout(() => {
          notification.close();
        }, 5e3);
        return notification;
      } catch (error) {
      }
    };
    const loadQuickSettings = () => {
      try {
        const saved = localStorage.getItem("quickSettings");
        if (saved) {
          const settings = JSON.parse(saved);
          quickSettings.autoRefresh = settings.autoRefresh ?? true;
          quickSettings.notifications = settings.notifications ?? true;
        }
      } catch (error) {
      }
    };
    const loadUserPreferences = () => {
      try {
        const saved = localStorage.getItem("userPreferences");
        if (saved) {
          const userPrefs = JSON.parse(saved);
          preferences.defaultView = userPrefs.defaultView ?? "grid";
        }
      } catch (error) {
      }
    };
    const loadUserSettingsFromServer = async () => {
      var _a;
      try {
        const profileResponse = await api.get("/auth/profile");
        if (profileResponse.data.success) {
          const profileData = profileResponse.data.data;
          profileForm.email = profileData.email || "";
          profileForm.display_name = profileData.display_name || "";
          profileForm.bio = profileData.bio || "";
          userInfo.email = profileData.email || "";
          userInfo.display_name = profileData.display_name || "";
          userInfo.bio = profileData.bio || "";
          userInfo.username = profileData.username || "";
          userInfo.created_at = profileData.created_at || "";
        }
        const preferencesResponse = await api.get("/auth/preferences");
        if (preferencesResponse.data.success) {
          const prefsData = preferencesResponse.data.data;
          preferences.defaultView = prefsData.defaultView || "grid";
        }
        const notificationResponse = await api.get("/auth/notification-settings");
        if (notificationResponse.data.success) {
          const notifData = notificationResponse.data.data;
          preferences.emailNotifications = notifData.emailNotifications ?? true;
          preferences.storageWarnings = notifData.storageWarnings ?? true;
          preferences.securityAlerts = notifData.securityAlerts ?? true;
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 401) {
          ElMessage.warning("登录已过期，使用本地设置");
        } else {
          ElMessage.warning("无法连接到服务器，使用本地设置");
        }
      }
    };
    const loadNotificationSettings = () => {
      try {
        const saved = localStorage.getItem("notificationSettings");
        if (saved) {
          const notifSettings = JSON.parse(saved);
          preferences.emailNotifications = notifSettings.emailNotifications ?? true;
          preferences.storageWarnings = notifSettings.storageWarnings ?? true;
          preferences.securityAlerts = notifSettings.securityAlerts ?? true;
        }
      } catch (error) {
      }
    };
    const handlePermissionChange = () => {
      if (notificationSupported.value) {
        notificationPermission.value = Notification.permission;
        if (Notification.permission === "denied") {
          quickSettings.notifications = false;
          localStorage.setItem("quickSettings", JSON.stringify(quickSettings));
        }
      }
    };
    const initNotifications = async () => {
      checkNotificationSupport();
      if (notificationSupported.value) {
        if ("permissions" in navigator) {
          navigator.permissions.query({ name: "notifications" }).then((result) => {
            result.addEventListener("change", handlePermissionChange);
          }).catch(() => {
            setInterval(() => {
              if (Notification.permission !== notificationPermission.value) {
                handlePermissionChange();
              }
            }, 1e3);
          });
        } else {
          setInterval(() => {
            if (Notification.permission !== notificationPermission.value) {
              handlePermissionChange();
            }
          }, 1e3);
        }
      }
      if (quickSettings.notifications && notificationSupported.value) {
        await requestNotificationPermission();
      }
    };
    const checkStorageWarning = () => {
      if (quickSettings.notifications && storagePercentage.value >= 80) {
        showNotification("存储空间警告", {
          body: `您的存储空间已使用 ${storagePercentage.value}%，建议及时清理`,
          tag: "storage-warning"
        });
      }
    };
    watch(() => quickSettings.autoRefresh, (newValue) => {
      if (newValue) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
      localStorage.setItem("quickSettings", JSON.stringify(quickSettings));
    });
    watch(() => quickSettings.notifications, async (newValue) => {
      if (newValue) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          quickSettings.notifications = false;
        }
      }
      localStorage.setItem("quickSettings", JSON.stringify(quickSettings));
    });
    const storagePercentage = computed(() => {
      if (!userInfo.storage_limit || userInfo.storage_limit === 0) return 0;
      if (!userInfo.used_storage || userInfo.used_storage === 0) return 0;
      const percentage = Math.round(userInfo.used_storage / userInfo.storage_limit * 100);
      return percentage;
    });
    const storageColor = computed(() => {
      const percentage = storagePercentage.value;
      if (percentage >= 90) return "#f56c6c";
      if (percentage >= 70) return "#e6a23c";
      return "#67c23a";
    });
    const uploadAction = computed(() => {
      const baseUrl = "https://tukubackend.vtart.cn";
      return `${baseUrl}/api/avatars/upload`;
    });
    const uploadHeaders = computed(() => ({
      Authorization: `Bearer ${authStore.token}`
    }));
    const profileRules = {
      email: [
        { required: true, message: "请输入邮箱地址", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
      ],
      display_name: [
        { required: true, message: "请输入昵称", trigger: "blur" },
        { min: 2, max: 20, message: "昵称长度在2-20个字符", trigger: "blur" },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: "昵称只能包含中文、字母、数字、下划线和空格", trigger: "blur" }
      ],
      bio: [
        { max: 200, message: "个人简介不能超过200个字符", trigger: "blur" }
      ]
    };
    const passwordRules = {
      newPassword: [
        { required: true, message: "请输入新密码", trigger: "blur" },
        { min: 6, max: 20, message: "密码长度在6-20个字符", trigger: "blur" },
        { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: "密码必须包含字母和数字", trigger: "blur" }
      ],
      confirmPassword: [
        { required: true, message: "请确认新密码", trigger: "blur" },
        {
          validator: (_rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error("两次输入的密码不一致"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
      emailCode: [
        { required: true, message: "请输入邮箱验证码", trigger: "blur" },
        { len: 6, message: "验证码长度为6位", trigger: "blur" },
        { pattern: /^\d{6}$/, message: "验证码只能包含数字", trigger: "blur" }
      ]
    };
    const loadUserInfo = async () => {
      try {
        const response = await api.get("/auth/me");
        const userData = response.data.user;
        let avatarUrl = userData.avatar_url || "";
        Object.assign(userInfo, {
          username: userData.username,
          email: userData.email,
          display_name: userData.display_name || userData.username,
          bio: userData.bio || "",
          avatar_url: avatarUrl,
          used_storage: userData.used_storage || 0,
          storage_limit: userData.storage_limit || 0,
          created_at: userData.created_at || (/* @__PURE__ */ new Date()).toISOString(),
          last_login: userData.last_login || ""
        });
        Object.assign(profileForm, {
          username: userData.username,
          email: userData.email,
          display_name: userData.display_name || userData.username,
          bio: userData.bio || ""
        });
      } catch (error) {
        ElMessage.error("加载用户信息失败");
      }
    };
    const loadUserStats = async () => {
      try {
        const response = await api.get("/auth/stats");
        const stats = response.data.data;
        Object.assign(userStats, {
          totalFiles: stats.totalFiles || 0,
          totalFolders: stats.totalFolders || 0,
          loginCount: stats.loginCount || 0
        });
      } catch (error) {
      }
    };
    const refreshStorageInfo = async (showSuccessMessage = true) => {
      try {
        refreshingStorage.value = true;
        await loadUserInfo();
        await loadStorageDetails();
        if (showSuccessMessage) {
          ElMessage.success("存储信息已刷新");
        }
      } catch (error) {
        ElMessage.error("刷新存储信息失败");
      } finally {
        refreshingStorage.value = false;
      }
    };
    const loadStorageDetails = async () => {
      try {
        const response = await api.get("/files/storage-details");
        const details = response.data.data;
        Object.assign(storageDetails, {
          imageSize: details.imageSize || 0,
          videoSize: details.videoSize || 0,
          otherSize: details.otherSize || 0,
          imageCount: details.imageCount || 0,
          videoCount: details.videoCount || 0,
          otherCount: details.otherCount || 0
        });
      } catch (error) {
      }
    };
    const performCleanup = async () => {
      if (cleanupOptions.value.length === 0) {
        ElMessage.warning("请选择要清理的内容");
        return;
      }
      try {
        cleaning.value = true;
        await api.post("/files/cleanup", {
          options: cleanupOptions.value
        });
        ElMessage.success("存储清理完成");
        showStorageCleanup.value = false;
        cleanupOptions.value = [];
        await refreshStorageInfo();
      } catch (error) {
        ElMessage.error("存储清理失败");
      } finally {
        cleaning.value = false;
      }
    };
    const estimatedCleanup = computed(() => {
      let estimated = 0;
      if (cleanupOptions.value && cleanupOptions.value.includes("duplicates")) estimated += (storageDetails.imageSize || 0) * 0.1;
      if (cleanupOptions.value && cleanupOptions.value.includes("temp")) estimated += 50 * 1024 * 1024;
      if (cleanupOptions.value && cleanupOptions.value.includes("large")) estimated += (storageDetails.videoSize || 0) * 0.2;
      if (cleanupOptions.value && cleanupOptions.value.includes("old")) estimated += (storageDetails.otherSize || 0) * 0.3;
      return estimated;
    });
    const saveProfile = async () => {
      var _a, _b, _c;
      if (!profileFormRef.value) return;
      if (!validateSettings("profile")) return;
      try {
        await profileFormRef.value.validate();
        saving.value = true;
        const updateData = {
          email: profileForm.email,
          display_name: profileForm.display_name,
          bio: profileForm.bio
        };
        const response = await api.put("/auth/profile", updateData);
        if (response.data.success) {
          ElMessage.success("个人信息保存成功");
          authStore.updateUser(updateData);
          localStorage.setItem("userProfile", JSON.stringify(updateData));
          await loadUserInfo();
        } else {
          ElMessage.error(response.data.message || "保存失败");
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 400) {
          ElMessage.error(error.response.data.message || "数据验证失败");
        } else if (((_b = error.response) == null ? void 0 : _b.status) === 401) {
          ElMessage.error("登录已过期，请重新登录");
        } else if (((_c = error.response) == null ? void 0 : _c.status) === 409) {
          ElMessage.error("邮箱已被其他用户使用");
        } else {
          ElMessage.error("保存个人信息失败，请稍后重试");
        }
      } finally {
        saving.value = false;
      }
    };
    const savePreferences = async () => {
      var _a, _b;
      if (!validateSettings("preferences")) return;
      try {
        saving.value = true;
        const updateData = {
          defaultView: preferences.defaultView
        };
        const response = await api.put("/auth/preferences", updateData);
        if (response.data.success) {
          ElMessage.success("界面设置保存成功");
          localStorage.setItem("userPreferences", JSON.stringify(updateData));
          if (window.userPreferences) {
            window.userPreferences.defaultView = preferences.defaultView;
          }
          window.dispatchEvent(new CustomEvent("preferencesUpdated", {
            detail: { defaultView: preferences.defaultView }
          }));
        } else {
          ElMessage.error(response.data.message || "保存失败");
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 400) {
          ElMessage.error("设置数据无效");
        } else if (((_b = error.response) == null ? void 0 : _b.status) === 401) {
          ElMessage.error("登录已过期，请重新登录");
        } else {
          ElMessage.error("保存界面设置失败，请稍后重试");
        }
      } finally {
        saving.value = false;
      }
    };
    const saveNotificationSettings = async () => {
      var _a, _b;
      if (!validateSettings("notifications")) return;
      try {
        saving.value = true;
        const updateData = {
          emailNotifications: preferences.emailNotifications,
          storageWarnings: preferences.storageWarnings,
          securityAlerts: preferences.securityAlerts
        };
        const response = await api.put("/auth/notification-settings", updateData);
        if (response.data.success) {
          ElMessage.success("通知设置保存成功");
          localStorage.setItem("notificationSettings", JSON.stringify(updateData));
          if (window.notificationSettings) {
            Object.assign(window.notificationSettings, updateData);
          }
          window.dispatchEvent(new CustomEvent("notificationSettingsUpdated", {
            detail: updateData
          }));
          if (preferences.storageWarnings) {
            checkStorageWarning();
          }
        } else {
          ElMessage.error(response.data.message || "保存失败");
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 400) {
          ElMessage.error("通知设置数据无效");
        } else if (((_b = error.response) == null ? void 0 : _b.status) === 401) {
          ElMessage.error("登录已过期，请重新登录");
        } else {
          ElMessage.error("保存通知设置失败，请稍后重试");
        }
      } finally {
        saving.value = false;
      }
    };
    const sendEmailCode = async () => {
      if (!userInfo.email) {
        ElMessage.error("请先设置邮箱地址");
        return;
      }
      await sendEmailCodeWithHuman(userInfo.email, "password_change");
    };
    const clearCountdown = () => {
    };
    const changePassword = async () => {
      if (!passwordFormRef.value) return;
      try {
        await passwordFormRef.value.validate();
        changingPassword.value = true;
        await api.put("/auth/password", {
          new_password: passwordForm.newPassword,
          email_code: passwordForm.emailCode
        });
        ElMessage.success("密码修改成功");
        Object.assign(passwordForm, {
          newPassword: "",
          confirmPassword: "",
          emailCode: ""
        });
        passwordFormRef.value.resetFields();
        clearCountdown();
      } catch (error) {
        ElMessage.error("修改密码失败");
      } finally {
        changingPassword.value = false;
      }
    };
    const confirmDeleteAccount = async () => {
      var _a, _b;
      try {
        const { action } = await ElMessageBox.prompt(
          '请输入"注销"以确认永久删除账号（不可恢复）：',
          "注销账号",
          {
            inputPlaceholder: "输入 注销 确认",
            inputValidator: (val) => val === "注销" ? true : "请输入：注销",
            confirmButtonText: "永久删除",
            cancelButtonText: "取消",
            confirmButtonClass: "el-button--danger"
          }
        );
        if (action !== "confirm") return;
        const resp = await api.post("/auth/account/delete", { confirm: "注销" });
        if ((_a = resp.data) == null ? void 0 : _a.success) {
          ElMessage.success("账号已注销");
          const auth = useAuthStore();
          await auth.logout();
          window.location.href = "/login";
        } else {
          ElMessage.error(((_b = resp.data) == null ? void 0 : _b.message) || "注销失败");
        }
      } catch (e) {
        if (e === "cancel") return;
        ElMessage.error((e == null ? void 0 : e.message) || "操作失败");
      }
    };
    const beforeAvatarUpload = (file) => {
      const isImage = file.type.startsWith("image/");
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isImage) {
        ElMessage.error("只能上传图片文件!");
        return false;
      }
      if (!isLt5M) {
        ElMessage.error("图片大小不能超过 5MB!");
        return false;
      }
      return true;
    };
    const handleAvatarSuccess = (response) => {
      if (response && response.success && response.data && response.data.url) {
        const baseUrl = "https://tukubackend.vtart.cn";
        const avatarUrl = baseUrl + response.data.url + "?t=" + Date.now();
        userInfo.avatar_url = avatarUrl;
        authStore.updateUser({ avatar_url: avatarUrl });
        ElMessage.success(response.message || "头像上传成功");
      } else {
        ElMessage.error(response.message || "头像上传失败");
      }
    };
    const handleAvatarUploadError = (_error, _uploadFile, _uploadFiles) => {
      ElMessage.error("头像上传失败");
    };
    const handleAvatarError = (_event) => {
      ElMessage.warning("头像加载失败，将显示默认头像");
    };
    const formatDate = (dateString) => {
      if (!dateString) return "暂无数据";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "无效日期";
        return date.toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai",
          // 默认北京时间
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      } catch (error) {
        return "日期格式错误";
      }
    };
    const saveAllSettings = async () => {
      try {
        saving.value = true;
        if (profileFormRef.value) {
          await saveProfile();
        }
        await savePreferences();
        await saveNotificationSettings();
        ElMessage.success("所有设置已保存");
      } catch (error) {
        ElMessage.error("保存设置失败");
      } finally {
        saving.value = false;
      }
    };
    const validateSettings = (type) => {
      switch (type) {
        case "profile":
          if (!profileForm.email || !profileForm.email.includes("@")) {
            ElMessage.error("请输入有效的邮箱地址");
            return false;
          }
          if (profileForm.display_name && profileForm.display_name.length > 50) {
            ElMessage.error("昵称不能超过50个字符");
            return false;
          }
          if (profileForm.bio && profileForm.bio.length > 200) {
            ElMessage.error("个人简介不能超过200个字符");
            return false;
          }
          return true;
        case "preferences":
          if (!["grid", "list"].includes(preferences.defaultView)) {
            ElMessage.error("默认视图设置无效");
            return false;
          }
          return true;
        case "notifications":
          if (typeof preferences.emailNotifications !== "boolean" || typeof preferences.storageWarnings !== "boolean" || typeof preferences.securityAlerts !== "boolean") {
            ElMessage.error("通知设置数据无效");
            return false;
          }
          return true;
        default:
          return false;
      }
    };
    const goToForgotPassword = () => {
      ElMessageBox.confirm(
        "您将跳转到忘记密码页面，通过邮箱验证来重置密码。是否继续？",
        "确认跳转",
        {
          confirmButtonText: "继续",
          cancelButtonText: "取消",
          type: "info",
          customClass: "custom-message-box"
        }
      ).then(() => {
        router.push("/forgot-password");
      }).catch(() => {
      });
    };
    onMounted(async () => {
      try {
        await loadUserInfo();
        await loadUserSettingsFromServer();
        loadQuickSettings();
        loadUserPreferences();
        loadNotificationSettings();
        await initNotifications();
        await loadUserStats();
        await loadStorageDetails();
        if (quickSettings.autoRefresh) {
          startAutoRefresh();
        }
        checkStorageWarning();
        await loadBindings();
      } catch (error) {
        ElMessage.error("页面加载失败，请刷新重试");
      }
    });
    onUnmounted(() => {
      stopAutoRefresh();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_avatar = ElAvatar;
      const _component_el_upload = ElUpload;
      const _component_el_tag = ElTag;
      const _component_el_card = ElCard;
      const _component_el_progress = ElProgress;
      const _component_el_switch = ElSwitch;
      const _component_el_col = ElCol;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      const _component_el_row = ElRow;
      const _component_el_tab_pane = ElTabPane;
      const _component_el_tooltip = ElTooltip;
      const _component_el_radio = ElRadio;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_tabs = ElTabs;
      const _component_el_dialog = ElDialog;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_checkbox_group = ElCheckboxGroup;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[25] || (_cache[25] = createBaseVNode("div", { class: "header-left" }, [
              createBaseVNode("h1", { class: "page-title" }, "个人设置"),
              createBaseVNode("p", { class: "page-subtitle" }, "管理您的个人信息和系统设置")
            ], -1)),
            createBaseVNode("div", _hoisted_4, [
              createVNode(_component_el_button, {
                type: "primary",
                onClick: saveAllSettings,
                loading: saving.value
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(check_default))
                    ]),
                    _: 1
                  }),
                  _cache[24] || (_cache[24] = createTextVNode(" 保存更改 ", -1))
                ]),
                _: 1
              }, 8, ["loading"])
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createVNode(_component_el_row, { gutter: 40 }, {
            default: withCtx(() => [
              createVNode(_component_el_col, {
                xs: 24,
                sm: 24,
                md: 8,
                lg: 6,
                xl: 6
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { class: "user-info-card" }, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_6, [
                        createBaseVNode("div", _hoisted_7, [
                          createVNode(_component_el_avatar, {
                            size: 100,
                            src: userInfo.avatar_url,
                            class: "user-avatar",
                            onError: handleAvatarError
                          }, {
                            default: withCtx(() => {
                              var _a;
                              return [
                                createTextVNode(toDisplayString((_a = userInfo.username) == null ? void 0 : _a.charAt(0).toUpperCase()), 1)
                              ];
                            }),
                            _: 1
                          }, 8, ["src"]),
                          createBaseVNode("div", _hoisted_8, [
                            createVNode(_component_el_upload, {
                              action: uploadAction.value,
                              headers: uploadHeaders.value,
                              "show-file-list": false,
                              "before-upload": beforeAvatarUpload,
                              "on-success": handleAvatarSuccess,
                              "on-error": handleAvatarUploadError,
                              accept: "image/*"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_button, {
                                  type: "primary",
                                  size: "small",
                                  circle: ""
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(camera_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }, 8, ["action", "headers"])
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_9, [
                          createBaseVNode("h3", _hoisted_10, toDisplayString(userInfo.username), 1),
                          createBaseVNode("p", _hoisted_11, [
                            createVNode(_component_el_tag, {
                              type: unref(authStore).isAdmin ? "danger" : "primary"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(authStore).isAdmin ? "管理员" : "普通用户"), 1)
                              ]),
                              _: 1
                            }, 8, ["type"])
                          ]),
                          createBaseVNode("p", _hoisted_12, toDisplayString(userInfo.email), 1)
                        ])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_card, { class: "storage-card" }, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_13, [
                        _cache[27] || (_cache[27] = createBaseVNode("h4", null, "存储使用情况", -1)),
                        createVNode(_component_el_button, {
                          type: "text",
                          size: "small",
                          onClick: _cache[0] || (_cache[0] = () => refreshStorageInfo(true)),
                          loading: refreshingStorage.value
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(refresh_default))
                              ]),
                              _: 1
                            }),
                            _cache[26] || (_cache[26] = createTextVNode(" 刷新 ", -1))
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ]),
                      createBaseVNode("div", _hoisted_14, [
                        createVNode(_component_el_progress, {
                          percentage: storagePercentage.value,
                          color: storageColor.value,
                          "stroke-width": 8
                        }, {
                          default: withCtx(({ percentage }) => [
                            createTextVNode(toDisplayString(unref(formatPercentage)(percentage)), 1)
                          ]),
                          _: 1
                        }, 8, ["percentage", "color"]),
                        createBaseVNode("div", _hoisted_15, [
                          createBaseVNode("span", _hoisted_16, toDisplayString(unref(formatFileSize)(userInfo.used_storage)), 1),
                          createBaseVNode("span", _hoisted_17, "/ " + toDisplayString(unref(formatFileSize)(userInfo.storage_limit)), 1)
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_18, [
                        createBaseVNode("div", _hoisted_19, [
                          _cache[28] || (_cache[28] = createBaseVNode("span", { class: "label" }, "图片文件", -1)),
                          createBaseVNode("span", _hoisted_20, toDisplayString(unref(formatFileSize)(storageDetails.imageSize)), 1)
                        ]),
                        createBaseVNode("div", _hoisted_21, [
                          _cache[29] || (_cache[29] = createBaseVNode("span", { class: "label" }, "视频文件", -1)),
                          createBaseVNode("span", _hoisted_22, toDisplayString(unref(formatFileSize)(storageDetails.videoSize)), 1)
                        ]),
                        createBaseVNode("div", _hoisted_23, [
                          _cache[30] || (_cache[30] = createBaseVNode("span", { class: "label" }, "其他文件", -1)),
                          createBaseVNode("span", _hoisted_24, toDisplayString(unref(formatFileSize)(storageDetails.otherSize)), 1)
                        ])
                      ]),
                      createBaseVNode("div", _hoisted_25, [
                        createBaseVNode("div", _hoisted_26, [
                          createVNode(_component_el_button, {
                            type: "primary",
                            size: "small",
                            onClick: _cache[1] || (_cache[1] = ($event) => showStorageCleanup.value = true),
                            disabled: storagePercentage.value < 80
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(delete_default))
                                ]),
                                _: 1
                              }),
                              _cache[31] || (_cache[31] = createTextVNode(" 清理存储 ", -1))
                            ]),
                            _: 1
                          }, 8, ["disabled"])
                        ]),
                        createBaseVNode("div", _hoisted_27, [
                          createVNode(_component_el_button, {
                            type: "text",
                            size: "small",
                            onClick: _cache[2] || (_cache[2] = ($event) => showStorageDetails.value = true)
                          }, {
                            default: withCtx(() => [..._cache[32] || (_cache[32] = [
                              createTextVNode(" 详细分析 ", -1)
                            ])]),
                            _: 1
                          })
                        ])
                      ])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_card, { class: "quick-settings-card" }, {
                    default: withCtx(() => [
                      _cache[35] || (_cache[35] = createBaseVNode("div", { class: "quick-settings-header" }, [
                        createBaseVNode("h4", null, "快捷设置")
                      ], -1)),
                      createBaseVNode("div", _hoisted_28, [
                        createBaseVNode("div", _hoisted_29, [
                          _cache[33] || (_cache[33] = createBaseVNode("span", { class: "setting-label" }, "自动刷新", -1)),
                          createBaseVNode("div", _hoisted_30, [
                            createVNode(_component_el_switch, {
                              modelValue: quickSettings.autoRefresh,
                              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => quickSettings.autoRefresh = $event),
                              disabled: refreshingStorage.value
                            }, null, 8, ["modelValue", "disabled"]),
                            quickSettings.autoRefresh ? (openBlock(), createElementBlock("span", _hoisted_31, toDisplayString(refreshIntervalTime.value / 1e3) + "秒 ", 1)) : createCommentVNode("", true)
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_32, [
                          _cache[34] || (_cache[34] = createBaseVNode("span", { class: "setting-label" }, "通知提醒", -1)),
                          createBaseVNode("div", _hoisted_33, [
                            createVNode(_component_el_switch, {
                              modelValue: quickSettings.notifications,
                              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => quickSettings.notifications = $event),
                              disabled: !notificationSupported.value
                            }, null, 8, ["modelValue", "disabled"]),
                            !notificationSupported.value ? (openBlock(), createElementBlock("span", _hoisted_34, " 不支持 ")) : notificationPermission.value === "denied" ? (openBlock(), createElementBlock("span", _hoisted_35, " 已拒绝 ")) : notificationPermission.value === "granted" ? (openBlock(), createElementBlock("span", _hoisted_36, " 已开启 ")) : createCommentVNode("", true)
                          ])
                        ])
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, {
                xs: 24,
                sm: 24,
                md: 16,
                lg: 18,
                xl: 18
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { class: "settings-card" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_tabs, {
                        modelValue: activeTab.value,
                        "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => activeTab.value = $event),
                        class: "settings-tabs"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_tab_pane, {
                            label: "个人信息",
                            name: "profile"
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_37, [
                                _cache[39] || (_cache[39] = createBaseVNode("h4", null, "基本信息", -1)),
                                createVNode(_component_el_form, {
                                  ref_key: "profileFormRef",
                                  ref: profileFormRef,
                                  model: profileForm,
                                  rules: profileRules,
                                  "label-width": "100px",
                                  class: "profile-form"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_form_item, {
                                      label: "用户名",
                                      prop: "username"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          modelValue: profileForm.username,
                                          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => profileForm.username = $event),
                                          placeholder: "请输入用户名",
                                          disabled: false
                                        }, null, 8, ["modelValue"]),
                                        _cache[36] || (_cache[36] = createBaseVNode("div", { class: "form-hint" }, "支持中文、字母、数字、下划线和符号（不含空格与@）", -1))
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, {
                                      label: "昵称",
                                      prop: "display_name"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          modelValue: profileForm.display_name,
                                          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => profileForm.display_name = $event),
                                          placeholder: "请输入昵称"
                                        }, null, 8, ["modelValue"]),
                                        _cache[37] || (_cache[37] = createBaseVNode("div", { class: "form-hint" }, "在其他用户面前显示的名称", -1))
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, {
                                      label: "个人简介",
                                      prop: "bio"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          modelValue: profileForm.bio,
                                          "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => profileForm.bio = $event),
                                          type: "textarea",
                                          rows: 3,
                                          placeholder: "介绍一下自己...",
                                          maxlength: "200",
                                          "show-word-limit": ""
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_button, {
                                          type: "primary",
                                          onClick: saveProfile,
                                          loading: saving.value
                                        }, {
                                          default: withCtx(() => [..._cache[38] || (_cache[38] = [
                                            createTextVNode(" 保存个人信息 ", -1)
                                          ])]),
                                          _: 1
                                        }, 8, ["loading"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, { label: "注册时间" }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          value: formatDate(userInfo.created_at),
                                          disabled: ""
                                        }, null, 8, ["value"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["model"])
                              ]),
                              createBaseVNode("div", _hoisted_38, [
                                _cache[43] || (_cache[43] = createBaseVNode("h4", null, "账户统计", -1)),
                                createVNode(_component_el_row, { gutter: 16 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_col, { span: 8 }, {
                                      default: withCtx(() => [
                                        createBaseVNode("div", _hoisted_39, [
                                          createBaseVNode("div", _hoisted_40, toDisplayString(userStats.totalFiles), 1),
                                          _cache[40] || (_cache[40] = createBaseVNode("div", { class: "stat-label" }, "文件总数", -1))
                                        ])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_col, { span: 8 }, {
                                      default: withCtx(() => [
                                        createBaseVNode("div", _hoisted_41, [
                                          createBaseVNode("div", _hoisted_42, toDisplayString(userStats.totalFolders), 1),
                                          _cache[41] || (_cache[41] = createBaseVNode("div", { class: "stat-label" }, "文件夹数", -1))
                                        ])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_col, { span: 8 }, {
                                      default: withCtx(() => [
                                        createBaseVNode("div", _hoisted_43, [
                                          createBaseVNode("div", _hoisted_44, toDisplayString(userStats.loginCount), 1),
                                          _cache[42] || (_cache[42] = createBaseVNode("div", { class: "stat-label" }, "登录次数", -1))
                                        ])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_tab_pane, {
                            label: "安全设置",
                            name: "security"
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_45, [
                                _cache[47] || (_cache[47] = createBaseVNode("h4", null, "密码安全", -1)),
                                createVNode(_component_el_form, {
                                  ref_key: "passwordFormRef",
                                  ref: passwordFormRef,
                                  model: passwordForm,
                                  rules: passwordRules,
                                  "label-width": "100px",
                                  class: "password-form"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_form_item, {
                                      label: "新密码",
                                      prop: "newPassword"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          modelValue: passwordForm.newPassword,
                                          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => passwordForm.newPassword = $event),
                                          type: "password",
                                          placeholder: "请输入新密码",
                                          "show-password": ""
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, {
                                      label: "确认密码",
                                      prop: "confirmPassword"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_input, {
                                          modelValue: passwordForm.confirmPassword,
                                          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => passwordForm.confirmPassword = $event),
                                          type: "password",
                                          placeholder: "请再次输入新密码",
                                          "show-password": ""
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, {
                                      label: "邮箱验证码",
                                      prop: "emailCode"
                                    }, {
                                      default: withCtx(() => [
                                        createBaseVNode("div", _hoisted_46, [
                                          createVNode(_component_el_input, {
                                            modelValue: passwordForm.emailCode,
                                            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => passwordForm.emailCode = $event),
                                            placeholder: "请输入邮箱验证码",
                                            maxlength: "6"
                                          }, null, 8, ["modelValue"]),
                                          createVNode(_component_el_button, {
                                            type: "primary",
                                            disabled: unref(emailCodeCooldown) > 0 || !userInfo.email,
                                            onClick: sendEmailCode,
                                            loading: unref(emailCodeSending),
                                            class: "send-code-btn same-height"
                                          }, {
                                            default: withCtx(() => [
                                              createTextVNode(toDisplayString(unref(emailCodeCooldown) > 0 ? `${unref(emailCodeCooldown)}s` : "发送验证码"), 1)
                                            ]),
                                            _: 1
                                          }, 8, ["disabled", "loading"])
                                        ]),
                                        createBaseVNode("div", _hoisted_47, " 验证码将发送到您的邮箱：" + toDisplayString(userInfo.email), 1)
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, null, {
                                      default: withCtx(() => [
                                        createBaseVNode("div", _hoisted_48, [
                                          createVNode(_component_el_button, {
                                            type: "primary",
                                            onClick: changePassword,
                                            loading: changingPassword.value
                                          }, {
                                            default: withCtx(() => [..._cache[44] || (_cache[44] = [
                                              createTextVNode(" 修改密码 ", -1)
                                            ])]),
                                            _: 1
                                          }, 8, ["loading"]),
                                          createVNode(_component_el_button, {
                                            type: "text",
                                            class: "forgot-password",
                                            onClick: goToForgotPassword
                                          }, {
                                            default: withCtx(() => [..._cache[45] || (_cache[45] = [
                                              createTextVNode(" 忘记密码？ ", -1)
                                            ])]),
                                            _: 1
                                          })
                                        ]),
                                        _cache[46] || (_cache[46] = createBaseVNode("div", { class: "form-hint" }, " 如果忘记当前密码，可以通过邮箱验证重置密码 ", -1))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["model"])
                              ]),
                              createBaseVNode("div", _hoisted_49, [
                                _cache[59] || (_cache[59] = createBaseVNode("h4", null, "第三方账号绑定", -1)),
                                createBaseVNode("div", _hoisted_50, [
                                  createBaseVNode("div", _hoisted_51, [
                                    createBaseVNode("div", _hoisted_52, [
                                      _cache[48] || (_cache[48] = createBaseVNode("div", { class: "binding-name" }, "QQ 登录", -1)),
                                      createBaseVNode("div", {
                                        class: normalizeClass(["binding-status", { on: bindings.qq, off: !bindings.qq }])
                                      }, toDisplayString(bindings.qq ? "已绑定" : "未绑定"), 3)
                                    ]),
                                    createBaseVNode("div", _hoisted_53, [
                                      !bindings.qq ? (openBlock(), createBlock(_component_el_button, {
                                        key: 0,
                                        size: "small",
                                        type: "primary",
                                        onClick: bindQQ
                                      }, {
                                        default: withCtx(() => [..._cache[49] || (_cache[49] = [
                                          createTextVNode("去绑定", -1)
                                        ])]),
                                        _: 1
                                      })) : createCommentVNode("", true),
                                      bindings.qq ? (openBlock(), createBlock(_component_el_tooltip, {
                                        key: 1,
                                        disabled: !lastProviderAndNoPassword.value,
                                        content: "请先设置密码后再解绑最后一个第三方登录",
                                        placement: "top"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_component_el_button, {
                                            size: "small",
                                            type: "default",
                                            disabled: lastProviderAndNoPassword.value,
                                            onClick: unbindQQ
                                          }, {
                                            default: withCtx(() => [..._cache[50] || (_cache[50] = [
                                              createTextVNode("解绑", -1)
                                            ])]),
                                            _: 1
                                          }, 8, ["disabled"])
                                        ]),
                                        _: 1
                                      }, 8, ["disabled"])) : createCommentVNode("", true)
                                    ])
                                  ]),
                                  createBaseVNode("div", _hoisted_54, [
                                    createBaseVNode("div", _hoisted_55, [
                                      _cache[51] || (_cache[51] = createBaseVNode("div", { class: "binding-name" }, "邮箱", -1)),
                                      createBaseVNode("div", {
                                        class: normalizeClass(["binding-status", { on: !!bindings.email, off: !bindings.email }])
                                      }, toDisplayString(bindings.email ? bindings.email : "未绑定"), 3)
                                    ]),
                                    createBaseVNode("div", _hoisted_56, [
                                      bindings.email ? (openBlock(), createBlock(_component_el_button, {
                                        key: 0,
                                        size: "small",
                                        type: "default",
                                        onClick: unbindEmail
                                      }, {
                                        default: withCtx(() => [..._cache[52] || (_cache[52] = [
                                          createTextVNode("解绑", -1)
                                        ])]),
                                        _: 1
                                      })) : (openBlock(), createBlock(_component_el_button, {
                                        key: 1,
                                        size: "small",
                                        onClick: _cache[11] || (_cache[11] = ($event) => showEmailBindPanel.value = true)
                                      }, {
                                        default: withCtx(() => [..._cache[53] || (_cache[53] = [
                                          createTextVNode("去设置", -1)
                                        ])]),
                                        _: 1
                                      }))
                                    ])
                                  ]),
                                  createVNode(Transition, { name: "fade-slide" }, {
                                    default: withCtx(() => [
                                      showEmailBindPanel.value ? (openBlock(), createElementBlock("div", _hoisted_57, [
                                        createVNode(_component_el_form, {
                                          "label-width": "88px",
                                          class: "email-bind-form"
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_form_item, { label: "邮箱" }, {
                                              default: withCtx(() => [
                                                createVNode(_component_el_input, {
                                                  modelValue: emailBind.email,
                                                  "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => emailBind.email = $event),
                                                  placeholder: "请输入要绑定的邮箱"
                                                }, null, 8, ["modelValue"])
                                              ]),
                                              _: 1
                                            }),
                                            createVNode(_component_el_form_item, { label: "验证码" }, {
                                              default: withCtx(() => [
                                                createBaseVNode("div", _hoisted_58, [
                                                  createVNode(_component_el_input, {
                                                    modelValue: emailBind.code,
                                                    "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => emailBind.code = $event),
                                                    placeholder: "6位验证码",
                                                    maxlength: "6"
                                                  }, null, 8, ["modelValue"]),
                                                  createVNode(_component_el_button, {
                                                    class: "send-code-btn same-height",
                                                    disabled: unref(emailCodeSending) || unref(emailCodeCooldown) > 0 || !emailBind.email,
                                                    onClick: sendEmailBindCode
                                                  }, {
                                                    default: withCtx(() => [
                                                      createTextVNode(toDisplayString(unref(emailCodeCooldown) > 0 ? `${unref(emailCodeCooldown)}s` : "发送验证码"), 1)
                                                    ]),
                                                    _: 1
                                                  }, 8, ["disabled"])
                                                ])
                                              ]),
                                              _: 1
                                            }),
                                            createBaseVNode("div", _hoisted_59, [
                                              createVNode(_component_el_button, {
                                                size: "small",
                                                onClick: _cache[14] || (_cache[14] = ($event) => showEmailBindPanel.value = false)
                                              }, {
                                                default: withCtx(() => [..._cache[54] || (_cache[54] = [
                                                  createTextVNode("取消", -1)
                                                ])]),
                                                _: 1
                                              }),
                                              createVNode(_component_el_button, {
                                                size: "small",
                                                type: "primary",
                                                loading: emailBind.binding,
                                                onClick: confirmEmailBind
                                              }, {
                                                default: withCtx(() => [..._cache[55] || (_cache[55] = [
                                                  createTextVNode("绑定邮箱", -1)
                                                ])]),
                                                _: 1
                                              }, 8, ["loading"])
                                            ])
                                          ]),
                                          _: 1
                                        })
                                      ])) : createCommentVNode("", true)
                                    ]),
                                    _: 1
                                  }),
                                  createBaseVNode("div", _hoisted_60, [
                                    createBaseVNode("div", _hoisted_61, [
                                      _cache[56] || (_cache[56] = createBaseVNode("div", { class: "binding-name" }, "E通行证", -1)),
                                      createBaseVNode("div", {
                                        class: normalizeClass(["binding-status", { on: bindings.epass, off: !bindings.epass }])
                                      }, toDisplayString(bindings.epass ? "已绑定" : "未绑定"), 3)
                                    ]),
                                    createBaseVNode("div", _hoisted_62, [
                                      !bindings.epass ? (openBlock(), createBlock(_component_el_button, {
                                        key: 0,
                                        size: "small",
                                        type: "primary",
                                        onClick: bindEPass
                                      }, {
                                        default: withCtx(() => [..._cache[57] || (_cache[57] = [
                                          createTextVNode("去绑定", -1)
                                        ])]),
                                        _: 1
                                      })) : (openBlock(), createBlock(_component_el_tooltip, {
                                        key: 1,
                                        disabled: !lastProviderAndNoPassword.value,
                                        content: "请先设置密码后再解绑最后一个第三方登录",
                                        placement: "top"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_component_el_button, {
                                            size: "small",
                                            type: "default",
                                            disabled: lastProviderAndNoPassword.value,
                                            onClick: unbindEPass
                                          }, {
                                            default: withCtx(() => [..._cache[58] || (_cache[58] = [
                                              createTextVNode("解绑", -1)
                                            ])]),
                                            _: 1
                                          }, 8, ["disabled"])
                                        ]),
                                        _: 1
                                      }, 8, ["disabled"]))
                                    ])
                                  ])
                                ])
                              ]),
                              createBaseVNode("div", _hoisted_63, [
                                _cache[61] || (_cache[61] = createBaseVNode("h4", null, "危险操作", -1)),
                                _cache[62] || (_cache[62] = createBaseVNode("p", { class: "danger-tip" }, "此操作将永久删除您的账号及所有数据（文件、文件夹、分享、登录日志、偏好设置等），且不可恢复。", -1)),
                                createVNode(_component_el_button, {
                                  type: "danger",
                                  onClick: confirmDeleteAccount
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(delete_default))
                                      ]),
                                      _: 1
                                    }),
                                    _cache[60] || (_cache[60] = createTextVNode(" 注销账号 ", -1))
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_tab_pane, {
                            label: "偏好设置",
                            name: "preferences"
                          }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_64, [
                                _cache[66] || (_cache[66] = createBaseVNode("h4", null, "界面设置", -1)),
                                createVNode(_component_el_form, {
                                  "label-width": "100px",
                                  class: "preferences-form"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_form_item, { label: "默认视图" }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_radio_group, {
                                          modelValue: preferences.defaultView,
                                          "onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => preferences.defaultView = $event)
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_radio, { label: "grid" }, {
                                              default: withCtx(() => [..._cache[63] || (_cache[63] = [
                                                createTextVNode("网格视图", -1)
                                              ])]),
                                              _: 1
                                            }),
                                            createVNode(_component_el_radio, { label: "list" }, {
                                              default: withCtx(() => [..._cache[64] || (_cache[64] = [
                                                createTextVNode("列表视图", -1)
                                              ])]),
                                              _: 1
                                            })
                                          ]),
                                          _: 1
                                        }, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_button, {
                                          type: "primary",
                                          onClick: savePreferences,
                                          loading: saving.value
                                        }, {
                                          default: withCtx(() => [..._cache[65] || (_cache[65] = [
                                            createTextVNode(" 保存界面设置 ", -1)
                                          ])]),
                                          _: 1
                                        }, 8, ["loading"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ]),
                              createBaseVNode("div", _hoisted_65, [
                                _cache[68] || (_cache[68] = createBaseVNode("h4", null, "通知设置", -1)),
                                createVNode(_component_el_form, {
                                  "label-width": "100px",
                                  class: "preferences-form"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_form_item, { label: "邮件通知" }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_switch, {
                                          modelValue: preferences.emailNotifications,
                                          "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => preferences.emailNotifications = $event)
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, { label: "存储警告" }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_switch, {
                                          modelValue: preferences.storageWarnings,
                                          "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => preferences.storageWarnings = $event)
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, { label: "安全提醒" }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_switch, {
                                          modelValue: preferences.securityAlerts,
                                          "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => preferences.securityAlerts = $event)
                                        }, null, 8, ["modelValue"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_form_item, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_button, {
                                          type: "primary",
                                          onClick: saveNotificationSettings,
                                          loading: saving.value
                                        }, {
                                          default: withCtx(() => [..._cache[67] || (_cache[67] = [
                                            createTextVNode(" 保存通知设置 ", -1)
                                          ])]),
                                          _: 1
                                        }, 8, ["loading"])
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                })
                              ])
                            ]),
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
              })
            ]),
            _: 1
          })
        ]),
        createVNode(_component_el_dialog, {
          modelValue: showStorageDetails.value,
          "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => showStorageDetails.value = $event),
          title: "存储详细分析",
          width: "600px"
        }, {
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_66, [
              createBaseVNode("div", _hoisted_67, [
                _cache[75] || (_cache[75] = createBaseVNode("h4", null, "文件类型分布", -1)),
                createVNode(_component_el_row, { gutter: 16 }, {
                  default: withCtx(() => [
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_68, [
                          _cache[70] || (_cache[70] = createBaseVNode("div", { class: "type-icon image" }, "📷", -1)),
                          createBaseVNode("div", _hoisted_69, [
                            _cache[69] || (_cache[69] = createBaseVNode("div", { class: "type-name" }, "图片", -1)),
                            createBaseVNode("div", _hoisted_70, toDisplayString(unref(formatFileSize)(storageDetails.imageSize)), 1),
                            createBaseVNode("div", _hoisted_71, toDisplayString(storageDetails.imageCount) + " 个文件", 1)
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_72, [
                          _cache[72] || (_cache[72] = createBaseVNode("div", { class: "type-icon video" }, "🎥", -1)),
                          createBaseVNode("div", _hoisted_73, [
                            _cache[71] || (_cache[71] = createBaseVNode("div", { class: "type-name" }, "视频", -1)),
                            createBaseVNode("div", _hoisted_74, toDisplayString(unref(formatFileSize)(storageDetails.videoSize)), 1),
                            createBaseVNode("div", _hoisted_75, toDisplayString(storageDetails.videoCount) + " 个文件", 1)
                          ])
                        ])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_76, [
                          _cache[74] || (_cache[74] = createBaseVNode("div", { class: "type-icon other" }, "📄", -1)),
                          createBaseVNode("div", _hoisted_77, [
                            _cache[73] || (_cache[73] = createBaseVNode("div", { class: "type-name" }, "其他", -1)),
                            createBaseVNode("div", _hoisted_78, toDisplayString(unref(formatFileSize)(storageDetails.otherSize)), 1),
                            createBaseVNode("div", _hoisted_79, toDisplayString(storageDetails.otherCount) + " 个文件", 1)
                          ])
                        ])
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_80, [
                _cache[79] || (_cache[79] = createBaseVNode("h4", null, "存储建议", -1)),
                createBaseVNode("div", _hoisted_81, [
                  storagePercentage.value >= 90 ? (openBlock(), createElementBlock("div", _hoisted_82, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(warning_default))
                      ]),
                      _: 1
                    }),
                    _cache[76] || (_cache[76] = createBaseVNode("span", null, "存储空间严重不足，建议立即清理文件", -1))
                  ])) : storagePercentage.value >= 80 ? (openBlock(), createElementBlock("div", _hoisted_83, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(info_filled_default))
                      ]),
                      _: 1
                    }),
                    _cache[77] || (_cache[77] = createBaseVNode("span", null, "存储空间使用率较高，建议适当清理", -1))
                  ])) : (openBlock(), createElementBlock("div", _hoisted_84, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(success_filled_default))
                      ]),
                      _: 1
                    }),
                    _cache[78] || (_cache[78] = createBaseVNode("span", null, "存储空间使用正常", -1))
                  ]))
                ])
              ])
            ])
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showStorageCleanup.value,
          "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => showStorageCleanup.value = $event),
          title: "存储清理",
          width: "500px"
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[22] || (_cache[22] = ($event) => showStorageCleanup.value = false)
            }, {
              default: withCtx(() => [..._cache[86] || (_cache[86] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: performCleanup,
              loading: cleaning.value
            }, {
              default: withCtx(() => [..._cache[87] || (_cache[87] = [
                createTextVNode(" 开始清理 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_85, [
              _cache[85] || (_cache[85] = createBaseVNode("p", null, "选择要清理的内容：", -1)),
              createVNode(_component_el_checkbox_group, {
                modelValue: cleanupOptions.value,
                "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => cleanupOptions.value = $event)
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_checkbox, { label: "duplicates" }, {
                    default: withCtx(() => [..._cache[80] || (_cache[80] = [
                      createTextVNode("重复文件", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_checkbox, { label: "temp" }, {
                    default: withCtx(() => [..._cache[81] || (_cache[81] = [
                      createTextVNode("临时文件", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_checkbox, { label: "large" }, {
                    default: withCtx(() => [..._cache[82] || (_cache[82] = [
                      createTextVNode("大文件（>10MB）", -1)
                    ])]),
                    _: 1
                  }),
                  createVNode(_component_el_checkbox, { label: "old" }, {
                    default: withCtx(() => [..._cache[83] || (_cache[83] = [
                      createTextVNode("30天前的文件", -1)
                    ])]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["modelValue"]),
              createBaseVNode("div", _hoisted_86, [
                createBaseVNode("p", null, [
                  _cache[84] || (_cache[84] = createTextVNode("预计可释放空间：", -1)),
                  createBaseVNode("strong", null, toDisplayString(unref(formatFileSize)(estimatedCleanup.value)), 1)
                ])
              ])
            ])
          ]),
          _: 1
        }, 8, ["modelValue"])
      ]);
    };
  }
});
const UserCenter = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0bcdf4a8"]]);
export {
  UserCenter as default
};
//# sourceMappingURL=UserCenter-C6ge7eLf.js.map
