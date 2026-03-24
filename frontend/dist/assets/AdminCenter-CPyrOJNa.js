import { a as api, j as getAvatarUrl, f as formatFileSize, _ as _export_sfc } from "./index-Bz4sqqM7.js";
/* empty css                              */
/* empty css                    */
/* empty css                   */
/* empty css                         */
/* empty css                    */
/* empty css                   */
/* empty css                        */
/* empty css                   */
/* empty css                         */
/* empty css                      */
/* empty css                */
/* empty css                  */
/* empty css                          */
/* empty css                   */
/* empty css                   */
/* empty css                */
/* empty css                 */
/* empty css                      */
import { y as defineComponent, r as ref, k as reactive, c as computed, l as onMounted, an as markRaw, U as onUnmounted, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, L as createCommentVNode, I as createBlock, Q as Fragment, a6 as renderList, E as normalizeClass, n as nextTick, O as createTextVNode, u as unref, M as resolveDynamicComponent, P as toDisplayString, K as withDirectives, a4 as withKeys, W as withModifiers, A as openBlock } from "./vendor-DT2rKQnu.js";
import { ag as data_board_default, u as user_filled_default, o as document_default, i as folder_default, a2 as setting_default, $ as circle_check_default, E as ElMessage, c as ElButton, a1 as ElCard, q as ElDialog, ah as ElRow, a as ElIcon, K as refresh_default, ai as ElMenu, aj as ElMenuItem, ak as ElCol, al as arrow_up_default, b as ElForm, d as ElFormItem, e as ElInput, L as search_default, Y as ElSelect, Z as ElOption, am as ElDatePicker, an as plus_default, C as delete_default, ao as vLoading, a0 as ElAvatar, X as ElTag, z as ElProgress, g as ElCheckbox, D as ElDropdown, ap as arrow_down_default, N as ElDropdownMenu, O as ElDropdownItem, f as user_default, aq as switch_default, A as folder_opened_default, ar as data_analysis_default, a6 as ElEmpty, V as ElTable, W as ElTableColumn, as as more_filled_default, at as key_default, w as download_default, au as ElDivider, _ as ElInputNumber, av as ElSwitch, h as upload_default, aw as ElCheckboxGroup, ax as tools_default, ay as brush_default, az as ElRadioGroup, aA as ElRadioButton, aB as ElColorPicker, p as picture_default, aC as star_default, U as view_default, ad as ElSlider, I as ElMessageBox } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "admin-center-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-content" };
const _hoisted_4 = { class: "header-actions" };
const _hoisted_5 = { class: "admin-center-content" };
const _hoisted_6 = {
  key: 0,
  class: "mobile-nav-bar"
};
const _hoisted_7 = { class: "mobile-nav-header" };
const _hoisted_8 = { class: "mobile-tabs" };
const _hoisted_9 = ["onClick"];
const _hoisted_10 = {
  key: 0,
  class: "admin-section"
};
const _hoisted_11 = { class: "stat-card users-card" };
const _hoisted_12 = { class: "stat-icon users" };
const _hoisted_13 = { class: "stat-info" };
const _hoisted_14 = { class: "stat-value" };
const _hoisted_15 = { class: "stat-trend" };
const _hoisted_16 = { class: "stat-card files-card" };
const _hoisted_17 = { class: "stat-icon files" };
const _hoisted_18 = { class: "stat-info" };
const _hoisted_19 = { class: "stat-value" };
const _hoisted_20 = { class: "stat-trend" };
const _hoisted_21 = { class: "stat-card folder-card" };
const _hoisted_22 = { class: "stat-icon folder" };
const _hoisted_23 = { class: "stat-info" };
const _hoisted_24 = { class: "stat-value" };
const _hoisted_25 = { class: "stat-trend" };
const _hoisted_26 = { class: "quick-actions" };
const _hoisted_27 = {
  key: 1,
  class: "admin-section"
};
const _hoisted_28 = { class: "user-filters" };
const _hoisted_29 = {
  key: 0,
  class: "mobile-filters"
};
const _hoisted_30 = { class: "user-actions" };
const _hoisted_31 = {
  key: 0,
  class: "mobile-actions"
};
const _hoisted_32 = {
  key: 1,
  class: "desktop-actions"
};
const _hoisted_33 = { class: "action-left" };
const _hoisted_34 = {
  key: 0,
  class: "mobile-user-list"
};
const _hoisted_35 = ["onClick"];
const _hoisted_36 = { class: "user-card-header" };
const _hoisted_37 = { class: "user-info" };
const _hoisted_38 = { class: "user-details" };
const _hoisted_39 = { class: "username" };
const _hoisted_40 = { class: "email" };
const _hoisted_41 = { class: "user-status" };
const _hoisted_42 = { class: "user-card-content" };
const _hoisted_43 = { class: "storage-section" };
const _hoisted_44 = { class: "storage-info" };
const _hoisted_45 = { class: "storage-text" };
const _hoisted_46 = { class: "time-section" };
const _hoisted_47 = { class: "time-text" };
const _hoisted_48 = { class: "user-card-actions" };
const _hoisted_49 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_50 = { class: "user-info" };
const _hoisted_51 = ["title"];
const _hoisted_52 = { class: "email-text" };
const _hoisted_53 = { class: "storage-info" };
const _hoisted_54 = { class: "storage-text" };
const _hoisted_55 = { class: "time-text" };
const _hoisted_56 = {
  key: 2,
  class: "admin-section"
};
const _hoisted_57 = { class: "log-filters" };
const _hoisted_58 = { class: "timestamp-text" };
const _hoisted_59 = { class: "message-content" };
const _hoisted_60 = {
  key: 3,
  class: "admin-section"
};
const _hoisted_61 = { class: "stat-content" };
const _hoisted_62 = { class: "stat-icon total" };
const _hoisted_63 = { class: "stat-info" };
const _hoisted_64 = { class: "stat-value" };
const _hoisted_65 = { class: "stat-content" };
const _hoisted_66 = { class: "stat-icon used" };
const _hoisted_67 = { class: "stat-info" };
const _hoisted_68 = { class: "stat-value" };
const _hoisted_69 = { class: "stat-content" };
const _hoisted_70 = { class: "stat-icon available" };
const _hoisted_71 = { class: "stat-info" };
const _hoisted_72 = { class: "stat-value" };
const _hoisted_73 = { class: "card-header" };
const _hoisted_74 = { class: "usage-content" };
const _hoisted_75 = { class: "usage-details" };
const _hoisted_76 = { class: "usage-text" };
const _hoisted_77 = { class: "action-buttons" };
const _hoisted_78 = {
  key: 4,
  class: "admin-section"
};
const _hoisted_79 = { class: "color-picker-container" };
const _hoisted_80 = { class: "color-value" };
const _hoisted_81 = {
  key: 5,
  class: "admin-section"
};
const _hoisted_82 = { class: "strict-row" };
const _hoisted_83 = { class: "strict-row" };
const _hoisted_84 = { class: "strict-value" };
const _hoisted_85 = { style: { "display": "flex", "gap": "8px", "align-items": "center", "width": "100%" } };
const _hoisted_86 = { class: "settings-actions" };
const _hoisted_87 = { class: "settings-action-item" };
const _hoisted_88 = { class: "settings-action-item" };
const _hoisted_89 = {
  key: 2,
  class: "mobile-content"
};
const _hoisted_90 = {
  key: 0,
  class: "admin-section"
};
const _hoisted_91 = { class: "stat-card users-card" };
const _hoisted_92 = { class: "stat-icon users" };
const _hoisted_93 = { class: "stat-info" };
const _hoisted_94 = { class: "stat-value" };
const _hoisted_95 = { class: "stat-trend" };
const _hoisted_96 = { class: "stat-card files-card" };
const _hoisted_97 = { class: "stat-icon files" };
const _hoisted_98 = { class: "stat-info" };
const _hoisted_99 = { class: "stat-value" };
const _hoisted_100 = { class: "stat-trend" };
const _hoisted_101 = { class: "stat-card storage-card" };
const _hoisted_102 = { class: "stat-icon storage" };
const _hoisted_103 = { class: "stat-info" };
const _hoisted_104 = { class: "stat-value" };
const _hoisted_105 = { class: "stat-trend" };
const _hoisted_106 = {
  key: 1,
  class: "admin-section"
};
const _hoisted_107 = { class: "mobile-user-filters" };
const _hoisted_108 = { class: "user-filter-header" };
const _hoisted_109 = { class: "filter-title" };
const _hoisted_110 = { class: "search-section" };
const _hoisted_111 = { class: "filter-section" };
const _hoisted_112 = { class: "user-action-section" };
const _hoisted_113 = { class: "user-action-buttons" };
const _hoisted_114 = { class: "user-actions" };
const _hoisted_115 = {
  key: 0,
  class: "mobile-actions"
};
const _hoisted_116 = {
  key: 0,
  class: "mobile-user-list"
};
const _hoisted_117 = ["onClick"];
const _hoisted_118 = { class: "user-card-header" };
const _hoisted_119 = { class: "user-info" };
const _hoisted_120 = { class: "user-details" };
const _hoisted_121 = { class: "username" };
const _hoisted_122 = { class: "email" };
const _hoisted_123 = { class: "user-status" };
const _hoisted_124 = { class: "user-card-content" };
const _hoisted_125 = { class: "storage-section" };
const _hoisted_126 = { class: "storage-info" };
const _hoisted_127 = { class: "storage-text" };
const _hoisted_128 = { class: "time-section" };
const _hoisted_129 = { class: "time-text" };
const _hoisted_130 = { class: "user-card-actions" };
const _hoisted_131 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_132 = {
  key: 2,
  class: "admin-section"
};
const _hoisted_133 = { class: "mobile-log-filters" };
const _hoisted_134 = { class: "log-filter-header" };
const _hoisted_135 = { class: "filter-title" };
const _hoisted_136 = { class: "level-section" };
const _hoisted_137 = { class: "search-section" };
const _hoisted_138 = { class: "log-action-section" };
const _hoisted_139 = { class: "log-action-buttons" };
const _hoisted_140 = { class: "mobile-log-list" };
const _hoisted_141 = { class: "log-card-header" };
const _hoisted_142 = { class: "log-time" };
const _hoisted_143 = { class: "log-card-content" };
const _hoisted_144 = { class: "log-source" };
const _hoisted_145 = { class: "log-message" };
const _hoisted_146 = {
  key: 0,
  class: "empty-state"
};
const _hoisted_147 = {
  key: 3,
  class: "admin-section"
};
const _hoisted_148 = { class: "mobile-storage-stats" };
const _hoisted_149 = { class: "storage-stat-card" };
const _hoisted_150 = { class: "stat-icon total" };
const _hoisted_151 = { class: "stat-info" };
const _hoisted_152 = { class: "stat-value" };
const _hoisted_153 = { class: "storage-stat-card" };
const _hoisted_154 = { class: "stat-icon used" };
const _hoisted_155 = { class: "stat-info" };
const _hoisted_156 = { class: "stat-value" };
const _hoisted_157 = { class: "storage-stat-card" };
const _hoisted_158 = { class: "stat-icon motion" };
const _hoisted_159 = { class: "stat-info" };
const _hoisted_160 = { class: "stat-value" };
const _hoisted_161 = { class: "storage-stat-card" };
const _hoisted_162 = { class: "stat-icon available" };
const _hoisted_163 = { class: "stat-info" };
const _hoisted_164 = { class: "stat-value" };
const _hoisted_165 = { class: "mobile-storage-usage" };
const _hoisted_166 = { class: "usage-header" };
const _hoisted_167 = { class: "usage-content" };
const _hoisted_168 = { class: "usage-details" };
const _hoisted_169 = { class: "usage-text" };
const _hoisted_170 = { class: "mobile-storage-actions" };
const _hoisted_171 = {
  key: 4,
  class: "admin-section"
};
const _hoisted_172 = { class: "mobile-settings-form" };
const _hoisted_173 = { class: "settings-group" };
const _hoisted_174 = { class: "group-title" };
const _hoisted_175 = { class: "settings-group" };
const _hoisted_176 = { class: "group-title" };
const _hoisted_177 = { class: "settings-group" };
const _hoisted_178 = { class: "group-title" };
const _hoisted_179 = { class: "settings-group" };
const _hoisted_180 = { class: "group-title" };
const _hoisted_181 = { class: "color-picker-container" };
const _hoisted_182 = { class: "color-value" };
const _hoisted_183 = { class: "settings-actions" };
const _hoisted_184 = {
  key: 5,
  class: "admin-section"
};
const _hoisted_185 = { class: "mobile-settings-form" };
const _hoisted_186 = { class: "settings-group" };
const _hoisted_187 = { class: "group-title" };
const _hoisted_188 = { class: "settings-group" };
const _hoisted_189 = { class: "group-title" };
const _hoisted_190 = { class: "settings-group" };
const _hoisted_191 = { class: "group-title" };
const _hoisted_192 = { class: "settings-actions" };
const _hoisted_193 = { class: "settings-action-item" };
const _hoisted_194 = { class: "settings-action-item" };
const _hoisted_195 = { class: "user-stats-content grayscale" };
const _hoisted_196 = {
  key: 0,
  class: "stats-grid"
};
const _hoisted_197 = {
  key: 0,
  class: "mobile-user-header"
};
const _hoisted_198 = { class: "user-avatar-section" };
const _hoisted_199 = { class: "user-basic-info" };
const _hoisted_200 = { class: "user-tags" };
const _hoisted_201 = {
  key: 1,
  class: "stats-section"
};
const _hoisted_202 = { class: "stats-item" };
const _hoisted_203 = { class: "value" };
const _hoisted_204 = { class: "stats-item" };
const _hoisted_205 = { class: "value" };
const _hoisted_206 = { class: "stats-item" };
const _hoisted_207 = { class: "value" };
const _hoisted_208 = { class: "stats-item password-item" };
const _hoisted_209 = { class: "password-container" };
const _hoisted_210 = { class: "password-display" };
const _hoisted_211 = { class: "password-value" };
const _hoisted_212 = {
  key: 0,
  class: "password-verification"
};
const _hoisted_213 = { class: "verification-input" };
const _hoisted_214 = { class: "verification-timer" };
const _hoisted_215 = { class: "timer-text" };
const _hoisted_216 = { class: "stats-item" };
const _hoisted_217 = { class: "value" };
const _hoisted_218 = { class: "stats-item" };
const _hoisted_219 = { class: "value" };
const _hoisted_220 = { class: "stats-item" };
const _hoisted_221 = { class: "value" };
const _hoisted_222 = {
  key: 2,
  class: "mobile-info-cards"
};
const _hoisted_223 = { class: "mobile-info-card" };
const _hoisted_224 = { class: "card-header" };
const _hoisted_225 = { class: "card-content" };
const _hoisted_226 = { class: "info-item" };
const _hoisted_227 = { class: "info-value" };
const _hoisted_228 = { class: "info-item" };
const _hoisted_229 = { class: "info-value" };
const _hoisted_230 = { class: "info-item password-item" };
const _hoisted_231 = { class: "password-display" };
const _hoisted_232 = { class: "password-value" };
const _hoisted_233 = {
  key: 0,
  class: "password-verification"
};
const _hoisted_234 = { class: "verification-input" };
const _hoisted_235 = { class: "verification-actions-mobile" };
const _hoisted_236 = { class: "verification-timer" };
const _hoisted_237 = { class: "timer-text" };
const _hoisted_238 = { class: "info-item" };
const _hoisted_239 = { class: "info-value" };
const _hoisted_240 = { class: "mobile-info-card" };
const _hoisted_241 = { class: "card-header" };
const _hoisted_242 = { class: "card-content" };
const _hoisted_243 = { class: "storage-progress" };
const _hoisted_244 = { class: "progress-info" };
const _hoisted_245 = { class: "progress-percent" };
const _hoisted_246 = { class: "storage-details" };
const _hoisted_247 = { class: "storage-item" };
const _hoisted_248 = { class: "storage-value" };
const _hoisted_249 = { class: "storage-item" };
const _hoisted_250 = { class: "storage-value" };
const _hoisted_251 = { class: "storage-item" };
const _hoisted_252 = { class: "storage-value" };
const _hoisted_253 = {
  key: 3,
  class: "stats-section"
};
const _hoisted_254 = { class: "stats-item" };
const _hoisted_255 = { class: "value" };
const _hoisted_256 = { class: "stats-item" };
const _hoisted_257 = { class: "value" };
const _hoisted_258 = { class: "stats-item" };
const _hoisted_259 = { class: "value" };
const _hoisted_260 = { class: "stats-item" };
const _hoisted_261 = { class: "value" };
const _hoisted_262 = {
  key: 1,
  class: "no-stats"
};
const _hoisted_263 = { class: "dialog-footer" };
const geetestScriptUrl = "https://static.geetest.com/v4/gt4.js";
const geetestMaxWaitMs = 12e3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminCenter",
  setup(__props) {
    const geetestCaptchaId = "30d77075542cc161d6518051a937b9a0";
    let geetestHandler = null;
    const geetestReady = ref(false);
    const loadScriptOnce = (src) => new Promise((resolve, reject) => {
      const exists = Array.from(document.scripts).some((s2) => s2.src === src);
      if (exists) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("geetest script load failed"));
      document.head.appendChild(s);
    });
    const ensureGeetest = async () => {
      if (geetestReady.value && geetestHandler) return true;
      await loadScriptOnce(geetestScriptUrl);
      const initGeetest4 = window.initGeetest4;
      if (!initGeetest4) return false;
      return await new Promise((resolve) => {
        try {
          initGeetest4({
            captchaId: geetestCaptchaId,
            product: "bind",
            language: "zho",
            mask: { outside: true, bgColor: "#0000004d" },
            timeout: 15e3
          }, (handler) => {
            var _a;
            geetestHandler = handler;
            geetestReady.value = !!handler;
            try {
              (_a = geetestHandler == null ? void 0 : geetestHandler.onReady) == null ? void 0 : _a.call(geetestHandler, () => {
              });
            } catch {
            }
            resolve(geetestReady.value);
          });
        } catch {
          resolve(false);
        }
      });
    };
    const moderationForm = reactive({
      enable: false,
      provider: "",
      apiUrl: "",
      apiKey: "",
      model: "",
      strictness: 70,
      maxImageBytes: 524288,
      httpTimeoutMs: 2e4,
      imageHeuristic: true,
      ocrApiUrl: "",
      ocrApiKey: ""
    });
    const maxImageSizeUnit = ref("MB");
    const maxImageSizeValue = computed({
      get() {
        const bytes = Number(moderationForm.maxImageBytes || 0);
        if (maxImageSizeUnit.value === "KB") return Math.round(bytes / 1024);
        if (maxImageSizeUnit.value === "B") return bytes;
        return Math.round(bytes / (1024 * 1024));
      },
      set(v) {
        const n = Number(v || 0);
        if (maxImageSizeUnit.value === "KB") moderationForm.maxImageBytes = Math.max(0, Math.round(n * 1024));
        else if (maxImageSizeUnit.value === "B") moderationForm.maxImageBytes = Math.max(0, Math.round(n));
        else moderationForm.maxImageBytes = Math.max(0, Math.round(n * 1024 * 1024));
      }
    });
    const moderationLoading = ref(false);
    const moderationSaving = ref(false);
    const loadModeration = async () => {
      try {
        moderationLoading.value = true;
        const { data } = await api.get("/system/moderation");
        moderationForm.enable = !!data.enable;
        moderationForm.provider = data.provider || "";
        moderationForm.apiUrl = data.apiUrl || "";
        moderationForm.apiKey = data.apiKey || "";
        moderationForm.model = data.model || "";
        moderationForm.strictness = Number.isFinite(Number(data.strictness)) ? Number(data.strictness) : 70;
        moderationForm.maxImageBytes = Number.isFinite(Number(data.maxImageBytes)) ? Number(data.maxImageBytes) : 524288;
        moderationForm.httpTimeoutMs = Number.isFinite(Number(data.httpTimeoutMs)) ? Number(data.httpTimeoutMs) : 2e4;
        try {
          if (moderationForm.maxImageBytes % (1024 * 1024) === 0) maxImageSizeUnit.value = "MB";
          else if (moderationForm.maxImageBytes % 1024 === 0) maxImageSizeUnit.value = "KB";
          else maxImageSizeUnit.value = "B";
        } catch {
        }
        moderationForm.imageHeuristic = data.imageHeuristic !== false;
        moderationForm.ocrApiUrl = data.ocrApiUrl || "";
        moderationForm.ocrApiKey = data.ocrApiKey || "";
      } catch (e) {
        ElMessage.error("加载审核设置失败");
      } finally {
        moderationLoading.value = false;
      }
    };
    const saveModeration = async () => {
      var _a, _b;
      try {
        moderationSaving.value = true;
        await api.put("/system/moderation", { ...moderationForm });
        ElMessage.success("审核设置保存成功（全局5秒内生效）");
      } catch (e) {
        ElMessage.error(((_b = (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "保存审核设置失败");
      } finally {
        moderationSaving.value = false;
      }
    };
    onMounted(() => {
      loadModeration().catch(() => {
      });
    });
    const showCaptcha = async () => {
      const ok = await ensureGeetest();
      if (!ok || !geetestHandler) return false;
      return await new Promise((resolve) => {
        var _a, _b, _c;
        let settled = false;
        const cleanup = () => {
          if (settled) return;
          settled = true;
          try {
            if (geetestHandler == null ? void 0 : geetestHandler.close) geetestHandler.close();
            if (geetestHandler == null ? void 0 : geetestHandler.hide) geetestHandler.hide();
          } catch (e) {
          }
        };
        const onSuccess = async () => {
          var _a2, _b2, _c2, _d;
          if (settled) return;
          settled = true;
          try {
            const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null;
            if (!validate) {
              ElMessage.error("请完成人机验证");
              cleanup();
              return resolve(false);
            }
            const { lot_number, captcha_output, pass_token, gen_time } = validate;
            if (!lot_number || !captcha_output || !pass_token || !gen_time) {
              ElMessage.error("验证码参数不完整，请重新验证");
              cleanup();
              return resolve(false);
            }
            const resp = await api.post("/auth/captcha/validate", {
              lot_number,
              captcha_output,
              pass_token,
              gen_time,
              captcha_id: geetestCaptchaId
            });
            if (((_a2 = resp == null ? void 0 : resp.data) == null ? void 0 : _a2.success) || ((_b2 = resp == null ? void 0 : resp.data) == null ? void 0 : _b2.result) === "success") {
              cleanup();
              return resolve(true);
            }
            ElMessage.error(((_c2 = resp == null ? void 0 : resp.data) == null ? void 0 : _c2.message) || ((_d = resp == null ? void 0 : resp.data) == null ? void 0 : _d.reason) || "人机验证失败");
            cleanup();
            resolve(false);
          } catch (e) {
            ElMessage.error("人机验证服务异常，请稍后重试");
            cleanup();
            resolve(false);
          }
        };
        const onError = () => {
          if (settled) return;
          settled = true;
          ElMessage.error("人机验证出错");
          cleanup();
          resolve(false);
        };
        const onClose = () => {
          if (settled) return;
          settled = true;
          ElMessage.warning("请先完成人机验证");
          cleanup();
          resolve(false);
        };
        try {
          (_a = geetestHandler == null ? void 0 : geetestHandler.onSuccess) == null ? void 0 : _a.call(geetestHandler, onSuccess);
          (_b = geetestHandler == null ? void 0 : geetestHandler.onError) == null ? void 0 : _b.call(geetestHandler, onError);
          (_c = geetestHandler == null ? void 0 : geetestHandler.onClose) == null ? void 0 : _c.call(geetestHandler, onClose);
          if (geetestHandler.showCaptcha) geetestHandler.showCaptcha();
          else if (geetestHandler.showBox) geetestHandler.showBox();
          setTimeout(() => {
            if (!settled) {
              settled = true;
              ElMessage.warning("验证超时，请重试");
              cleanup();
              resolve(false);
            }
          }, geetestMaxWaitMs);
        } catch {
          cleanup();
          resolve(false);
        }
      });
    };
    const activeSection = ref("overview");
    const refreshing = ref(false);
    const savingSettings = ref(false);
    const loadingSettings = ref(false);
    const creatingUser = ref(false);
    const showCreateUserDialog = ref(false);
    const selectedUsers = ref([]);
    const userFormRef = ref();
    const openMenus = ref(/* @__PURE__ */ new Set());
    const showCleanupDialog = ref(false);
    const showUserStatsDialog = ref(false);
    const selectedUserStats = ref(null);
    const userStats = ref(null);
    const loadingUserStats = ref(false);
    const showPassword = ref(false);
    const passwordVerificationCode = ref("");
    const passwordVerificationSent = ref(false);
    const passwordVerificationExpired = ref(false);
    const passwordVerifiedOk = ref(false);
    const passwordVerificationExpiry = ref(null);
    const sendingVerificationCode = ref(false);
    const passwordVerificationCooldown = ref(0);
    let passwordVerificationTimer = null;
    const startPasswordVerificationCooldown = () => {
      if (passwordVerificationTimer) {
        clearInterval(passwordVerificationTimer);
        passwordVerificationTimer = null;
      }
      passwordVerificationCooldown.value = 60;
      passwordVerificationTimer = window.setInterval(() => {
        passwordVerificationCooldown.value--;
        if (passwordVerificationCooldown.value <= 0) {
          if (passwordVerificationTimer) {
            clearInterval(passwordVerificationTimer);
            passwordVerificationTimer = null;
          }
          passwordVerificationCooldown.value = 0;
        }
      }, 1e3);
    };
    const isMobile = ref(false);
    const mobileTabs = ref([
      { key: "overview", label: "概览", icon: markRaw(data_board_default) },
      { key: "users", label: "用户", icon: markRaw(user_filled_default) },
      { key: "logs", label: "日志", icon: markRaw(document_default) },
      { key: "storage", label: "存储", icon: markRaw(folder_default) },
      { key: "settings", label: "设置", icon: markRaw(setting_default) },
      { key: "moderation", label: "审核", icon: markRaw(circle_check_default) }
    ]);
    const systemStats = reactive({
      totalUsers: 0,
      totalFiles: 0,
      totalStorage: 0,
      totalMotion: 0,
      totalFolders: 0
    });
    const storageBreakdownImageCount = ref(0);
    const storageBreakdownImageBytes = ref(0);
    const storageBreakdownVideoCount = ref(0);
    const storageBreakdownVideoBytes = ref(0);
    const storageBreakdownMotionCount = ref(0);
    computed(() => storageBreakdownImageCount.value);
    computed(() => storageBreakdownImageBytes.value);
    computed(() => storageBreakdownVideoCount.value);
    computed(() => storageBreakdownVideoBytes.value);
    computed(() => storageBreakdownMotionCount.value);
    const adjustTableWidth = () => {
      nextTick(() => {
        const tables = document.querySelectorAll(".el-table");
        tables.forEach((table) => {
          const tableElement = table;
          const bodyWrapper = tableElement.querySelector(".el-table__body-wrapper");
          if (bodyWrapper) {
            bodyWrapper.style.width = "100%";
            bodyWrapper.style.marginRight = "0px";
            bodyWrapper.style.paddingRight = "0px";
          }
          const headerWrapper = tableElement.querySelector(".el-table__header-wrapper");
          if (headerWrapper) {
            headerWrapper.style.width = "100%";
            headerWrapper.style.marginRight = "0px";
            headerWrapper.style.paddingRight = "0px";
          }
          const innerWrapper = tableElement.querySelector(".el-table__inner-wrapper");
          if (innerWrapper) {
            innerWrapper.style.width = "100%";
            innerWrapper.style.marginRight = "0px";
            innerWrapper.style.paddingRight = "0px";
          }
        });
      });
    };
    const setupSyncScroll = () => {
      nextTick(() => {
        const tables = document.querySelectorAll(".el-table");
        tables.forEach((table) => {
          const tableElement = table;
          const headerWrapper = tableElement.querySelector(".el-table__header-wrapper");
          const bodyWrapper = tableElement.querySelector(".el-table__body-wrapper");
          if (headerWrapper && bodyWrapper) {
            const tableWidth = tableElement.offsetWidth;
            headerWrapper.style.width = `${tableWidth}px`;
            bodyWrapper.style.width = `${tableWidth}px`;
            const headerTable = headerWrapper.querySelector("table");
            const bodyTable = bodyWrapper.querySelector("table");
            if (headerTable && bodyTable) {
              headerTable.style.width = `${tableWidth}px`;
              bodyTable.style.width = `${tableWidth}px`;
            }
            let isScrolling = false;
            headerWrapper.addEventListener("scroll", (e) => {
              if (!isScrolling) {
                isScrolling = true;
                const target = e.target;
                bodyWrapper.scrollLeft = target.scrollLeft;
                setTimeout(() => {
                  isScrolling = false;
                }, 10);
              }
            });
            bodyWrapper.addEventListener("scroll", (e) => {
              if (!isScrolling) {
                isScrolling = true;
                const target = e.target;
                headerWrapper.scrollLeft = target.scrollLeft;
                setTimeout(() => {
                  isScrolling = false;
                }, 10);
              }
            });
            const headerScrollbar = headerWrapper.querySelector(".el-scrollbar__wrap");
            const bodyScrollbar = bodyWrapper.querySelector(".el-scrollbar__wrap");
            if (headerScrollbar) {
              headerScrollbar.addEventListener("scroll", (e) => {
                if (!isScrolling) {
                  isScrolling = true;
                  const target = e.target;
                  if (bodyScrollbar) {
                    bodyScrollbar.scrollLeft = target.scrollLeft;
                  }
                  setTimeout(() => {
                    isScrolling = false;
                  }, 10);
                }
              });
            }
            if (bodyScrollbar) {
              bodyScrollbar.addEventListener("scroll", (e) => {
                if (!isScrolling) {
                  isScrolling = true;
                  const target = e.target;
                  if (headerScrollbar) {
                    headerScrollbar.scrollLeft = target.scrollLeft;
                  }
                  setTimeout(() => {
                    isScrolling = false;
                  }, 10);
                }
              });
            }
            const fixedRightHeader = tableElement.querySelector(".el-table__fixed-right .el-table__fixed-header-wrapper");
            const fixedRightBody = tableElement.querySelector(".el-table__fixed-right .el-table__fixed-body-wrapper");
            if (fixedRightHeader) {
              fixedRightHeader.addEventListener("scroll", () => {
                if (isScrolling) return;
                isScrolling = true;
                const scrollLeft = fixedRightHeader.scrollLeft;
                headerWrapper.scrollLeft = scrollLeft;
                bodyWrapper.scrollLeft = scrollLeft;
                if (fixedRightBody) {
                  fixedRightBody.scrollLeft = scrollLeft;
                }
                requestAnimationFrame(() => {
                  isScrolling = false;
                });
              });
            }
            if (fixedRightBody) {
              fixedRightBody.addEventListener("scroll", () => {
                if (isScrolling) return;
                isScrolling = true;
                const scrollLeft = fixedRightBody.scrollLeft;
                headerWrapper.scrollLeft = scrollLeft;
                bodyWrapper.scrollLeft = scrollLeft;
                if (fixedRightHeader) {
                  fixedRightHeader.scrollLeft = scrollLeft;
                }
                requestAnimationFrame(() => {
                  isScrolling = false;
                });
              });
            }
            const observer = new MutationObserver(() => {
              const fixedRight = tableElement.querySelector(".el-table__fixed-right");
              if (fixedRight) {
                const fixedRightHeader2 = fixedRight.querySelector(".el-table__fixed-header-wrapper");
                const fixedRightBody2 = fixedRight.querySelector(".el-table__fixed-body-wrapper");
                if (fixedRightHeader2 && !fixedRightHeader2.hasAttribute("data-sync-attached")) {
                  fixedRightHeader2.setAttribute("data-sync-attached", "true");
                  fixedRightHeader2.addEventListener("scroll", () => {
                    if (isScrolling) return;
                    isScrolling = true;
                    const scrollLeft = fixedRightHeader2.scrollLeft;
                    headerWrapper.scrollLeft = scrollLeft;
                    bodyWrapper.scrollLeft = scrollLeft;
                    if (fixedRightBody2) {
                      fixedRightBody2.scrollLeft = scrollLeft;
                    }
                    requestAnimationFrame(() => {
                      isScrolling = false;
                    });
                  });
                }
                if (fixedRightBody2 && !fixedRightBody2.hasAttribute("data-sync-attached")) {
                  fixedRightBody2.setAttribute("data-sync-attached", "true");
                  fixedRightBody2.addEventListener("scroll", () => {
                    if (isScrolling) return;
                    isScrolling = true;
                    const scrollLeft = fixedRightBody2.scrollLeft;
                    headerWrapper.scrollLeft = scrollLeft;
                    bodyWrapper.scrollLeft = scrollLeft;
                    if (fixedRightHeader2) {
                      fixedRightHeader2.scrollLeft = scrollLeft;
                    }
                    requestAnimationFrame(() => {
                      isScrolling = false;
                    });
                  });
                }
              }
            });
            observer.observe(tableElement, {
              childList: true,
              subtree: true
            });
          }
        });
      });
    };
    const storageStats = reactive({
      totalStorage: 0,
      usedStorage: 0,
      availableStorage: 0
    });
    const users = ref([]);
    const logs = ref([]);
    const logFilter = reactive({
      level: "",
      keyword: ""
    });
    const userFilter = reactive({
      search: "",
      role: "",
      status: "",
      createdRange: [],
      lastLoginRange: [],
      sortBy: "created_at",
      sortOrder: "desc"
    });
    const systemSettings = reactive({
      systemName: "图库系统",
      allowRegistration: true,
      maintenanceMode: false,
      maxFileSize: 100,
      maxUploadFiles: 10,
      allowedImageTypes: ["jpg", "png", "gif", "webp"],
      allowedVideoTypes: ["mp4", "webm", "mov"],
      allowedDocumentTypes: ["pdf", "docx", "xlsx"],
      allowedDocumentTypesCsv: "pdf,docx,xlsx",
      thumbnailSize: 300,
      maxStoragePerUser: 0,
      autoCleanLogs: false,
      // 外观设置
      themeMode: "auto",
      // auto, light, dark
      primaryColor: "#409eff",
      sidebarWidth: 220,
      enableAnimation: true,
      logoUrl: "",
      faviconUrl: "",
      customCss: "",
      // 安全设置
      minPasswordLength: 6,
      passwordComplexity: "low",
      // low, medium, high
      enableLoginLock: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      sessionTimeout: 60,
      enableTwoFactor: false,
      // 分享设置
      sharingEnabled: true,
      shareDisabledAt: "",
      // 通知设置
      enableMaintenanceNotification: false
    });
    const prevMaintenanceMode = ref(false);
    const predefineColors = [
      "#409eff",
      "#67c23a",
      "#e6a23c",
      "#f56c6c",
      "#909399",
      "#c71585",
      "#ff69b4",
      "#ff1493",
      "#dc143c",
      "#b22222",
      "#8b0000",
      "#ff4500",
      "#ff8c00",
      "#ffa500",
      "#ffd700",
      "#ffff00",
      "#9acd32",
      "#32cd32",
      "#00ff00",
      "#00ff7f",
      "#00ced1",
      "#00bfff",
      "#1e90ff",
      "#4169e1",
      "#0000ff",
      "#8a2be2",
      "#9932cc",
      "#9400d3",
      "#4b0082",
      "#800080"
    ];
    const newUser = reactive({
      username: "",
      email: "",
      password: "",
      role: "user"
    });
    const userRules = {
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 2, max: 20, message: "用户名长度必须在2-20个字符之间", trigger: "blur" },
        { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: "用户名只能包含中文、字母、数字、下划线和空格", trigger: "blur" },
        {
          validator: (_rule, value, callback) => {
            if (value && value.includes("@")) {
              callback(new Error("用户名不能使用邮箱格式"));
            } else if (value && value.trim().length === 0) {
              callback(new Error("用户名不能只包含空格"));
            } else {
              callback();
            }
          },
          trigger: "blur"
        }
      ],
      email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度不能少于6位", trigger: "blur" }
      ]
    };
    const filteredLogs = computed(() => {
      let result = logs.value;
      if (logFilter.level) {
        result = result.filter((log) => log.level === logFilter.level);
      }
      if (logFilter.keyword) {
        const keyword = logFilter.keyword.toLowerCase();
        result = result.filter(
          (log) => log.message.toLowerCase().includes(keyword) || log.source.toLowerCase().includes(keyword)
        );
      }
      return result;
    });
    const storageUsagePercentage = computed(() => {
      const total = Number(storageStats.totalStorage) || 0;
      const used = Number(storageStats.usedStorage) || 0;
      if (total === 0) return 0;
      return Math.round(used / total * 100);
    });
    let refreshTimer = null;
    const handleSectionSelect = (index) => {
      activeSection.value = index;
    };
    const refreshAllData = async () => {
      if (refreshing.value) {
        ElMessage.warning("正在刷新中，请稍候...");
        return;
      }
      refreshing.value = true;
      try {
        await fetchSystemStats();
        await fetchUsers();
        await fetchLogs();
        await fetchSystemSettings();
        await fetchStorageStats();
        ElMessage.success("数据刷新成功");
      } catch (error) {
        ElMessage.error("刷新数据失败");
      } finally {
        refreshing.value = false;
      }
    };
    const applyFrontendSettings = () => {
      try {
        const html = document.documentElement;
        html.setAttribute("data-theme", systemSettings.themeMode);
        document.documentElement.style.setProperty("--primary-color", systemSettings.primaryColor);
        document.documentElement.style.setProperty("--sidebar-width", `${systemSettings.sidebarWidth}px`);
        if (systemSettings.faviconUrl) {
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = systemSettings.faviconUrl;
        }
        let styleEl = document.getElementById("custom-css");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "custom-css";
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = systemSettings.customCss || "";
      } catch {
      }
    };
    const fetchSystemStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        const data = response.data;
        systemStats.totalUsers = Number(data.total_users) || 0;
        systemStats.totalFiles = Number(data.total_files) || 0;
        systemStats.totalStorage = Number(data.total_file_size) || 0;
        systemStats.totalMotion = Number(data.live_count) || 0;
        systemStats.totalFolders = Number(data.total_folders) || 0;
      } catch (error) {
        throw error;
      }
    };
    const getStatusTagType = (status) => {
      switch (status) {
        case "active":
          return "success";
        case "inactive":
          return "danger";
        case "suspended":
          return "warning";
        default:
          return "info";
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case "active":
          return "正常";
        case "inactive":
          return "已禁用";
        case "suspended":
          return "已暂停";
        default:
          return "未知";
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");
        users.value = response.data.users || [];
        adjustTableWidth();
        setupSyncScroll();
      } catch (error) {
        throw error;
      }
    };
    const fetchLogs = async () => {
      try {
        const response = await api.get("/admin/logs");
        logs.value = response.data.logs || [];
      } catch (error) {
        throw error;
      }
    };
    const fetchSystemSettings = async () => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F;
      loadingSettings.value = true;
      try {
        const response = await api.get("/admin/settings");
        const settings = response.data.settings || {};
        systemSettings.systemName = ((_a = settings.system_name) == null ? void 0 : _a.value) || "图库系统";
        systemSettings.allowRegistration = ((_b = settings.enable_registration) == null ? void 0 : _b.value) === "true";
        systemSettings.maintenanceMode = ((_c = settings.maintenance_mode) == null ? void 0 : _c.value) === "true";
        const maxFileSizeBytes = parseInt((_d = settings.max_file_size) == null ? void 0 : _d.value) || 100 * 1024 * 1024;
        systemSettings.maxFileSize = Math.round(maxFileSizeBytes / (1024 * 1024));
        systemSettings.maxUploadFiles = parseInt((_e = settings.max_upload_files) == null ? void 0 : _e.value) || 10;
        systemSettings.allowedImageTypes = ((_g = (_f = settings.allowed_image_types) == null ? void 0 : _f.value) == null ? void 0 : _g.split(",")) || ["jpg", "png", "gif", "webp"];
        systemSettings.allowedVideoTypes = ((_i = (_h = settings.allowed_video_types) == null ? void 0 : _h.value) == null ? void 0 : _i.split(",")) || ["mp4", "webm", "mov"];
        systemSettings.allowedDocumentTypes = ((_k = (_j = settings.allowed_document_types) == null ? void 0 : _j.value) == null ? void 0 : _k.split(",")) || ["pdf", "docx", "xlsx"];
        systemSettings.allowedDocumentTypesCsv = ((_l = settings.allowed_document_types) == null ? void 0 : _l.value) || "pdf,docx,xlsx";
        systemSettings.thumbnailSize = parseInt((_m = settings.thumbnail_size) == null ? void 0 : _m.value) || 300;
        const maxStorageBytes = parseInt((_n = settings.max_storage_per_user) == null ? void 0 : _n.value);
        systemSettings.maxStoragePerUser = isNaN(maxStorageBytes) ? 0 : Math.round(maxStorageBytes / (1024 * 1024));
        systemSettings.autoCleanLogs = ((_o = settings.auto_clean_logs) == null ? void 0 : _o.value) === "true";
        systemSettings.themeMode = ((_p = settings.theme_mode) == null ? void 0 : _p.value) || "auto";
        systemSettings.primaryColor = ((_q = settings.primary_color) == null ? void 0 : _q.value) || "#409eff";
        systemSettings.sidebarWidth = parseInt((_r = settings.sidebar_width) == null ? void 0 : _r.value) || 220;
        systemSettings.enableAnimation = ((_s = settings.enable_animation) == null ? void 0 : _s.value) === "true";
        systemSettings.logoUrl = ((_t = settings.logo_url) == null ? void 0 : _t.value) || "";
        systemSettings.faviconUrl = ((_u = settings.favicon_url) == null ? void 0 : _u.value) || "";
        systemSettings.customCss = ((_v = settings.custom_css) == null ? void 0 : _v.value) || "";
        systemSettings.minPasswordLength = parseInt((_w = settings.min_password_length) == null ? void 0 : _w.value) || 6;
        systemSettings.passwordComplexity = ((_x = settings.password_complexity) == null ? void 0 : _x.value) || "low";
        systemSettings.enableLoginLock = ((_y = settings.enable_login_lock) == null ? void 0 : _y.value) === "true";
        systemSettings.maxLoginAttempts = parseInt((_z = settings.max_login_attempts) == null ? void 0 : _z.value) || 5;
        systemSettings.lockoutDuration = parseInt((_A = settings.lockout_duration) == null ? void 0 : _A.value) || 15;
        systemSettings.sessionTimeout = parseInt((_B = settings.session_timeout) == null ? void 0 : _B.value) || 60;
        systemSettings.enableTwoFactor = ((_C = settings.enable_two_factor) == null ? void 0 : _C.value) === "true";
        systemSettings.sharingEnabled = ((_D = settings.sharing_enabled) == null ? void 0 : _D.value) !== "false";
        systemSettings.shareDisabledAt = ((_E = settings.share_disabled_at) == null ? void 0 : _E.value) || "";
        systemSettings.enableMaintenanceNotification = ((_F = settings.enable_maintenance_notification) == null ? void 0 : _F.value) === "true";
        prevMaintenanceMode.value = systemSettings.maintenanceMode;
      } catch (error) {
        ElMessage.error("获取系统设置失败");
        throw error;
      } finally {
        loadingSettings.value = false;
      }
    };
    const fetchStorageStats = async () => {
      try {
        const response = await api.get("/admin/storage-stats");
        const data = response.data;
        storageStats.totalStorage = Number(data.total_storage) || 0;
        storageStats.usedStorage = Number(data.used_storage) || 0;
        storageStats.availableStorage = Number(data.available_storage) || 0;
      } catch (error) {
        storageStats.totalStorage = Number(systemStats.totalStorage) || 0;
        storageStats.usedStorage = Number(systemStats.totalStorage) || 0;
        storageStats.availableStorage = 0;
      }
    };
    const refreshStorageStats = async () => {
      try {
        await fetchStorageStats();
        ElMessage.success("存储统计已刷新");
      } catch (error) {
        ElMessage.error("刷新存储统计失败");
      }
    };
    const getStorageUsageColor = (percentage) => {
      if (percentage >= 90) return "#f56c6c";
      if (percentage >= 70) return "#e6a23c";
      return "#67c23a";
    };
    const showStorageAnalysis = () => {
      ElMessageBox.alert(
        `
    <div style="text-align: left;">
      <h4>存储分析报告：</h4>
      <p><strong>总存储空间：</strong>${formatFileSize(storageStats.totalStorage)}</p>
      <p><strong>已使用空间：</strong>${formatFileSize(storageStats.usedStorage)}</p>
      <p><strong>可用空间：</strong>${formatFileSize(storageStats.availableStorage)}</p>
      <p><strong>使用率：</strong>${storageUsagePercentage.value}%</p>
      <hr style="margin: 10px 0;">
      <p><strong>建议：</strong></p>
      <p>${storageUsagePercentage.value >= 90 ? "⚠️ 存储空间严重不足，建议立即清理" : storageUsagePercentage.value >= 70 ? "⚠️ 存储空间使用率较高，建议定期清理" : "✅ 存储空间使用正常"}</p>
    </div>
    `,
        "存储分析",
        {
          confirmButtonText: "确定",
          dangerouslyUseHTMLString: true
        }
      );
    };
    const exportStorageReport = () => {
      const report = {
        timestamp: (/* @__PURE__ */ new Date()).toLocaleString(),
        totalStorage: storageStats.totalStorage,
        usedStorage: storageStats.usedStorage,
        availableStorage: storageStats.availableStorage,
        usagePercentage: storageUsagePercentage.value,
        totalUsers: systemStats.totalUsers,
        totalFiles: systemStats.totalFiles
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storage-report-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success("存储报告已导出");
    };
    const handleUserSelectionChange = (checked, user) => {
      if (checked) {
        if (!selectedUsers.value.includes(user)) {
          selectedUsers.value.push(user);
        }
      } else {
        const index = selectedUsers.value.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          selectedUsers.value.splice(index, 1);
        }
      }
    };
    const handleTableSelectionChange = (selection) => {
      selectedUsers.value = selection;
    };
    const toggleMenu = (user) => {
      const userId = user.id;
      if (openMenus.value.has(userId)) {
        openMenus.value.delete(userId);
      } else {
        openMenus.value.clear();
        openMenus.value.add(userId);
      }
    };
    const isMenuOpen = (user) => {
      return openMenus.value.has(user.id);
    };
    const handleMenuToggle = (visible, user) => {
      const userId = user.id;
      if (visible) {
        openMenus.value.clear();
        openMenus.value.add(userId);
      } else {
        openMenus.value.delete(userId);
      }
    };
    const closeAllMenus = () => {
      openMenus.value.clear();
    };
    onMounted(() => {
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.closest(".el-dropdown") && !target.closest(".el-dropdown-menu") && !target.closest(".el-dialog") && !target.closest(".el-overlay")) {
          closeAllMenus();
        }
      });
    });
    const handleUserCardClick = async (user, evt) => {
      try {
        if (evt) {
          const target = evt.target;
          if (target.closest(".el-dropdown") || target.closest(".el-dropdown-menu") || target.closest(".el-button")) {
            return;
          }
        }
        const captchaResult = await showCaptcha();
        if (!captchaResult) {
          ElMessage.warning("人机验证失败");
          return;
        }
        await showUserStats(user);
      } catch (error) {
        ElMessage.error("操作失败，请重试");
      }
    };
    const handleUserAction = async (command, user) => {
      closeAllMenus();
      try {
        switch (command) {
          case "toggleRole":
            const newRole = user.role === "admin" ? "user" : "admin";
            const roleText = newRole === "admin" ? "管理员" : "普通用户";
            await ElMessageBox.confirm(
              `确定要将用户 "${user.username}" 设置为${roleText}吗？`,
              "确认操作",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "custom-message-box"
              }
            );
            await toggleUserRole(user);
            break;
          case "toggleStatus":
            const newStatus = user.status === "active" ? "inactive" : "active";
            const statusText = newStatus === "active" ? "启用" : "禁用";
            await ElMessageBox.confirm(
              `确定要${statusText}用户 "${user.username}" 吗？`,
              "确认操作",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "custom-message-box"
              }
            );
            await toggleUserStatus(user);
            break;
          case "manageStorage":
            await manageUserStorage(user);
            break;
          case "resetPassword":
            await resetUserPassword(user);
            break;
          case "forceLogout":
            await forceUserLogout(user);
            break;
          case "viewStats":
            await showUserStats(user);
            break;
          case "editStorage":
            await manageUserStorage(user);
            break;
          case "delete":
            await ElMessageBox.confirm(
              `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
              "危险操作",
              {
                confirmButtonText: "删除",
                cancelButtonText: "取消",
                type: "error",
                customClass: "custom-message-box custom-danger-box",
                confirmButtonClass: "el-button--danger"
              }
            );
            await deleteUser(user);
            ElMessage.success("用户已删除");
            break;
        }
      } catch (error) {
        if (error === "cancel") {
          ElMessage.info("操作已取消");
        } else {
          ElMessage.error("操作失败，请重试");
        }
      }
    };
    const handleTableRowClick = async (row, _column, event) => {
      if (_column && (_column.fixed === "right" || _column.label === "操作")) return;
      const target = event.target;
      if (target.closest(".el-dropdown") || target.closest(".el-dropdown-menu") || target.closest(".el-button")) return;
      await handleUserCardClick(row, event);
    };
    const toggleUserRole = async (user) => {
      try {
        const newRole = user.role === "admin" ? "user" : "admin";
        await api.put(`/admin/users/${user.id}/role`, { role: newRole });
        const userIndex = users.value.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          users.value[userIndex].role = newRole;
        }
        ElMessage.success(`用户角色已更新为${newRole === "admin" ? "管理员" : "普通用户"}`);
      } catch (error) {
        ElMessage.error("切换用户角色失败");
        throw error;
      }
    };
    const toggleUserStatus = async (user) => {
      try {
        const newStatus = user.status === "active" ? "inactive" : "active";
        await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
        const userIndex = users.value.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          users.value[userIndex].status = newStatus;
        }
        ElMessage.success(`用户状态已更新为${newStatus === "active" ? "正常" : "已禁用"}`);
      } catch (error) {
        ElMessage.error("切换用户状态失败");
        throw error;
      }
    };
    const sendPasswordVerificationCode = async () => {
      if (!selectedUserStats.value) return;
      try {
        sendingVerificationCode.value = true;
        const captchaResult = await showCaptcha();
        if (!captchaResult) {
          ElMessage.warning("人机验证失败");
          return;
        }
        const response = await api.post(`/admin/users/${selectedUserStats.value.id}/view-password/send-code`);
        if (response.data.success) {
          passwordVerificationExpiry.value = new Date(Date.now() + 5 * 60 * 1e3);
          passwordVerificationCode.value = "";
          ElMessage.success("验证码已发送到用户邮箱");
          startPasswordVerificationCooldown();
        } else {
          ElMessage.error(response.data.message || "发送验证码失败");
        }
      } catch (error) {
        ElMessage.error("发送验证码失败，请重试");
      } finally {
        sendingVerificationCode.value = false;
      }
    };
    const verifyPasswordCode = async () => {
      if (!selectedUserStats.value || passwordVerificationCode.value.length !== 6) return;
      try {
        const response = await api.post(`/admin/users/${selectedUserStats.value.id}/view-password/verify`, {
          code: passwordVerificationCode.value
        });
        if (response.data.success) {
          userStats.value.password = response.data.passwordMaskedHash || "****";
          showPassword.value = true;
          passwordVerifiedOk.value = true;
          passwordVerificationSent.value = false;
          passwordVerificationExpired.value = false;
          passwordVerificationCode.value = "";
          ElMessage.success("验证成功");
        } else {
          ElMessage.error(response.data.message || "验证码错误或已过期");
        }
      } catch (error) {
        ElMessage.error("验证失败，请重试");
      }
    };
    const generateRandomPassword = (length = 12) => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+";
      let res = "";
      for (let i = 0; i < length; i++) res += chars[Math.floor(Math.random() * chars.length)];
      return res;
    };
    const resetSelectedUserPassword = async () => {
      if (!selectedUserStats.value) return;
      if (!passwordVerifiedOk.value) {
        passwordVerificationSent.value = true;
        passwordVerificationExpired.value = false;
        passwordVerificationExpiry.value = new Date(Date.now() + 5 * 60 * 1e3);
        passwordVerificationCode.value = "";
        ElMessage.info("请先完成验证码校验");
        return;
      }
      try {
        const newPwd = generateRandomPassword(12);
        await api.put(`/admin/users/${selectedUserStats.value.id}/password`, { password: newPwd });
        await ElMessageBox.alert(`新密码：${newPwd}`, "重置成功", { confirmButtonText: "我已保存" });
        passwordVerifiedOk.value = false;
        showPassword.value = false;
        passwordVerificationSent.value = false;
      } catch (e) {
        ElMessage.error("重置密码失败，请重试");
      }
    };
    const getVerificationTimeLeft = () => {
      if (!passwordVerificationExpiry.value) return "0:00";
      const now = /* @__PURE__ */ new Date();
      const diff = passwordVerificationExpiry.value.getTime() - now.getTime();
      if (diff <= 0) {
        passwordVerificationExpired.value = true;
        return "已过期";
      }
      const minutes = Math.floor(diff / 6e4);
      const seconds = Math.floor(diff % 6e4 / 1e3);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    const showUserStats = async (user) => {
      var _a, _b, _c, _d, _e;
      try {
        selectedUserStats.value = user;
        loadingUserStats.value = true;
        showUserStatsDialog.value = true;
        showPassword.value = false;
        passwordVerificationSent.value = false;
        passwordVerificationExpired.value = false;
        passwordVerificationCode.value = "";
        passwordVerificationExpiry.value = null;
        passwordVerifiedOk.value = false;
        const response = await api.get(`/admin/users/${user.id}/stats`);
        if (response.data.user && response.data.dataStats && response.data.storage) {
          const { user: userData, dataStats, storage } = response.data;
          selectedUserStats.value = {
            ...selectedUserStats.value || {},
            ...userData
          };
          userStats.value = {
            // 用户基本信息
            username: userData.username,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            created_at: userData.created_at,
            // 存储信息
            used_storage: storage.used_storage ?? storage.used ?? 0,
            storage_limit: storage.storage_limit ?? storage.limit ?? 0,
            file_count: storage.file_count || 0,
            // 统计数据
            login_count: dataStats.login_count || 0,
            upload_count: dataStats.upload_count || 0,
            download_count: dataStats.download_count || 0,
            last_login: dataStats.last_login || null,
            password: userData.password || null
          };
        } else if (response.data.success) {
          userStats.value = {
            ...response.data,
            // 确保存储相关字段存在且有值
            used_storage: response.data.used_storage ?? response.data.used ?? 0,
            storage_limit: response.data.storage_limit ?? response.data.limit ?? 0,
            file_count: response.data.file_count || 0,
            // 其他统计信息
            login_count: response.data.login_count || 0,
            upload_count: response.data.upload_count || 0,
            download_count: response.data.download_count || 0,
            last_login: response.data.last_login || null,
            password: response.data.password || null
          };
          try {
            const maybeUser = response.data.user || response.data;
            if (maybeUser && (maybeUser.id || maybeUser.username)) {
              selectedUserStats.value = {
                ...selectedUserStats.value || {},
                ...maybeUser
              };
            }
          } catch {
          }
        } else {
          throw new Error(response.data.message || "获取用户统计失败");
        }
      } catch (error) {
        if (((_a = error.response) == null ? void 0 : _a.status) === 404) {
          userStats.value = {
            used_storage: user.used_storage || 0,
            storage_limit: user.storage_limit || 0,
            file_count: 0,
            // 用户列表中没有文件数信息
            login_count: 0,
            upload_count: 0,
            download_count: 0,
            last_login: null,
            password: null,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: user.created_at
          };
          ElMessage.warning("用户统计API暂不可用，显示基本信息");
        } else if (((_b = error.response) == null ? void 0 : _b.status) === 403) {
          ElMessage.error("没有权限访问用户统计信息");
          showUserStatsDialog.value = false;
        } else if (((_c = error.response) == null ? void 0 : _c.status) >= 500) {
          ElMessage.error("服务器错误，请稍后重试");
          showUserStatsDialog.value = false;
        } else {
          const errorMsg = ((_e = (_d = error.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || error.message || "获取用户统计失败";
          userStats.value = {
            used_storage: user.used_storage || 0,
            storage_limit: user.storage_limit || 0,
            file_count: 0,
            login_count: 0,
            upload_count: 0,
            download_count: 0,
            last_login: null,
            password: null,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: user.created_at
          };
          ElMessage.warning(`用户统计API调用失败: ${errorMsg}，显示基本信息`);
        }
      } finally {
        loadingUserStats.value = false;
      }
    };
    const closeUserStatsDialog = () => {
      showUserStatsDialog.value = false;
      selectedUserStats.value = null;
      userStats.value = null;
      showPassword.value = false;
      passwordVerificationSent.value = false;
      passwordVerificationExpired.value = false;
      passwordVerificationCode.value = "";
      passwordVerificationExpiry.value = null;
    };
    const manageUserStorage = async (user) => {
      try {
        const { value: formData } = await ElMessageBox({
          title: "管理用户存储",
          message: `
        <div style="text-align: left;">
          <p><strong>当前用户：</strong>${user.username}</p>
          <p><strong>当前存储限制：</strong>${formatFileSize(user.storage_limit || 0)}</p>
          <p><strong>已使用存储：</strong>${formatFileSize(user.used_storage || 0)}</p>
          <hr style="margin: 15px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">新的存储限制：</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input id="storage-value" type="number" placeholder="请输入数值" 
                     style="flex: 1; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px;" 
                     min="1" step="0.1">
              <select id="storage-unit" style="padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px;">
                <option value="MB">MB</option>
                <option value="GB" selected>GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>
          <div style="color: #909399; font-size: 12px;">
            <p>💡 提示：</p>
            <p>• MB: 兆字节 (1MB = 1,048,576 字节)</p>
            <p>• GB: 千兆字节 (1GB = 1,073,741,824 字节)</p>
            <p>• TB: 太字节 (1TB = 1,099,511,627,776 字节)</p>
          </div>
        </div>
      `,
          showCancelButton: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          dangerouslyUseHTMLString: true,
          beforeClose: (action, instance, done) => {
            if (action === "confirm") {
              const valueInput = document.getElementById("storage-value");
              const unitSelect = document.getElementById("storage-unit");
              if (!valueInput.value || parseFloat(valueInput.value) <= 0) {
                ElMessage.error("请输入有效的存储数值");
                return;
              }
              const value = parseFloat(valueInput.value);
              const unit = unitSelect.value;
              let bytes = 0;
              switch (unit) {
                case "MB":
                  bytes = value * 1024 * 1024;
                  break;
                case "GB":
                  bytes = value * 1024 * 1024 * 1024;
                  break;
                case "TB":
                  bytes = value * 1024 * 1024 * 1024 * 1024;
                  break;
              }
              if (bytes < (user.used_storage || 0)) {
                ElMessage.error(`新容量不能小于已使用容量 (${formatFileSize(user.used_storage || 0)})`);
                return;
              }
              instance.confirmButtonLoading = true;
              api.put(`/admin/users/${user.id}/storage`, { storage_limit: Math.floor(bytes) }).then(() => {
                const userIndex = users.value.findIndex((u) => u.id === user.id);
                if (userIndex !== -1) {
                  users.value[userIndex].storage_limit = Math.floor(bytes);
                }
                ElMessage.success(`用户存储限制已更新为 ${value} ${unit}`);
                done();
              }).catch((error) => {
                ElMessage.error("更新存储限制失败");
                instance.confirmButtonLoading = false;
              });
            } else {
              done();
            }
          }
        });
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("管理用户存储失败");
        }
      }
    };
    const resetUserPassword = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要重置用户 "${user.username}" 的密码吗？

重置后用户需要使用新密码登录。`,
          "重置密码确认",
          {
            confirmButtonText: "确定重置",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        const { value: newPassword } = await ElMessageBox.prompt(
          `请输入用户 "${user.username}" 的新密码:`,
          "设置新密码",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            inputType: "password",
            inputPattern: /^.{6,}$/,
            inputErrorMessage: "密码长度至少6位"
          }
        );
        await api.put(`/admin/users/${user.id}/password`, { password: newPassword });
        ElMessage.success("用户密码重置成功");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("重置密码失败");
        }
      }
    };
    const forceUserLogout = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要强制用户 "${user.username}" 登出吗？

