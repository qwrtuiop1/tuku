import { u as useAuthStore, m as useEmailCode, a as api, n as isValidEmail, _ as _export_sfc } from "./index-C_iH8KFY.js";
import { y as defineComponent, c as computed, r as ref, k as reactive, l as onMounted, U as onUnmounted, z as createElementBlock, B as createBaseVNode, ay as createStaticVNode, R as createVNode, J as withCtx, u as unref, L as createCommentVNode, E as normalizeClass, I as createBlock, O as createTextVNode, P as toDisplayString, W as withModifiers, a4 as withKeys, al as resolveComponent, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { U as view_default, a as ElIcon, m as message_default, d as ElFormItem, e as ElInput, c as ElButton, r as right_default, b as ElForm, f as user_default, l as lock_default, s as arrow_left_default, aa as check_default, E as ElMessage } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "forgot-password-container" };
const _hoisted_2 = { class: "top-nav" };
const _hoisted_3 = { class: "nav-content" };
const _hoisted_4 = { class: "nav-logo" };
const _hoisted_5 = { class: "forgot-password-content" };
const _hoisted_6 = { class: "forgot-password-box" };
const _hoisted_7 = { class: "steps-indicator" };
const _hoisted_8 = {
  key: 0,
  class: "step-content"
};
const _hoisted_9 = { class: "step-header" };
const _hoisted_10 = { class: "header-icon" };
const _hoisted_11 = {
  key: 1,
  class: "step-content"
};
const _hoisted_12 = { class: "step-header" };
const _hoisted_13 = { class: "header-icon" };
const _hoisted_14 = { class: "email-code-group" };
const _hoisted_15 = { class: "step-actions" };
const _hoisted_16 = {
  key: 2,
  class: "step-content"
};
const _hoisted_17 = { class: "step-header" };
const _hoisted_18 = { class: "header-icon" };
const _hoisted_19 = { class: "step-actions" };
const _hoisted_20 = { class: "forgot-password-footer" };
const _hoisted_21 = { class: "login-link" };
const _hoisted_22 = { class: "info-panel" };
const _hoisted_23 = { class: "panel-content" };
const _hoisted_24 = { class: "instruction-list" };
const _hoisted_25 = { class: "instruction-item" };
const _hoisted_26 = { class: "instruction-item" };
const _hoisted_27 = { class: "instruction-item" };
const _hoisted_28 = { class: "instruction-content" };
const geetestScriptUrl = "https://static.geetest.com/v4/gt4.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ForgotPassword",
  setup(__props) {
    const router = useRouter();
    useAuthStore();
    computed(() => {
      return window.innerWidth <= 768;
    });
    const currentStep = ref(1);
    const loading = ref(false);
    const emailFormRef = ref();
    const verifyFormRef = ref();
    const passwordFormRef = ref();
    const emailForm = reactive({
      email: ""
    });
    const verifyForm = reactive({
      username: "",
      emailCode: ""
    });
    const passwordForm = reactive({
      newPassword: "",
      confirmPassword: ""
    });
    const { emailCodeCooldown, sendEmailCodeWithHuman } = useEmailCode();
    const passwordRequirements = ref("");
    const resetToken = ref("");
    const passwordPolicy = ref(null);
    const passwordHintsStep1 = computed(() => {
      if (!passwordPolicy.value) return "长度至少 6 位";
      const parts = [];
      parts.push(`长度至少 ${passwordPolicy.value.minLength || 6} 位`);
      if (passwordPolicy.value.complexity === "medium") parts.push("需包含字母和数字");
      if (passwordPolicy.value.complexity === "high") parts.push("需包含大小写字母、数字和符号");
      return parts.join("；");
    });
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入邮箱地址"));
      } else if (!isValidEmail(value)) {
        callback(new Error("请输入有效的邮箱地址"));
      } else {
        callback();
      }
    };
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入用户名"));
      } else if (value.length < 3) {
        callback(new Error("用户名长度不能少于3位"));
      } else {
        callback();
      }
    };
    const validateEmailCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入验证码"));
      } else if (value.length !== 6) {
        callback(new Error("验证码必须是6位数字"));
      } else if (!/^\d{6}$/.test(value)) {
        callback(new Error("验证码只能包含数字"));
      } else {
        callback();
      }
    };
    const validateNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入新密码"));
      } else if (value.length < 6) {
        callback(new Error("密码长度不能少于6位"));
      } else {
        callback();
      }
    };
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请确认新密码"));
      } else if (value !== passwordForm.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    const emailRules = {
      email: [{ validator: validateEmail, trigger: "blur" }]
    };
    const verifyRules = {
      username: [{ validator: validateUsername, trigger: "blur" }],
      emailCode: [{ validator: validateEmailCode, trigger: "blur" }]
    };
    const geetestCaptchaId = "30d77075542cc161d6518051a937b9a0";
    const geetestReady = ref(false);
    let geetestHandler = null;
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
    const passwordRules = {
      newPassword: [{ validator: validateNewPassword, trigger: "blur" }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }]
    };
    const handleEmailSubmit = async () => {
      var _a, _b;
      if (!emailFormRef.value) return;
      try {
        await emailFormRef.value.validate();
        loading.value = true;
        const response = await api.post("/auth/check-email", { email: emailForm.email });
        if (response.data.exists) {
          currentStep.value = 2;
          ElMessage.success("邮箱验证成功，请继续下一步");
        } else {
          ElMessage.error("该邮箱地址未注册");
        }
      } catch (error) {
        const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "邮箱验证失败";
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };
    const sendEmailCode = async () => {
      await sendEmailCodeWithHuman(emailForm.email, "forgot_password");
    };
    const handleVerifySubmit = async () => {
      var _a, _b;
      if (!verifyFormRef.value) return;
      try {
        await verifyFormRef.value.validate();
        loading.value = true;
        const response = await api.post("/auth/verify-forgot-password", {
          username: verifyForm.username,
          email: emailForm.email,
          emailCode: verifyForm.emailCode
        });
        if (response.data.valid) {
          resetToken.value = response.data.resetToken || "";
          passwordRequirements.value = response.data.passwordRequirements || "";
          passwordPolicy.value = response.data.passwordPolicy || null;
          currentStep.value = 3;
          ElMessage.success("身份验证成功，请设置新密码");
        } else {
          ElMessage.error(response.data.message || "用户名、邮箱或验证码不正确");
        }
      } catch (error) {
        const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "身份验证失败";
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };
    const handlePasswordSubmit = async () => {
      var _a, _b;
      if (!passwordFormRef.value) return;
      try {
        await passwordFormRef.value.validate();
        loading.value = true;
        const checkResponse = await api.post("/auth/check-password-same", {
          username: verifyForm.username,
          email: emailForm.email,
          newPassword: passwordForm.newPassword
        });
        if (checkResponse.data.isSame) {
          ElMessage.error("新密码不能与原密码相同，请重新设置");
          return;
        }
        const payload = {
          username: verifyForm.username,
          email: emailForm.email,
          newPassword: passwordForm.newPassword
        };
        if (resetToken.value) payload.resetToken = resetToken.value;
        if (!resetToken.value) payload.emailCode = verifyForm.emailCode;
        const resetResponse = await api.post("/auth/reset-password-new", payload);
        if (resetResponse.data.success) {
          ElMessage.success({ message: "密码重置成功！2秒后自动跳转到登录页面", duration: 2e3, showClose: false });
          clearTimers();
          setTimeout(() => {
            router.push("/login");
          }, 2e3);
        }
      } catch (error) {
        const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "密码重置失败";
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };
    const canSubmitNewPassword = computed(() => {
      var _a;
      if (!passwordPolicy.value) return ((_a = passwordForm.newPassword) == null ? void 0 : _a.length) >= 6 && passwordForm.newPassword === passwordForm.confirmPassword;
      const min = passwordPolicy.value.minLength || 6;
      const okLen = (passwordForm.newPassword || "").length >= min;
      const complexity = passwordPolicy.value.complexity || "low";
      const pwd = passwordForm.newPassword || "";
      let okComplex = true;
      if (complexity === "medium") okComplex = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd);
      if (complexity === "high") okComplex = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
      const same = pwd === passwordForm.confirmPassword;
      return okLen && okComplex && same;
    });
    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };
    const clearTimers = () => {
    };
    onMounted(() => {
      ensureGeetest().catch(() => {
      });
      api.get("/auth/password-policy").then((res) => {
        var _a;
        if ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.success) {
          passwordRequirements.value = res.data.passwordRequirements || "";
          passwordPolicy.value = res.data.passwordPolicy || null;
        }
      }).catch(() => {
      });
    });
    onUnmounted(() => {
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_button = ElButton;
      const _component_el_form = ElForm;
      const _component_router_link = resolveComponent("router-link");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              createVNode(_component_el_icon, { class: "logo-icon" }, {
                default: withCtx(() => [
                  createVNode(unref(view_default))
                ]),
                _: 1
              }),
              _cache[5] || (_cache[5] = createBaseVNode("span", { class: "logo-text" }, "图库系统", -1))
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", {
                class: normalizeClass(["step-item", { active: currentStep.value >= 1, completed: currentStep.value > 1 }])
              }, [..._cache[6] || (_cache[6] = [
                createBaseVNode("div", { class: "step-number" }, "1", -1),
                createBaseVNode("div", { class: "step-label" }, "输入邮箱", -1)
              ])], 2),
              createBaseVNode("div", {
                class: normalizeClass(["step-line", { active: currentStep.value > 1 }])
              }, null, 2),
              createBaseVNode("div", {
                class: normalizeClass(["step-item", { active: currentStep.value >= 2, completed: currentStep.value > 2 }])
              }, [..._cache[7] || (_cache[7] = [
                createBaseVNode("div", { class: "step-number" }, "2", -1),
                createBaseVNode("div", { class: "step-label" }, "验证身份", -1)
              ])], 2),
              createBaseVNode("div", {
                class: normalizeClass(["step-line", { active: currentStep.value > 2 }])
              }, null, 2),
              createBaseVNode("div", {
                class: normalizeClass(["step-item", { active: currentStep.value >= 3 }])
              }, [..._cache[8] || (_cache[8] = [
                createBaseVNode("div", { class: "step-number" }, "3", -1),
                createBaseVNode("div", { class: "step-label" }, "重置密码", -1)
              ])], 2)
            ]),
            currentStep.value === 1 ? (openBlock(), createElementBlock("div", _hoisted_8, [
              createBaseVNode("div", _hoisted_9, [
                createBaseVNode("div", _hoisted_10, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(message_default))
                    ]),
                    _: 1
                  })
                ]),
                _cache[9] || (_cache[9] = createBaseVNode("h1", { class: "step-title" }, "找回密码", -1)),
                _cache[10] || (_cache[10] = createBaseVNode("p", { class: "step-subtitle" }, "输入您的邮箱地址，我们将发送验证码", -1))
              ]),
              createVNode(_component_el_form, {
                ref_key: "emailFormRef",
                ref: emailFormRef,
                model: emailForm,
                rules: emailRules,
                class: "step-form",
                onSubmit: withModifiers(handleEmailSubmit, ["prevent"])
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { prop: "email" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: emailForm.email,
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => emailForm.email = $event),
                        placeholder: "请输入注册时的邮箱地址",
                        size: "large",
                        "prefix-icon": unref(message_default),
                        clearable: "",
                        class: "custom-input"
                      }, null, 8, ["modelValue", "prefix-icon"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, null, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        size: "large",
                        class: "step-button",
                        loading: loading.value,
                        onClick: handleEmailSubmit
                      }, {
                        default: withCtx(() => [
                          !loading.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                            default: withCtx(() => [
                              createVNode(unref(right_default))
                            ]),
                            _: 1
                          })) : createCommentVNode("", true),
                          createTextVNode(" " + toDisplayString(loading.value ? "发送中..." : "下一步"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ])) : createCommentVNode("", true),
            currentStep.value === 2 ? (openBlock(), createElementBlock("div", _hoisted_11, [
              createBaseVNode("div", _hoisted_12, [
                createBaseVNode("div", _hoisted_13, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(user_default))
                    ]),
                    _: 1
                  })
                ]),
                _cache[11] || (_cache[11] = createBaseVNode("h1", { class: "step-title" }, "验证身份", -1)),
                _cache[12] || (_cache[12] = createBaseVNode("p", { class: "step-subtitle" }, "请输入用户名和邮箱验证码", -1))
              ]),
              createVNode(_component_el_form, {
                ref_key: "verifyFormRef",
                ref: verifyFormRef,
                model: verifyForm,
                rules: verifyRules,
                class: "step-form",
                onSubmit: withModifiers(handleVerifySubmit, ["prevent"])
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { prop: "username" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: verifyForm.username,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => verifyForm.username = $event),
                        placeholder: "请输入用户名",
                        size: "large",
                        "prefix-icon": unref(user_default),
                        clearable: "",
                        class: "custom-input"
                      }, null, 8, ["modelValue", "prefix-icon"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { prop: "emailCode" }, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_14, [
                        createVNode(_component_el_input, {
                          modelValue: verifyForm.emailCode,
                          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => verifyForm.emailCode = $event),
                          placeholder: "请输入6位验证码",
                          size: "large",
                          "prefix-icon": unref(lock_default),
                          maxlength: "6",
                          class: "custom-input code-input"
                        }, null, 8, ["modelValue", "prefix-icon"]),
                        createVNode(_component_el_button, {
                          type: "primary",
                          size: "large",
                          disabled: unref(emailCodeCooldown) > 0,
                          onClick: sendEmailCode,
                          class: "send-code-btn same-height"
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
                  createVNode(_component_el_form_item, null, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_15, [
                        createVNode(_component_el_button, {
                          size: "large",
                          onClick: prevStep
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(arrow_left_default))
                              ]),
                              _: 1
                            }),
                            _cache[13] || (_cache[13] = createTextVNode(" 上一步 ", -1))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_button, {
                          type: "primary",
                          size: "large",
                          class: "step-button",
                          loading: loading.value,
                          onClick: handleVerifySubmit
                        }, {
                          default: withCtx(() => [
                            !loading.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                              default: withCtx(() => [
                                createVNode(unref(right_default))
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            createTextVNode(" " + toDisplayString(loading.value ? "验证中..." : "下一步"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading"])
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ])) : createCommentVNode("", true),
            currentStep.value === 3 ? (openBlock(), createElementBlock("div", _hoisted_16, [
              createBaseVNode("div", _hoisted_17, [
                createBaseVNode("div", _hoisted_18, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(lock_default))
                    ]),
                    _: 1
                  })
                ]),
                _cache[14] || (_cache[14] = createBaseVNode("h1", { class: "step-title" }, "重置密码", -1)),
                _cache[15] || (_cache[15] = createBaseVNode("p", { class: "step-subtitle" }, "请输入您的新密码", -1))
              ]),
              createVNode(_component_el_form, {
                ref_key: "passwordFormRef",
                ref: passwordFormRef,
                model: passwordForm,
                rules: passwordRules,
                class: "step-form",
                onSubmit: withModifiers(handlePasswordSubmit, ["prevent"])
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { prop: "newPassword" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: passwordForm.newPassword,
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => passwordForm.newPassword = $event),
                        type: "password",
                        placeholder: "请输入新密码",
                        size: "large",
                        "prefix-icon": unref(lock_default),
                        "show-password": "",
                        class: "custom-input"
                      }, null, 8, ["modelValue", "prefix-icon"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { prop: "confirmPassword" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: passwordForm.confirmPassword,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => passwordForm.confirmPassword = $event),
                        type: "password",
                        placeholder: "请确认新密码",
                        size: "large",
                        "prefix-icon": unref(lock_default),
                        "show-password": "",
                        class: "custom-input",
                        onKeyup: withKeys(handlePasswordSubmit, ["enter"])
                      }, null, 8, ["modelValue", "prefix-icon"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, null, {
                    default: withCtx(() => [
                      createBaseVNode("div", _hoisted_19, [
                        createVNode(_component_el_button, {
                          size: "large",
                          onClick: prevStep
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(arrow_left_default))
                              ]),
                              _: 1
                            }),
                            _cache[16] || (_cache[16] = createTextVNode(" 上一步 ", -1))
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_button, {
                          type: "primary",
                          size: "large",
                          class: "step-button",
                          loading: loading.value,
                          disabled: !canSubmitNewPassword.value,
                          onClick: handlePasswordSubmit
                        }, {
                          default: withCtx(() => [
                            !loading.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                              default: withCtx(() => [
                                createVNode(unref(check_default))
                              ]),
                              _: 1
                            })) : createCommentVNode("", true),
                            createTextVNode(" " + toDisplayString(loading.value ? "重置中..." : "完成重置"), 1)
                          ]),
                          _: 1
                        }, 8, ["loading", "disabled"])
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ])) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_20, [
              createBaseVNode("p", _hoisted_21, [
                _cache[18] || (_cache[18] = createTextVNode(" 记起密码了？ ", -1)),
                createVNode(_component_router_link, {
                  to: "/login",
                  class: "link"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[17] || (_cache[17] = createTextVNode(" 返回登录 ", -1))
                  ]),
                  _: 1
                })
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_22, [
            createBaseVNode("div", _hoisted_23, [
              _cache[22] || (_cache[22] = createBaseVNode("h2", { class: "panel-title" }, "密码重置说明", -1)),
              createBaseVNode("div", _hoisted_24, [
                createBaseVNode("div", _hoisted_25, [
                  createVNode(_component_el_icon, { class: "instruction-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(message_default))
                    ]),
                    _: 1
                  }),
                  _cache[19] || (_cache[19] = createBaseVNode("div", { class: "instruction-content" }, [
                    createBaseVNode("h3", null, "邮箱验证"),
                    createBaseVNode("p", null, "验证码将发送到您注册时使用的邮箱地址")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_26, [
                  createVNode(_component_el_icon, { class: "instruction-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(user_default))
                    ]),
                    _: 1
                  }),
                  _cache[20] || (_cache[20] = createBaseVNode("div", { class: "instruction-content" }, [
                    createBaseVNode("h3", null, "身份确认"),
                    createBaseVNode("p", null, "用户名和邮箱必须属于同一个账户")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_27, [
                  createVNode(_component_el_icon, { class: "instruction-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(lock_default))
                    ]),
                    _: 1
                  }),
                  createBaseVNode("div", _hoisted_28, [
                    _cache[21] || (_cache[21] = createBaseVNode("h3", null, "密码安全", -1)),
                    createBaseVNode("p", null, " 新密码不能与原密码相同； " + toDisplayString(passwordHintsStep1.value), 1)
                  ])
                ])
              ])
            ])
          ])
        ]),
        _cache[23] || (_cache[23] = createStaticVNode('<div class="bg-decoration" data-v-76f2c066><div class="floating-shape shape-1" data-v-76f2c066></div><div class="floating-shape shape-2" data-v-76f2c066></div><div class="floating-shape shape-3" data-v-76f2c066></div><div class="floating-shape shape-4" data-v-76f2c066></div></div>', 1))
      ]);
    };
  }
});
const ForgotPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-76f2c066"]]);
export {
  ForgotPassword as default
};
//# sourceMappingURL=ForgotPassword-DJXCOcaC.js.map
