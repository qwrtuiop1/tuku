import { a as api, _ as _export_sfc } from "./index-CN3YQEQK.js";
/* empty css                  */
import { y as defineComponent, r as ref, aD as useRoute, l as onMounted, U as onUnmounted, z as createElementBlock, I as createBlock, L as createCommentVNode, B as createBaseVNode, u as unref, R as createVNode, J as withCtx, O as createTextVNode, A as openBlock, n as nextTick } from "./vendor-DT2rKQnu.js";
import { c as ElButton, a6 as ElEmpty, E as ElMessage } from "./element-Bcpu2TdA.js";
const _hoisted_1 = { class: "live-share" };
const _hoisted_2 = {
  key: 0,
  class: "player-card"
};
const _hoisted_3 = {
  key: 0,
  class: "video-wrap"
};
const _hoisted_4 = ["poster"];
const _hoisted_5 = ["src"];
const _hoisted_6 = ["src"];
const _hoisted_7 = {
  key: 1,
  class: "poster-wrap"
};
const _hoisted_8 = ["src"];
const _hoisted_9 = {
  key: 2,
  class: "actions"
};
const _hoisted_10 = {
  key: 3,
  class: "hint"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LiveShare",
  setup(__props) {
    const route = useRoute();
    const videoRef = ref(null);
    const poster = decodeURIComponent(route.query.poster || "");
    const mp4 = decodeURIComponent(route.query.mp4 || "");
    const webm = decodeURIComponent(route.query.webm || "");
    const ended = ref(false);
    let poller = null;
    const disabled = ref(false);
    const applyDisabled = () => {
      var _a;
      disabled.value = true;
      try {
        (_a = videoRef.value) == null ? void 0 : _a.pause();
      } catch {
      }
    };
    const checkShareEnabled = async () => {
      try {
        const { data } = await api.get("/system/share-status");
        if (data && data.sharing_enabled === false) {
          applyDisabled();
          ElMessage.error("分享功能已关闭，链接已失效");
          return false;
        }
        return true;
      } catch (_) {
        return true;
      }
    };
    const onEnded = () => {
      ended.value = true;
    };
    onMounted(async () => {
      const ok = await checkShareEnabled();
      if (!ok) return;
      const v = videoRef.value;
      if (v) {
        v.play().catch(() => {
        });
      }
      poller = setInterval(checkShareEnabled, 2e3);
    });
    const replay = async () => {
      ended.value = false;
      await nextTick();
      const v = videoRef.value;
      if (v) {
        try {
          v.pause();
        } catch {
        }
        v.currentTime = 0;
        v.play().catch(() => {
        });
      }
    };
    onUnmounted(() => {
      if (poller) {
        clearInterval(poller);
        poller = null;
      }
    });
    return (_ctx, _cache) => {
      const _component_el_button = ElButton;
      const _component_el_empty = ElEmpty;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        !disabled.value ? (openBlock(), createElementBlock("div", _hoisted_2, [
          !ended.value ? (openBlock(), createElementBlock("div", _hoisted_3, [
            createBaseVNode("video", {
              ref_key: "videoRef",
              ref: videoRef,
              poster: unref(poster),
              controls: "",
              playsinline: "",
              "webkit-playsinline": "",
              autoplay: true,
              onEnded
            }, [
              unref(mp4) ? (openBlock(), createElementBlock("source", {
                key: 0,
                src: unref(mp4),
                type: "video/mp4"
              }, null, 8, _hoisted_5)) : createCommentVNode("", true),
              unref(webm) ? (openBlock(), createElementBlock("source", {
                key: 1,
                src: unref(webm),
                type: "video/webm"
              }, null, 8, _hoisted_6)) : createCommentVNode("", true)
            ], 40, _hoisted_4)
          ])) : (openBlock(), createElementBlock("div", _hoisted_7, [
            createBaseVNode("img", {
              src: unref(poster),
              alt: "poster"
            }, null, 8, _hoisted_8)
          ])),
          ended.value ? (openBlock(), createElementBlock("div", _hoisted_9, [
            createVNode(_component_el_button, {
              type: "primary",
              onClick: replay
            }, {
              default: withCtx(() => [..._cache[0] || (_cache[0] = [
                createTextVNode("查看动图", -1)
              ])]),
              _: 1
            })
          ])) : createCommentVNode("", true),
          !unref(mp4) && !unref(webm) && unref(poster) ? (openBlock(), createElementBlock("div", _hoisted_10, " 当前环境不支持视频播放，已展示静态图。 ")) : createCommentVNode("", true)
        ])) : (openBlock(), createBlock(_component_el_empty, {
          key: 1,
          description: "分享功能已关闭，链接已失效"
        }))
      ]);
    };
  }
});
const LiveShare = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1a48ea42"]]);
export {
  LiveShare as default
};
//# sourceMappingURL=LiveShare-hPwXUpI0.js.map
