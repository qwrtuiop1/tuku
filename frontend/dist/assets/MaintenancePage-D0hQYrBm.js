import { _ as _export_sfc } from "./index-Cm5Ur1oL.js";
/* empty css                 */
import { y as defineComponent, r as ref, l as onMounted, z as createElementBlock, B as createBaseVNode, R as createVNode, J as withCtx, u as unref, P as toDisplayString, O as createTextVNode, az as useRouter, A as openBlock } from "./vendor-DT2rKQnu.js";
import { ax as tools_default, a as ElIcon, a9 as clock_default, m as message_default, aO as phone_default, aN as info_filled_default, a1 as ElCard, K as refresh_default, c as ElButton, aP as back_default, E as ElMessage } from "./element-CUyZSw-d.js";
const _hoisted_1 = { class: "maintenance-page" };
const _hoisted_2 = { class: "maintenance-container" };
const _hoisted_3 = { class: "maintenance-icon" };
const _hoisted_4 = { class: "maintenance-info" };
const _hoisted_5 = { class: "card-header" };
const _hoisted_6 = { class: "info-content" };
const _hoisted_7 = { class: "info-item" };
const _hoisted_8 = { class: "info-item" };
const _hoisted_9 = { class: "info-item" };
const _hoisted_10 = { class: "maintenance-actions" };
const _hoisted_11 = { class: "maintenance-footer" };
const _hoisted_12 = { class: "copyright" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MaintenancePage",
  setup(__props) {
    const router = useRouter();
    const refreshing = ref(false);
    const maintenanceTime = ref("2-4小时");
    const maintenanceMessage = ref("系统升级优化，提升用户体验");
    const systemName = ref("图库系统");
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const refreshPage = async () => {
      refreshing.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        window.location.reload();
      } catch (error) {
        ElMessage.error("刷新失败");
        refreshing.value = false;
      }
    };
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    };
    const fetchMaintenanceInfo = async () => {
    };
    onMounted(() => {
      fetchMaintenanceInfo();
    });
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_card = ElCard;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createVNode(_component_el_icon, {
              size: "80",
              color: "#409eff"
            }, {
              default: withCtx(() => [
                createVNode(unref(tools_default))
              ]),
              _: 1
            })
          ]),
          _cache[5] || (_cache[5] = createBaseVNode("h1", { class: "maintenance-title" }, "系统维护中", -1)),
          _cache[6] || (_cache[6] = createBaseVNode("p", { class: "maintenance-description" }, " 系统正在进行维护升级，暂时无法提供服务 ", -1)),
          createBaseVNode("div", _hoisted_4, [
            createVNode(_component_el_card, { class: "info-card" }, {
              header: withCtx(() => [
                createBaseVNode("div", _hoisted_5, [
                  createVNode(_component_el_icon, null, {
                    default: withCtx(() => [
                      createVNode(unref(info_filled_default))
                    ]),
                    _: 1
                  }),
                  _cache[0] || (_cache[0] = createBaseVNode("span", null, "维护信息", -1))
                ])
              ]),
              default: withCtx(() => [
                createBaseVNode("div", _hoisted_6, [
                  createBaseVNode("div", _hoisted_7, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(clock_default))
                      ]),
                      _: 1
                    }),
                    createBaseVNode("span", null, "预计维护时间：" + toDisplayString(maintenanceTime.value), 1)
                  ]),
                  createBaseVNode("div", _hoisted_8, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(message_default))
                      ]),
                      _: 1
                    }),
                    createBaseVNode("span", null, "维护说明：" + toDisplayString(maintenanceMessage.value), 1)
                  ]),
                  createBaseVNode("div", _hoisted_9, [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(phone_default))
                      ]),
                      _: 1
                    }),
                    _cache[1] || (_cache[1] = createBaseVNode("span", null, "如有紧急事务，请联系管理员", -1))
                  ])
                ])
              ]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_10, [
            createVNode(_component_el_button, {
              type: "primary",
              onClick: refreshPage,
              loading: refreshing.value
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(refresh_default))
                  ]),
                  _: 1
                }),
                _cache[2] || (_cache[2] = createTextVNode(" 刷新页面 ", -1))
              ]),
              _: 1
            }, 8, ["loading"]),
            createVNode(_component_el_button, { onClick: goBack }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(unref(back_default))
                  ]),
                  _: 1
                }),
                _cache[3] || (_cache[3] = createTextVNode(" 返回上页 ", -1))
              ]),
              _: 1
            })
          ]),
          createBaseVNode("div", _hoisted_11, [
            _cache[4] || (_cache[4] = createBaseVNode("p", null, "感谢您的耐心等待", -1)),
            createBaseVNode("p", _hoisted_12, toDisplayString(systemName.value) + " © " + toDisplayString(unref(currentYear)), 1)
          ])
        ])
      ]);
    };
  }
});
const MaintenancePage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9baa2eaf"]]);
export {
  MaintenancePage as default
};
//# sourceMappingURL=MaintenancePage-D0hQYrBm.js.map