这将清除该用户的所有登录会话。`,
          "强制登出确认",
          {
            confirmButtonText: "确定登出",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        await api.post(`/admin/users/${user.id}/logout`);
        ElMessage.success("用户已被强制登出");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("强制登出失败");
        }
      }
    };
    const deleteUser = async (user) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户 "${user.username}" 吗？

此操作将删除：
- 用户的所有文件
- 用户的所有文件夹
- 用户的登录记录
- 相关的系统日志

此操作不可撤销！`,
          "删除用户确认",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
            dangerouslyUseHTMLString: true
          }
        );
        await api.delete(`/admin/users/${user.id}`);
        users.value = users.value.filter((u) => u.id !== user.id);
        ElMessage.success(`用户 "${user.username}" 已删除`);
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除用户失败");
        }
      }
    };
    const batchDeleteUsers = async () => {
      if (selectedUsers.value.length === 0) {
        ElMessage.warning("请先选择要删除的用户");
        return;
      }
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？

此操作将删除：
- 用户的所有文件
- 用户的所有文件夹
- 用户的登录记录
- 相关的系统日志

此操作不可撤销！`,
          "批量删除确认",
          {
            confirmButtonText: "确定删除",
            cancelButtonText: "取消",
            type: "warning",
            dangerouslyUseHTMLString: true
          }
        );
        const userIds = selectedUsers.value.map((user) => user.id);
        await api.delete("/admin/users/batch", { data: { user_ids: userIds } });
        users.value = users.value.filter((user) => !userIds.includes(user.id));
        selectedUsers.value = [];
        ElMessage.success(`已成功删除 ${userIds.length} 个用户`);
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("批量删除用户失败");
        }
      }
    };
    const searchUsers = async () => {
      var _a, _b;
      if (refreshing.value) {
        ElMessage.warning("正在刷新中，请稍候...");
        return;
      }
      try {
        const params = {};
        if (userFilter.search) params.search = userFilter.search;
        if (userFilter.role) params.role = userFilter.role;
        if (userFilter.status) params.status = userFilter.status;
        if (((_a = userFilter.createdRange) == null ? void 0 : _a.length) === 2) {
          params.created_from = userFilter.createdRange[0];
          params.created_to = userFilter.createdRange[1];
        }
        if (((_b = userFilter.lastLoginRange) == null ? void 0 : _b.length) === 2) {
          params.last_login_from = userFilter.lastLoginRange[0];
          params.last_login_to = userFilter.lastLoginRange[1];
        }
        if (userFilter.sortBy) params.sort_by = userFilter.sortBy;
        if (userFilter.sortOrder) params.sort_order = userFilter.sortOrder;
        const response = await api.get("/admin/users", { params });
        users.value = response.data.users || [];
        ElMessage.success("搜索完成");
      } catch (error) {
        ElMessage.error("搜索用户失败");
      }
    };
    const resetUserFilter = async () => {
      if (refreshing.value) {
        ElMessage.warning("正在刷新中，请稍候...");
        return;
      }
      userFilter.search = "";
      userFilter.role = "";
      userFilter.status = "";
      userFilter.createdRange = [];
      userFilter.lastLoginRange = [];
      userFilter.sortBy = "created_at";
      userFilter.sortOrder = "desc";
      try {
        await fetchUsers();
        ElMessage.success("筛选已重置");
      } catch (error) {
        ElMessage.error("重置筛选失败");
      }
    };
    const createUser = async () => {
      if (!userFormRef.value) return;
      try {
        await userFormRef.value.validate();
        creatingUser.value = true;
        await api.post("/admin/users", {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        });
        ElMessage.success("用户创建成功");
        showCreateUserDialog.value = false;
        Object.assign(newUser, {
          username: "",
          email: "",
          password: "",
          role: "user"
        });
        await fetchUsers();
      } catch (error) {
        ElMessage.error("创建用户失败");
      } finally {
        creatingUser.value = false;
      }
    };
    const searchLogs = async () => {
      if (refreshing.value) {
        ElMessage.warning("正在刷新中，请稍候...");
        return;
      }
      try {
        const params = {};
        if (logFilter.level) {
          params.level = logFilter.level;
        }
        const response = await api.get("/admin/logs", { params });
        logs.value = response.data.logs || [];
        ElMessage.success("日志搜索完成");
      } catch (error) {
        ElMessage.error("搜索日志失败");
      }
    };
    const clearLogs = async () => {
      if (refreshing.value) {
        ElMessage.warning("正在刷新中，请稍候...");
        return;
      }
      try {
        await ElMessageBox.confirm("确定要清空所有日志吗？", "清空确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        await api.delete("/admin/logs");
        logs.value = [];
        ElMessage.success("日志已清空");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("清空日志失败");
        }
      }
    };
    const exportLogs = () => {
      if (logs.value.length === 0) {
        ElMessage.warning("没有日志数据可导出");
        return;
      }
      const logData = logs.value.map((log) => ({
        时间: formatTimestamp(log.timestamp),
        级别: getLevelText(log.level),
        来源: log.source || "系统",
        消息: log.message || "无消息内容",
        用户ID: log.user_id || "系统"
      }));
      const headers = ["时间", "级别", "来源", "消息", "用户ID"];
      const csvContent = [
        headers.join(","),
        ...logData.map(
          (row) => headers.map((header) => `"${(row[header] || "").toString().replace(/"/g, '""')}"`).join(",")
        )
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-logs-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success(`已导出 ${logs.value.length} 条日志记录`);
    };
    const saveSystemSettings = async () => {
      var _a, _b;
      if (systemSettings.allowedImageTypes.length === 0) {
        ElMessage.error("至少需要选择一种图片格式");
        return;
      }
      if (systemSettings.minPasswordLength < 4) {
        ElMessage.error("最小密码长度不能小于4");
        return;
      }
      if (systemSettings.enableLoginLock && systemSettings.maxLoginAttempts < 3) {
        ElMessage.error("启用登录锁定时，最大失败次数需≥3");
        return;
      }
      if (systemSettings.systemName.trim().length === 0) {
        ElMessage.error("系统名称不能为空");
        return;
      }
      savingSettings.value = true;
      try {
        if (!prevMaintenanceMode.value && systemSettings.maintenanceMode) {
          await ElMessageBox.confirm(
            "你将开启维护模式，普通用户将无法访问，确认继续？",
            "确认开启维护模式",
            { type: "warning", confirmButtonText: "确认开启", cancelButtonText: "取消" }
          );
        }
        let shareApiSupported = true;
        try {
          await api.get("/system/share-status", { timeout: 3e3 });
        } catch (_) {
          shareApiSupported = false;
        }
        const settings = {
          system_name: systemSettings.systemName.trim(),
          enable_registration: systemSettings.allowRegistration.toString(),
          maintenance_mode: systemSettings.maintenanceMode.toString(),
          max_file_size: systemSettings.maxFileSize.toString(),
          max_upload_files: systemSettings.maxUploadFiles.toString(),
          allowed_image_types: systemSettings.allowedImageTypes.join(","),
          allowed_video_types: systemSettings.allowedVideoTypes.join(","),
          allowed_document_types: (systemSettings.allowedDocumentTypesCsv || systemSettings.allowedDocumentTypes.join(",")).trim(),
          thumbnail_size: systemSettings.thumbnailSize.toString(),
          auto_clean_logs: systemSettings.autoCleanLogs.toString(),
          // 外观与前端行为设置
          theme_mode: systemSettings.themeMode,
          primary_color: systemSettings.primaryColor,
          sidebar_width: systemSettings.sidebarWidth.toString(),
          enable_animation: systemSettings.enableAnimation.toString(),
          logo_url: systemSettings.logoUrl,
          favicon_url: systemSettings.faviconUrl,
          custom_css: systemSettings.customCss,
          // 存储（每用户上限，MB => 后端转换）
          max_storage_per_user: systemSettings.maxStoragePerUser.toString(),
          // 安全设置
          min_password_length: systemSettings.minPasswordLength.toString(),
          password_complexity: systemSettings.passwordComplexity,
          enable_login_lock: systemSettings.enableLoginLock.toString(),
          max_login_attempts: systemSettings.maxLoginAttempts.toString(),
          lockout_duration: systemSettings.lockoutDuration.toString(),
          session_timeout: systemSettings.sessionTimeout.toString(),
          enable_two_factor: systemSettings.enableTwoFactor.toString(),
          // 通知设置
          enable_maintenance_notification: systemSettings.enableMaintenanceNotification.toString()
        };
        if (shareApiSupported) {
          settings["sharing_enabled"] = systemSettings.sharingEnabled.toString();
          if (systemSettings.sharingEnabled === false) {
            settings["share_disabled_at"] = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
          }
        }
        await api.put("/admin/settings", { settings });
        ElMessage.success("系统设置保存成功");
        prevMaintenanceMode.value = systemSettings.maintenanceMode;
        setTimeout(() => {
          window.location.reload();
        }, 800);
        window.dispatchEvent(new CustomEvent("system-settings-changed", {
          detail: {
            enable_animation: systemSettings.enableAnimation,
            theme_mode: systemSettings.themeMode,
            primary_color: systemSettings.primaryColor,
            sidebar_width: systemSettings.sidebarWidth
          }
        }));
        applyFrontendSettings();
        if (systemSettings.maintenanceMode) {
          ElMessageBox.alert(
            "维护模式已开启，普通用户将无法访问系统。请确保在维护完成后及时关闭维护模式。",
            "维护模式提醒",
            {
              confirmButtonText: "我知道了",
              type: "warning"
            }
          );
        }
      } catch (error) {
        if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("保存设置失败");
        }
      } finally {
        savingSettings.value = false;
      }
    };
    const showSettingsPreview = () => {
      ElMessageBox.alert(
        `
    <div style="text-align: left;">
      <h4>当前设置预览：</h4>
      <p><strong>系统名称：</strong>${systemSettings.systemName}</p>
      <p><strong>允许注册：</strong>${systemSettings.allowRegistration ? "是" : "否"}</p>
      <p><strong>维护模式：</strong>${systemSettings.maintenanceMode ? "开启" : "关闭"}</p>
      <p><strong>最大文件大小：</strong>${systemSettings.maxFileSize}MB</p>
      <p><strong>单次上传数量：</strong>${systemSettings.maxUploadFiles}个</p>
      <p><strong>允许的图片类型：</strong>${systemSettings.allowedImageTypes.join(", ")}</p>
      <p><strong>允许的视频类型：</strong>${systemSettings.allowedVideoTypes.join(", ")}</p>
      <p><strong>缩略图尺寸：</strong>${systemSettings.thumbnailSize}px</p>
      <p><strong>自动清理日志：</strong>${systemSettings.autoCleanLogs ? "开启" : "关闭"}</p>
      <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
      <h4 style="color: #409eff; margin-bottom: 10px;">外观设置：</h4>
      <p><strong>主题模式：</strong>${systemSettings.themeMode === "auto" ? "自动" : systemSettings.themeMode === "light" ? "浅色" : "深色"}</p>
      <p><strong>主色调：</strong><span style="color: ${systemSettings.primaryColor}; font-weight: bold;">${systemSettings.primaryColor}</span></p>
      <p><strong>侧边栏宽度：</strong>${systemSettings.sidebarWidth}px</p>
      <p><strong>页面动画：</strong>${systemSettings.enableAnimation ? "开启" : "关闭"}</p>
      <p><strong>Logo地址：</strong>${systemSettings.logoUrl || "使用默认Logo"}</p>
      <p><strong>网站图标：</strong>${systemSettings.faviconUrl || "使用默认图标"}</p>
      <p><strong>自定义CSS：</strong>${systemSettings.customCss ? "已设置" : "未设置"}</p>
    </div>
    `,
        "设置预览",
        {
          confirmButtonText: "确定",
          dangerouslyUseHTMLString: true
        }
      );
    };
    const getLevelType = (level) => {
      switch (level) {
        case "error":
          return "danger";
        case "warning":
          return "warning";
        case "info":
          return "success";
        default:
          return "info";
      }
    };
    const getLevelText = (level) => {
      switch (level) {
        case "error":
          return "错误";
        case "warning":
          return "警告";
        case "info":
          return "信息";
        default:
          return "未知";
      }
    };
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return "未知时间";
      try {
        const date = new Date(timestamp);
        return date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
      } catch (error) {
        return timestamp;
      }
    };
    const getStorageProgressColor = (used, limit) => {
      if (!limit || limit === 0) return "#e6e6e6";
      const percentage = used / limit * 100;
      if (percentage >= 90) return "#f56c6c";
      if (percentage >= 70) return "#e6a23c";
      return "#67c23a";
    };
    const startAutoRefresh = () => {
      refreshTimer = setInterval(() => {
        if (!refreshing.value) {
          refreshAllData();
        }
      }, 6e4);
    };
    const stopAutoRefresh = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };
    const checkMobile = () => {
      const width = window.innerWidth;
      isMobile.value = width < 768;
    };
    const handleResize = () => {
      checkMobile();
      setTimeout(() => {
        adjustTableWidth();
      }, 100);
    };
    onMounted(async () => {
      try {
        checkMobile();
        window.addEventListener("resize", handleResize);
        await refreshAllData();
        startAutoRefresh();
        adjustTableWidth();
        setupSyncScroll();
      } catch (error) {
        ElMessage.error("初始化数据失败");
      }
    });
    onUnmounted(() => {
      stopAutoRefresh();
      window.removeEventListener("resize", handleResize);
    });
    return (_ctx, _cache) => {
      var _a;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_menu_item = ElMenuItem;
      const _component_el_menu = ElMenu;
      const _component_el_card = ElCard;
      const _component_el_col = ElCol;
      const _component_el_row = ElRow;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_option = ElOption;
      const _component_el_select = ElSelect;
      const _component_el_form = ElForm;
      const _component_el_date_picker = ElDatePicker;
      const _component_el_avatar = ElAvatar;
      const _component_el_tag = ElTag;
      const _component_el_progress = ElProgress;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_dropdown_item = ElDropdownItem;
      const _component_el_dropdown_menu = ElDropdownMenu;
      const _component_el_dropdown = ElDropdown;
      const _component_el_empty = ElEmpty;
      const _component_el_table_column = ElTableColumn;
      const _component_el_table = ElTable;
      const _component_el_divider = ElDivider;
      const _component_el_input_number = ElInputNumber;
      const _component_el_switch = ElSwitch;
      const _component_el_checkbox_group = ElCheckboxGroup;
      const _component_el_radio_button = ElRadioButton;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_color_picker = ElColorPicker;
      const _component_el_slider = ElSlider;
      const _component_el_dialog = ElDialog;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            _cache[92] || (_cache[92] = createBaseVNode("div", { class: "header-left" }, [
              createBaseVNode("h1", { class: "page-title" }, "管理中心"),
              createBaseVNode("p", { class: "page-subtitle" }, "系统管理、监控和日志中心")
            ], -1)),
            createBaseVNode("div", _hoisted_4, [
              createVNode(_component_el_button, {
                onClick: refreshAllData,
                loading: refreshing.value
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(refresh_default))
                    ]),
                    _: 1
                  }),
                  _cache[91] || (_cache[91] = createTextVNode(" 刷新数据 ", -1))
                ]),
                _: 1
              }, 8, ["loading"])
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              _cache[93] || (_cache[93] = createBaseVNode("h2", { class: "mobile-nav-title" }, "管理中心", -1)),
              createVNode(_component_el_button, {
                type: "primary",
                size: "small",
                onClick: refreshAllData,
                loading: refreshing.value,
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
              }, 8, ["loading"])
            ]),
            createBaseVNode("div", _hoisted_8, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(mobileTabs.value, (tab) => {
                return openBlock(), createElementBlock("div", {
                  key: tab.key,
                  class: normalizeClass(["mobile-tab", { active: activeSection.value === tab.key }]),
                  onClick: ($event) => handleSectionSelect(tab.key)
                }, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      (openBlock(), createBlock(resolveDynamicComponent(tab.icon)))
                    ]),
                    _: 2
                  }, 1024),
                  createBaseVNode("span", null, toDisplayString(tab.label), 1)
                ], 10, _hoisted_9);
              }), 128))
            ])
          ])) : createCommentVNode("", true),
          !isMobile.value ? (openBlock(), createBlock(_component_el_row, {
            key: 1,
            class: "desktop-layout"
          }, {
            default: withCtx(() => [
              createVNode(_component_el_col, {
                xs: 24,
                sm: 8,
                md: 6,
                lg: 5,
                xl: 4
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { class: "admin-nav-card" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_menu, {
                        modelValue: activeSection.value,
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeSection.value = $event),
                        "default-active": activeSection.value,
                        class: "admin-menu",
                        onSelect: handleSectionSelect
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_menu_item, { index: "overview" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(data_board_default))
                                ]),
                                _: 1
                              }),
                              _cache[94] || (_cache[94] = createBaseVNode("span", null, "系统概览", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_menu_item, { index: "users" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(user_filled_default))
                                ]),
                                _: 1
                              }),
                              _cache[95] || (_cache[95] = createBaseVNode("span", null, "用户管理", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_menu_item, { index: "logs" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(document_default))
                                ]),
                                _: 1
                              }),
                              _cache[96] || (_cache[96] = createBaseVNode("span", null, "系统日志", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_menu_item, { index: "storage" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(folder_default))
                                ]),
                                _: 1
                              }),
                              _cache[97] || (_cache[97] = createBaseVNode("span", null, "存储管理", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_menu_item, { index: "settings" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(setting_default))
                                ]),
                                _: 1
                              }),
                              _cache[98] || (_cache[98] = createBaseVNode("span", null, "系统设置", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_menu_item, { index: "moderation" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(circle_check_default))
                                ]),
                                _: 1
                              }),
                              _cache[99] || (_cache[99] = createBaseVNode("span", null, "审核设置", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "default-active"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, {
                xs: 24,
                sm: 16,
                md: 18,
                lg: 19,
                xl: 20
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { class: "admin-panel-card" }, {
                    default: withCtx(() => [
                      activeSection.value === "overview" ? (openBlock(), createElementBlock("div", _hoisted_10, [
                        _cache[111] || (_cache[111] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "系统概览"),
                          createBaseVNode("p", null, "系统整体运行状态和统计数据")
                        ], -1)),
                        createVNode(_component_el_row, { class: "stats-cards" }, {
                          default: withCtx(() => [
                            createVNode(_component_el_col, {
                              xs: 12,
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_11, [
                                  createBaseVNode("div", _hoisted_12, [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(user_filled_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createBaseVNode("div", _hoisted_13, [
                                    createBaseVNode("div", _hoisted_14, toDisplayString(systemStats.totalUsers), 1),
                                    _cache[101] || (_cache[101] = createBaseVNode("div", { class: "stat-label" }, "总用户数", -1)),
                                    createBaseVNode("div", _hoisted_15, [
                                      createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                        default: withCtx(() => [
                                          createVNode(unref(arrow_up_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[100] || (_cache[100] = createBaseVNode("span", { class: "trend-text" }, "活跃用户", -1))
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_col, {
                              xs: 12,
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_16, [
                                  createBaseVNode("div", _hoisted_17, [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(folder_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createBaseVNode("div", _hoisted_18, [
                                    createBaseVNode("div", _hoisted_19, toDisplayString(systemStats.totalFiles), 1),
                                    _cache[103] || (_cache[103] = createBaseVNode("div", { class: "stat-label" }, "总文件数", -1)),
                                    createBaseVNode("div", _hoisted_20, [
                                      createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                        default: withCtx(() => [
                                          createVNode(unref(arrow_up_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[102] || (_cache[102] = createBaseVNode("span", { class: "trend-text" }, "存储文件", -1))
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_col, {
                              xs: 12,
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_21, [
                                  createBaseVNode("div", _hoisted_22, [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(folder_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  createBaseVNode("div", _hoisted_23, [
                                    createBaseVNode("div", _hoisted_24, toDisplayString(systemStats.totalFolders || 0), 1),
                                    _cache[105] || (_cache[105] = createBaseVNode("div", { class: "stat-label" }, "文件夹", -1)),
                                    createBaseVNode("div", _hoisted_25, [
                                      createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                        default: withCtx(() => [
                                          createVNode(unref(arrow_up_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[104] || (_cache[104] = createBaseVNode("span", { class: "trend-text" }, "数据", -1))
                                    ])
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createBaseVNode("div", _hoisted_26, [
                          _cache[110] || (_cache[110] = createBaseVNode("h4", null, "快速操作", -1)),
                          createVNode(_component_el_row, { class: "quick-actions-row" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_col, {
                                xs: 12,
                                sm: 6,
                                md: 6,
                                lg: 6,
                                xl: 6
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    class: "quick-action-btn",
                                    onClick: _cache[1] || (_cache[1] = ($event) => activeSection.value = "users")
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(user_filled_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[106] || (_cache[106] = createBaseVNode("span", null, "用户管理", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_col, {
                                xs: 12,
                                sm: 6,
                                md: 6,
                                lg: 6,
                                xl: 6
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    class: "quick-action-btn",
                                    onClick: _cache[2] || (_cache[2] = ($event) => activeSection.value = "logs")
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(document_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[107] || (_cache[107] = createBaseVNode("span", null, "系统日志", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_col, {
                                xs: 12,
                                sm: 6,
                                md: 6,
                                lg: 6,
                                xl: 6
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    class: "quick-action-btn",
                                    onClick: _cache[3] || (_cache[3] = ($event) => activeSection.value = "settings")
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(setting_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[108] || (_cache[108] = createBaseVNode("span", null, "系统设置", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_col, {
                                xs: 12,
                                sm: 6,
                                md: 6,
                                lg: 6,
                                xl: 6
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    class: "quick-action-btn",
                                    onClick: refreshAllData
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(refresh_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[109] || (_cache[109] = createBaseVNode("span", null, "刷新数据", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ])
                      ])) : createCommentVNode("", true),
                      activeSection.value === "users" ? (openBlock(), createElementBlock("div", _hoisted_27, [
                        _cache[131] || (_cache[131] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "用户管理"),
                          createBaseVNode("p", null, "管理系统用户和权限")
                        ], -1)),
                        createBaseVNode("div", _hoisted_28, [
                          isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_29, [
                            createVNode(_component_el_form, {
                              model: userFilter,
                              "label-position": "top"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_row, { gutter: 12 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_col, { span: 24 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_form_item, { label: "搜索用户" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_input, {
                                              modelValue: userFilter.search,
                                              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => userFilter.search = $event),
                                              placeholder: "用户名或邮箱",
                                              clearable: "",
                                              onKeyup: withKeys(searchUsers, ["enter"])
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
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_row, { gutter: 12 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_col, { span: 12 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_form_item, { label: "角色" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_select, {
                                              modelValue: userFilter.role,
                                              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => userFilter.role = $event),
                                              placeholder: "选择角色",
                                              clearable: "",
                                              style: { "width": "100%" }
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_component_el_option, {
                                                  label: "全部",
                                                  value: ""
                                                }),
                                                createVNode(_component_el_option, {
                                                  label: "管理员",
                                                  value: "admin"
                                                }),
                                                createVNode(_component_el_option, {
                                                  label: "用户",
                                                  value: "user"
                                                })
                                              ]),
                                              _: 1
                                            }, 8, ["modelValue"])
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_col, { span: 12 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_form_item, { label: "状态" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_select, {
                                              modelValue: userFilter.status,
                                              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => userFilter.status = $event),
                                              placeholder: "选择状态",
                                              clearable: "",
                                              style: { "width": "100%" }
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_component_el_option, {
                                                  label: "全部",
                                                  value: ""
                                                }),
                                                createVNode(_component_el_option, {
                                                  label: "正常",
                                                  value: "active"
                                                }),
                                                createVNode(_component_el_option, {
                                                  label: "已禁用",
                                                  value: "inactive"
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
                                }),
                                createVNode(_component_el_row, { gutter: 12 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_col, { span: 12 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_button, {
                                          type: "primary",
                                          onClick: searchUsers,
                                          loading: refreshing.value,
                                          style: { "width": "100%" }
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(search_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[112] || (_cache[112] = createTextVNode(" 搜索 ", -1))
                                          ]),
                                          _: 1
                                        }, 8, ["loading"])
                                      ]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_col, { span: 12 }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_button, {
                                          onClick: resetUserFilter,
                                          style: { "width": "100%" }
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(refresh_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[113] || (_cache[113] = createTextVNode(" 重置 ", -1))
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
                              _: 1
                            }, 8, ["model"])
                          ])) : (openBlock(), createBlock(_component_el_form, {
                            key: 1,
                            model: userFilter,
                            inline: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_form_item, { label: "搜索用户" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_input, {
                                    modelValue: userFilter.search,
                                    "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => userFilter.search = $event),
                                    placeholder: "用户名或邮箱",
                                    clearable: "",
                                    style: { "width": "200px" },
                                    onKeyup: withKeys(searchUsers, ["enter"])
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
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "角色" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_select, {
                                    modelValue: userFilter.role,
                                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => userFilter.role = $event),
                                    placeholder: "选择角色",
                                    clearable: "",
                                    style: { "width": "120px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "全部",
                                        value: ""
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "管理员",
                                        value: "admin"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "用户",
                                        value: "user"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "状态" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_select, {
                                    modelValue: userFilter.status,
                                    "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => userFilter.status = $event),
                                    placeholder: "选择状态",
                                    clearable: "",
                                    style: { "width": "120px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "全部",
                                        value: ""
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "正常",
                                        value: "active"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "已禁用",
                                        value: "inactive"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "注册时间" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_date_picker, {
                                    modelValue: userFilter.createdRange,
                                    "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => userFilter.createdRange = $event),
                                    type: "daterange",
                                    "range-separator": "至",
                                    "start-placeholder": "开始日期",
                                    "end-placeholder": "结束日期",
                                    "value-format": "YYYY-MM-DD HH:mm:ss"
                                  }, null, 8, ["modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "最后登录" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_date_picker, {
                                    modelValue: userFilter.lastLoginRange,
                                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => userFilter.lastLoginRange = $event),
                                    type: "daterange",
                                    "range-separator": "至",
                                    "start-placeholder": "开始日期",
                                    "end-placeholder": "结束日期",
                                    "value-format": "YYYY-MM-DD HH:mm:ss"
                                  }, null, 8, ["modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "排序" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_select, {
                                    modelValue: userFilter.sortBy,
                                    "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => userFilter.sortBy = $event),
                                    placeholder: "字段",
                                    style: { "width": "140px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "注册时间",
                                        value: "created_at"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "最后登录",
                                        value: "last_login"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "已用存储",
                                        value: "used_storage"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "用户名",
                                        value: "username"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "邮箱",
                                        value: "email"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "登录次数",
                                        value: "login_count"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue"]),
                                  createVNode(_component_el_select, {
                                    modelValue: userFilter.sortOrder,
                                    "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => userFilter.sortOrder = $event),
                                    placeholder: "顺序",
                                    style: { "width": "120px", "margin-left": "8px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "降序",
                                        value: "desc"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "升序",
                                        value: "asc"
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
                                    onClick: searchUsers,
                                    loading: refreshing.value
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(search_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[114] || (_cache[114] = createTextVNode(" 搜索 ", -1))
                                    ]),
                                    _: 1
                                  }, 8, ["loading"]),
                                  createVNode(_component_el_button, { onClick: resetUserFilter }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(refresh_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[115] || (_cache[115] = createTextVNode(" 重置 ", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["model"]))
                        ]),
                        createBaseVNode("div", _hoisted_30, [
                          isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_31, [
                            createVNode(_component_el_row, { gutter: 12 }, {
                              default: withCtx(() => [
                                createVNode(_component_el_col, { span: 12 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_button, {
                                      type: "primary",
                                      onClick: _cache[14] || (_cache[14] = ($event) => showCreateUserDialog.value = true),
                                      style: { "width": "100%" }
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(plus_default))
                                          ]),
                                          _: 1
                                        }),
                                        _cache[116] || (_cache[116] = createTextVNode(" 创建用户 ", -1))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_col, { span: 12 }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_button, {
                                      onClick: batchDeleteUsers,
                                      disabled: selectedUsers.value.length === 0,
                                      style: { "width": "100%" }
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(delete_default))
                                          ]),
                                          _: 1
                                        }),
                                        _cache[117] || (_cache[117] = createTextVNode(" 批量删除 ", -1))
                                      ]),
                                      _: 1
                                    }, 8, ["disabled"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ])) : (openBlock(), createElementBlock("div", _hoisted_32, [
                            createBaseVNode("div", _hoisted_33, [
                              createVNode(_component_el_button, {
                                type: "primary",
                                onClick: _cache[15] || (_cache[15] = ($event) => showCreateUserDialog.value = true)
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(plus_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[118] || (_cache[118] = createTextVNode(" 创建用户 ", -1))
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_button, {
                                onClick: batchDeleteUsers,
                                disabled: selectedUsers.value.length === 0
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(delete_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[119] || (_cache[119] = createTextVNode(" 批量删除 ", -1))
                                ]),
                                _: 1
                              }, 8, ["disabled"])
                            ])
                          ]))
                        ]),
                        isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_34, [
                          (openBlock(true), createElementBlock(Fragment, null, renderList(users.value, (user) => {
                            return withDirectives((openBlock(), createElementBlock("div", {
                              key: user.id,
                              class: "user-card",
                              onClick: ($event) => handleUserCardClick(user, $event)
                            }, [
                              createBaseVNode("div", _hoisted_36, [
                                createBaseVNode("div", _hoisted_37, [
                                  createVNode(_component_el_avatar, {
                                    size: 40,
                                    src: unref(getAvatarUrl)(user.avatar_url)
                                  }, {
                                    default: withCtx(() => {
                                      var _a2;
                                      return [
                                        createTextVNode(toDisplayString((_a2 = user.username) == null ? void 0 : _a2.charAt(0).toUpperCase()), 1)
                                      ];
                                    }),
                                    _: 2
                                  }, 1032, ["src"]),
                                  createBaseVNode("div", _hoisted_38, [
                                    createBaseVNode("div", _hoisted_39, toDisplayString(user.username || "未知用户"), 1),
                                    createBaseVNode("div", _hoisted_40, toDisplayString(user.email || "未设置"), 1)
                                  ])
                                ]),
                                createBaseVNode("div", _hoisted_41, [
                                  createVNode(_component_el_tag, {
                                    type: user.role === "admin" ? "danger" : "primary",
                                    size: "small"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(user.role === "admin" ? "管理员" : "用户"), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["type"]),
                                  createVNode(_component_el_tag, {
                                    type: getStatusTagType(user.status),
                                    size: "small",
                                    style: { "margin-top": "4px" }
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(getStatusText(user.status)), 1)
                                    ]),
                                    _: 2
                                  }, 1032, ["type"])
                                ])
                              ]),
                              createBaseVNode("div", _hoisted_42, [
                                createBaseVNode("div", _hoisted_43, [
                                  _cache[120] || (_cache[120] = createBaseVNode("div", { class: "storage-label" }, "存储使用", -1)),
                                  createBaseVNode("div", _hoisted_44, [
                                    createVNode(_component_el_progress, {
                                      percentage: Math.round((user.used_storage || 0) / (user.storage_limit || 1) * 100),
                                      "stroke-width": 8,
                                      "show-text": false,
                                      color: getStorageProgressColor(user.used_storage, user.storage_limit)
                                    }, null, 8, ["percentage", "color"]),
                                    createBaseVNode("div", _hoisted_45, toDisplayString(unref(formatFileSize)(user.used_storage || 0)) + " / " + toDisplayString(unref(formatFileSize)(user.storage_limit || 0)), 1)
                                  ])
                                ]),
                                createBaseVNode("div", _hoisted_46, [
                                  _cache[121] || (_cache[121] = createBaseVNode("div", { class: "time-label" }, "注册时间", -1)),
                                  createBaseVNode("div", _hoisted_47, toDisplayString(formatTimestamp(user.created_at)), 1)
                                ])
                              ]),
                              createBaseVNode("div", _hoisted_48, [
                                createVNode(_component_el_checkbox, {
                                  "model-value": selectedUsers.value.includes(user),
                                  onChange: (val) => handleUserSelectionChange(!!val, user)
                                }, {
                                  default: withCtx(() => [..._cache[122] || (_cache[122] = [
                                    createTextVNode(" 选择 ", -1)
                                  ])]),
                                  _: 1
                                }, 8, ["model-value", "onChange"]),
                                createVNode(_component_el_dropdown, {
                                  onCommand: (command) => handleUserAction(command, user),
                                  trigger: "click",
                                  "hide-on-click": true
                                }, {
                                  dropdown: withCtx(() => [
                                    createVNode(_component_el_dropdown_menu, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_dropdown_item, { command: "toggleRole" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(user_default))
                                              ]),
                                              _: 1
                                            }),
                                            createTextVNode(" " + toDisplayString(user.role === "admin" ? "设为用户" : "设为管理员"), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(_component_el_dropdown_item, { command: "toggleStatus" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(switch_default))
                                              ]),
                                              _: 1
                                            }),
                                            createTextVNode(" " + toDisplayString(user.status === "active" ? "禁用用户" : "启用用户"), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(_component_el_dropdown_item, { command: "editStorage" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(folder_opened_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[124] || (_cache[124] = createTextVNode(" 设置存储 ", -1))
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_el_dropdown_item, {
                                          command: "viewStats",
                                          divided: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(data_analysis_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[125] || (_cache[125] = createTextVNode(" 查看统计 ", -1))
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_el_dropdown_item, {
                                          command: "delete",
                                          divided: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(delete_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[126] || (_cache[126] = createTextVNode(" 删除用户 ", -1))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  default: withCtx(() => [
                                    createVNode(_component_el_button, {
                                      type: "primary",
                                      size: "small"
                                    }, {
                                      default: withCtx(() => [
                                        _cache[123] || (_cache[123] = createTextVNode(" 操作 ", -1)),
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(arrow_down_default))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 2
                                }, 1032, ["onCommand"])
                              ])
                            ], 8, _hoisted_35)), [
                              [_directive_loading, refreshing.value]
                            ]);
                          }), 128)),
                          users.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_49, [
                            createVNode(_component_el_empty, { description: "暂无用户数据" })
                          ])) : createCommentVNode("", true)
                        ])) : withDirectives((openBlock(), createBlock(_component_el_table, {
                          key: 1,
                          data: users.value,
                          style: { "width": "100%", "table-layout": "fixed" },
                          onSelectionChange: handleTableSelectionChange,
                          onRowClick: handleTableRowClick,
                          "empty-text": "暂无用户数据",
                          "row-key": "id",
                          class: "user-table"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_table_column, {
                              type: "selection",
                              width: "55"
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "username",
                              label: "用户名",
                              width: "140"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("div", _hoisted_50, [
                                  createVNode(_component_el_avatar, {
                                    size: 32,
                                    src: unref(getAvatarUrl)(row.avatar_url),
                                    shape: "circle"
                                  }, {
                                    default: withCtx(() => {
                                      var _a2;
                                      return [
                                        createTextVNode(toDisplayString((_a2 = row.username) == null ? void 0 : _a2.charAt(0).toUpperCase()), 1)
                                      ];
                                    }),
                                    _: 2
                                  }, 1032, ["src"]),
                                  createBaseVNode("span", {
                                    class: "username-text",
                                    title: row.username || "未知用户"
                                  }, toDisplayString(row.username || "未知用户"), 9, _hoisted_51)
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "email",
                              label: "邮箱",
                              "min-width": "120"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("span", _hoisted_52, toDisplayString(row.email || "未设置"), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "role",
                              label: "角色",
                              width: "60"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_tag, {
                                  type: row.role === "admin" ? "danger" : "primary",
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(row.role === "admin" ? "管理员" : "用户"), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["type"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "status",
                              label: "状态",
                              width: "80"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_tag, {
                                  type: getStatusTagType(row.status),
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getStatusText(row.status)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["type"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              label: "存储使用",
                              width: "120"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("div", _hoisted_53, [
                                  createVNode(_component_el_progress, {
                                    percentage: Math.round((row.used_storage || 0) / (row.storage_limit || 1) * 100),
                                    "stroke-width": 6,
                                    "show-text": false,
                                    color: getStorageProgressColor(row.used_storage, row.storage_limit)
                                  }, null, 8, ["percentage", "color"]),
                                  createBaseVNode("span", _hoisted_54, toDisplayString(unref(formatFileSize)(row.used_storage || 0)) + " / " + toDisplayString(unref(formatFileSize)(row.storage_limit || 0)), 1)
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "created_at",
                              label: "注册时间",
                              width: "100"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("span", _hoisted_55, toDisplayString(formatTimestamp(row.created_at)), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              label: "操作",
                              width: "60",
                              fixed: "right"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_dropdown, {
                                  onCommand: (command) => handleUserAction(command, row),
                                  onVisibleChange: (visible) => handleMenuToggle(visible, row),
                                  trigger: "click",
                                  "hide-on-click": true
                                }, {
                                  dropdown: withCtx(() => [
                                    createVNode(_component_el_dropdown_menu, null, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_dropdown_item, { command: "toggleRole" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(user_default))
                                              ]),
                                              _: 1
                                            }),
                                            createTextVNode(" " + toDisplayString(row.role === "admin" ? "取消管理员" : "设为管理员"), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(_component_el_dropdown_item, { command: "toggleStatus" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(switch_default))
                                              ]),
                                              _: 1
                                            }),
                                            createTextVNode(" " + toDisplayString(row.status === "active" ? "禁用用户" : "启用用户"), 1)
                                          ]),
                                          _: 2
                                        }, 1024),
                                        createVNode(_component_el_dropdown_item, { command: "manageStorage" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(folder_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[127] || (_cache[127] = createTextVNode(" 管理存储 ", -1))
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_el_dropdown_item, { command: "resetPassword" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(key_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[128] || (_cache[128] = createTextVNode(" 重置密码 ", -1))
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_el_dropdown_item, { command: "forceLogout" }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(switch_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[129] || (_cache[129] = createTextVNode(" 强制登出 ", -1))
                                          ]),
                                          _: 1
                                        }),
                                        createVNode(_component_el_dropdown_item, {
                                          command: "delete",
                                          divided: ""
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_component_el_icon, null, {
                                              default: withCtx(() => [
                                                createVNode(unref(delete_default))
                                              ]),
                                              _: 1
                                            }),
                                            _cache[130] || (_cache[130] = createTextVNode(" 删除用户 ", -1))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  default: withCtx(() => [
                                    createVNode(_component_el_button, {
                                      type: "text",
                                      size: "small",
                                      onClick: withModifiers(($event) => toggleMenu(row), ["stop"]),
                                      class: normalizeClass({ "menu-open": isMenuOpen(row) })
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
                                    }, 8, ["onClick", "class"])
                                  ]),
                                  _: 2
                                }, 1032, ["onCommand", "onVisibleChange"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["data"])), [
                          [_directive_loading, refreshing.value]
                        ])
                      ])) : createCommentVNode("", true),
                      activeSection.value === "logs" ? (openBlock(), createElementBlock("div", _hoisted_56, [
                        _cache[135] || (_cache[135] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "系统日志"),
                          createBaseVNode("p", null, "查看和管理系统运行日志")
                        ], -1)),
                        createBaseVNode("div", _hoisted_57, [
                          createVNode(_component_el_form, {
                            model: logFilter,
                            inline: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_form_item, { label: "日志级别" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_select, {
                                    modelValue: logFilter.level,
                                    "onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => logFilter.level = $event),
                                    placeholder: "选择级别",
                                    clearable: "",
                                    style: { "width": "120px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "全部",
                                        value: ""
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "错误",
                                        value: "error"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "警告",
                                        value: "warning"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "信息",
                                        value: "info"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, { label: "关键词" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_input, {
                                    modelValue: logFilter.keyword,
                                    "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => logFilter.keyword = $event),
                                    placeholder: "搜索日志内容",
                                    clearable: "",
                                    style: { "width": "200px" },
                                    onKeyup: withKeys(searchLogs, ["enter"])
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
                                _: 1
                              }),
                              createVNode(_component_el_form_item, null, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    type: "primary",
                                    onClick: searchLogs,
                                    loading: refreshing.value
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(search_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[132] || (_cache[132] = createTextVNode(" 搜索 ", -1))
                                    ]),
                                    _: 1
                                  }, 8, ["loading"]),
                                  createVNode(_component_el_button, { onClick: exportLogs }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(download_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[133] || (_cache[133] = createTextVNode(" 导出日志 ", -1))
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_el_button, {
                                    onClick: clearLogs,
                                    loading: refreshing.value
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(delete_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[134] || (_cache[134] = createTextVNode(" 清空日志 ", -1))
                                    ]),
                                    _: 1
                                  }, 8, ["loading"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["model"])
                        ]),
                        withDirectives((openBlock(), createBlock(_component_el_table, {
                          data: filteredLogs.value,
                          style: { "width": "100%" },
                          height: "400",
                          "empty-text": "暂无日志数据"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_table_column, {
                              prop: "timestamp",
                              label: "时间",
                              width: "180"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("span", _hoisted_58, toDisplayString(formatTimestamp(row.timestamp)), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "level",
                              label: "级别",
                              width: "100"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_tag, {
                                  type: getLevelType(row.level),
                                  size: "small"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getLevelText(row.level)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["type"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "source",
                              label: "来源",
                              width: "120"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_tag, {
                                  size: "small",
                                  type: "info"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(row.source || "系统"), 1)
                                  ]),
                                  _: 2
                                }, 1024)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "message",
                              label: "消息",
                              "min-width": "200"
                            }, {
                              default: withCtx(({ row }) => [
                                createBaseVNode("div", _hoisted_59, toDisplayString(row.message || "无消息内容"), 1)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["data"])), [
                          [_directive_loading, refreshing.value]
                        ])
                      ])) : createCommentVNode("", true),
                      activeSection.value === "storage" ? (openBlock(), createElementBlock("div", _hoisted_60, [
                        _cache[145] || (_cache[145] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "存储管理"),
                          createBaseVNode("p", null, "管理系统存储空间和使用情况")
                        ], -1)),
                        createVNode(_component_el_row, {
                          gutter: 16,
                          class: "storage-stats"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_col, {
                              xs: 24,
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_card, { class: "storage-stat-card" }, {
                                  default: withCtx(() => [
                                    createBaseVNode("div", _hoisted_61, [
                                      createBaseVNode("div", _hoisted_62, [
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(data_board_default))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      createBaseVNode("div", _hoisted_63, [
                                        createBaseVNode("div", _hoisted_64, toDisplayString(unref(formatFileSize)(storageStats.totalStorage)), 1),
                                        _cache[136] || (_cache[136] = createBaseVNode("div", { class: "stat-label" }, "总存储空间", -1))
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
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_card, { class: "storage-stat-card" }, {
                                  default: withCtx(() => [
                                    createBaseVNode("div", _hoisted_65, [
                                      createBaseVNode("div", _hoisted_66, [
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(folder_default))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      createBaseVNode("div", _hoisted_67, [
                                        createBaseVNode("div", _hoisted_68, toDisplayString(unref(formatFileSize)(storageStats.usedStorage)), 1),
                                        _cache[137] || (_cache[137] = createBaseVNode("div", { class: "stat-label" }, "已使用空间", -1))
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
                              sm: 8,
                              md: 8,
                              lg: 8,
                              xl: 8
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_card, { class: "storage-stat-card" }, {
                                  default: withCtx(() => [
                                    createBaseVNode("div", _hoisted_69, [
                                      createBaseVNode("div", _hoisted_70, [
                                        createVNode(_component_el_icon, null, {
                                          default: withCtx(() => [
                                            createVNode(unref(circle_check_default))
                                          ]),
                                          _: 1
                                        })
                                      ]),
                                      createBaseVNode("div", _hoisted_71, [
                                        createBaseVNode("div", _hoisted_72, toDisplayString(unref(formatFileSize)(storageStats.availableStorage)), 1),
                                        _cache[138] || (_cache[138] = createBaseVNode("div", { class: "stat-label" }, "可用空间", -1))
                                      ])
                                    ])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_card, { class: "storage-usage-card" }, {
                          header: withCtx(() => [
                            createBaseVNode("div", _hoisted_73, [
                              _cache[140] || (_cache[140] = createBaseVNode("span", null, "存储使用率", -1)),
                              createVNode(_component_el_button, {
                                onClick: refreshStorageStats,
                                loading: refreshing.value,
                                size: "small"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(refresh_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[139] || (_cache[139] = createTextVNode(" 刷新 ", -1))
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ])
                          ]),
                          default: withCtx(() => [
                            createBaseVNode("div", _hoisted_74, [
                              createVNode(_component_el_progress, {
                                percentage: storageUsagePercentage.value,
                                "stroke-width": 20,
                                color: getStorageUsageColor(storageUsagePercentage.value),
                                "show-text": true,
                                "text-inside": ""
                              }, null, 8, ["percentage", "color"]),
                              createBaseVNode("div", _hoisted_75, [
                                createBaseVNode("span", _hoisted_76, " 已使用 " + toDisplayString(unref(formatFileSize)(storageStats.usedStorage)) + " / " + toDisplayString(unref(formatFileSize)(storageStats.totalStorage)), 1)
                              ])
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_card, { class: "storage-actions-card" }, {
                          header: withCtx(() => [..._cache[141] || (_cache[141] = [
                            createBaseVNode("span", null, "存储操作", -1)
                          ])]),
                          default: withCtx(() => [
                            createBaseVNode("div", _hoisted_77, [
                              createVNode(_component_el_button, {
                                type: "primary",
                                onClick: _cache[18] || (_cache[18] = ($event) => showCleanupDialog.value = true)
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(delete_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[142] || (_cache[142] = createTextVNode(" 清理存储 ", -1))
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_button, { onClick: showStorageAnalysis }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(data_analysis_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[143] || (_cache[143] = createTextVNode(" 存储分析 ", -1))
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_button, { onClick: exportStorageReport }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(download_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[144] || (_cache[144] = createTextVNode(" 导出报告 ", -1))
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        })
                      ])) : createCommentVNode("", true),
                      activeSection.value === "settings" ? (openBlock(), createElementBlock("div", _hoisted_78, [
                        _cache[203] || (_cache[203] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "系统设置"),
                          createBaseVNode("p", null, "配置系统参数和功能")
                        ], -1)),
                        createVNode(_component_el_form, {
                          "label-width": "120px",
                          class: "system-settings-form"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(setting_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[146] || (_cache[146] = createTextVNode(" 基本设置 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "系统名称" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: systemSettings.systemName,
                                  "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => systemSettings.systemName = $event),
                                  placeholder: "请输入系统名称",
                                  clearable: "",
                                  maxlength: "50",
                                  "show-word-limit": ""
                                }, {
                                  prefix: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(setting_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[147] || (_cache[147] = createBaseVNode("div", { class: "form-description" }, "显示在页面标题和登录页面的系统名称", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(key_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[148] || (_cache[148] = createTextVNode(" 安全设置 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "最小密码长度" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.minPasswordLength,
                                  "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => systemSettings.minPasswordLength = $event),
                                  min: 4,
                                  max: 64
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "密码复杂度" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_select, {
                                  modelValue: systemSettings.passwordComplexity,
                                  "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => systemSettings.passwordComplexity = $event),
                                  style: { "width": "200px" }
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_option, {
                                      label: "低",
                                      value: "low"
                                    }),
                                    createVNode(_component_el_option, {
                                      label: "中",
                                      value: "medium"
                                    }),
                                    createVNode(_component_el_option, {
                                      label: "高",
                                      value: "high"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "登录锁定" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.enableLoginLock,
                                  "onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => systemSettings.enableLoginLock = $event),
                                  "active-text": "启用",
                                  "inactive-text": "关闭"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "最大失败次数" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.maxLoginAttempts,
                                  "onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => systemSettings.maxLoginAttempts = $event),
                                  min: 3,
                                  max: 20
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "锁定时长(分钟)" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.lockoutDuration,
                                  "onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => systemSettings.lockoutDuration = $event),
                                  min: 1,
                                  max: 1440
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "会话超时(分钟)" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.sessionTimeout,
                                  "onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => systemSettings.sessionTimeout = $event),
                                  min: 5,
                                  max: 1440
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "双因素认证" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.enableTwoFactor,
                                  "onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => systemSettings.enableTwoFactor = $event),
                                  "active-text": "启用",
                                  "inactive-text": "关闭"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "启用分享功能" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.sharingEnabled,
                                  "onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => systemSettings.sharingEnabled = $event),
                                  "active-text": "开启",
                                  "inactive-text": "关闭"
                                }, null, 8, ["modelValue"]),
                                _cache[149] || (_cache[149] = createBaseVNode("div", { class: "form-description" }, "关闭后：所有分享链接立即失效，历史链接永久不可用；再次开启后需要重新生成新链接", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(folder_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[150] || (_cache[150] = createTextVNode(" 存储设置 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "单用户存储上限(MB)" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.maxStoragePerUser,
                                  "onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => systemSettings.maxStoragePerUser = $event),
                                  min: 0,
                                  max: 1048576
                                }, null, 8, ["modelValue"]),
                                _cache[151] || (_cache[151] = createBaseVNode("div", { class: "form-description" }, "0 表示不限制", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(document_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[152] || (_cache[152] = createTextVNode(" 文档类型 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "允许的文档扩展名" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: systemSettings.allowedDocumentTypesCsv,
                                  "onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => systemSettings.allowedDocumentTypesCsv = $event),
                                  placeholder: "例如: pdf,docx,xlsx"
                                }, null, 8, ["modelValue"]),
                                _cache[153] || (_cache[153] = createBaseVNode("div", { class: "form-description" }, "多个扩展名用英文逗号分隔", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(user_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[154] || (_cache[154] = createTextVNode(" 用户管理 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "允许注册" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.allowRegistration,
                                  "onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => systemSettings.allowRegistration = $event),
                                  "active-text": "允许",
                                  "inactive-text": "禁止",
                                  "active-color": "#374151",
                                  "inactive-color": "#6b7280"
                                }, null, 8, ["modelValue"]),
                                _cache[155] || (_cache[155] = createBaseVNode("div", { class: "form-description" }, "是否允许新用户注册，关闭后只能由管理员创建用户", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "维护模式" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.maintenanceMode,
                                  "onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => systemSettings.maintenanceMode = $event),
                                  "active-text": "开启",
                                  "inactive-text": "关闭",
                                  "active-color": "#6b7280",
                                  "inactive-color": "#374151"
                                }, null, 8, ["modelValue"]),
                                _cache[156] || (_cache[156] = createBaseVNode("div", { class: "form-description" }, "开启后只有管理员可以访问系统，普通用户将看到维护页面", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(upload_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[157] || (_cache[157] = createTextVNode(" 文件上传 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "最大文件大小" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.maxFileSize,
                                  "onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => systemSettings.maxFileSize = $event),
                                  min: 1,
                                  max: 1e3,
                                  "controls-position": "right",
                                  style: { "width": "200px" }
                                }, null, 8, ["modelValue"]),
                                _cache[158] || (_cache[158] = createBaseVNode("span", { class: "form-unit" }, "MB", -1)),
                                _cache[159] || (_cache[159] = createBaseVNode("div", { class: "form-description" }, "单个文件上传的最大大小限制，建议不超过100MB", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "单次上传数量" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.maxUploadFiles,
                                  "onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => systemSettings.maxUploadFiles = $event),
                                  min: 1,
                                  max: 50,
                                  "controls-position": "right",
                                  style: { "width": "200px" }
                                }, null, 8, ["modelValue"]),
                                _cache[160] || (_cache[160] = createBaseVNode("span", { class: "form-unit" }, "个", -1)),
                                _cache[161] || (_cache[161] = createBaseVNode("div", { class: "form-description" }, "单次最多可以上传的文件数量", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "允许的图片类型" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_checkbox_group, {
                                  modelValue: systemSettings.allowedImageTypes,
                                  "onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => systemSettings.allowedImageTypes = $event)
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_checkbox, { label: "jpg" }, {
                                      default: withCtx(() => [..._cache[162] || (_cache[162] = [
                                        createTextVNode("JPG", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "jpeg" }, {
                                      default: withCtx(() => [..._cache[163] || (_cache[163] = [
                                        createTextVNode("JPEG", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "png" }, {
                                      default: withCtx(() => [..._cache[164] || (_cache[164] = [
                                        createTextVNode("PNG", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "gif" }, {
                                      default: withCtx(() => [..._cache[165] || (_cache[165] = [
                                        createTextVNode("GIF", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "webp" }, {
                                      default: withCtx(() => [..._cache[166] || (_cache[166] = [
                                        createTextVNode("WebP", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "svg" }, {
                                      default: withCtx(() => [..._cache[167] || (_cache[167] = [
                                        createTextVNode("SVG", -1)
                                      ])]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[168] || (_cache[168] = createBaseVNode("div", { class: "form-description" }, "选择允许上传的图片格式，至少选择一种格式", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "允许的视频类型" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_checkbox_group, {
                                  modelValue: systemSettings.allowedVideoTypes,
                                  "onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => systemSettings.allowedVideoTypes = $event)
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_checkbox, { label: "mp4" }, {
                                      default: withCtx(() => [..._cache[169] || (_cache[169] = [
                                        createTextVNode("MP4", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "webm" }, {
                                      default: withCtx(() => [..._cache[170] || (_cache[170] = [
                                        createTextVNode("WebM", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "mov" }, {
                                      default: withCtx(() => [..._cache[171] || (_cache[171] = [
                                        createTextVNode("MOV", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "avi" }, {
                                      default: withCtx(() => [..._cache[172] || (_cache[172] = [
                                        createTextVNode("AVI", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "mkv" }, {
                                      default: withCtx(() => [..._cache[173] || (_cache[173] = [
                                        createTextVNode("MKV", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "m4v" }, {
                                      default: withCtx(() => [..._cache[174] || (_cache[174] = [
                                        createTextVNode("M4V", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "flv" }, {
                                      default: withCtx(() => [..._cache[175] || (_cache[175] = [
                                        createTextVNode("FLV", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "wmv" }, {
                                      default: withCtx(() => [..._cache[176] || (_cache[176] = [
                                        createTextVNode("WMV", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "mpeg" }, {
                                      default: withCtx(() => [..._cache[177] || (_cache[177] = [
                                        createTextVNode("MPEG", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "mpg" }, {
                                      default: withCtx(() => [..._cache[178] || (_cache[178] = [
                                        createTextVNode("MPG", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "3gp" }, {
                                      default: withCtx(() => [..._cache[179] || (_cache[179] = [
                                        createTextVNode("3GP", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "ts" }, {
                                      default: withCtx(() => [..._cache[180] || (_cache[180] = [
                                        createTextVNode("TS", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "m2ts" }, {
                                      default: withCtx(() => [..._cache[181] || (_cache[181] = [
                                        createTextVNode("M2TS", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_checkbox, { label: "ogv" }, {
                                      default: withCtx(() => [..._cache[182] || (_cache[182] = [
                                        createTextVNode("OGV", -1)
                                      ])]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[183] || (_cache[183] = createBaseVNode("div", { class: "form-description" }, "选择允许上传的视频格式", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(tools_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[184] || (_cache[184] = createTextVNode(" 系统优化 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "缩略图尺寸" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.thumbnailSize,
                                  "onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => systemSettings.thumbnailSize = $event),
                                  min: 100,
                                  max: 800,
                                  "controls-position": "right",
                                  style: { "width": "200px" }
                                }, null, 8, ["modelValue"]),
                                _cache[185] || (_cache[185] = createBaseVNode("span", { class: "form-unit" }, "px", -1)),
                                _cache[186] || (_cache[186] = createBaseVNode("div", { class: "form-description" }, "生成缩略图的尺寸，影响加载速度和存储空间", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "自动清理日志" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.autoCleanLogs,
                                  "onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => systemSettings.autoCleanLogs = $event),
                                  "active-text": "开启",
                                  "inactive-text": "关闭"
                                }, null, 8, ["modelValue"]),
                                _cache[187] || (_cache[187] = createBaseVNode("div", { class: "form-description" }, "自动清理30天前的系统日志", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_divider, { "content-position": "left" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(brush_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[188] || (_cache[188] = createTextVNode(" 外观设置 ", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "主题模式" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_radio_group, {
                                  modelValue: systemSettings.themeMode,
                                  "onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => systemSettings.themeMode = $event)
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_radio_button, { label: "auto" }, {
                                      default: withCtx(() => [..._cache[189] || (_cache[189] = [
                                        createTextVNode("自动", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_radio_button, { label: "light" }, {
                                      default: withCtx(() => [..._cache[190] || (_cache[190] = [
                                        createTextVNode("浅色", -1)
                                      ])]),
                                      _: 1
                                    }),
                                    createVNode(_component_el_radio_button, { label: "dark" }, {
                                      default: withCtx(() => [..._cache[191] || (_cache[191] = [
                                        createTextVNode("深色", -1)
                                      ])]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[192] || (_cache[192] = createBaseVNode("div", { class: "form-description" }, "自动模式会根据系统设置自动切换主题", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "主色调" }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_79, [
                                  createVNode(_component_el_color_picker, {
                                    modelValue: systemSettings.primaryColor,
                                    "onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => systemSettings.primaryColor = $event),
                                    predefine: predefineColors,
                                    "show-alpha": "",
                                    size: "large"
                                  }, null, 8, ["modelValue"]),
                                  createBaseVNode("span", _hoisted_80, toDisplayString(systemSettings.primaryColor), 1)
                                ]),
                                _cache[193] || (_cache[193] = createBaseVNode("div", { class: "form-description" }, "系统的主要颜色，影响按钮、链接等元素", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "侧边栏宽度" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: systemSettings.sidebarWidth,
                                  "onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => systemSettings.sidebarWidth = $event),
                                  min: 180,
                                  max: 300,
                                  "controls-position": "right",
                                  style: { "width": "200px" }
                                }, null, 8, ["modelValue"]),
                                _cache[194] || (_cache[194] = createBaseVNode("span", { class: "form-unit" }, "px", -1)),
                                _cache[195] || (_cache[195] = createBaseVNode("div", { class: "form-description" }, "侧边栏的宽度，影响整体布局", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "页面动画" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: systemSettings.enableAnimation,
                                  "onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => systemSettings.enableAnimation = $event),
                                  "active-text": "开启",
                                  "inactive-text": "关闭",
                                  "active-color": "#374151",
                                  "inactive-color": "#6b7280"
                                }, null, 8, ["modelValue"]),
                                _cache[196] || (_cache[196] = createBaseVNode("div", { class: "form-description" }, "开启页面切换和交互动画效果", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "Logo地址" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: systemSettings.logoUrl,
                                  "onUpdate:modelValue": _cache[42] || (_cache[42] = ($event) => systemSettings.logoUrl = $event),
                                  placeholder: "请输入Logo图片URL",
                                  clearable: "",
                                  maxlength: "500",
                                  "show-word-limit": ""
                                }, {
                                  prefix: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(picture_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[197] || (_cache[197] = createBaseVNode("div", { class: "form-description" }, "自定义Logo图片地址，留空使用默认Logo", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "网站图标" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: systemSettings.faviconUrl,
                                  "onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => systemSettings.faviconUrl = $event),
                                  placeholder: "请输入网站图标URL",
                                  clearable: "",
                                  maxlength: "500",
                                  "show-word-limit": ""
                                }, {
                                  prefix: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(star_default))
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"]),
                                _cache[198] || (_cache[198] = createBaseVNode("div", { class: "form-description" }, "自定义网站图标(favicon)地址", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "自定义CSS" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: systemSettings.customCss,
                                  "onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => systemSettings.customCss = $event),
                                  type: "textarea",
                                  rows: 4,
                                  placeholder: "请输入自定义CSS代码",
                                  maxlength: "2000",
                                  "show-word-limit": ""
                                }, null, 8, ["modelValue"]),
                                _cache[199] || (_cache[199] = createBaseVNode("div", { class: "form-description" }, "添加自定义样式代码，支持CSS语法", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, null, {
                              default: withCtx(() => [
                                createVNode(_component_el_button, {
                                  type: "primary",
                                  onClick: saveSystemSettings,
                                  loading: savingSettings.value
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(setting_default))
                                      ]),
                                      _: 1
                                    }),
                                    _cache[200] || (_cache[200] = createTextVNode(" 保存设置 ", -1))
                                  ]),
                                  _: 1
                                }, 8, ["loading"]),
                                createVNode(_component_el_button, {
                                  onClick: fetchSystemSettings,
                                  loading: loadingSettings.value
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(refresh_default))
                                      ]),
                                      _: 1
                                    }),
                                    _cache[201] || (_cache[201] = createTextVNode(" 重置 ", -1))
                                  ]),
                                  _: 1
                                }, 8, ["loading"]),
                                createVNode(_component_el_button, {
                                  type: "warning",
                                  onClick: showSettingsPreview
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_icon, null, {
                                      default: withCtx(() => [
                                        createVNode(unref(view_default))
                                      ]),
                                      _: 1
                                    }),
                                    _cache[202] || (_cache[202] = createTextVNode(" 预览效果 ", -1))
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])) : createCommentVNode("", true),
                      activeSection.value === "moderation" ? (openBlock(), createElementBlock("div", _hoisted_81, [
                        _cache[207] || (_cache[207] = createBaseVNode("div", { class: "section-header" }, [
                          createBaseVNode("h3", null, "审核设置"),
                          createBaseVNode("p", null, "配置内容审核开关、提供商与阈值（实时生效）")
                        ], -1)),
                        createVNode(_component_el_form, {
                          model: moderationForm,
                          "label-width": "120px",
                          class: "moderation-form"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_form_item, { label: "启用审核" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: moderationForm.enable,
                                  "onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => moderationForm.enable = $event)
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "提供商" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_select, {
                                  modelValue: moderationForm.provider,
                                  "onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => moderationForm.provider = $event),
                                  placeholder: "选择提供商"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_option, {
                                      label: "SiliconFlow",
                                      value: "siliconflow"
                                    }),
                                    createVNode(_component_el_option, {
                                      label: "自研/通用接口",
                                      value: "custom"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "API URL" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: moderationForm.apiUrl,
                                  "onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => moderationForm.apiUrl = $event),
                                  placeholder: "https://..."
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "API Key" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: moderationForm.apiKey,
                                  "onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => moderationForm.apiKey = $event),
                                  placeholder: "密钥",
                                  "show-password": ""
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "模型名称" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: moderationForm.model,
                                  "onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => moderationForm.model = $event),
                                  placeholder: "例如 Pro/deepseek-ai/DeepSeek-V3.2-Exp"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "AI等待时长" }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_82, [
                                  createVNode(_component_el_input, {
                                    modelValue: moderationForm.httpTimeoutMs,
                                    "onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => moderationForm.httpTimeoutMs = $event),
                                    modelModifiers: { number: true },
                                    placeholder: "默认 20000 (20秒)"
                                  }, null, 8, ["modelValue"]),
                                  _cache[204] || (_cache[204] = createBaseVNode("span", { class: "strict-value" }, "ms", -1))
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "严格度" }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_83, [
                                  createVNode(_component_el_slider, {
                                    modelValue: moderationForm.strictness,
                                    "onUpdate:modelValue": _cache[51] || (_cache[51] = ($event) => moderationForm.strictness = $event),
                                    min: 0,
                                    max: 100
                                  }, null, 8, ["modelValue"]),
                                  createBaseVNode("span", _hoisted_84, toDisplayString(moderationForm.strictness), 1)
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "图片启发式" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_switch, {
                                  modelValue: moderationForm.imageHeuristic,
                                  "onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => moderationForm.imageHeuristic = $event)
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "最大图片大小" }, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_85, [
                                  createVNode(_component_el_input, {
                                    modelValue: maxImageSizeValue.value,
                                    "onUpdate:modelValue": _cache[53] || (_cache[53] = ($event) => maxImageSizeValue.value = $event),
                                    modelModifiers: { number: true },
                                    placeholder: "数值",
                                    style: { "flex": "1" }
                                  }, null, 8, ["modelValue"]),
                                  createVNode(_component_el_select, {
                                    modelValue: maxImageSizeUnit.value,
                                    "onUpdate:modelValue": _cache[54] || (_cache[54] = ($event) => maxImageSizeUnit.value = $event),
                                    style: { "width": "100px" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "MB",
                                        value: "MB"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "KB",
                                        value: "KB"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "B",
                                        value: "B"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue"])
                                ])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "OCR API URL" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: moderationForm.ocrApiUrl,
                                  "onUpdate:modelValue": _cache[55] || (_cache[55] = ($event) => moderationForm.ocrApiUrl = $event),
                                  placeholder: "可选：用于图片文字审核"
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, { label: "OCR API Key" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: moderationForm.ocrApiKey,
                                  "onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => moderationForm.ocrApiKey = $event),
                                  placeholder: "可选",
                                  "show-password": ""
                                }, null, 8, ["modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, null, {
                              default: withCtx(() => [
                                createBaseVNode("div", _hoisted_86, [
                                  createBaseVNode("div", _hoisted_87, [
                                    createVNode(_component_el_button, {
                                      type: "primary",
                                      loading: moderationSaving.value,
                                      onClick: saveModeration,
                                      style: { "width": "100%" }
                                    }, {
                                      default: withCtx(() => [..._cache[205] || (_cache[205] = [
                                        createTextVNode("保存", -1)
                                      ])]),
                                      _: 1
                                    }, 8, ["loading"])
                                  ]),
                                  createBaseVNode("div", _hoisted_88, [
                                    createVNode(_component_el_button, {
                                      loading: moderationLoading.value,
                                      onClick: loadModeration,
                                      style: { "width": "100%" }
                                    }, {
                                      default: withCtx(() => [..._cache[206] || (_cache[206] = [
                                        createTextVNode("重载", -1)
                                      ])]),
                                      _: 1
                                    }, 8, ["loading"])
                                  ])
                                ])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["model"])
                      ])) : createCommentVNode("", true)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          })) : createCommentVNode("", true),
          isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_89, [
            createVNode(_component_el_card, { class: "mobile-panel-card" }, {
              default: withCtx(() => [
                activeSection.value === "overview" ? (openBlock(), createElementBlock("div", _hoisted_90, [
                  _cache[214] || (_cache[214] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "系统概览"),
                    createBaseVNode("p", null, "系统整体运行状态和统计数据")
                  ], -1)),
                  createVNode(_component_el_row, { class: "stats-cards" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_col, { span: 24 }, {
                        default: withCtx(() => [
                          createBaseVNode("div", _hoisted_91, [
                            createBaseVNode("div", _hoisted_92, [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(user_filled_default))
                                ]),
                                _: 1
                              })
                            ]),
                            createBaseVNode("div", _hoisted_93, [
                              createBaseVNode("div", _hoisted_94, toDisplayString(systemStats.totalUsers), 1),
                              _cache[209] || (_cache[209] = createBaseVNode("div", { class: "stat-label" }, "总用户数", -1)),
                              createBaseVNode("div", _hoisted_95, [
                                createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                  default: withCtx(() => [
                                    createVNode(unref(arrow_up_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[208] || (_cache[208] = createBaseVNode("span", { class: "trend-text" }, "活跃用户", -1))
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_el_col, { span: 24 }, {
                        default: withCtx(() => [
                          createBaseVNode("div", _hoisted_96, [
                            createBaseVNode("div", _hoisted_97, [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(folder_default))
                                ]),
                                _: 1
                              })
                            ]),
                            createBaseVNode("div", _hoisted_98, [
                              createBaseVNode("div", _hoisted_99, toDisplayString(systemStats.totalFiles), 1),
                              _cache[211] || (_cache[211] = createBaseVNode("div", { class: "stat-label" }, "总文件数", -1)),
                              createBaseVNode("div", _hoisted_100, [
                                createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                  default: withCtx(() => [
                                    createVNode(unref(arrow_up_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[210] || (_cache[210] = createBaseVNode("span", { class: "trend-text" }, "存储文件", -1))
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_el_col, { span: 24 }, {
                        default: withCtx(() => [
                          createBaseVNode("div", _hoisted_101, [
                            createBaseVNode("div", _hoisted_102, [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(folder_opened_default))
                                ]),
                                _: 1
                              })
                            ]),
                            createBaseVNode("div", _hoisted_103, [
                              createBaseVNode("div", _hoisted_104, toDisplayString(unref(formatFileSize)(systemStats.totalStorage)), 1),
                              _cache[213] || (_cache[213] = createBaseVNode("div", { class: "stat-label" }, "总存储", -1)),
                              createBaseVNode("div", _hoisted_105, [
                                createVNode(_component_el_icon, { class: "trend-icon up" }, {
                                  default: withCtx(() => [
                                    createVNode(unref(arrow_up_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[212] || (_cache[212] = createBaseVNode("span", { class: "trend-text" }, "存储使用", -1))
                              ])
                            ])
                          ])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ])) : createCommentVNode("", true),
                activeSection.value === "users" ? (openBlock(), createElementBlock("div", _hoisted_106, [
                  _cache[228] || (_cache[228] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "用户管理"),
                    createBaseVNode("p", null, "管理系统用户和权限")
                  ], -1)),
                  createBaseVNode("div", _hoisted_107, [
                    createBaseVNode("div", _hoisted_108, [
                      createBaseVNode("div", _hoisted_109, [
                        createVNode(_component_el_icon, { class: "filter-icon" }, {
                          default: withCtx(() => [
                            createVNode(unref(user_default))
                          ]),
                          _: 1
                        }),
                        _cache[215] || (_cache[215] = createBaseVNode("span", null, "用户筛选", -1))
                      ]),
                      _cache[216] || (_cache[216] = createBaseVNode("div", { class: "filter-subtitle" }, "快速查找和管理系统用户", -1))
                    ]),
                    createVNode(_component_el_form, {
                      model: userFilter,
                      "label-position": "top",
                      class: "user-filter-form"
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_110, [
                          createVNode(_component_el_form_item, {
                            label: "用户搜索",
                            class: "search-item"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: userFilter.search,
                                "onUpdate:modelValue": _cache[57] || (_cache[57] = ($event) => userFilter.search = $event),
                                placeholder: "输入用户名或邮箱",
                                clearable: "",
                                onKeyup: withKeys(searchUsers, ["enter"]),
                                class: "search-input"
                              }, {
                                prefix: withCtx(() => [
                                  createVNode(_component_el_icon, { class: "search-prefix-icon" }, {
                                    default: withCtx(() => [
                                      createVNode(unref(search_default))
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
                        createBaseVNode("div", _hoisted_111, [
                          createVNode(_component_el_form_item, {
                            label: "用户角色",
                            class: "filter-item"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_select, {
                                modelValue: userFilter.role,
                                "onUpdate:modelValue": _cache[58] || (_cache[58] = ($event) => userFilter.role = $event),
                                placeholder: "选择用户角色",
                                clearable: "",
                                class: "filter-select"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_option, {
                                    label: "全部角色",
                                    value: ""
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "管理员",
                                    value: "admin"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "普通用户",
                                    value: "user"
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, {
                            label: "用户状态",
                            class: "filter-item"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_select, {
                                modelValue: userFilter.status,
                                "onUpdate:modelValue": _cache[59] || (_cache[59] = ($event) => userFilter.status = $event),
                                placeholder: "选择用户状态",
                                clearable: "",
                                class: "filter-select"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_option, {
                                    label: "全部状态",
                                    value: ""
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "正常用户",
                                    value: "active"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "禁用用户",
                                    value: "inactive"
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_112, [
                          createBaseVNode("div", _hoisted_113, [
                            createVNode(_component_el_button, {
                              type: "primary",
                              onClick: searchUsers,
                              loading: refreshing.value,
                              class: "user-action-btn primary-btn"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(search_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[217] || (_cache[217] = createBaseVNode("span", null, "搜索用户", -1))
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            createVNode(_component_el_button, {
                              onClick: resetUserFilter,
                              class: "user-action-btn secondary-btn"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(refresh_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[218] || (_cache[218] = createBaseVNode("span", null, "重置筛选", -1))
                              ]),
                              _: 1
                            })
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["model"])
                  ]),
                  createBaseVNode("div", _hoisted_114, [
                    isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_115, [
                      createVNode(_component_el_row, { gutter: 12 }, {
                        default: withCtx(() => [
                          createVNode(_component_el_col, { span: 12 }, {
                            default: withCtx(() => [
                              createVNode(_component_el_button, {
                                type: "primary",
                                onClick: _cache[60] || (_cache[60] = ($event) => showCreateUserDialog.value = true),
                                style: { "width": "100%" }
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(plus_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[219] || (_cache[219] = createTextVNode(" 创建用户 ", -1))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_col, { span: 12 }, {
                            default: withCtx(() => [
                              createVNode(_component_el_button, {
                                onClick: batchDeleteUsers,
                                disabled: selectedUsers.value.length === 0,
                                style: { "width": "100%" }
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(delete_default))
                                    ]),
                                    _: 1
                                  }),
                                  _cache[220] || (_cache[220] = createTextVNode(" 批量删除 ", -1))
                                ]),
                                _: 1
                              }, 8, ["disabled"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ])) : createCommentVNode("", true)
                  ]),
                  isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_116, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(users.value, (user) => {
                      return withDirectives((openBlock(), createElementBlock("div", {
                        key: user.id,
                        class: "user-card",
                        onClick: ($event) => handleUserCardClick(user, $event)
                      }, [
                        createBaseVNode("div", _hoisted_118, [
                          createBaseVNode("div", _hoisted_119, [
                            createVNode(_component_el_avatar, {
                              size: 40,
                              src: unref(getAvatarUrl)(user.avatar_url)
                            }, {
                              default: withCtx(() => {
                                var _a2;
                                return [
                                  createTextVNode(toDisplayString((_a2 = user.username) == null ? void 0 : _a2.charAt(0).toUpperCase()), 1)
                                ];
                              }),
                              _: 2
                            }, 1032, ["src"]),
                            createBaseVNode("div", _hoisted_120, [
                              createBaseVNode("div", _hoisted_121, toDisplayString(user.username || "未知用户"), 1),
                              createBaseVNode("div", _hoisted_122, toDisplayString(user.email || "未设置"), 1)
                            ])
                          ]),
                          createBaseVNode("div", _hoisted_123, [
                            createVNode(_component_el_tag, {
                              type: user.role === "admin" ? "danger" : "primary",
                              size: "small"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(user.role === "admin" ? "管理员" : "用户"), 1)
                              ]),
                              _: 2
                            }, 1032, ["type"]),
                            createVNode(_component_el_tag, {
                              type: getStatusTagType(user.status),
                              size: "small",
                              style: { "margin-top": "4px" }
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(getStatusText(user.status)), 1)
                              ]),
                              _: 2
                            }, 1032, ["type"])
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_124, [
                          createBaseVNode("div", _hoisted_125, [
                            _cache[221] || (_cache[221] = createBaseVNode("div", { class: "storage-label" }, "存储使用", -1)),
                            createBaseVNode("div", _hoisted_126, [
                              createVNode(_component_el_progress, {
                                percentage: Math.round((user.used_storage || 0) / (user.storage_limit || 1) * 100),
                                "stroke-width": 8,
                                "show-text": false,
                                color: getStorageProgressColor(user.used_storage, user.storage_limit)
                              }, null, 8, ["percentage", "color"]),
                              createBaseVNode("div", _hoisted_127, toDisplayString(unref(formatFileSize)(user.used_storage || 0)) + " / " + toDisplayString(unref(formatFileSize)(user.storage_limit || 0)), 1)
                            ])
                          ]),
                          createBaseVNode("div", _hoisted_128, [
                            _cache[222] || (_cache[222] = createBaseVNode("div", { class: "time-label" }, "注册时间", -1)),
                            createBaseVNode("div", _hoisted_129, toDisplayString(formatTimestamp(user.created_at)), 1)
                          ])
                        ]),
                        createBaseVNode("div", _hoisted_130, [
                          createVNode(_component_el_checkbox, {
                            "model-value": selectedUsers.value.includes(user),
                            onChange: (val) => handleUserSelectionChange(!!val, user)
                          }, {
                            default: withCtx(() => [..._cache[223] || (_cache[223] = [
                              createTextVNode(" 选择 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["model-value", "onChange"]),
                          createVNode(_component_el_dropdown, {
                            onCommand: (command) => handleUserAction(command, user),
                            trigger: "click",
                            "hide-on-click": true
                          }, {
                            dropdown: withCtx(() => [
                              createVNode(_component_el_dropdown_menu, null, {
                                default: withCtx(() => [
                                  createVNode(_component_el_dropdown_item, { command: "toggleRole" }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(user_default))
                                        ]),
                                        _: 1
                                      }),
                                      createTextVNode(" " + toDisplayString(user.role === "admin" ? "设为用户" : "设为管理员"), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createVNode(_component_el_dropdown_item, { command: "toggleStatus" }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(switch_default))
                                        ]),
                                        _: 1
                                      }),
                                      createTextVNode(" " + toDisplayString(user.status === "active" ? "禁用用户" : "启用用户"), 1)
                                    ]),
                                    _: 2
                                  }, 1024),
                                  createVNode(_component_el_dropdown_item, { command: "editStorage" }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(folder_opened_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[225] || (_cache[225] = createTextVNode(" 设置存储 ", -1))
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_el_dropdown_item, {
                                    command: "viewStats",
                                    divided: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(data_analysis_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[226] || (_cache[226] = createTextVNode(" 查看统计 ", -1))
                                    ]),
                                    _: 1
                                  }),
                                  createVNode(_component_el_dropdown_item, {
                                    command: "delete",
                                    divided: ""
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(delete_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[227] || (_cache[227] = createTextVNode(" 删除用户 ", -1))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 2
                              }, 1024)
                            ]),
                            default: withCtx(() => [
                              createVNode(_component_el_button, {
                                type: "primary",
                                size: "small",
                                onClick: _cache[61] || (_cache[61] = withModifiers(() => {
                                }, ["stop"]))
                              }, {
                                default: withCtx(() => [
                                  _cache[224] || (_cache[224] = createTextVNode(" 操作 ", -1)),
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(arrow_down_default))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              })
                            ]),
                            _: 2
                          }, 1032, ["onCommand"])
                        ])
                      ], 8, _hoisted_117)), [
                        [_directive_loading, refreshing.value]
                      ]);
                    }), 128)),
                    users.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_131, [
                      createVNode(_component_el_empty, { description: "暂无用户数据" })
                    ])) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true),
                activeSection.value === "logs" ? (openBlock(), createElementBlock("div", _hoisted_132, [
                  _cache[234] || (_cache[234] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "系统日志"),
                    createBaseVNode("p", null, "查看和管理系统运行日志")
                  ], -1)),
                  createBaseVNode("div", _hoisted_133, [
                    createBaseVNode("div", _hoisted_134, [
                      createBaseVNode("div", _hoisted_135, [
                        createVNode(_component_el_icon, { class: "filter-icon" }, {
                          default: withCtx(() => [
                            createVNode(unref(document_default))
                          ]),
                          _: 1
                        }),
                        _cache[229] || (_cache[229] = createBaseVNode("span", null, "日志筛选", -1))
                      ]),
                      _cache[230] || (_cache[230] = createBaseVNode("div", { class: "filter-subtitle" }, "快速查找和分析系统日志", -1))
                    ]),
                    createVNode(_component_el_form, {
                      model: logFilter,
                      "label-position": "top",
                      class: "log-filter-form"
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_136, [
                          createVNode(_component_el_form_item, {
                            label: "日志级别",
                            class: "level-item"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_select, {
                                modelValue: logFilter.level,
                                "onUpdate:modelValue": _cache[62] || (_cache[62] = ($event) => logFilter.level = $event),
                                placeholder: "选择日志级别",
                                clearable: "",
                                class: "level-select"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_option, {
                                    label: "全部级别",
                                    value: ""
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "错误日志",
                                    value: "error"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "警告日志",
                                    value: "warning"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "信息日志",
                                    value: "info"
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_137, [
                          createVNode(_component_el_form_item, {
                            label: "关键词搜索",
                            class: "search-item"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: logFilter.keyword,
                                "onUpdate:modelValue": _cache[63] || (_cache[63] = ($event) => logFilter.keyword = $event),
                                placeholder: "输入关键词搜索日志",
                                clearable: "",
                                onKeyup: withKeys(searchLogs, ["enter"]),
                                class: "search-input"
                              }, {
                                prefix: withCtx(() => [
                                  createVNode(_component_el_icon, { class: "search-prefix-icon" }, {
                                    default: withCtx(() => [
                                      createVNode(unref(search_default))
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
                        createBaseVNode("div", _hoisted_138, [
                          createBaseVNode("div", _hoisted_139, [
                            createVNode(_component_el_button, {
                              type: "primary",
                              onClick: searchLogs,
                              loading: refreshing.value,
                              class: "log-action-btn primary-btn"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(search_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[231] || (_cache[231] = createBaseVNode("span", null, "搜索日志", -1))
                              ]),
                              _: 1
                            }, 8, ["loading"]),
                            createVNode(_component_el_button, {
                              onClick: exportLogs,
                              class: "log-action-btn secondary-btn"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(download_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[232] || (_cache[232] = createBaseVNode("span", null, "导出日志", -1))
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_button, {
                              onClick: clearLogs,
                              loading: refreshing.value,
                              class: "log-action-btn danger-btn"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(delete_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[233] || (_cache[233] = createBaseVNode("span", null, "清空日志", -1))
                              ]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ])
                      ]),
                      _: 1
                    }, 8, ["model"])
                  ]),
                  createBaseVNode("div", _hoisted_140, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(filteredLogs.value, (log) => {
                      return withDirectives((openBlock(), createElementBlock("div", {
                        key: log.id,
                        class: "log-card"
                      }, [
                        createBaseVNode("div", _hoisted_141, [
                          createBaseVNode("div", _hoisted_142, toDisplayString(formatTimestamp(log.timestamp)), 1),
                          createVNode(_component_el_tag, {
                            type: getLevelType(log.level),
                            size: "small"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(getLevelText(log.level)), 1)
                            ]),
                            _: 2
                          }, 1032, ["type"])
                        ]),
                        createBaseVNode("div", _hoisted_143, [
                          createBaseVNode("div", _hoisted_144, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(document_default))
                              ]),
                              _: 1
                            }),
                            createBaseVNode("span", null, toDisplayString(log.source || "系统"), 1)
                          ]),
                          createBaseVNode("div", _hoisted_145, toDisplayString(log.message || "无消息内容"), 1)
                        ])
                      ])), [
                        [_directive_loading, refreshing.value]
                      ]);
                    }), 128)),
                    filteredLogs.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_146, [
                      createVNode(_component_el_empty, { description: "暂无日志数据" })
                    ])) : createCommentVNode("", true)
                  ])
                ])) : createCommentVNode("", true),
                activeSection.value === "storage" ? (openBlock(), createElementBlock("div", _hoisted_147, [
                  _cache[244] || (_cache[244] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "存储管理"),
                    createBaseVNode("p", null, "管理系统存储空间和使用情况")
                  ], -1)),
                  createBaseVNode("div", _hoisted_148, [
                    createBaseVNode("div", _hoisted_149, [
                      createBaseVNode("div", _hoisted_150, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(data_board_default))
                          ]),
                          _: 1
                        })
                      ]),
                      createBaseVNode("div", _hoisted_151, [
                        createBaseVNode("div", _hoisted_152, toDisplayString(unref(formatFileSize)(storageStats.totalStorage)), 1),
                        _cache[235] || (_cache[235] = createBaseVNode("div", { class: "stat-label" }, "总存储空间", -1))
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_153, [
                      createBaseVNode("div", _hoisted_154, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(folder_default))
                          ]),
                          _: 1
                        })
                      ]),
                      createBaseVNode("div", _hoisted_155, [
                        createBaseVNode("div", _hoisted_156, toDisplayString(unref(formatFileSize)(storageStats.usedStorage)), 1),
                        _cache[236] || (_cache[236] = createBaseVNode("div", { class: "stat-label" }, "已使用空间", -1))
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_157, [
                      createBaseVNode("div", _hoisted_158, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(circle_check_default))
                          ]),
                          _: 1
                        })
                      ]),
                      createBaseVNode("div", _hoisted_159, [
                        createBaseVNode("div", _hoisted_160, toDisplayString(systemStats.totalMotion || 0), 1),
                        _cache[237] || (_cache[237] = createBaseVNode("div", { class: "stat-label" }, "动图/实况", -1))
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_161, [
                      createBaseVNode("div", _hoisted_162, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(circle_check_default))
                          ]),
                          _: 1
                        })
                      ]),
                      createBaseVNode("div", _hoisted_163, [
                        createBaseVNode("div", _hoisted_164, toDisplayString(unref(formatFileSize)(storageStats.availableStorage)), 1),
                        _cache[238] || (_cache[238] = createBaseVNode("div", { class: "stat-label" }, "可用空间", -1))
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_165, [
                    createBaseVNode("div", _hoisted_166, [
                      _cache[240] || (_cache[240] = createBaseVNode("h4", null, "存储使用率", -1)),
                      createVNode(_component_el_button, {
                        onClick: refreshStorageStats,
                        loading: refreshing.value,
                        size: "small"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(refresh_default))
                            ]),
                            _: 1
                          }),
                          _cache[239] || (_cache[239] = createTextVNode(" 刷新 ", -1))
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ]),
                    createBaseVNode("div", _hoisted_167, [
                      createVNode(_component_el_progress, {
                        percentage: storageUsagePercentage.value,
                        "stroke-width": 16,
                        color: getStorageUsageColor(storageUsagePercentage.value),
                        "show-text": true,
                        "text-inside": ""
                      }, null, 8, ["percentage", "color"]),
                      createBaseVNode("div", _hoisted_168, [
                        createBaseVNode("span", _hoisted_169, " 已使用 " + toDisplayString(unref(formatFileSize)(storageStats.usedStorage)) + " / " + toDisplayString(unref(formatFileSize)(storageStats.totalStorage)), 1)
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_170, [
                    createVNode(_component_el_row, { gutter: 12 }, {
                      default: withCtx(() => [
                        createVNode(_component_el_col, { span: 12 }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              type: "primary",
                              onClick: _cache[64] || (_cache[64] = ($event) => showCleanupDialog.value = true),
                              style: { "width": "100%" }
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(delete_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[241] || (_cache[241] = createTextVNode(" 清理存储 ", -1))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_col, { span: 12 }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              onClick: showStorageAnalysis,
                              style: { "width": "100%" }
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(data_analysis_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[242] || (_cache[242] = createTextVNode(" 存储分析 ", -1))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_row, {
                      gutter: 12,
                      style: { "margin-top": "12px" }
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_col, { span: 24 }, {
                          default: withCtx(() => [
                            createVNode(_component_el_button, {
                              onClick: exportStorageReport,
                              style: { "width": "100%" }
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(download_default))
                                  ]),
                                  _: 1
                                }),
                                _cache[243] || (_cache[243] = createTextVNode(" 导出报告 ", -1))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ])
                ])) : createCommentVNode("", true),
                activeSection.value === "settings" ? (openBlock(), createElementBlock("div", _hoisted_171, [
                  _cache[263] || (_cache[263] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "系统设置"),
                    createBaseVNode("p", null, "配置系统参数和功能")
                  ], -1)),
                  createBaseVNode("div", _hoisted_172, [
                    createVNode(_component_el_form, {
                      "label-position": "top",
                      class: "system-settings-form"
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_173, [
                          createBaseVNode("div", _hoisted_174, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(setting_default))
                              ]),
                              _: 1
                            }),
                            _cache[245] || (_cache[245] = createBaseVNode("span", null, "基本设置", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "系统名称" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: systemSettings.systemName,
                                "onUpdate:modelValue": _cache[65] || (_cache[65] = ($event) => systemSettings.systemName = $event),
                                placeholder: "请输入系统名称",
                                clearable: "",
                                maxlength: "50",
                                "show-word-limit": ""
                              }, {
                                prefix: withCtx(() => [
                                  createVNode(_component_el_icon, null, {
                                    default: withCtx(() => [
                                      createVNode(unref(setting_default))
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"]),
                              _cache[246] || (_cache[246] = createBaseVNode("div", { class: "form-description" }, "显示在页面标题和登录页面的系统名称", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_175, [
                          createBaseVNode("div", _hoisted_176, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(user_default))
                              ]),
                              _: 1
                            }),
                            _cache[247] || (_cache[247] = createBaseVNode("span", null, "用户管理", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "允许注册" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_switch, {
                                modelValue: systemSettings.allowRegistration,
                                "onUpdate:modelValue": _cache[66] || (_cache[66] = ($event) => systemSettings.allowRegistration = $event),
                                "active-text": "允许",
                                "inactive-text": "禁止",
                                "active-color": "#374151",
                                "inactive-color": "#6b7280"
                              }, null, 8, ["modelValue"]),
                              _cache[248] || (_cache[248] = createBaseVNode("div", { class: "form-description" }, "是否允许新用户注册，关闭后只能由管理员创建用户", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "维护模式" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_switch, {
                                modelValue: systemSettings.maintenanceMode,
                                "onUpdate:modelValue": _cache[67] || (_cache[67] = ($event) => systemSettings.maintenanceMode = $event),
                                "active-text": "开启",
                                "inactive-text": "关闭",
                                "active-color": "#6b7280",
                                "inactive-color": "#374151"
                              }, null, 8, ["modelValue"]),
                              _cache[249] || (_cache[249] = createBaseVNode("div", { class: "form-description" }, "开启后只有管理员可以访问系统，普通用户将看到维护页面", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_177, [
                          createBaseVNode("div", _hoisted_178, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(upload_default))
                              ]),
                              _: 1
                            }),
                            _cache[250] || (_cache[250] = createBaseVNode("span", null, "文件上传", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "最大文件大小" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input_number, {
                                modelValue: systemSettings.maxFileSize,
                                "onUpdate:modelValue": _cache[68] || (_cache[68] = ($event) => systemSettings.maxFileSize = $event),
                                min: 1,
                                max: 1e3,
                                "controls-position": "right",
                                style: { "width": "100%" }
                              }, null, 8, ["modelValue"]),
                              _cache[251] || (_cache[251] = createBaseVNode("span", { class: "form-unit" }, "MB", -1)),
                              _cache[252] || (_cache[252] = createBaseVNode("div", { class: "form-description" }, "单个文件上传的最大大小限制，建议不超过100MB", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "单次上传数量" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input_number, {
                                modelValue: systemSettings.maxUploadFiles,
                                "onUpdate:modelValue": _cache[69] || (_cache[69] = ($event) => systemSettings.maxUploadFiles = $event),
                                min: 1,
                                max: 50,
                                "controls-position": "right",
                                style: { "width": "100%" }
                              }, null, 8, ["modelValue"]),
                              _cache[253] || (_cache[253] = createBaseVNode("span", { class: "form-unit" }, "个", -1)),
                              _cache[254] || (_cache[254] = createBaseVNode("div", { class: "form-description" }, "单次最多可以上传的文件数量", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_179, [
                          createBaseVNode("div", _hoisted_180, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(brush_default))
                              ]),
                              _: 1
                            }),
                            _cache[255] || (_cache[255] = createBaseVNode("span", null, "外观设置", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "主题模式" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_radio_group, {
                                modelValue: systemSettings.themeMode,
                                "onUpdate:modelValue": _cache[70] || (_cache[70] = ($event) => systemSettings.themeMode = $event),
                                style: { "width": "100%" }
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_radio_button, {
                                    label: "auto",
                                    style: { "flex": "1" }
                                  }, {
                                    default: withCtx(() => [..._cache[256] || (_cache[256] = [
                                      createTextVNode("自动", -1)
                                    ])]),
                                    _: 1
                                  }),
                                  createVNode(_component_el_radio_button, {
                                    label: "light",
                                    style: { "flex": "1" }
                                  }, {
                                    default: withCtx(() => [..._cache[257] || (_cache[257] = [
                                      createTextVNode("浅色", -1)
                                    ])]),
                                    _: 1
                                  }),
                                  createVNode(_component_el_radio_button, {
                                    label: "dark",
                                    style: { "flex": "1" }
                                  }, {
                                    default: withCtx(() => [..._cache[258] || (_cache[258] = [
                                      createTextVNode("深色", -1)
                                    ])]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"]),
                              _cache[259] || (_cache[259] = createBaseVNode("div", { class: "form-description" }, "自动模式会根据系统设置自动切换主题", -1))
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "主色调" }, {
                            default: withCtx(() => [
                              createBaseVNode("div", _hoisted_181, [
                                createVNode(_component_el_color_picker, {
                                  modelValue: systemSettings.primaryColor,
                                  "onUpdate:modelValue": _cache[71] || (_cache[71] = ($event) => systemSettings.primaryColor = $event),
                                  predefine: predefineColors,
                                  "show-alpha": "",
                                  size: "large"
                                }, null, 8, ["modelValue"]),
                                createBaseVNode("span", _hoisted_182, toDisplayString(systemSettings.primaryColor), 1)
                              ]),
                              _cache[260] || (_cache[260] = createBaseVNode("div", { class: "form-description" }, "系统的主要颜色，影响按钮、链接等元素", -1))
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_183, [
                          createVNode(_component_el_row, { gutter: 12 }, {
                            default: withCtx(() => [
                              createVNode(_component_el_col, { span: 12 }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    type: "primary",
                                    onClick: saveSystemSettings,
                                    loading: savingSettings.value,
                                    style: { "width": "100%" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(setting_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[261] || (_cache[261] = createTextVNode(" 保存设置 ", -1))
                                    ]),
                                    _: 1
                                  }, 8, ["loading"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_col, { span: 12 }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    onClick: fetchSystemSettings,
                                    loading: loadingSettings.value,
                                    style: { "width": "100%" }
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_icon, null, {
                                        default: withCtx(() => [
                                          createVNode(unref(refresh_default))
                                        ]),
                                        _: 1
                                      }),
                                      _cache[262] || (_cache[262] = createTextVNode(" 重置 ", -1))
                                    ]),
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
                  ])
                ])) : createCommentVNode("", true),
                activeSection.value === "moderation" ? (openBlock(), createElementBlock("div", _hoisted_184, [
                  _cache[269] || (_cache[269] = createBaseVNode("div", { class: "section-header" }, [
                    createBaseVNode("h3", null, "审核设置"),
                    createBaseVNode("p", null, "配置内容审核（移动端）")
                  ], -1)),
                  createBaseVNode("div", _hoisted_185, [
                    createVNode(_component_el_form, {
                      "label-position": "top",
                      class: "system-settings-form"
                    }, {
                      default: withCtx(() => [
                        createBaseVNode("div", _hoisted_186, [
                          createBaseVNode("div", _hoisted_187, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(circle_check_default))
                              ]),
                              _: 1
                            }),
                            _cache[264] || (_cache[264] = createBaseVNode("span", null, "基础", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "启用审核" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_switch, {
                                modelValue: moderationForm.enable,
                                "onUpdate:modelValue": _cache[72] || (_cache[72] = ($event) => moderationForm.enable = $event)
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "提供商" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_select, {
                                modelValue: moderationForm.provider,
                                "onUpdate:modelValue": _cache[73] || (_cache[73] = ($event) => moderationForm.provider = $event),
                                placeholder: "选择提供商"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_option, {
                                    label: "SiliconFlow",
                                    value: "siliconflow"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "自研/通用接口",
                                    value: "custom"
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "API URL" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.apiUrl,
                                "onUpdate:modelValue": _cache[74] || (_cache[74] = ($event) => moderationForm.apiUrl = $event),
                                placeholder: "https://..."
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "API Key" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.apiKey,
                                "onUpdate:modelValue": _cache[75] || (_cache[75] = ($event) => moderationForm.apiKey = $event),
                                placeholder: "密钥",
                                "show-password": ""
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "模型名称" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.model,
                                "onUpdate:modelValue": _cache[76] || (_cache[76] = ($event) => moderationForm.model = $event),
                                placeholder: "例如 Pro/deepseek-ai/DeepSeek-V3.2-Exp"
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_188, [
                          createBaseVNode("div", _hoisted_189, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(tools_default))
                              ]),
                              _: 1
                            }),
                            _cache[265] || (_cache[265] = createBaseVNode("span", null, "策略", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "严格度" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_slider, {
                                modelValue: moderationForm.strictness,
                                "onUpdate:modelValue": _cache[77] || (_cache[77] = ($event) => moderationForm.strictness = $event),
                                min: 0,
                                max: 100
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "图片启发式" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_switch, {
                                modelValue: moderationForm.imageHeuristic,
                                "onUpdate:modelValue": _cache[78] || (_cache[78] = ($event) => moderationForm.imageHeuristic = $event)
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "最大图片字节" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.maxImageBytes,
                                "onUpdate:modelValue": _cache[79] || (_cache[79] = ($event) => moderationForm.maxImageBytes = $event),
                                modelModifiers: { number: true },
                                placeholder: "默认 524288 (512KB)"
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_190, [
                          createBaseVNode("div", _hoisted_191, [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(key_default))
                              ]),
                              _: 1
                            }),
                            _cache[266] || (_cache[266] = createBaseVNode("span", null, "OCR", -1))
                          ]),
                          createVNode(_component_el_form_item, { label: "OCR API URL" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.ocrApiUrl,
                                "onUpdate:modelValue": _cache[80] || (_cache[80] = ($event) => moderationForm.ocrApiUrl = $event),
                                placeholder: "可选：用于图片文字审核"
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, { label: "OCR API Key" }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: moderationForm.ocrApiKey,
                                "onUpdate:modelValue": _cache[81] || (_cache[81] = ($event) => moderationForm.ocrApiKey = $event),
                                placeholder: "可选",
                                "show-password": ""
                              }, null, 8, ["modelValue"])
                            ]),
                            _: 1
                          })
                        ]),
                        createBaseVNode("div", _hoisted_192, [
                          createBaseVNode("div", _hoisted_193, [
                            createVNode(_component_el_button, {
                              type: "primary",
                              loading: moderationSaving.value,
                              onClick: saveModeration,
                              style: { "width": "100%" }
                            }, {
                              default: withCtx(() => [..._cache[267] || (_cache[267] = [
                                createTextVNode("保存", -1)
                              ])]),
                              _: 1
                            }, 8, ["loading"])
                          ]),
                          createBaseVNode("div", _hoisted_194, [
                            createVNode(_component_el_button, {
                              loading: moderationLoading.value,
                              onClick: loadModeration,
                              style: { "width": "100%" }
                            }, {
                              default: withCtx(() => [..._cache[268] || (_cache[268] = [
                                createTextVNode("重载", -1)
                              ])]),
                              _: 1
                            }, 8, ["loading"])
                          ])
                        ])
                      ]),
                      _: 1
                    })
                  ])
                ])) : createCommentVNode("", true)
              ]),
              _: 1
            })
          ])) : createCommentVNode("", true)
        ]),
        createVNode(_component_el_dialog, {
          modelValue: showCreateUserDialog.value,
          "onUpdate:modelValue": _cache[87] || (_cache[87] = ($event) => showCreateUserDialog.value = $event),
          title: "创建用户",
          width: "500px"
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[86] || (_cache[86] = ($event) => showCreateUserDialog.value = false)
            }, {
              default: withCtx(() => [..._cache[270] || (_cache[270] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: createUser,
              loading: creatingUser.value
            }, {
              default: withCtx(() => [..._cache[271] || (_cache[271] = [
                createTextVNode("创建", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, {
              model: newUser,
              rules: userRules,
              ref_key: "userFormRef",
              ref: userFormRef,
              "label-width": "100px"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, {
                  label: "用户名",
                  prop: "username"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: newUser.username,
                      "onUpdate:modelValue": _cache[82] || (_cache[82] = ($event) => newUser.username = $event),
                      placeholder: "请输入用户名"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "邮箱",
                  prop: "email"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: newUser.email,
                      "onUpdate:modelValue": _cache[83] || (_cache[83] = ($event) => newUser.email = $event),
                      placeholder: "请输入邮箱"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "密码",
                  prop: "password"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: newUser.password,
                      "onUpdate:modelValue": _cache[84] || (_cache[84] = ($event) => newUser.password = $event),
                      type: "password",
                      placeholder: "请输入密码"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "角色",
                  prop: "role"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: newUser.role,
                      "onUpdate:modelValue": _cache[85] || (_cache[85] = ($event) => newUser.role = $event),
                      placeholder: "选择角色"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_option, {
                          label: "普通用户",
                          value: "user"
                        }),
                        createVNode(_component_el_option, {
                          label: "管理员",
                          value: "admin"
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
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: showUserStatsDialog.value,
          "onUpdate:modelValue": _cache[90] || (_cache[90] = ($event) => showUserStatsDialog.value = $event),
          title: `用户统计 - ${((_a = selectedUserStats.value) == null ? void 0 : _a.username) || ""}`,
          width: isMobile.value ? "92%" : "640px",
          "close-on-click-modal": true,
          class: normalizeClass({ "mobile-dialog": isMobile.value, "grayscale-dialog": true }),
          onClose: closeUserStatsDialog
        }, {
          footer: withCtx(() => [
            createBaseVNode("div", _hoisted_263, [
              createVNode(_component_el_button, { onClick: closeUserStatsDialog }, {
                default: withCtx(() => [..._cache[300] || (_cache[300] = [
                  createTextVNode("关闭", -1)
                ])]),
                _: 1
              })
            ])
          ]),
          default: withCtx(() => {
            var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
            return [
              withDirectives((openBlock(), createElementBlock("div", _hoisted_195, [
                userStats.value ? (openBlock(), createElementBlock("div", _hoisted_196, [
                  isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_197, [
                    createBaseVNode("div", _hoisted_198, [
                      createVNode(_component_el_avatar, {
                        size: 60,
                        src: unref(getAvatarUrl)((_a2 = selectedUserStats.value) == null ? void 0 : _a2.avatar_url)
                      }, {
                        default: withCtx(() => {
                          var _a3, _b2;
                          return [
                            createTextVNode(toDisplayString((_b2 = (_a3 = selectedUserStats.value) == null ? void 0 : _a3.username) == null ? void 0 : _b2.charAt(0).toUpperCase()), 1)
                          ];
                        }),
                        _: 1
                      }, 8, ["src"]),
                      createBaseVNode("div", _hoisted_199, [
                        createBaseVNode("h3", null, toDisplayString((_b = selectedUserStats.value) == null ? void 0 : _b.username), 1),
                        createBaseVNode("p", null, toDisplayString((_c = selectedUserStats.value) == null ? void 0 : _c.email), 1),
                        createBaseVNode("div", _hoisted_200, [
                          createVNode(_component_el_tag, {
                            type: ((_d = selectedUserStats.value) == null ? void 0 : _d.role) === "admin" ? "danger" : "primary",
                            size: "small"
                          }, {
                            default: withCtx(() => {
                              var _a3;
                              return [
                                createTextVNode(toDisplayString(((_a3 = selectedUserStats.value) == null ? void 0 : _a3.role) === "admin" ? "管理员" : "用户"), 1)
                              ];
                            }),
                            _: 1
                          }, 8, ["type"]),
                          createVNode(_component_el_tag, {
                            type: getStatusTagType(((_e = selectedUserStats.value) == null ? void 0 : _e.status) || ""),
                            size: "small"
                          }, {
                            default: withCtx(() => {
                              var _a3;
                              return [
                                createTextVNode(toDisplayString(getStatusText(((_a3 = selectedUserStats.value) == null ? void 0 : _a3.status) || "")), 1)
                              ];
                            }),
                            _: 1
                          }, 8, ["type"])
                        ])
                      ])
                    ])
                  ])) : createCommentVNode("", true),
                  !isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_201, [
                    _cache[281] || (_cache[281] = createBaseVNode("h4", null, "基本信息", -1)),
                    createBaseVNode("div", _hoisted_202, [
                      _cache[272] || (_cache[272] = createBaseVNode("span", { class: "label" }, "用户名：", -1)),
                      createBaseVNode("span", _hoisted_203, toDisplayString((_f = selectedUserStats.value) == null ? void 0 : _f.username), 1)
                    ]),
                    createBaseVNode("div", _hoisted_204, [
                      _cache[273] || (_cache[273] = createBaseVNode("span", { class: "label" }, "用户ID：", -1)),
                      createBaseVNode("span", _hoisted_205, toDisplayString((_g = selectedUserStats.value) == null ? void 0 : _g.id), 1)
                    ]),
                    createBaseVNode("div", _hoisted_206, [
                      _cache[274] || (_cache[274] = createBaseVNode("span", { class: "label" }, "邮箱：", -1)),
                      createBaseVNode("span", _hoisted_207, toDisplayString((_h = selectedUserStats.value) == null ? void 0 : _h.email), 1)
                    ]),
                    createBaseVNode("div", _hoisted_208, [
                      createBaseVNode("div", _hoisted_209, [
                        _cache[276] || (_cache[276] = createBaseVNode("span", { class: "label" }, "密码：", -1)),
                        createBaseVNode("div", _hoisted_210, [
                          createBaseVNode("span", _hoisted_211, toDisplayString(showPassword.value ? userStats.value.password || "未设置" : "******"), 1),
                          createVNode(_component_el_button, {
                            type: "primary",
                            size: "small",
                            onClick: resetSelectedUserPassword,
                            class: "password-toggle-btn"
                          }, {
                            default: withCtx(() => [..._cache[275] || (_cache[275] = [
                              createTextVNode(" 重置密码 ", -1)
                            ])]),
                            _: 1
                          })
                        ])
                      ]),
                      passwordVerificationSent.value && !passwordVerificationExpired.value ? (openBlock(), createElementBlock("div", _hoisted_212, [
                        createBaseVNode("div", _hoisted_213, [
                          createVNode(_component_el_input, {
                            modelValue: passwordVerificationCode.value,
                            "onUpdate:modelValue": _cache[88] || (_cache[88] = ($event) => passwordVerificationCode.value = $event),
                            placeholder: "请输入验证码",
                            size: "small",
                            maxlength: "6",
                            class: "verification-code-input"
                          }, null, 8, ["modelValue"]),
                          createVNode(_component_el_button, {
                            type: "success",
                            size: "small",
                            onClick: verifyPasswordCode,
                            disabled: passwordVerificationCode.value.length !== 6,
                            class: "verify-btn-desktop"
                          }, {
                            default: withCtx(() => [..._cache[277] || (_cache[277] = [
                              createTextVNode(" 验证 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["disabled"]),
                          createVNode(_component_el_button, {
                            type: "primary",
                            size: "small",
                            onClick: sendPasswordVerificationCode,
                            loading: sendingVerificationCode.value,
                            disabled: passwordVerificationCooldown.value > 0,
                            class: "send-code-btn-desktop"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(passwordVerificationCooldown.value > 0 ? `${passwordVerificationCooldown.value}s` : "发送验证码"), 1)
                            ]),
                            _: 1
                          }, 8, ["loading", "disabled"])
                        ]),
                        createBaseVNode("div", _hoisted_214, [
                          createBaseVNode("span", _hoisted_215, "验证码有效期：" + toDisplayString(getVerificationTimeLeft()), 1)
                        ])
                      ])) : createCommentVNode("", true)
                    ]),
                    createBaseVNode("div", _hoisted_216, [
                      _cache[278] || (_cache[278] = createBaseVNode("span", { class: "label" }, "角色：", -1)),
                      createBaseVNode("span", _hoisted_217, toDisplayString(((_i = selectedUserStats.value) == null ? void 0 : _i.role) === "admin" ? "管理员" : "用户"), 1)
                    ]),
                    createBaseVNode("div", _hoisted_218, [
                      _cache[279] || (_cache[279] = createBaseVNode("span", { class: "label" }, "状态：", -1)),
                      createBaseVNode("span", _hoisted_219, toDisplayString(getStatusText(((_j = selectedUserStats.value) == null ? void 0 : _j.status) || "")), 1)
                    ]),
                    createBaseVNode("div", _hoisted_220, [
                      _cache[280] || (_cache[280] = createBaseVNode("span", { class: "label" }, "注册时间：", -1)),
                      createBaseVNode("span", _hoisted_221, toDisplayString(((_k = selectedUserStats.value) == null ? void 0 : _k.created_at) ? new Date(selectedUserStats.value.created_at).toLocaleString() : "未知"), 1)
                    ])
                  ])) : createCommentVNode("", true),
                  isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_222, [
                    createBaseVNode("div", _hoisted_223, [
                      createBaseVNode("div", _hoisted_224, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(key_default))
                          ]),
                          _: 1
                        }),
                        _cache[282] || (_cache[282] = createBaseVNode("span", null, "账户信息", -1))
                      ]),
                      createBaseVNode("div", _hoisted_225, [
                        createBaseVNode("div", _hoisted_226, [
                          _cache[283] || (_cache[283] = createBaseVNode("span", { class: "info-label" }, "用户名", -1)),
                          createBaseVNode("span", _hoisted_227, toDisplayString((_l = selectedUserStats.value) == null ? void 0 : _l.username), 1)
                        ]),
                        createBaseVNode("div", _hoisted_228, [
                          _cache[284] || (_cache[284] = createBaseVNode("span", { class: "info-label" }, "邮箱", -1)),
                          createBaseVNode("span", _hoisted_229, toDisplayString((_m = selectedUserStats.value) == null ? void 0 : _m.email), 1)
                        ]),
                        createBaseVNode("div", _hoisted_230, [
                          _cache[286] || (_cache[286] = createBaseVNode("span", { class: "info-label" }, "密码", -1)),
                          createBaseVNode("div", _hoisted_231, [
                            createBaseVNode("span", _hoisted_232, toDisplayString(showPassword.value ? userStats.value.password || "未设置" : "******"), 1),
                            createVNode(_component_el_button, {
                              type: "primary",
                              size: "small",
                              onClick: resetSelectedUserPassword,
                              class: "password-toggle-btn"
                            }, {
                              default: withCtx(() => [..._cache[285] || (_cache[285] = [
                                createTextVNode(" 重置密码 ", -1)
                              ])]),
                              _: 1
                            })
                          ])
                        ]),
                        passwordVerificationSent.value && !passwordVerificationExpired.value ? (openBlock(), createElementBlock("div", _hoisted_233, [
                          createBaseVNode("div", _hoisted_234, [
                            createVNode(_component_el_input, {
                              modelValue: passwordVerificationCode.value,
                              "onUpdate:modelValue": _cache[89] || (_cache[89] = ($event) => passwordVerificationCode.value = $event),
                              placeholder: "请输入验证码",
                              size: "small",
                              maxlength: "6"
                            }, null, 8, ["modelValue"])
                          ]),
                          createBaseVNode("div", _hoisted_235, [
                            createVNode(_component_el_button, {
                              type: "success",
                              size: "small",
                              onClick: verifyPasswordCode,
                              disabled: passwordVerificationCode.value.length !== 6,
                              class: "verify-btn"
                            }, {
                              default: withCtx(() => [..._cache[287] || (_cache[287] = [
                                createTextVNode(" 验证 ", -1)
                              ])]),
                              _: 1
                            }, 8, ["disabled"]),
                            createVNode(_component_el_button, {
                              type: "primary",
                              size: "small",
                              onClick: sendPasswordVerificationCode,
                              loading: sendingVerificationCode.value,
                              disabled: passwordVerificationCooldown.value > 0,
                              class: "send-code-btn"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(passwordVerificationCooldown.value > 0 ? `${passwordVerificationCooldown.value}s` : "发送验证码"), 1)
                              ]),
                              _: 1
                            }, 8, ["loading", "disabled"])
                          ]),
                          createBaseVNode("div", _hoisted_236, [
                            createBaseVNode("span", _hoisted_237, "验证码有效期：" + toDisplayString(getVerificationTimeLeft()), 1)
                          ])
                        ])) : createCommentVNode("", true),
                        createBaseVNode("div", _hoisted_238, [
                          _cache[288] || (_cache[288] = createBaseVNode("span", { class: "info-label" }, "注册时间", -1)),
                          createBaseVNode("span", _hoisted_239, toDisplayString(((_n = selectedUserStats.value) == null ? void 0 : _n.created_at) ? new Date(selectedUserStats.value.created_at).toLocaleDateString() : "未知"), 1)
                        ])
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_240, [
                      createBaseVNode("div", _hoisted_241, [
                        createVNode(_component_el_icon, null, {
                          default: withCtx(() => [
                            createVNode(unref(folder_opened_default))
                          ]),
                          _: 1
                        }),
                        _cache[289] || (_cache[289] = createBaseVNode("span", null, "存储信息", -1))
                      ]),
                      createBaseVNode("div", _hoisted_242, [
                        createBaseVNode("div", _hoisted_243, [
                          createBaseVNode("div", _hoisted_244, [
                            _cache[290] || (_cache[290] = createBaseVNode("span", { class: "progress-label" }, "存储使用率", -1)),
                            createBaseVNode("span", _hoisted_245, toDisplayString(userStats.value.storage_limit > 0 ? Math.round(userStats.value.used_storage / userStats.value.storage_limit * 100) : 0) + "%", 1)
                          ]),
                          createVNode(_component_el_progress, {
                            percentage: userStats.value.storage_limit > 0 ? Math.round(userStats.value.used_storage / userStats.value.storage_limit * 100) : 0,
                            color: userStats.value.storage_limit > 0 && userStats.value.used_storage / userStats.value.storage_limit > 0.8 ? "#f56c6c" : "#409eff",
                            "stroke-width": 8
                          }, null, 8, ["percentage", "color"])
                        ]),
                        createBaseVNode("div", _hoisted_246, [
                          createBaseVNode("div", _hoisted_247, [
                            _cache[291] || (_cache[291] = createBaseVNode("span", { class: "storage-label" }, "已使用", -1)),
                            createBaseVNode("span", _hoisted_248, toDisplayString(unref(formatFileSize)(userStats.value.used_storage || 0)), 1)
                          ]),
                          createBaseVNode("div", _hoisted_249, [
                            _cache[292] || (_cache[292] = createBaseVNode("span", { class: "storage-label" }, "总容量", -1)),
                            createBaseVNode("span", _hoisted_250, toDisplayString(unref(formatFileSize)(userStats.value.storage_limit || 0)), 1)
                          ]),
                          createBaseVNode("div", _hoisted_251, [
                            _cache[293] || (_cache[293] = createBaseVNode("span", { class: "storage-label" }, "文件数", -1)),
                            createBaseVNode("span", _hoisted_252, toDisplayString(userStats.value.file_count || 0), 1)
                          ])
                        ])
                      ])
                    ])
                  ])) : createCommentVNode("", true),
                  !isMobile.value ? (openBlock(), createElementBlock("div", _hoisted_253, [
                    _cache[298] || (_cache[298] = createBaseVNode("h4", null, "存储统计", -1)),
                    createBaseVNode("div", _hoisted_254, [
                      _cache[294] || (_cache[294] = createBaseVNode("span", { class: "label" }, "已使用：", -1)),
                      createBaseVNode("span", _hoisted_255, toDisplayString(unref(formatFileSize)(userStats.value.used_storage || 0)), 1)
                    ]),
                    createBaseVNode("div", _hoisted_256, [
                      _cache[295] || (_cache[295] = createBaseVNode("span", { class: "label" }, "存储限制：", -1)),
                      createBaseVNode("span", _hoisted_257, toDisplayString(unref(formatFileSize)(userStats.value.storage_limit || 0)), 1)
                    ]),
                    createBaseVNode("div", _hoisted_258, [
                      _cache[296] || (_cache[296] = createBaseVNode("span", { class: "label" }, "使用率：", -1)),
                      createBaseVNode("span", _hoisted_259, toDisplayString(userStats.value.storage_limit > 0 ? Math.round(userStats.value.used_storage / userStats.value.storage_limit * 100) : 0) + "%", 1)
                    ]),
                    createBaseVNode("div", _hoisted_260, [
                      _cache[297] || (_cache[297] = createBaseVNode("span", { class: "label" }, "文件数量：", -1)),
                      createBaseVNode("span", _hoisted_261, toDisplayString(userStats.value.file_count || 0), 1)
                    ])
                  ])) : createCommentVNode("", true)
                ])) : !loadingUserStats.value ? (openBlock(), createElementBlock("div", _hoisted_262, [
                  createVNode(_component_el_icon, { class: "no-data-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(data_analysis_default))
                    ]),
                    _: 1
                  }),
                  _cache[299] || (_cache[299] = createBaseVNode("p", null, "暂无统计数据", -1))
                ])) : createCommentVNode("", true)
              ])), [
                [_directive_loading, loadingUserStats.value]
              ])
            ];
          }),
          _: 1
        }, 8, ["modelValue", "title", "width", "class"])
      ]);
    };
  }
});
const AdminCenter = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5e9cf4ca"]]);
export {
  AdminCenter as default
};
//# sourceMappingURL=AdminCenter-CPyrOJNa.js.map
