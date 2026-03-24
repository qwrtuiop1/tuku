import { a as api, f as formatFileSize, _ as _export_sfc } from "./index-DbxwNbHT.js";
/* empty css                  */
import { y as defineComponent, aD as useRoute, r as ref, l as onMounted, U as onUnmounted, z as createElementBlock, I as createBlock, L as createCommentVNode, B as createBaseVNode, P as toDisplayString, u as unref, R as createVNode, J as withCtx, O as createTextVNode, A as openBlock } from "./vendor-DT2rKQnu.js";
import { c as ElButton, a6 as ElEmpty, E as ElMessage } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "share-view" };
const _hoisted_2 = {
  key: 0,
  class: "card"
};
const _hoisted_3 = { class: "title" };
const _hoisted_4 = { class: "meta" };
const _hoisted_5 = { key: 0 };
const _hoisted_6 = {
  key: 0,
  class: "preview"
};
const _hoisted_7 = ["src"];
const _hoisted_8 = ["src", "type"];
const _hoisted_9 = { class: "actions" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ShareViewer",
  setup(__props) {
    const route = useRoute();
    const token = route.params.token;
    const meta = ref(null);
    const loaded = ref(false);
    const previewUrl = ref(null);
    const downloadUrl = ref(null);
    const streamUrl = ref(null);
    const videoRef = ref(null);
    let poller = null;
    onMounted(async () => {
      try {
        const { data } = await api.get(`/share/${token}`);
        if (data && data.success) {
          meta.value = data;
          const base = "https://tukubackend.vtart.cn";
          const toAbs = (u) => {
            if (!u) return null;
            if (/^https?:\/\//i.test(u)) return u;
            return `${base}${u}`;
          };
          previewUrl.value = toAbs(data.preview_url);
          downloadUrl.value = toAbs(data.download_url);
          streamUrl.value = toAbs(data.stream_url);
        }
      } catch (_) {
        meta.value = null;
      } finally {
        loaded.value = true;
      }
      poller = setInterval(async () => {
        var _a;
        try {
          const { data } = await api.get("/system/share-status");
          if (data && data.sharing_enabled === false) {
            try {
              (_a = videoRef.value) == null ? void 0 : _a.pause();
            } catch {
            }
            meta.value = null;
            loaded.value = true;
          }
        } catch (_) {
        }
      }, 5e3);
    });
    const download = () => {
      if (!downloadUrl.value) return;
      const a = document.createElement("a");
      a.href = downloadUrl.value;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
      ElMessage.success("开始下载");
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
        loaded.value && meta.value ? (openBlock(), createElementBlock("div", _hoisted_2, [
          createBaseVNode("h2", _hoisted_3, toDisplayString(meta.value.file.original_name), 1),
          createBaseVNode("div", _hoisted_4, [
            createBaseVNode("span", null, toDisplayString(unref(formatFileSize)(meta.value.file.file_size || 0)), 1),
            meta.value.file.created_at ? (openBlock(), createElementBlock("span", _hoisted_5, " · " + toDisplayString(new Date(meta.value.file.created_at).toLocaleString()), 1)) : createCommentVNode("", true)
          ]),
          meta.value.allow_preview ? (openBlock(), createElementBlock("div", _hoisted_6, [
            meta.value.file.file_type === "image" && previewUrl.value ? (openBlock(), createElementBlock("img", {
              key: 0,
              src: previewUrl.value,
              alt: "preview"
            }, null, 8, _hoisted_7)) : meta.value.file.file_type === "video" && streamUrl.value ? (openBlock(), createElementBlock("video", {
              key: 1,
              ref_key: "videoRef",
              ref: videoRef,
              controls: "",
              playsinline: "",
              "webkit-playsinline": "",
              autoplay: true
            }, [
              createBaseVNode("source", {
                src: streamUrl.value,
                type: meta.value.file.mime_type || "video/mp4"
              }, null, 8, _hoisted_8)
            ], 512)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_9, [
            createVNode(_component_el_button, {
              type: "primary",
              disabled: !meta.value.allow_download || !downloadUrl.value,
              onClick: download
            }, {
              default: withCtx(() => [..._cache[0] || (_cache[0] = [
                createTextVNode("下载", -1)
              ])]),
              _: 1
            }, 8, ["disabled"])
          ])
        ])) : loaded.value ? (openBlock(), createBlock(_component_el_empty, {
          key: 1,
          description: "分享不存在或已过期"
        })) : createCommentVNode("", true)
      ]);
    };
  }
});
const ShareViewer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2daacfdc"]]);
export {
  ShareViewer as default
};
//# sourceMappingURL=ShareViewer-DodJXUlK.js.map
