import { u as useAuthStore, a as api, _ as _export_sfc } from "./index-BrSJuu_a.js";
import { y as defineComponent, r as ref, l as onMounted, az as useRouter, z as createElementBlock, B as createBaseVNode, R as createVNode, L as createCommentVNode, J as withCtx, u as unref, P as toDisplayString, O as createTextVNode, A as openBlock } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, n as loading_default, a as ElIcon, aK as circle_close_filled_default, c as ElButton, aL as circle_check_filled_default } from "./element-Bcpu2TdA.js";
import { G as GlassConfirmModal } from "./GlassConfirmModal-D4JtkrJ7.js";
const _hoisted_1 = { class: "qq-callback-container" };
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
  __name: "QQCallback",
  setup(__props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(true);
    const error = ref("");
    const success = ref(false);
    const showConfirm = ref(false);
    const tempToken = ref("");
    const profile = ref({});
    onMounted(async () => {
      var _a, _b;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        if (!code) {
          throw new Error("授权码缺失");
        }
        const payload = { code };
        if (state) payload.state = state;
        const response = await api.post("/auth/qq/callback", payload);
        if (response.data.success) {
          if (response.data.needs_confirm || response.data.signup_required) {
            const t = response.data.tempToken;
            const avatar = ((_a = response.data.profile) == null ? void 0 : _a.avatar) || ((_b = response.data.qq) == null ? void 0 : _b.avatar) || "";
            router.replace({ name: "SignupConfirm", query: { provider: "qq", token: t, avatar } });
            return;
          }
          try {
            sessionStorage.setItem("bindingsRefresh", "1");
          } catch {
          }
          if (state === "bind") {
            success.value = true;
            ElMessage.success("QQ绑定成功，正在返回...");
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
          if (settings) {
            localStorage.setItem("userSettings", JSON.stringify(settings));
          }
          success.value = true;
          ElMessage.success("QQ登录成功！");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          throw new Error(response.data.message || "QQ登录失败");
        }
      } catch (err) {
        error.value = err.message || "QQ登录失败，请重试";
        loading.value = false;
      }
    });
    const goToLogin = () => {
      router.push("/login");
    };
    const confirmRegister = async () => {
      var _a, _b;
      try {
        const resp = await api.post("/auth/qq/confirm-register", { tempToken: tempToken.value });
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
            _cache[0] || (_cache[0] = createBaseVNode("p", null, "正在处理QQ登录...", -1))
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
            _cache[2] || (_cache[2] = createBaseVNode("p", null, "QQ登录成功！", -1)),
            _cache[3] || (_cache[3] = createBaseVNode("p", null, "正在跳转...", -1))
          ])) : createCommentVNode("", true)
        ]),
        createVNode(GlassConfirmModal, {
          visible: showConfirm.value,
          title: "是否注册并登录？",
          message: "检测到该 QQ 尚未在本站注册。是否立即注册并登录？",
          "confirm-text": "注册并登录",
          "cancel-text": "取消",
          avatar: profile.value.avatar,
          "provider-name": "QQ",
          onConfirm: confirmRegister,
          onCancel: cancelRegister
        }, null, 8, ["visible", "avatar"])
      ]);
    };
  }
});
const QQCallback = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bbf21fb3"]]);
export {
  QQCallback as default
};
//# sourceMappingURL=QQCallback-iFlAYoN3.js.map
