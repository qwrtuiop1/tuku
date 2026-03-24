import { u as useAuthStore, a as api, _ as _export_sfc } from "./index-D3xFHpAi.js";
import { y as defineComponent, r as ref, l as onMounted, az as useRouter, z as createElementBlock, B as createBaseVNode, R as createVNode, L as createCommentVNode, J as withCtx, u as unref, P as toDisplayString, O as createTextVNode, A as openBlock } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, n as loading_default, a as ElIcon, aL as circle_close_filled_default, c as ElButton, aM as circle_check_filled_default } from "./element-CUyZSw-d.js";
import { G as GlassConfirmModal } from "./GlassConfirmModal-80Ht6nWg.js";
const _hoisted_1 = { class: "epass-callback-container" };
const _hoisted_2 = { class: "callback-content" };
const _hoisted_3 = {
  key: 0,
  class: "loading-spinner"
};
const _hoisted_4 = {
  key: 1,
  class: "error-message"
};
const _hoisted_5 = {
  key: 2,
  class: "success-message"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EPassCallback",
  setup(__props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(true);
    const error = ref("");
    const success = ref(false);
    const showConfirm = ref(false);
    const tempToken = ref("");
    const profile = ref({});
    const confirmText = ref("检测到该 E通行证 尚未在本站注册。是否使用授权邮箱直接注册并登录？");
    onMounted(async () => {
      var _a, _b, _c;
      try {
        const hash = ((_a = window.location.hash) == null ? void 0 : _a.replace(/^#/, "")) || "";
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const state = params.get("state") || "";
        const err = params.get("error");
        if (err) {
          throw new Error(`授权失败：${err}`);
        }
        if (!accessToken) {
          throw new Error("缺少access_token");
        }
        const savedState = sessionStorage.getItem("epass_state") || "";
        if (savedState && state && savedState !== state) {
          throw new Error("状态校验失败，请重试");
        }
        const response = await api.post("/auth/epass/callback", { accessToken, state });
        if (response.data.success) {
          if (response.data.needs_confirm) {
            const t = response.data.tempToken;
            const avatar = ((_b = response.data.profile) == null ? void 0 : _b.avatar) || "";
            const email = ((_c = response.data.profile) == null ? void 0 : _c.email) || "";
            router.replace({ name: "SignupConfirm", query: { provider: "epass", token: t, avatar, email } });
            return;
          }
          try {
            sessionStorage.setItem("bindingsRefresh", "1");
          } catch {
          }
          if (state === "bind") {
            success.value = true;
            ElMessage.success("E通行证绑定成功，正在返回...");
            setTimeout(() => {
              router.push("/user-center");
            }, 1e3);
            return;
          }
          const { token, user, settings } = response.data;
          authStore.token = token;
          authStore.user = user;
          localStorage.setItem("token", token);
          localStorage.setItem("rememberMe", "true");
          if (settings) localStorage.setItem("userSettings", JSON.stringify(settings));
          success.value = true;
          ElMessage.success("登录成功！");
          setTimeout(() => {
            router.push("/");
          }, 1200);
        } else {
          throw new Error(response.data.message || "登录失败");
        }
      } catch (e) {
        error.value = (e == null ? void 0 : e.message) || "E通行证登录失败，请重试";
      } finally {
        loading.value = false;
      }
    });
    const goToLogin = () => {
      router.push("/login");
    };
    const confirmRegister = async () => {
      var _a, _b;
      try {
        const resp = await api.post("/auth/epass/confirm-register", { tempToken: tempToken.value });
        if (!((_a = resp.data) == null ? void 0 : _a.success)) throw new Error(((_b = resp.data) == null ? void 0 : _b.message) || "注册失败");
        const { token, user, settings } = resp.data;
        const authStore2 = useAuthStore();
        authStore2.token = token;
        authStore2.user = user;
        localStorage.setItem("token", token);
        localStorage.setItem("rememberMe", "true");
        if (settings) localStorage.setItem("userSettings", JSON.stringify(settings));
        ElMessage.success("已注册并登录");
        router.push("/");
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "注册失败，请重试");
        router.push("/login");
      }
    };
    const cancelRegister = () => {
      ElMessage.info("已取消注册");
      router.push("/login");
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_3, [
            createVNode(_component_el_icon, { class: "is-loading" }, {
              default: withCtx(() => [
                createVNode(unref(loading_default))
              ]),
              _: 1
            }),
            _cache[0] || (_cache[0] = createBaseVNode("p", null, "正在处理E通行证登录...", -1))
          ])) : error.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
            createVNode(_component_el_icon, { class: "error-icon" }, {
              default: withCtx(() => [
                createVNode(unref(circle_close_filled_default))
              ]),
              _: 1
            }),
            createBaseVNode("p", null, toDisplayString(error.value), 1),
            createVNode(_component_el_button, {
              type: "primary",
              onClick: goToLogin
            }, {
              default: withCtx(() => [..._cache[1] || (_cache[1] = [
                createTextVNode("返回登录", -1)
              ])]),
              _: 1
            })
          ])) : success.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
            createVNode(_component_el_icon, { class: "success-icon" }, {
              default: withCtx(() => [
                createVNode(unref(circle_check_filled_default))
              ]),
              _: 1
            }),
            _cache[2] || (_cache[2] = createBaseVNode("p", null, "E通行证登录成功！", -1)),
            _cache[3] || (_cache[3] = createBaseVNode("p", null, "正在跳转...", -1))
          ])) : createCommentVNode("", true)
        ]),
        createVNode(GlassConfirmModal, {
          visible: showConfirm.value,
          title: "是否注册并登录？",
          message: confirmText.value,
          "confirm-text": "注册并登录",
          "cancel-text": "取消",
          avatar: profile.value.avatar,
          "provider-name": "E通行证",
          onConfirm: confirmRegister,
          onCancel: cancelRegister
        }, null, 8, ["visible", "message", "avatar"])
      ]);
    };
  }
});
const EPassCallback = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d5a280de"]]);
export {
  EPassCallback as default
};
//# sourceMappingURL=EPassCallback-BxsY1gft.js.map
