import { u as useAuthStore, a as api, _ as _export_sfc } from "./index-DfUEOATv.js";
import { y as defineComponent, c as computed, r as ref, k as reactive, l as onMounted, z as createElementBlock, B as createBaseVNode, ay as createStaticVNode, R as createVNode, J as withCtx, u as unref, a4 as withKeys, O as createTextVNode, I as createBlock, L as createCommentVNode, P as toDisplayString, W as withModifiers, al as resolveComponent, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { p as picture_default, a as ElIcon, l as lock_default, d as ElFormItem, e as ElInput, f as user_default, g as ElCheckbox, c as ElButton, r as right_default, b as ElForm, u as user_filled_default, h as upload_default, U as view_default, aK as platform_default, E as ElMessage } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "login-container" };
const _hoisted_2 = { class: "top-nav" };
const _hoisted_3 = { class: "nav-content" };
const _hoisted_4 = { class: "nav-logo" };
const _hoisted_5 = { class: "login-content" };
const _hoisted_6 = { class: "login-box" };
const _hoisted_7 = { class: "login-header" };
const _hoisted_8 = { class: "header-icon" };
const _hoisted_9 = { class: "remember-forgot-container" };
const _hoisted_10 = { class: "social-login" };
const _hoisted_11 = { class: "social-btn-wrapper" };
const _hoisted_12 = { class: "social-btn-wrapper" };
const _hoisted_13 = { class: "login-footer" };
const _hoisted_14 = { class: "register-link" };
const _hoisted_15 = { class: "info-panel" };
const _hoisted_16 = { class: "panel-content" };
const _hoisted_17 = { class: "feature-list" };
const _hoisted_18 = { class: "feature-item" };
const _hoisted_19 = { class: "feature-item" };
const _hoisted_20 = { class: "feature-item" };
const geetestScriptUrl = "https://static.geetest.com/v4/gt4.js";
const geetestMaxWaitMs = 12e3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Login",
  setup(__props) {
    const router = useRouter();
    const authStore = useAuthStore();
    computed(() => {
      return window.innerWidth <= 768;
    });
    const loginFormRef = ref();
    const loginForm = reactive({
      username: "",
      password: ""
    });
    const rememberMe = ref(localStorage.getItem("rememberMe") === "true");
    const loginRules = {
      username: [
        { required: true, message: "请输入用户名或邮箱", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码长度不能少于6位", trigger: "blur" }
      ]
    };
    const geetestCaptchaId = "30d77075542cc161d6518051a937b9a0";
    let geetestHandler = null;
    const geetestReady = ref(false);
    const loadScriptOnce = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("geetest script load failed"));
        document.head.appendChild(s);
      });
    };
    const ensureGeetest = async () => {
      if (geetestReady.value && geetestHandler) return true;
      await loadScriptOnce(geetestScriptUrl);
      const initGeetest4 = window.initGeetest4;
      if (!initGeetest4) return false;
      return new Promise((resolve) => {
        try {
          initGeetest4({
            captchaId: geetestCaptchaId,
            product: "bind",
            riskType: "verify",
            language: "zho",
            protocol: "https://",
            timeout: 3e4
          }, (handler) => {
            geetestHandler = handler;
            geetestReady.value = !!handler;
            resolve(geetestReady.value);
          });
        } catch (_) {
          resolve(false);
        }
      });
    };
    const runHumanVerification = async () => {
      const ok = await ensureGeetest();
      if (!ok || !geetestHandler) return false;
      return new Promise((resolve) => {
        let settled = false;
        let popupShown = false;
        try {
          ElMessage({ type: "info", message: "正在拉起人机验证...", duration: 1200 });
        } catch {
        }
        const onSuccess = async () => {
          var _a;
          try {
            const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null;
            if (!validate) return resolve(false);
            const { lot_number, captcha_output, pass_token, gen_time } = validate;
            const resp = await api.post("/auth/captcha/validate", {
              lot_number,
              captcha_output,
              pass_token,
              gen_time,
              sign_token: validate.sign_token,
              captcha_id: geetestCaptchaId
            });
            settled = true;
            resolve(((_a = resp.data) == null ? void 0 : _a.success) === true);
          } catch (e) {
            settled = true;
            try {
              ElMessage.error("二次校验失败，请重试");
            } catch {
            }
            resolve(false);
          }
        };
        if (geetestHandler.onSuccess) geetestHandler.onSuccess(onSuccess);
        if (geetestHandler.onError) geetestHandler.onError(() => {
          if (!settled) {
            settled = true;
            try {
              ElMessage.error("人机验证出错，请关闭拦截或更换网络后重试");
            } catch {
            }
            resolve(false);
          }
        });
        if (geetestHandler.onClose) geetestHandler.onClose(() => {
          if (!settled) {
            settled = true;
            try {
              ElMessage.warning("请先完成人机验证");
            } catch {
            }
            resolve(false);
          }
        });
        const showIt = () => {
          popupShown = true;
          if (geetestHandler.showCaptcha) geetestHandler.showCaptcha();
          else if (geetestHandler.showBox) geetestHandler.showBox();
          else onSuccess();
        };
        try {
          showIt();
        } catch {
        }
        if (geetestHandler.onReady) geetestHandler.onReady(() => {
          popupShown = true;
          showIt();
        });
        setTimeout(() => {
          if (!settled) {
            settled = true;
            if (!popupShown) {
              try {
                ElMessage.error("人机验证超时，请重试或检查拦截设置");
              } catch {
              }
            }
            resolve(false);
          }
        }, geetestMaxWaitMs);
      });
    };
    const handleLogin = async () => {
      if (!loginFormRef.value) return;
      try {
        await loginFormRef.value.validate();
        const humanOk = await runHumanVerification();
        if (!humanOk) {
          ElMessage.error("请先完成人机验证");
          return;
        }
        const success = await authStore.login({
          ...loginForm,
          rememberMe: rememberMe.value
        });
        if (success) {
          router.push("/");
        }
      } catch (error) {
      }
    };
    const goToForgotPassword = () => {
      router.push("/forgot-password");
    };
    const handleQQLogin = async () => {
      var _a, _b;
      try {
        const response = await api.get("/auth/qq/auth");
        if (response.data.success) {
          window.location.href = response.data.authUrl;
        } else {
          ElMessage.error(`QQ登录服务暂不可用: ${response.data.message}`);
        }
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          ElMessage.error("网络连接失败，请检查网络连接");
        } else if (((_a = error.response) == null ? void 0 : _a.status) === 404) {
          ElMessage.error("QQ登录接口不存在");
        } else if (((_b = error.response) == null ? void 0 : _b.status) === 500) {
          ElMessage.error("服务器内部错误，请联系管理员");
        } else {
          ElMessage.error(`QQ登录失败: ${error.message || "请重试"}`);
        }
      }
    };
    const handleEPassLogin = async () => {
      var _a;
      try {
        const arr = new Uint8Array(16);
        if ((_a = window.crypto) == null ? void 0 : _a.getRandomValues) window.crypto.getRandomValues(arr);
        const state = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
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
        ElMessage.error((e == null ? void 0 : e.message) || "E通行证登录初始化失败");
      }
    };
    onMounted(() => {
      ensureGeetest().catch(() => {
      });
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_button = ElButton;
      const _component_el_form = ElForm;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              createVNode(_component_el_icon, { class: "logo-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(picture_default))
                ]),
                _: 1
              }),
              _cache[3] || (_cache[3] = createBaseVNode("span", { class: "logo-text" }, "图库系统", -1))
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", _hoisted_8, [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(lock_default))
                  ]),
                  _: 1
                })
              ]),
              _cache[4] || (_cache[4] = createBaseVNode("h1", { class: "login-title" }, "欢迎回来", -1)),
              _cache[5] || (_cache[5] = createBaseVNode("p", { class: "login-subtitle" }, "登录您的账户以继续使用图库系统", -1))
            ]),
            createVNode(_component_el_form, {
              ref_key: "loginFormRef",
              ref: loginFormRef,
              model: loginForm,
              rules: loginRules,
              class: "login-form",
              onSubmit: withModifiers(handleLogin, ["prevent"])
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { prop: "username" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: loginForm.username,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => loginForm.username = $event),
                      placeholder: "请输入用户名或邮箱",
                      size: "large",
                      "prefix-icon": unref(user_default),
                      clearable: "",
                      class: "custom-input"
                    }, null, 8, ["modelValue", "prefix-icon"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "password" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: loginForm.password,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => loginForm.password = $event),
                      type: "password",
                      placeholder: "请输入密码",
                      size: "large",
                      "prefix-icon": unref(lock_default),
                      "show-password": "",
                      class: "custom-input",
                      onKeyup: withKeys(handleLogin, ["enter"])
                    }, null, 8, ["modelValue", "prefix-icon"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { class: "remember-row" }, {
                  default: withCtx(() => [
                    createBaseVNode("div", _hoisted_9, [
                      createVNode(_component_el_checkbox, {
                        modelValue: rememberMe.value,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => rememberMe.value = $event),
                        class: "remember-checkbox"
                      }, {
                        default: withCtx(() => [..._cache[6] || (_cache[6] = [
                          createBaseVNode("span", { class: "remember-text" }, "记住我", -1),
                          createBaseVNode("span", { class: "remember-hint" }, "（30天内免登录）", -1)
                        ])]),
                        _: 1
                      }, 8, ["modelValue"]),
                      createVNode(_component_el_button, {
                        type: "text",
                        class: "forgot-password",
                        onClick: goToForgotPassword
                      }, {
                        default: withCtx(() => [..._cache[7] || (_cache[7] = [
                          createTextVNode(" 忘记密码？ ", -1)
                        ])]),
                        _: 1
                      })
                    ])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, null, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: "primary",
                      size: "large",
                      class: "login-button",
                      loading: unref(authStore).loading,
                      onClick: handleLogin
                    }, {
                      default: withCtx(() => [
                        !unref(authStore).loading ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                          default: withCtx(() => [
                            createVNode(unref(right_default))
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(authStore).loading ? "登录中..." : "立即登录"), 1)
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            _cache[12] || (_cache[12] = createBaseVNode("div", { class: "login-divider" }, [
              createBaseVNode("span", { class: "divider-text" }, "或")
            ], -1)),
            createBaseVNode("div", _hoisted_10, [
              createBaseVNode("div", _hoisted_11, [
                createVNode(_component_el_button, {
                  class: "social-btn qq-btn",
                  onClick: handleQQLogin
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[8] || (_cache[8] = createTextVNode(" QQ登录 ", -1))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_12, [
                createVNode(_component_el_button, {
                  class: "social-btn wechat-btn",
                  onClick: handleEPassLogin
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[9] || (_cache[9] = createTextVNode(" E通行证登录 ", -1))
                  ]),
                  _: 1
                })
              ])
            ]),
            createBaseVNode("div", _hoisted_13, [
              createBaseVNode("p", _hoisted_14, [
                _cache[11] || (_cache[11] = createTextVNode(" 还没有账户？ ", -1)),
                createVNode(_component_router_link, {
                  to: "/register",
                  class: "link"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_filled_default))
                      ]),
                      _: 1
                    }),
                    _cache[10] || (_cache[10] = createTextVNode(" 立即注册 ", -1))
                  ]),
                  _: 1
                })
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_15, [
            createBaseVNode("div", _hoisted_16, [
              _cache[16] || (_cache[16] = createBaseVNode("h2", { class: "panel-title" }, "为什么选择图库系统？", -1)),
              createBaseVNode("div", _hoisted_17, [
                createBaseVNode("div", _hoisted_18, [
                  createVNode(_component_el_icon, { class: "feature-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(upload_default))
                    ]),
                    _: 1
                  }),
                  _cache[13] || (_cache[13] = createBaseVNode("div", { class: "feature-content" }, [
                    createBaseVNode("h3", null, "快速上传"),
                    createBaseVNode("p", null, "支持拖拽上传，批量处理，让文件管理更高效")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_19, [
                  createVNode(_component_el_icon, { class: "feature-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(view_default))
                    ]),
                    _: 1
                  }),
                  _cache[14] || (_cache[14] = createBaseVNode("div", { class: "feature-content" }, [
                    createBaseVNode("h3", null, "在线预览"),
                    createBaseVNode("p", null, "图片、视频在线预览，无需下载即可查看")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_20, [
                  createVNode(_component_el_icon, { class: "feature-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(platform_default))
                    ]),
                    _: 1
                  }),
                  _cache[15] || (_cache[15] = createBaseVNode("div", { class: "feature-content" }, [
                    createBaseVNode("h3", null, "安全可靠"),
                    createBaseVNode("p", null, "企业级安全防护，保护您的文件隐私")
                  ], -1))
                ])
              ])
            ])
          ])
        ]),
        _cache[17] || (_cache[17] = createStaticVNode('<div class="bg-decoration" data-v-0d76df14><div class="floating-shape shape-1" data-v-0d76df14></div><div class="floating-shape shape-2" data-v-0d76df14></div><div class="floating-shape shape-3" data-v-0d76df14></div><div class="floating-shape shape-4" data-v-0d76df14></div></div>', 1))
      ]);
    };
  }
});
const Login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0d76df14"]]);
export {
  Login as default
};
//# sourceMappingURL=Login-D-m1gYXn.js.map
