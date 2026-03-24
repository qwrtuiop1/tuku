import { y as defineComponent, z as createElementBlock, B as createBaseVNode, ay as createStaticVNode, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { _ as _export_sfc } from "./index-h0KlDSqm.js";
import "./element-BbPUDzOb.js";
const _hoisted_1 = { class: "nf" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NotFound",
  setup(__props) {
    const router = useRouter();
    const goHome = () => {
      router.push("/");
    };
    const goBack = () => {
      router.go(-1);
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", { class: "grid" }, [
          _cache[2] || (_cache[2] = createBaseVNode("div", { class: "code" }, "404", -1)),
          _cache[3] || (_cache[3] = createBaseVNode("div", { class: "title" }, "页面不存在", -1)),
          _cache[4] || (_cache[4] = createBaseVNode("div", { class: "desc" }, "抱歉，您访问的页面不存在或已被删除", -1)),
          createBaseVNode("div", { class: "actions" }, [
            createBaseVNode("button", {
              class: "btn primary",
              onClick: goHome
            }, [..._cache[0] || (_cache[0] = [
              createBaseVNode("span", null, "返回首页", -1)
            ])]),
            createBaseVNode("button", {
              class: "btn ghost",
              onClick: goBack
            }, [..._cache[1] || (_cache[1] = [
              createBaseVNode("span", null, "返回上页", -1)
            ])])
          ])
        ]),
        _cache[5] || (_cache[5] = createStaticVNode('<div class="lines" aria-hidden="true" data-v-d04a8d10><div class="l l1" data-v-d04a8d10></div><div class="l l2" data-v-d04a8d10></div><div class="l l3" data-v-d04a8d10></div><div class="l l4" data-v-d04a8d10></div><div class="l l5" data-v-d04a8d10></div></div>', 1))
      ]);
    };
  }
});
const NotFound = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d04a8d10"]]);
export {
  NotFound as default
};
//# sourceMappingURL=NotFound-C29qZT-i.js.map
