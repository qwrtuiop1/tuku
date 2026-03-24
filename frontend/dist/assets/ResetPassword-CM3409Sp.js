import { u as useAuthStore, _ as _export_sfc } from "./index-TR09GHHj.js";
import { y as defineComponent, c as computed, r as ref, k as reactive, l as onMounted, aD as useRoute, az as useRouter, z as createElementBlock, B as createBaseVNode, ay as createStaticVNode, R as createVNode, J as withCtx, u as unref, O as createTextVNode, a4 as withKeys, I as createBlock, L as createCommentVNode, P as toDisplayString, W as withModifiers, al as resolveComponent, A as openBlock } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, p as picture_default, a as ElIcon, f as user_default, c as ElButton, l as lock_default, d as ElFormItem, e as ElInput, r as right_default, b as ElForm, aN as info_filled_default } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "reset-password-container" };
const _hoisted_2 = { class: "top-nav" };
const _hoisted_3 = { class: "nav-content" };
const _hoisted_4 = { class: "nav-logo" };
const _hoisted_5 = { class: "nav-actions" };
const _hoisted_6 = { class: "reset-password-content" };
const _hoisted_7 = { class: "reset-password-box" };
const _hoisted_8 = { class: "reset-password-header" };
const _hoisted_9 = { class: "header-icon" };
const _hoisted_10 = { class: "reset-password-footer" };
const _hoisted_11 = { class: "login-link" };
const _hoisted_12 = { class: "info-panel" };
const _hoisted_13 = { class: "panel-content" };
const _hoisted_14 = { class: "security-list" };
const _hoisted_15 = { class: "security-item" };
const _hoisted_16 = { class: "security-item" };
const _hoisted_17 = { class: "security-item" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ResetPassword",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    computed(() => {
      return window.innerWidth <= 768;
    });
    const resetPasswordFormRef = ref();
    const resetPasswordForm = reactive({
      password: "",
      confirmPassword: ""
    });
    const loading = ref(false);
    const validatePassword = (rule, value, callback) => {
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
      } else if (value !== resetPasswordForm.password) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    const resetPasswordRules = {
      password: [{ validator: validatePassword, trigger: "blur" }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }]
    };
    const handleResetPassword = async () => {
      if (!resetPasswordFormRef.value) return;
      try {
        await resetPasswordFormRef.value.validate();
        loading.value = true;
        const token = route.query.token;
        if (!token) {
          ElMessage.error("重置链接无效");
          return;
        }
        const success = await authStore.resetPassword(token, resetPasswordForm.password);
        if (success) {
          ElMessage.success({
            message: "密码重置成功！2秒后自动跳转到登录页面",
            duration: 2e3,
            showClose: false
          });
          setTimeout(() => {
            router.push("/login");
          }, 2e3);
        }
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };
    const goToLogin = () => {
      router.push("/login");
    };
    onMounted(() => {
      const token = route.query.token;
      if (!token) {
        ElMessage.error("重置链接无效");
        router.push("/forgot-password");
      }
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_form = ElForm;
      const _component_router_link = resolveComponent("router-link");
      const _component_Key = resolveComponent("Key");
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
              _cache[2] || (_cache[2] = createBaseVNode("span", { class: "logo-text" }, "图库系统", -1))
            ]),
            createBaseVNode("div", _hoisted_5, [
              createVNode(_component_el_button, {
                type: "text",
                onClick: goToLogin
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(user_default))
                    ]),
                    _: 1
                  }),
                  _cache[3] || (_cache[3] = createTextVNode(" 返回登录 ", -1))
                ]),
                _: 1
              })
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_6, [
          createBaseVNode("div", _hoisted_7, [
            createBaseVNode("div", _hoisted_8, [
              createBaseVNode("div", _hoisted_9, [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(lock_default))
                  ]),
                  _: 1
                })
              ]),
              _cache[4] || (_cache[4] = createBaseVNode("h1", { class: "reset-password-title" }, "重置密码", -1)),
              _cache[5] || (_cache[5] = createBaseVNode("p", { class: "reset-password-subtitle" }, "请输入您的新密码", -1))
            ]),
            createVNode(_component_el_form, {
              ref_key: "resetPasswordFormRef",
              ref: resetPasswordFormRef,
              model: resetPasswordForm,
              rules: resetPasswordRules,
              class: "reset-password-form",
              onSubmit: withModifiers(handleResetPassword, ["prevent"])
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { prop: "password" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: resetPasswordForm.password,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => resetPasswordForm.password = $event),
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
                      modelValue: resetPasswordForm.confirmPassword,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => resetPasswordForm.confirmPassword = $event),
                      type: "password",
                      placeholder: "请确认新密码",
                      size: "large",
                      "prefix-icon": unref(lock_default),
                      "show-password": "",
                      class: "custom-input",
                      onKeyup: withKeys(handleResetPassword, ["enter"])
                    }, null, 8, ["modelValue", "prefix-icon"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, null, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: "primary",
                      size: "large",
                      class: "reset-password-button",
                      loading: loading.value,
                      onClick: handleResetPassword
                    }, {
                      default: withCtx(() => [
                        !loading.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                          default: withCtx(() => [
                            createVNode(unref(right_default))
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(loading.value ? "重置中..." : "重置密码"), 1)
                      ]),
                      _: 1
                    }, 8, ["loading"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            createBaseVNode("div", _hoisted_10, [
              createBaseVNode("p", _hoisted_11, [
                _cache[7] || (_cache[7] = createTextVNode(" 记起密码了？ ", -1)),
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
                    _cache[6] || (_cache[6] = createTextVNode(" 返回登录 ", -1))
                  ]),
                  _: 1
                })
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_12, [
            createBaseVNode("div", _hoisted_13, [
              _cache[11] || (_cache[11] = createBaseVNode("h2", { class: "panel-title" }, "密码安全提示", -1)),
              createBaseVNode("div", _hoisted_14, [
                createBaseVNode("div", _hoisted_15, [
                  createVNode(_component_el_icon, { class: "security-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(lock_default))
                    ]),
                    _: 1
                  }),
                  _cache[8] || (_cache[8] = createBaseVNode("div", { class: "security-content" }, [
                    createBaseVNode("h3", null, "密码强度"),
                    createBaseVNode("p", null, "建议使用包含字母、数字和特殊字符的强密码")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_16, [
                  createVNode(_component_el_icon, { class: "security-icon" }, {
                    default: withCtx(() => [
                      createVNode(_component_Key)
                    ]),
                    _: 1
                  }),
                  _cache[9] || (_cache[9] = createBaseVNode("div", { class: "security-content" }, [
                    createBaseVNode("h3", null, "密码长度"),
                    createBaseVNode("p", null, "密码长度至少6位，建议8位以上")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_17, [
                  createVNode(_component_el_icon, { class: "security-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(info_filled_default))
                    ]),
                    _: 1
                  }),
                  _cache[10] || (_cache[10] = createBaseVNode("div", { class: "security-content" }, [
                    createBaseVNode("h3", null, "安全提醒"),
                    createBaseVNode("p", null, "请妥善保管您的密码，不要与他人分享")
                  ], -1))
                ])
              ])
            ])
          ])
        ]),
        _cache[12] || (_cache[12] = createStaticVNode('<div class="bg-decoration" data-v-23701ea1><div class="floating-shape shape-1" data-v-23701ea1></div><div class="floating-shape shape-2" data-v-23701ea1></div><div class="floating-shape shape-3" data-v-23701ea1></div><div class="floating-shape shape-4" data-v-23701ea1></div></div>', 1))
      ]);
    };
  }
});
const ResetPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-23701ea1"]]);
export {
  ResetPassword as default
};
//# sourceMappingURL=ResetPassword-CM3409Sp.js.map
