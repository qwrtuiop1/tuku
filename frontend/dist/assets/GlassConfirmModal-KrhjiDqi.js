import { y as defineComponent, r as ref, c as computed, w as watch, I as createBlock, z as createElementBlock, L as createCommentVNode, W as withModifiers, B as createBaseVNode, P as toDisplayString, D as normalizeStyle, E as normalizeClass, a1 as Teleport, A as openBlock } from "./vendor-DT2rKQnu.js";
import { _ as _export_sfc } from "./index-TR09GHHj.js";
const _hoisted_1 = { class: "modal-header" };
const _hoisted_2 = {
  key: 0,
  class: "avatar"
};
const _hoisted_3 = ["src"];
const _hoisted_4 = { class: "title-group" };
const _hoisted_5 = { class: "title" };
const _hoisted_6 = {
  key: 0,
  class: "subtitle"
};
const _hoisted_7 = { class: "modal-body" };
const _hoisted_8 = { class: "message" };
const _hoisted_9 = { class: "modal-actions" };
const _hoisted_10 = { class: "btn-label" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GlassConfirmModal",
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "确认操作" },
    message: { type: String, default: "" },
    confirmText: { type: String, default: "确认" },
    cancelText: { type: String, default: "取消" },
    avatar: { type: String, default: "" },
    providerName: { type: String, default: "" }
  },
  emits: ["confirm", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const cardRef = ref(null);
    const shrinkOut = ref(false);
    const origin = ref({ x: 0.5, y: 0.5 });
    const ripple = ref({ x: 0.5, y: 0.5 });
    const cardStyle = computed(() => ({
      transformOrigin: `${(origin.value.x * 100).toFixed(2)}% ${(origin.value.y * 100).toFixed(2)}%`
    }));
    const rippleStyle = computed(() => ({
      left: `${(ripple.value.x * 100).toFixed(2)}%`,
      top: `${(ripple.value.y * 100).toFixed(2)}%`
    }));
    const trackMouse = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      ripple.value = { x, y };
    };
    const handleConfirm = (e) => {
      setOrigin(e);
      shrinkOut.value = true;
      emit("confirm");
    };
    const handleCancel = (e) => {
      if (e) setOrigin(e);
      emit("cancel");
    };
    function setOrigin(e) {
      var _a;
      const rect = (_a = cardRef.value) == null ? void 0 : _a.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      origin.value = { x, y };
    }
    watch(() => props.visible, (v) => {
      if (!v) shrinkOut.value = false;
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, { to: "body" }, [
        __props.visible ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: "glass-modal-overlay",
          onClick: withModifiers(handleCancel, ["self"])
        }, [
          createBaseVNode("div", {
            ref_key: "cardRef",
            ref: cardRef,
            class: normalizeClass(["glass-modal-card", { "shrink-out": shrinkOut.value }]),
            style: normalizeStyle(cardStyle.value)
          }, [
            createBaseVNode("div", _hoisted_1, [
              __props.avatar ? (openBlock(), createElementBlock("div", _hoisted_2, [
                createBaseVNode("img", {
                  src: __props.avatar,
                  alt: "avatar"
                }, null, 8, _hoisted_3)
              ])) : createCommentVNode("", true),
              createBaseVNode("div", _hoisted_4, [
                createBaseVNode("h3", _hoisted_5, toDisplayString(__props.title), 1),
                __props.providerName ? (openBlock(), createElementBlock("p", _hoisted_6, "第三方：" + toDisplayString(__props.providerName), 1)) : createCommentVNode("", true)
              ])
            ]),
            createBaseVNode("div", _hoisted_7, [
              createBaseVNode("p", _hoisted_8, toDisplayString(__props.message), 1)
            ]),
            createBaseVNode("div", _hoisted_9, [
              createBaseVNode("button", {
                class: "btn btn-ghost",
                onClick: handleCancel,
                onMousemove: trackMouse
              }, toDisplayString(__props.cancelText), 33),
              createBaseVNode("button", {
                class: "btn btn-solid",
                onClick: handleConfirm,
                onMousemove: trackMouse
              }, [
                createBaseVNode("span", _hoisted_10, toDisplayString(__props.confirmText), 1),
                createBaseVNode("span", {
                  class: "ripple",
                  style: normalizeStyle(rippleStyle.value)
                }, null, 4)
              ], 32)
            ])
          ], 6)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const GlassConfirmModal = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2e607732"]]);
export {
  GlassConfirmModal as G
};
//# sourceMappingURL=GlassConfirmModal-KrhjiDqi.js.map
