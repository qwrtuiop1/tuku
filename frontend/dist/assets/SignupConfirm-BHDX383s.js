import { u as useAuthStore, a as api, _ as _export_sfc } from "./index-DbxwNbHT.js";
import { y as defineComponent, r as ref, aD as useRoute, c as computed, l as onMounted, az as useRouter, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, u as unref, L as createCommentVNode, P as toDisplayString, O as createTextVNode, A as openBlock } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, p as picture_default, a as ElIcon, u as user_filled_default, c as ElButton } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "confirm-container" };
const _hoisted_2 = { class: "top-nav" };
const _hoisted_3 = { class: "nav-content" };
const _hoisted_4 = { class: "nav-logo" };
const _hoisted_5 = { class: "confirm-content" };
const _hoisted_6 = { class: "confirm-box" };
const _hoisted_7 = { class: "confirm-header" };
const _hoisted_8 = { class: "header-icon" };
const _hoisted_9 = { class: "confirm-subtitle" };
const _hoisted_10 = {
  key: 0,
  class: "profile-preview"
};
const _hoisted_11 = ["src"];
const _hoisted_12 = {
  key: 1,
  class: "email"
};
const _hoisted_13 = { class: "confirm-actions" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SignupConfirm",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const provider = ref(route.query.provider || "");
    const token = ref(route.query.token || "");
    const avatar = ref(route.query.avatar || void 0);
    const email = ref(route.query.email || void 0);
    const submitting = ref(false);
    const providerName = computed(() => provider.value === "epass" ? "E通行证" : "QQ");
    onMounted(() => {
      if (!token.value || !provider.value) {
        ElMessage.error("注册确认信息无效，请重新登录");
        router.replace("/login");
      }
    });
    const confirm = async () => {
      var _a, _b;
      if (submitting.value) return;
      submitting.value = true;
      try {
        const endpoint = provider.value === "epass" ? "/auth/epass/confirm-register" : "/auth/qq/confirm-register";
        const resp = await api.post(endpoint, { tempToken: token.value });
        if (!((_a = resp.data) == null ? void 0 : _a.success)) {
          throw new Error(((_b = resp.data) == null ? void 0 : _b.message) || "注册失败");
        }
        const { token: jwt, user, settings } = resp.data;
        authStore.token = jwt;
        authStore.user = user;
        localStorage.setItem("token", jwt);
        localStorage.setItem("rememberMe", "true");
        if (settings) localStorage.setItem("userSettings", JSON.stringify(settings));
        ElMessage.success("已注册并登录");
        router.replace("/");
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "注册失败，请重试");
        router.replace("/login");
      } finally {
        submitting.value = false;
      }
    };
    const goLogin = () => {
      router.replace("/login");
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
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
              _cache[0] || (_cache[0] = createBaseVNode("span", { class: "logo-text" }, "图库系统", -1))
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_5, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("div", _hoisted_8, [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(user_filled_default))
                  ]),
                  _: 1
                })
              ]),
              _cache[1] || (_cache[1] = createBaseVNode("h1", { class: "confirm-title" }, "注册确认", -1)),
              createBaseVNode("p", _hoisted_9, "检测到您使用 " + toDisplayString(providerName.value) + " 登录，本账户尚未在本站注册", 1)
            ]),
            avatar.value || email.value ? (openBlock(), createElementBlock("div", _hoisted_10, [
              avatar.value ? (openBlock(), createElementBlock("img", {
                key: 0,
                src: avatar.value,
                alt: "avatar",
                class: "avatar"
              }, null, 8, _hoisted_11)) : createCommentVNode("", true),
              email.value ? (openBlock(), createElementBlock("div", _hoisted_12, toDisplayString(email.value), 1)) : createCommentVNode("", true)
            ])) : createCommentVNode("", true),
            _cache[4] || (_cache[4] = createBaseVNode("div", { class: "confirm-message" }, [
              createBaseVNode("p", null, "是否同意并立即注册为新用户，并自动登录？")
            ], -1)),
            createBaseVNode("div", _hoisted_13, [
              createVNode(_component_el_button, {
                class: "cancel-btn",
                onClick: goLogin,
                disabled: submitting.value
              }, {
                default: withCtx(() => [..._cache[2] || (_cache[2] = [
                  createTextVNode("取消", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              createVNode(_component_el_button, {
                type: "primary",
                class: "agree-btn",
                onClick: confirm,
                loading: submitting.value
              }, {
                default: withCtx(() => [..._cache[3] || (_cache[3] = [
                  createTextVNode("同意并登录", -1)
                ])]),
                _: 1
              }, 8, ["loading"])
            ])
          ])
        ]),
        _cache[5] || (_cache[5] = createBaseVNode("div", { class: "bg-decoration" }, [
          createBaseVNode("div", { class: "floating-shape shape-1" }),
          createBaseVNode("div", { class: "floating-shape shape-2" }),
          createBaseVNode("div", { class: "floating-shape shape-3" })
        ], -1))
      ]);
    };
  }
});
const SignupConfirm = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5ee10376"]]);
export {
  SignupConfirm as default
};
//# sourceMappingURL=SignupConfirm-BHDX383s.js.map
