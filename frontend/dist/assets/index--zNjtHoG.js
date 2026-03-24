const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Files-BiIQHGd_.js","assets/vendor-DT2rKQnu.js","assets/element-CUddkawN.js","assets/FilePreview-BA3E1t2T.js","assets/FilePreview-D6_7coJE.css","assets/el-tooltip-B1E_OvJu.css","assets/el-slider-DObYgh7C.css","assets/el-input-number-BThraEdc.css","assets/el-popper-Dfwo8GXA.css","assets/Files-Dw-hHDRn.css","assets/el-tag-CO2UKeRe.css","assets/el-select-O0SCLPOg.css","assets/el-scrollbar-JuKPLtAb.css","assets/el-overlay-BtkHQsWN.css","assets/el-pagination-BSIcaVrj.css","assets/el-table-column-CLT-mq3X.css","assets/el-breadcrumb-item-DVEVA2kC.css","assets/el-dropdown-item-Dbn8ZT3U.css","assets/Dashboard-DJx93R2S.js","assets/Dashboard-Bd_QEUtw.css","assets/el-empty-BosTTYP_.css","assets/el-card-BWE7AKUr.css","assets/el-alert-GLslyEgX.css","assets/el-avatar-CXr6uXHF.css","assets/AdminCenter-Dfb2YCgd.js","assets/AdminCenter-DX6oJGpd.css","assets/el-date-picker-panel-7ZE-yZWd.css","assets/el-radio-group-Cm8Z1iaG.css","assets/el-switch-Dh-rAQsy.css","assets/el-col-Cxkq2gIy.css","assets/el-menu-item-CC-X0ayz.css","assets/SettingsPage-66V3E3zQ.js","assets/SettingsPage-BG6LeZzu.css","assets/el-tab-pane-CBIEmiTI.css","assets/Login-DQ5fzAUg.js","assets/Login-DRu055RE.css","assets/EPassCallback-BH4T7X7d.js","assets/GlassConfirmModal-Cjhar67k.js","assets/GlassConfirmModal-Bvwu1Y6t.css","assets/EPassCallback-CuPBRsjn.css","assets/QQCallback-JRmmgJ5h.js","assets/QQCallback-Cc5Cn5eQ.css","assets/SignupConfirm-Dje1DpNG.js","assets/SignupConfirm-CcN08d-H.css","assets/ForgotPassword-_a7a1gL4.js","assets/ForgotPassword-DIxX5og5.css","assets/ResetPassword-BJzDRYYO.js","assets/ResetPassword-CM5muvUw.css","assets/MaintenancePage-DV63RorS.js","assets/MaintenancePage-DaX4xbZ2.css","assets/MainLayout-Bm197pW1.js","assets/MainLayout-Dn-Pw8-p.css","assets/LiveShare-t0_ZeSMg.js","assets/LiveShare-DO6VQV_h.css","assets/ShareViewer-Df0eB5A8.js","assets/ShareViewer-jo6nKHF-.css","assets/UserCenter-M5U7DDs8.js","assets/UserCenter-AR6ndJrn.css","assets/NotificationHistory-D6ZXMsuZ.js","assets/NotificationHistory-71gxUFZ_.css","assets/NotFound-CrrBeVqU.js","assets/NotFound-CGDc3gBc.css"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ax as defineStore, r as ref, c as computed, y as defineComponent, l as onMounted, z as createElementBlock, R as createVNode, J as withCtx, al as resolveComponent, A as openBlock, T as Transition, I as createBlock, M as resolveDynamicComponent, k as reactive, U as onUnmounted, B as createBaseVNode, ay as createStaticVNode, W as withModifiers, O as createTextVNode, u as unref, L as createCommentVNode, P as toDisplayString, E as normalizeClass, Q as Fragment, a6 as renderList, a4 as withKeys, az as useRouter, aA as createRouter, aB as createWebHistory, au as createApp, aC as createPinia } from "./vendor-DT2rKQnu.js";
import { E as ElMessage, a as ElIcon, b as ElForm, c as ElButton, p as picture_default, u as user_filled_default, d as ElFormItem, e as ElInput, f as user_default, m as message_default, l as lock_default, g as ElCheckbox, r as right_default, h as upload_default, i as folder_default, j as link_default, k as installer } from "./element-CUddkawN.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
/*! Element Plus v2.11.4 */
var zhCn = {
  name: "zh-cn",
  el: {
    breadcrumb: {
      label: "面包屑"
    },
    colorpicker: {
      confirm: "确定",
      clear: "清空",
      defaultLabel: "颜色选择器",
      description: "当前颜色 {color}，按 Enter 键选择新颜色",
      alphaLabel: "选择透明度的值"
    },
    datepicker: {
      now: "此刻",
      today: "今天",
      cancel: "取消",
      clear: "清空",
      confirm: "确定",
      dateTablePrompt: "使用方向键与 Enter 键可选择日期",
      monthTablePrompt: "使用方向键与 Enter 键可选择月份",
      yearTablePrompt: "使用方向键与 Enter 键可选择年份",
      selectedDate: "已选日期",
      selectDate: "选择日期",
      selectTime: "选择时间",
      startDate: "开始日期",
      startTime: "开始时间",
      endDate: "结束日期",
      endTime: "结束时间",
      prevYear: "前一年",
      nextYear: "后一年",
      prevMonth: "上个月",
      nextMonth: "下个月",
      year: "年",
      month1: "1 月",
      month2: "2 月",
      month3: "3 月",
      month4: "4 月",
      month5: "5 月",
      month6: "6 月",
      month7: "7 月",
      month8: "8 月",
      month9: "9 月",
      month10: "10 月",
      month11: "11 月",
      month12: "12 月",
      weeks: {
        sun: "日",
        mon: "一",
        tue: "二",
        wed: "三",
        thu: "四",
        fri: "五",
        sat: "六"
      },
      weeksFull: {
        sun: "星期日",
        mon: "星期一",
        tue: "星期二",
        wed: "星期三",
        thu: "星期四",
        fri: "星期五",
        sat: "星期六"
      },
      months: {
        jan: "一月",
        feb: "二月",
        mar: "三月",
        apr: "四月",
        may: "五月",
        jun: "六月",
        jul: "七月",
        aug: "八月",
        sep: "九月",
        oct: "十月",
        nov: "十一月",
        dec: "十二月"
      }
    },
    inputNumber: {
      decrease: "减少数值",
      increase: "增加数值"
    },
    select: {
      loading: "加载中",
      noMatch: "无匹配数据",
      noData: "无数据",
      placeholder: "请选择"
    },
    dropdown: {
      toggleDropdown: "切换下拉选项"
    },
    mention: {
      loading: "加载中"
    },
    cascader: {
      noMatch: "无匹配数据",
      loading: "加载中",
      placeholder: "请选择",
      noData: "暂无数据"
    },
    pagination: {
      goto: "前往",
      pagesize: "条/页",
      total: "共 {total} 条",
      pageClassifier: "页",
      page: "页",
      prev: "上一页",
      next: "下一页",
      currentPage: "第 {pager} 页",
      prevPages: "向前 {pager} 页",
      nextPages: "向后 {pager} 页",
      deprecationWarning: "你使用了一些已被废弃的用法，请参考 el-pagination 的官方文档"
    },
    dialog: {
      close: "关闭此对话框"
    },
    drawer: {
      close: "关闭此对话框"
    },
    messagebox: {
      title: "提示",
      confirm: "确定",
      cancel: "取消",
      error: "输入的数据不合法!",
      close: "关闭此对话框"
    },
    upload: {
      deleteTip: "按 Delete 键可删除",
      delete: "删除",
      preview: "查看图片",
      continue: "继续上传"
    },
    slider: {
      defaultLabel: "滑块介于 {min} 至 {max}",
      defaultRangeStartLabel: "选择起始值",
      defaultRangeEndLabel: "选择结束值"
    },
    table: {
      emptyText: "暂无数据",
      confirmFilter: "筛选",
      resetFilter: "重置",
      clearFilter: "全部",
      sumText: "合计"
    },
    tour: {
      next: "下一步",
      previous: "上一步",
      finish: "结束导览",
      close: "关闭此对话框"
    },
    tree: {
      emptyText: "暂无数据"
    },
    transfer: {
      noMatch: "无匹配数据",
      noData: "无数据",
      titles: ["列表 1", "列表 2"],
      filterPlaceholder: "请输入搜索内容",
      noCheckedFormat: "共 {total} 项",
      hasCheckedFormat: "已选 {checked}/{total} 项"
    },
    image: {
      error: "加载失败"
    },
    pageHeader: {
      title: "返回"
    },
    popconfirm: {
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    },
    carousel: {
      leftArrow: "上一张幻灯片",
      rightArrow: "下一张幻灯片",
      indicator: "幻灯片切换至索引 {index}"
    }
  }
};
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction$1 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$1(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$1(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$1(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$1(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$1(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$1,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$1.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$1.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$1.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  if (utils$1.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed2 = new this(first);
    targets.forEach((target) => computed2.set(target));
    return computed2;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils$1.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure) {
      const cookie = [name + "=" + encodeURIComponent(value)];
      utils$1.isNumber(expires) && cookie.push("expires=" + new Date(expires).toGMTString());
      utils$1.isString(path) && cookie.push("path=" + path);
      utils$1.isString(domain) && cookie.push("domain=" + domain);
      secure === true && cookie.push("secure");
      document.cookie = cookie.join("; ");
    },
    read(name) {
      const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
      return match ? decodeURIComponent(match[3]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config) => {
  let env = config ? config.env : {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
const adapters = {
  getAdapter: (adapters2, config) => {
    adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
    const { length } = adapters2;
    let nameOrAdapter;
    let adapter;
    const rejectedReasons = {};
    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters2[i];
      let id;
      adapter = nameOrAdapter;
      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
        if (adapter === void 0) {
          throw new AxiosError$1(`Unknown adapter '${id}'`);
        }
      }
      if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
        break;
      }
      rejectedReasons[id || "#" + i] = adapter;
    }
    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
      );
      let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
      throw new AxiosError$1(
        `There is no suitable adapter to dispatch the request ` + s,
        "ERR_NOT_SUPPORT"
      );
    }
    return adapter;
  },
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.12.2";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1e3,
  // 1秒
  retryDelayMultiplier: 2
  // 每次重试延迟翻倍
};
const retryRequest = async (config, retryCount = 0) => {
  var _a;
  try {
    return await axios(config);
  } catch (error) {
    if (((_a = error.response) == null ? void 0 : _a.status) === 429 && retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryDelayMultiplier, retryCount);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};
const api = axios.create({
  // 开发环境使用相对路径，通过 Vite proxy 转发
  // 生产环境使用空字符串，配合 baseURL 的 /api 前缀
  baseURL: `${"https://tukubackend.vtart.cn"}/api`,
  timeout: 3e4,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;
    if (response) {
      const { status, data } = response;
      switch (status) {
        case 401:
          const authStore = useAuthStore();
          authStore.logout();
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;
        case 400:
          ElMessage.error(data.message || "请求失败");
          break;
        case 403:
          if (data.code === "ACCOUNT_DISABLED") ;
          else {
            ElMessage.error(data.message || "权限不足");
          }
          break;
        case 404:
          ElMessage.error("请求的资源不存在");
          break;
        case 422:
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              ElMessage.error(err.msg || err.message);
            });
          } else {
            ElMessage.error(data.message || "数据验证失败");
          }
          break;
        case 429:
          try {
            return await retryRequest(config);
          } catch (retryError) {
            ElMessage.warning({
              message: "请求过于频繁，请稍后再试",
              duration: 3e3,
              showClose: true
            });
          }
          break;
        case 500:
          ElMessage.error("服务器内部错误");
          break;
        default:
          ElMessage.error(data.message || "请求失败");
      }
    } else if (error.code === "ECONNABORTED") {
      ElMessage.error("请求超时");
    } else if (error.message === "Network Error") {
      ElMessage.error("网络连接失败");
    } else {
      ElMessage.error("请求失败");
    }
    return Promise.reject(error);
  }
);
const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isValidJWTToken = (tokenValue) => {
    if (!tokenValue) return false;
    try {
      const payload = JSON.parse(atob(tokenValue.split(".")[1]));
      const now = Math.floor(Date.now() / 1e3);
      if (payload.exp && payload.exp < now) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  const getValidToken = () => {
    const localToken = localStorage.getItem("token");
    if (localToken && isValidJWTToken(localToken)) {
      return localToken;
    }
    const sessionToken = sessionStorage.getItem("token");
    if (sessionToken && isValidJWTToken(sessionToken)) {
      return sessionToken;
    }
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tokenExpiry");
    return null;
  };
  const token = ref(getValidToken());
  const loading = ref(false);
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => {
    var _a;
    return ((_a = user.value) == null ? void 0 : _a.role) === "admin";
  });
  const storageUsage = computed(() => {
    if (!user.value) return 0;
    return user.value.used_storage / user.value.storage_limit * 100;
  });
  const login = async (credentials) => {
    var _a;
    loading.value = true;
    try {
      const response = await api.post("/auth/login", credentials);
      const { token: newToken, user: userData } = response.data;
      if (userData.avatar_url && !userData.avatar_url.startsWith("http")) {
        const baseUrl = "https://tukubackend.vtart.cn";
        userData.avatar_url = baseUrl + userData.avatar_url;
      }
      token.value = newToken;
      user.value = userData;
      if (credentials.rememberMe) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("rememberMe", "true");
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", newToken);
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("token");
      }
      ElMessage.success("登录成功");
      return true;
    } catch (error) {
      const errorData = (_a = error.response) == null ? void 0 : _a.data;
      if ((errorData == null ? void 0 : errorData.code) === "ACCOUNT_DISABLED") {
        ElMessage.error({
          message: "账户已被禁用，请联系管理员",
          duration: 5e3,
          showClose: true
        });
      } else {
        ElMessage.error((errorData == null ? void 0 : errorData.message) || "登录失败");
      }
      return false;
    } finally {
      loading.value = false;
    }
  };
  const register = async (userData) => {
    var _a, _b;
    loading.value = true;
    try {
      const response = await api.post("/auth/register", userData);
      const { token: newToken, user: userInfo } = response.data;
      if (userInfo.avatar_url && !userInfo.avatar_url.startsWith("http")) {
        const baseUrl = "https://tukubackend.vtart.cn";
        userInfo.avatar_url = baseUrl + userInfo.avatar_url;
      }
      token.value = newToken;
      user.value = userInfo;
      localStorage.setItem("token", newToken);
      ElMessage.success("注册成功");
      return true;
    } catch (error) {
      ElMessage.error(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "注册失败");
      return false;
    } finally {
      loading.value = false;
    }
  };
  const logout = (showMessage = true) => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    if (showMessage) {
      ElMessage.success("已登出");
    }
  };
  const refreshTokenIfNeeded = async () => {
    if (!token.value) return false;
    try {
      const payload = JSON.parse(atob(token.value.split(".")[1]));
      const now = Math.floor(Date.now() / 1e3);
      const hoursUntilExpiry = (payload.exp - now) / 3600;
      if (hoursUntilExpiry < 24 && hoursUntilExpiry > 0) {
        const response = await api.post("/auth/refresh", { token: token.value });
        if (response.data.success) {
          const { token: newToken } = response.data;
          token.value = newToken;
          if (localStorage.getItem("token")) {
            localStorage.setItem("token", newToken);
          } else if (sessionStorage.getItem("token")) {
            sessionStorage.setItem("token", newToken);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  const checkAuth = async () => {
    var _a;
    if (!token.value) return false;
    await refreshTokenIfNeeded();
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.user;
      if (userData.avatar_url && !userData.avatar_url.startsWith("http")) {
        const baseUrl = "https://tukubackend.vtart.cn";
        userData.avatar_url = baseUrl + userData.avatar_url;
      }
      user.value = userData;
      return true;
    } catch (error) {
      const errorData = (_a = error.response) == null ? void 0 : _a.data;
      if ((errorData == null ? void 0 : errorData.code) === "ACCOUNT_DISABLED") {
        ElMessage.error({
          message: "账户已被禁用，请联系管理员",
          duration: 5e3,
          showClose: true
        });
      }
      logout(false);
      return false;
    }
  };
  const updateUser = (userData) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
    }
  };
  const forgotPassword = async (email) => {
    var _a;
    try {
      loading.value = true;
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data.success) {
        ElMessage.success("重置链接已发送到您的邮箱");
        return true;
      } else {
        ElMessage.error(response.data.message || "发送失败");
        return false;
      }
    } catch (error) {
      const errorData = (_a = error.response) == null ? void 0 : _a.data;
      ElMessage.error((errorData == null ? void 0 : errorData.message) || "发送失败，请稍后重试");
      return false;
    } finally {
      loading.value = false;
    }
  };
  const resetPassword = async (token2, newPassword) => {
    var _a;
    try {
      loading.value = true;
      const response = await api.post("/auth/reset-password", {
        token: token2,
        password: newPassword
      });
      if (response.data.success) {
        return true;
      } else {
        ElMessage.error(response.data.message || "重置失败");
        return false;
      }
    } catch (error) {
      const errorData = (_a = error.response) == null ? void 0 : _a.data;
      ElMessage.error((errorData == null ? void 0 : errorData.message) || "重置失败，请稍后重试");
      return false;
    } finally {
      loading.value = false;
    }
  };
  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    storageUsage,
    login,
    register,
    logout,
    checkAuth,
    refreshTokenIfNeeded,
    updateUser,
    forgotPassword,
    resetPassword
  };
});
const _hoisted_1$1 = { id: "app" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    const authStore = useAuthStore();
    onMounted(() => {
      var _a;
      authStore.checkAuth();
      if ("requestIdleCallback" in window) {
        (_a = window.requestIdleCallback) == null ? void 0 : _a.call(window, () => {
          const toPreload = [
            () => __vitePreload(() => import("./Files-BiIQHGd_.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]) : void 0),
            () => __vitePreload(() => import("./Dashboard-DJx93R2S.js"), true ? __vite__mapDeps([18,1,2,3,4,5,6,7,8,19,13,20,21,22,23]) : void 0),
            () => __vitePreload(() => import("./AdminCenter-Dfb2YCgd.js"), true ? __vite__mapDeps([24,1,2,25,26,13,6,7,5,8,27,28,15,12,10,20,17,23,11,29,21,30]) : void 0),
            () => __vitePreload(() => import("./SettingsPage-66V3E3zQ.js"), true ? __vite__mapDeps([31,2,1,32,21,22,33,10,11,12,8,28,7]) : void 0)
          ];
          toPreload.forEach((loader) => loader().catch(() => {
          }));
        }, { timeout: 2e3 });
      } else {
        setTimeout(() => {
          Promise.allSettled([
            __vitePreload(() => import("./Files-BiIQHGd_.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]) : void 0),
            __vitePreload(() => import("./Dashboard-DJx93R2S.js"), true ? __vite__mapDeps([18,1,2,3,4,5,6,7,8,19,13,20,21,22,23]) : void 0),
            __vitePreload(() => import("./AdminCenter-Dfb2YCgd.js"), true ? __vite__mapDeps([24,1,2,25,26,13,6,7,5,8,27,28,15,12,10,20,17,23,11,29,21,30]) : void 0),
            __vitePreload(() => import("./SettingsPage-66V3E3zQ.js"), true ? __vite__mapDeps([31,2,1,32,21,22,33,10,11,12,8,28,7]) : void 0)
          ]);
        }, 2e3);
      }
    });
    return (_ctx, _cache) => {
      const _component_router_view = resolveComponent("router-view");
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createVNode(_component_router_view, null, {
          default: withCtx(({ Component, route }) => [
            createVNode(Transition, {
              name: route.meta && route.meta.transition || "page-fade",
              mode: "out-in"
            }, {
              default: withCtx(() => [
                (openBlock(), createBlock(resolveDynamicComponent(Component), {
                  key: route.fullPath
                }))
              ]),
              _: 2
            }, 1032, ["name"])
          ]),
          _: 1
        })
      ]);
    };
  }
});
class ImageCacheService {
  constructor() {
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "MAX_CACHE_SIZE", 50);
    // 最大缓存数量
    __publicField(this, "CACHE_EXPIRY", 24 * 60 * 60 * 1e3);
  }
  // 24小时过期
  // 生成缓存键
  getCacheKey(fileId, token) {
    return `${fileId}_${token.slice(-8)}`;
  }
  // 检查缓存是否存在且有效
  hasCache(fileId, token) {
    const key = this.getCacheKey(fileId, token);
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  // 获取缓存的图片URL
  getCacheUrl(fileId, token) {
    const key = this.getCacheKey(fileId, token);
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
      this.cache.delete(key);
      return null;
    }
    return item.url;
  }
  // 缓存图片
  async cacheImage(fileId, token, imageUrl) {
    try {
      if (this.hasCache(fileId, token)) {
        return;
      }
      this.cleanExpiredCache();
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.removeOldestCache();
      }
      let response = null;
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(imageUrl, {
            method: "GET",
            headers: {
              "Accept": "image/*"
            },
            // 添加超时控制
            signal: AbortSignal.timeout(1e4)
            // 10秒超时
          });
          if (response.ok) {
            break;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          lastError = error;
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
          }
        }
      }
      if (!response || !response.ok) {
        throw lastError || new Error("图片获取失败");
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("图片数据为空");
      }
      const url = URL.createObjectURL(blob);
      const key = this.getCacheKey(fileId, token);
      this.cache.set(key, {
        url,
        blob,
        timestamp: Date.now(),
        fileId
      });
    } catch (error) {
    }
  }
  // 清理过期缓存
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.CACHE_EXPIRY) {
        URL.revokeObjectURL(item.url);
        this.cache.delete(key);
      }
    }
  }
  // 删除最旧的缓存
  removeOldestCache() {
    let oldestKey = "";
    let oldestTime = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      const item = this.cache.get(oldestKey);
      if (item) {
        URL.revokeObjectURL(item.url);
        this.cache.delete(oldestKey);
      }
    }
  }
  // 清除所有缓存
  clearCache() {
    for (const item of this.cache.values()) {
      URL.revokeObjectURL(item.url);
    }
    this.cache.clear();
  }
  // 获取缓存统计信息
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}
const imageCache = new ImageCacheService();
const formatFileSize = (bytes) => {
  if (bytes === null || bytes === void 0 || bytes === "" || isNaN(Number(bytes))) {
    return "0 B";
  }
  const numBytes = Number(bytes);
  if (numBytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const formatTime = (date) => {
  const d = new Date(date);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - d.getTime();
  const minute = 60 * 1e3;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  if (diff < minute) {
    return "刚刚";
  } else if (diff < hour) {
    return Math.floor(diff / minute) + "分钟前";
  } else if (diff < day) {
    return Math.floor(diff / hour) + "小时前";
  } else if (diff < week) {
    return Math.floor(diff / day) + "天前";
  } else if (diff < month) {
    return Math.floor(diff / week) + "周前";
  } else {
    return d.toLocaleDateString("zh-CN");
  }
};
function getApiOriginForStaticAssets() {
  var _a;
  const raw = "https://tukubackend.vtart.cn";
  let base = raw.trim();
  if (base) {
    base = base.replace(/\/+$/, "");
    if (/\/api$/i.test(base)) base = base.replace(/\/api$/i, "");
    return base;
  }
  if (typeof window !== "undefined" && ((_a = window.location) == null ? void 0 : _a.origin)) {
    return window.location.origin;
  }
  return "https://tukubackend.vtart.cn";
}
const getFilePreviewUrl = (fileId) => {
  let token = null;
  const localToken = localStorage.getItem("token");
  if (localToken) {
    try {
      const parts = localToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1e3);
        if (payload.exp && payload.exp > now) {
          token = localToken;
        }
      }
    } catch (error) {
    }
  }
  if (!token) {
    const sessionToken = sessionStorage.getItem("token");
    if (sessionToken) {
      try {
        const parts = sessionToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1e3);
          if (payload.exp && payload.exp > now) {
            token = sessionToken;
          }
        }
      } catch (error) {
      }
    }
  }
  const baseUrl = getApiOriginForStaticAssets();
  if (token) {
    return `${baseUrl}/api/files/preview/${fileId}?token=${token}`;
  } else {
    return `${baseUrl}/api/files/preview/${fileId}`;
  }
};
const getCachedImageUrl = async (fileId) => {
  let token = null;
  const localToken = localStorage.getItem("token");
  if (localToken) {
    try {
      const parts = localToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1e3);
        if (payload.exp && payload.exp > now) {
          token = localToken;
        }
      }
    } catch (error) {
    }
  }
  if (!token) {
    const sessionToken = sessionStorage.getItem("token");
    if (sessionToken) {
      try {
        const parts = sessionToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1e3);
          if (payload.exp && payload.exp > now) {
            token = sessionToken;
          }
        }
      } catch (error) {
      }
    }
  }
  if (!token) {
    return getFilePreviewUrl(fileId);
  }
  const cachedUrl = imageCache.getCacheUrl(fileId, token);
  if (cachedUrl) {
    return cachedUrl;
  }
  const originalUrl = getFilePreviewUrl(fileId);
  imageCache.cacheImage(fileId, token, originalUrl).catch((error) => {
  });
  return originalUrl;
};
const downloadFile = (fileId, filename) => {
  const previewUrl = getFilePreviewUrl(fileId);
  const url = previewUrl + (previewUrl.includes("?") ? "&" : "?") + "download=true";
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_self";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  }
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http")) {
    return avatarUrl.replace(/^http:\/\//i, "https://");
  }
  const baseUrl = getApiOriginForStaticAssets();
  return `${baseUrl}${avatarUrl}`;
};
const isValidUsername = (username) => {
  const usernameRegex = /^[^\s@]{2,20}$/;
  return usernameRegex.test(username);
};
const formatPercentage = (value) => {
  if (isNaN(value) || value === null || value === void 0) return "0.00%";
  if (value === 0) return "0.00%";
  const truncated = Math.floor(value * 100) / 100;
  return truncated.toFixed(2) + "%";
};
const getStorageUsageColor = (percent) => {
  if (percent < 70) return "#67c23a";
  if (percent < 90) return "#e6a23c";
  return "#f56c6c";
};
function useEmailCode(options) {
  const isSending = ref(false);
  const emailCodeCooldown = ref(0);
  let cooldownTimer = null;
  const startEmailCodeCooldown = (seconds = (options == null ? void 0 : options.defaultCooldownSeconds) ?? 60) => {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
    emailCodeCooldown.value = seconds;
    cooldownTimer = setInterval(() => {
      emailCodeCooldown.value--;
      if (emailCodeCooldown.value <= 0) {
        if (cooldownTimer) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
        }
        emailCodeCooldown.value = 0;
      }
    }, 1e3);
  };
  const clearEmailCodeCooldown = () => {
    if (cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
    emailCodeCooldown.value = 0;
  };
  const geetestScriptUrl2 = "https://static.geetest.com/v4/gt4.js";
  const geetestCaptchaId = "30d77075542cc161d6518051a937b9a0";
  let geetestHandler = null;
  const geetestReady = ref(false);
  const geetestMaxWaitMs2 = 12e3;
  const loadScriptOnce = (src) => new Promise((resolve, reject) => {
    const exists = Array.from(document.scripts).some((s2) => s2.src === src);
    if (exists) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("geetest script load failed"));
    document.head.appendChild(s);
  });
  const ensureGeetest = async () => {
    if (geetestReady.value && geetestHandler) return true;
    await loadScriptOnce(geetestScriptUrl2);
    const initGeetest4 = window.initGeetest4;
    if (!initGeetest4) return false;
    return await new Promise((resolve) => {
      try {
        initGeetest4({ captchaId: geetestCaptchaId, product: "bind", language: "zho", timeout: 15e3 }, (handler) => {
          var _a;
          geetestHandler = handler;
          geetestReady.value = !!handler;
          try {
            (_a = geetestHandler == null ? void 0 : geetestHandler.onReady) == null ? void 0 : _a.call(geetestHandler, () => {
            });
          } catch {
          }
          resolve(geetestReady.value);
        });
      } catch {
        resolve(false);
      }
    });
  };
  const internalRunHuman = async () => {
    const ok = await ensureGeetest();
    if (!ok || !geetestHandler) return false;
    return await new Promise((resolve) => {
      var _a, _b, _c;
      let settled = false;
      const onSuccess = async () => {
        var _a2, _b2, _c2;
        if (settled) return;
        settled = true;
        try {
          const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null;
          if (!validate) {
            ElMessage.error("请完成人机验证");
            return resolve(false);
          }
          const { lot_number, captcha_output, pass_token, gen_time } = validate;
          const resp = await api.post("/auth/captcha/validate", {
            lot_number,
            captcha_output,
            pass_token,
            gen_time,
            captcha_id: geetestCaptchaId
          });
          if (((_a2 = resp == null ? void 0 : resp.data) == null ? void 0 : _a2.success) || ((_b2 = resp == null ? void 0 : resp.data) == null ? void 0 : _b2.result) === "success") return resolve(true);
          ElMessage.error(((_c2 = resp == null ? void 0 : resp.data) == null ? void 0 : _c2.message) || "人机验证失败");
          resolve(false);
        } catch {
          ElMessage.error("人机验证服务异常，请稍后重试");
          resolve(false);
        }
      };
      try {
        (_a = geetestHandler == null ? void 0 : geetestHandler.onSuccess) == null ? void 0 : _a.call(geetestHandler, onSuccess);
        (_b = geetestHandler == null ? void 0 : geetestHandler.onError) == null ? void 0 : _b.call(geetestHandler, () => {
          if (!settled) {
            settled = true;
            ElMessage.error("人机验证出错");
            resolve(false);
          }
        });
        (_c = geetestHandler == null ? void 0 : geetestHandler.onClose) == null ? void 0 : _c.call(geetestHandler, () => {
          if (!settled) {
            settled = true;
            ElMessage.warning("请先完成人机验证");
            resolve(false);
          }
        });
        if (geetestHandler.showCaptcha) geetestHandler.showCaptcha();
        else if (geetestHandler.showBox) geetestHandler.showBox();
        setTimeout(() => {
          if (!settled) {
            settled = true;
            ElMessage.warning("验证超时，请重试");
            resolve(false);
          }
        }, geetestMaxWaitMs2);
      } catch {
        resolve(false);
      }
    });
  };
  const runHuman = async () => {
    if (options == null ? void 0 : options.runHuman) return await options.runHuman();
    return await internalRunHuman();
  };
  const sendEmailCodeWithHuman = async (email, type) => {
    var _a, _b, _c, _d, _e;
    if (!email) {
      ElMessage.warning("请先输入邮箱");
      return false;
    }
    const humanOk = await runHuman();
    if (!humanOk) return false;
    try {
      isSending.value = true;
      const resp = await api.post("/auth/send-email-code", { email, type });
      if ((_a = resp.data) == null ? void 0 : _a.success) {
        ElMessage.success("验证码已发送到邮箱");
        startEmailCodeCooldown(60);
        return true;
      }
      ElMessage.error(((_b = resp.data) == null ? void 0 : _b.message) || "发送失败");
      return false;
    } catch (e) {
      if (((_c = e == null ? void 0 : e.response) == null ? void 0 : _c.status) === 429) {
        ElMessage.error("操作过于频繁，请稍后再试");
        startEmailCodeCooldown(60);
      } else {
        ElMessage.error(((_e = (_d = e == null ? void 0 : e.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) || "发送失败");
      }
      return false;
    } finally {
      isSending.value = false;
    }
  };
  return {
    // state
    isSending,
    emailCodeCooldown,
    // actions
    startEmailCodeCooldown,
    clearEmailCodeCooldown,
    sendEmailCodeWithHuman,
    runHuman
  };
}
const _hoisted_1 = { class: "register-container" };
const _hoisted_2 = { class: "top-nav" };
const _hoisted_3 = { class: "nav-content" };
const _hoisted_4 = { class: "nav-logo" };
const _hoisted_5 = { class: "register-content" };
const _hoisted_6 = { class: "register-box" };
const _hoisted_7 = { class: "register-header" };
const _hoisted_8 = { class: "header-icon" };
const _hoisted_9 = {
  key: 0,
  class: "email-verification-section"
};
const _hoisted_10 = { class: "verification-input-row" };
const _hoisted_11 = {
  key: 0,
  class: "code-tips"
};
const _hoisted_12 = { class: "code-timer" };
const _hoisted_13 = {
  key: 0,
  class: "password-hint"
};
const _hoisted_14 = { class: "password-strength" };
const _hoisted_15 = {
  key: 0,
  class: "password-requirements"
};
const _hoisted_16 = { class: "requirement-list" };
const _hoisted_17 = { class: "social-register" };
const _hoisted_18 = { class: "social-btn-wrapper" };
const _hoisted_19 = { class: "social-btn-wrapper" };
const _hoisted_20 = { class: "register-footer" };
const _hoisted_21 = { class: "login-link" };
const _hoisted_22 = { class: "info-panel" };
const _hoisted_23 = { class: "panel-content" };
const _hoisted_24 = { class: "benefit-list" };
const _hoisted_25 = { class: "benefit-item" };
const _hoisted_26 = { class: "benefit-item" };
const _hoisted_27 = { class: "benefit-item" };
const _hoisted_28 = { class: "benefit-item" };
const geetestScriptUrl = "https://static.geetest.com/v4/gt4.js";
const geetestMaxWaitMs = 12e3;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Register",
  setup(__props) {
    const router2 = useRouter();
    const authStore = useAuthStore();
    computed(() => {
      return window.innerWidth <= 768;
    });
    const registerFormRef = ref();
    const registerForm = reactive({
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    });
    const agreeTerms = ref(false);
    const passwordStrength = reactive({
      level: "weak",
      text: "弱",
      hints: []
    });
    const emailCode = ref("");
    const showEmailCodeInput = ref(false);
    const { emailCodeCooldown, startEmailCodeCooldown, sendEmailCodeWithHuman } = useEmailCode({ defaultCooldownSeconds: 60, runHuman: runHumanVerification });
    const codeExpireTime = ref(0);
    const codeExpireTimer = ref(null);
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
    async function runHumanVerification() {
      const ok = await ensureGeetest();
      if (!ok || !geetestHandler) return false;
      return new Promise((resolve) => {
        let settled = false;
        let popupShown = false;
        try {
          ElMessage.info("正在拉起人机验证...", { duration: 1200 });
        } catch {
        }
        const onSuccess = async () => {
          var _a;
          try {
            const validate = geetestHandler.getValidate ? geetestHandler.getValidate() : null;
            if (!validate) return resolve(false);
            const { lot_number, captcha_output, pass_token, gen_time } = validate;
            const resp = await api.post("/auth/captcha/validate", {
              lot_number,
              captcha_output,
              pass_token,
              gen_time,
              sign_token: validate.sign_token,
              captcha_id: geetestCaptchaId
            });
            settled = true;
            resolve(((_a = resp.data) == null ? void 0 : _a.success) === true);
          } catch (e) {
            settled = true;
            try {
              ElMessage.error("二次校验失败，请重试");
            } catch {
            }
            resolve(false);
          }
        };
        if (geetestHandler.onSuccess) geetestHandler.onSuccess(onSuccess);
        if (geetestHandler.onError) geetestHandler.onError(() => {
          if (!settled) {
            settled = true;
            try {
              ElMessage.error("人机验证出错，请关闭拦截或更换网络后重试");
            } catch {
            }
            resolve(false);
          }
        });
        if (geetestHandler.onClose) geetestHandler.onClose(() => {
          if (!settled) {
            settled = true;
            try {
              ElMessage.warning("请先完成人机验证");
            } catch {
            }
            resolve(false);
          }
        });
        const showIt = () => {
          popupShown = true;
          if (geetestHandler.showCaptcha) geetestHandler.showCaptcha();
          else if (geetestHandler.showBox) geetestHandler.showBox();
          else onSuccess();
        };
        try {
          showIt();
        } catch {
        }
        if (geetestHandler.onReady) geetestHandler.onReady(() => {
          popupShown = true;
          showIt();
        });
        setTimeout(() => {
          if (!settled) {
            settled = true;
            if (!popupShown) {
              try {
                ElMessage.error("人机验证超时，请重试或检查拦截设置");
              } catch {
              }
            }
            resolve(false);
          }
        }, geetestMaxWaitMs);
      });
    }
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入用户名"));
      } else if (!isValidUsername(value)) {
        callback(new Error("用户名只能包含字母、数字和下划线，长度3-20位"));
      } else if (value.includes("@")) {
        callback(new Error("用户名不能使用邮箱格式"));
      } else {
        callback();
      }
    };
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入邮箱地址"));
      } else if (!isValidEmail(value)) {
        callback(new Error("请输入有效的邮箱地址"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入密码"));
      } else if (value.length < 6) {
        callback(new Error("密码长度不能少于6位"));
      } else {
        callback();
      }
    };
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请确认密码"));
      } else if (value !== registerForm.password) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    const checkPasswordStrength = () => {
      const password = registerForm.password;
      if (!password) {
        passwordStrength.level = "weak";
        passwordStrength.text = "弱";
        passwordStrength.hints = [];
        return;
      }
      const hints = [];
      let score = 0;
      if (password.length < 6) {
        hints.push("至少6个字符");
      } else {
        score++;
      }
      if (!/[a-z]/.test(password)) {
        hints.push("包含小写字母");
      } else {
        score++;
      }
      if (!/[A-Z]/.test(password)) {
        hints.push("包含大写字母");
      } else {
        score++;
      }
      if (!/[0-9]/.test(password)) {
        hints.push("包含数字");
      } else {
        score++;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        hints.push("包含特殊字符");
      } else {
        score++;
      }
      if (score >= 4) {
        passwordStrength.level = "strong";
        passwordStrength.text = "强";
      } else if (score >= 2) {
        passwordStrength.level = "medium";
        passwordStrength.text = "中";
      } else {
        passwordStrength.level = "weak";
        passwordStrength.text = "弱";
      }
      passwordStrength.hints = hints;
    };
    const registerRules = {
      username: [{ validator: validateUsername, trigger: "blur" }],
      email: [{ validator: validateEmail, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }]
    };
    const sendEmailCode = async () => {
      if (!registerForm.email) {
        ElMessage.warning("请先输入邮箱地址");
        return;
      }
      if (!isValidEmail(registerForm.email)) {
        ElMessage.warning("请输入有效的邮箱地址");
        return;
      }
      const ok = await sendEmailCodeWithHuman(registerForm.email, "verify_email");
      if (ok) {
        ElMessage.success("验证码已发送到您的邮箱");
        showEmailCodeInput.value = true;
        startEmailCodeCooldown(60);
        startCodeExpireTimer();
      }
    };
    const resendEmailCode = async () => {
      if (emailCodeCooldown.value > 0) {
        ElMessage.warning(`请等待 ${emailCodeCooldown.value} 秒后再试`);
        return;
      }
      await sendEmailCode();
    };
    const startCodeExpireTimer = () => {
      codeExpireTime.value = 300;
      if (codeExpireTimer.value) {
        clearInterval(codeExpireTimer.value);
        codeExpireTimer.value = null;
      }
      codeExpireTimer.value = setInterval(() => {
        codeExpireTime.value--;
        if (codeExpireTime.value <= 0) {
          clearInterval(codeExpireTimer.value);
          codeExpireTimer.value = null;
        }
      }, 1e3);
    };
    const clearTimers = () => {
      if (codeExpireTimer.value) {
        clearInterval(codeExpireTimer.value);
        codeExpireTimer.value = null;
      }
    };
    const handleRegister = async () => {
      if (!registerFormRef.value) return;
      if (!agreeTerms.value) {
        ElMessage.warning("请先阅读并同意《用户协议》和《隐私政策》");
        return;
      }
      try {
        await registerFormRef.value.validate();
        if (!emailCode.value) {
          ElMessage.warning("请输入邮箱验证码");
          return;
        }
        if (codeExpireTime.value <= 0) {
          ElMessage.warning("验证码已过期，请重新发送");
          return;
        }
        const success = await authStore.register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          emailCode: emailCode.value
        });
        if (success) {
          router2.push("/");
        }
      } catch (error) {
      }
    };
    onMounted(() => {
      ensureGeetest().catch(() => {
      });
    });
    onUnmounted(() => {
      clearTimers();
    });
    const handleQQLogin = async () => {
      var _a, _b, _c, _d;
      try {
        const response = await api.get("/auth/qq/auth");
        if (((_a = response.data) == null ? void 0 : _a.success) && response.data.authUrl) {
          window.location.href = response.data.authUrl;
        } else {
          ElMessage.error(`QQ登录服务暂不可用${((_b = response.data) == null ? void 0 : _b.message) ? "：" + response.data.message : ""}`);
        }
      } catch (error) {
        if ((error == null ? void 0 : error.code) === "ERR_NETWORK") ElMessage.error("网络连接失败，请检查网络");
        else if (((_c = error == null ? void 0 : error.response) == null ? void 0 : _c.status) === 404) ElMessage.error("QQ登录接口不存在");
        else if (((_d = error == null ? void 0 : error.response) == null ? void 0 : _d.status) === 500) ElMessage.error("服务器内部错误");
        else ElMessage.error(`QQ登录失败：${(error == null ? void 0 : error.message) || "请重试"}`);
      }
    };
    const handleEPassLogin = async () => {
      var _a;
      try {
        const arr = new Uint8Array(16);
        if ((_a = window.crypto) == null ? void 0 : _a.getRandomValues) window.crypto.getRandomValues(arr);
        const state = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
        try {
          sessionStorage.setItem("epass_state", state);
        } catch {
        }
        const clientId = "euser-gallery";
        const redirectUri = `${window.location.origin}/auth/callback`;
        const scope = "read";
        const params = new URLSearchParams({ client_id: clientId, response_type: "token", redirect_uri: redirectUri, scope, state });
        const authorizeUrl = `https://account.emoera.com/oauth/authorize?${params.toString()}`;
        window.location.href = authorizeUrl;
      } catch (e) {
        ElMessage.error((e == null ? void 0 : e.message) || "E通行证登录初始化失败");
      }
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_input = ElInput;
      const _component_el_form_item = ElFormItem;
      const _component_el_button = ElButton;
      const _component_el_checkbox = ElCheckbox;
      const _component_el_form = ElForm;
      const _component_router_link = resolveComponent("router-link");
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
              _cache[6] || (_cache[6] = createBaseVNode("span", { class: "logo-text" }, "图库系统", -1))
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
              _cache[7] || (_cache[7] = createBaseVNode("h1", { class: "register-title" }, "创建账户", -1)),
              _cache[8] || (_cache[8] = createBaseVNode("p", { class: "register-subtitle" }, "注册新账户，开始您的文件管理之旅", -1))
            ]),
            createVNode(_component_el_form, {
              ref_key: "registerFormRef",
              ref: registerFormRef,
              model: registerForm,
              rules: registerRules,
              class: "register-form",
              onSubmit: withModifiers(handleRegister, ["prevent"])
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { prop: "username" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: registerForm.username,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => registerForm.username = $event),
                      placeholder: "请输入用户名",
                      size: "large",
                      "prefix-icon": unref(user_default),
                      clearable: "",
                      class: "custom-input"
                    }, null, 8, ["modelValue", "prefix-icon"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "email" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: registerForm.email,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => registerForm.email = $event),
                      placeholder: "请输入邮箱地址",
                      size: "large",
                      "prefix-icon": unref(message_default),
                      clearable: "",
                      class: "custom-input"
                    }, null, 8, ["modelValue", "prefix-icon"]),
                    createVNode(Transition, {
                      name: "fade-up-soft",
                      appear: ""
                    }, {
                      default: withCtx(() => [
                        registerForm.email ? (openBlock(), createElementBlock("div", _hoisted_9, [
                          _cache[9] || (_cache[9] = createBaseVNode("div", {
                            id: "geetest-box",
                            class: "geetest-box"
                          }, null, -1)),
                          createBaseVNode("div", _hoisted_10, [
                            createVNode(_component_el_input, {
                              modelValue: emailCode.value,
                              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => emailCode.value = $event),
                              placeholder: "请输入6位验证码",
                              class: "email-code-input",
                              maxlength: "6",
                              size: "large"
                            }, null, 8, ["modelValue"]),
                            createVNode(_component_el_button, {
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
                          ]),
                          showEmailCodeInput.value ? (openBlock(), createElementBlock("div", _hoisted_11, [
                            createBaseVNode("span", _hoisted_12, "验证码有效期：" + toDisplayString(codeExpireTime.value) + "s", 1),
                            createVNode(_component_el_button, {
                              type: "text",
                              onClick: resendEmailCode,
                              disabled: unref(emailCodeCooldown) > 0
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(emailCodeCooldown) > 0 ? `${unref(emailCodeCooldown)}s后重发` : "重新发送"), 1)
                              ]),
                              _: 1
                            }, 8, ["disabled"])
                          ])) : createCommentVNode("", true)
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "password" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: registerForm.password,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => registerForm.password = $event),
                      type: "password",
                      placeholder: "请输入密码",
                      size: "large",
                      "prefix-icon": unref(lock_default),
                      "show-password": "",
                      class: "custom-input",
                      onInput: checkPasswordStrength
                    }, null, 8, ["modelValue", "prefix-icon"]),
                    createVNode(Transition, {
                      name: "fade-up-soft",
                      appear: ""
                    }, {
                      default: withCtx(() => [
                        registerForm.password ? (openBlock(), createElementBlock("div", _hoisted_13, [
                          createBaseVNode("div", _hoisted_14, [
                            _cache[10] || (_cache[10] = createBaseVNode("span", { class: "strength-label" }, "密码强度：", -1)),
                            createBaseVNode("span", {
                              class: normalizeClass(["strength-level", passwordStrength.level])
                            }, toDisplayString(passwordStrength.text), 3)
                          ]),
                          passwordStrength.hints.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_15, [
                            _cache[11] || (_cache[11] = createBaseVNode("div", { class: "requirement-title" }, "密码要求：", -1)),
                            createBaseVNode("ul", _hoisted_16, [
                              (openBlock(true), createElementBlock(Fragment, null, renderList(passwordStrength.hints, (hint) => {
                                return openBlock(), createElementBlock("li", {
                                  key: hint,
                                  class: "requirement-item"
                                }, toDisplayString(hint), 1);
                              }), 128))
                            ])
                          ])) : createCommentVNode("", true)
                        ])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { prop: "confirmPassword" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: registerForm.confirmPassword,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => registerForm.confirmPassword = $event),
                      type: "password",
                      placeholder: "请确认密码",
                      size: "large",
                      "prefix-icon": unref(lock_default),
                      "show-password": "",
                      class: "custom-input",
                      onKeyup: withKeys(handleRegister, ["enter"])
                    }, null, 8, ["modelValue", "prefix-icon"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, { class: "agreement-row" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_checkbox, {
                      modelValue: agreeTerms.value,
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => agreeTerms.value = $event),
                      class: "agreement-checkbox"
                    }, {
                      default: withCtx(() => [
                        _cache[14] || (_cache[14] = createTextVNode(" 我已阅读并同意 ", -1)),
                        createVNode(_component_el_button, {
                          type: "text",
                          class: "terms-link"
                        }, {
                          default: withCtx(() => [..._cache[12] || (_cache[12] = [
                            createTextVNode("《用户协议》", -1)
                          ])]),
                          _: 1
                        }),
                        _cache[15] || (_cache[15] = createTextVNode(" 和 ", -1)),
                        createVNode(_component_el_button, {
                          type: "text",
                          class: "terms-link"
                        }, {
                          default: withCtx(() => [..._cache[13] || (_cache[13] = [
                            createTextVNode("《隐私政策》", -1)
                          ])]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, null, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: "primary",
                      size: "large",
                      class: "register-button",
                      loading: unref(authStore).loading,
                      disabled: !agreeTerms.value,
                      onClick: handleRegister
                    }, {
                      default: withCtx(() => [
                        !unref(authStore).loading ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
                          default: withCtx(() => [
                            createVNode(unref(right_default))
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createTextVNode(" " + toDisplayString(unref(authStore).loading ? "注册中..." : "立即注册"), 1)
                      ]),
                      _: 1
                    }, 8, ["loading", "disabled"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            _cache[20] || (_cache[20] = createBaseVNode("div", { class: "register-divider" }, [
              createBaseVNode("span", { class: "divider-text" }, "或")
            ], -1)),
            createBaseVNode("div", _hoisted_17, [
              createBaseVNode("div", _hoisted_18, [
                createVNode(_component_el_button, {
                  class: "social-btn qq-btn",
                  onClick: handleQQLogin
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[16] || (_cache[16] = createTextVNode(" QQ注册 ", -1))
                  ]),
                  _: 1
                })
              ]),
              createBaseVNode("div", _hoisted_19, [
                createVNode(_component_el_button, {
                  class: "social-btn wechat-btn",
                  onClick: handleEPassLogin
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_icon, null, {
                      default: withCtx(() => [
                        createVNode(unref(user_default))
                      ]),
                      _: 1
                    }),
                    _cache[17] || (_cache[17] = createTextVNode(" E通行证登录 ", -1))
                  ]),
                  _: 1
                })
              ])
            ]),
            createBaseVNode("div", _hoisted_20, [
              createBaseVNode("p", _hoisted_21, [
                _cache[19] || (_cache[19] = createTextVNode(" 已有账户？ ", -1)),
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
                    _cache[18] || (_cache[18] = createTextVNode(" 立即登录 ", -1))
                  ]),
                  _: 1
                })
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_22, [
            createBaseVNode("div", _hoisted_23, [
              _cache[25] || (_cache[25] = createBaseVNode("h2", { class: "panel-title" }, "加入图库系统", -1)),
              createBaseVNode("div", _hoisted_24, [
                createBaseVNode("div", _hoisted_25, [
                  createVNode(_component_el_icon, { class: "benefit-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(upload_default))
                    ]),
                    _: 1
                  }),
                  _cache[21] || (_cache[21] = createBaseVNode("div", { class: "benefit-content" }, [
                    createBaseVNode("h3", null, "免费存储空间"),
                    createBaseVNode("p", null, "注册即获得1GB免费存储空间，满足日常使用需求")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_26, [
                  createVNode(_component_el_icon, { class: "benefit-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(folder_default))
                    ]),
                    _: 1
                  }),
                  _cache[22] || (_cache[22] = createBaseVNode("div", { class: "benefit-content" }, [
                    createBaseVNode("h3", null, "智能文件管理"),
                    createBaseVNode("p", null, "自动分类整理，快速查找，让文件管理变得简单")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_27, [
                  createVNode(_component_el_icon, { class: "benefit-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(link_default))
                    ]),
                    _: 1
                  }),
                  _cache[23] || (_cache[23] = createBaseVNode("div", { class: "benefit-content" }, [
                    createBaseVNode("h3", null, "便捷分享功能"),
                    createBaseVNode("p", null, "一键生成分享链接，轻松与他人分享您的文件")
                  ], -1))
                ]),
                createBaseVNode("div", _hoisted_28, [
                  createVNode(_component_el_icon, { class: "benefit-icon" }, {
                    default: withCtx(() => [
                      createVNode(unref(lock_default))
                    ]),
                    _: 1
                  }),
                  _cache[24] || (_cache[24] = createBaseVNode("div", { class: "benefit-content" }, [
                    createBaseVNode("h3", null, "安全保障"),
                    createBaseVNode("p", null, "企业级安全防护，您的文件隐私得到充分保护")
                  ], -1))
                ])
              ])
            ])
          ])
        ]),
        _cache[26] || (_cache[26] = createStaticVNode('<div class="bg-decoration" data-v-90856218><div class="floating-shape shape-1" data-v-90856218></div><div class="floating-shape shape-2" data-v-90856218></div><div class="floating-shape shape-3" data-v-90856218></div><div class="floating-shape shape-4" data-v-90856218></div></div>', 1))
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const Register = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-90856218"]]);
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => __vitePreload(() => import("./Login-DQ5fzAUg.js"), true ? __vite__mapDeps([34,1,2,35]) : void 0),
    meta: {
      title: "登录",
      requiresAuth: false,
      transition: "auth-slide"
    }
  },
  {
    path: "/auth/callback",
    name: "EPassCallback",
    component: () => __vitePreload(() => import("./EPassCallback-BH4T7X7d.js"), true ? __vite__mapDeps([36,1,2,37,38,39]) : void 0),
    meta: {
      title: "E通行证登录回调",
      requiresAuth: false
    }
  },
  {
    path: "/auth/qq/callback",
    name: "QQCallback",
    component: () => __vitePreload(() => import("./QQCallback-JRmmgJ5h.js"), true ? __vite__mapDeps([40,1,2,37,38,41]) : void 0),
    meta: {
      title: "QQ登录回调",
      requiresAuth: false
    }
  },
  // 兼容QQ互联后台配置的回调地址 /api/auth/qq/callback
  {
    path: "/api/auth/qq/callback",
    name: "QQCallbackApiAlias",
    component: () => __vitePreload(() => import("./QQCallback-JRmmgJ5h.js"), true ? __vite__mapDeps([40,1,2,37,38,41]) : void 0),
    meta: {
      title: "QQ登录回调",
      requiresAuth: false
    }
  },
  {
    path: "/auth/confirm-register",
    name: "SignupConfirm",
    component: () => __vitePreload(() => import("./SignupConfirm-Dje1DpNG.js"), true ? __vite__mapDeps([42,1,2,43]) : void 0),
    meta: {
      title: "注册确认",
      requiresAuth: false
    }
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      title: "注册",
      requiresAuth: false,
      transition: "auth-slide"
    }
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => __vitePreload(() => import("./ForgotPassword-_a7a1gL4.js"), true ? __vite__mapDeps([44,1,2,45]) : void 0),
    meta: {
      title: "忘记密码",
      requiresAuth: false,
      transition: "auth-slide"
    }
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => __vitePreload(() => import("./ResetPassword-BJzDRYYO.js"), true ? __vite__mapDeps([46,1,2,47]) : void 0),
    meta: {
      title: "重置密码",
      requiresAuth: false
    }
  },
  {
    path: "/maintenance",
    name: "Maintenance",
    component: () => __vitePreload(() => import("./MaintenancePage-DV63RorS.js"), true ? __vite__mapDeps([48,1,2,49,21]) : void 0),
    meta: {
      title: "系统维护",
      requiresAuth: false
    }
  },
  {
    path: "/",
    name: "Layout",
    component: () => __vitePreload(() => import("./MainLayout-Bm197pW1.js"), true ? __vite__mapDeps([50,1,2,51,13,12,5,8,16,17,23,30]) : void 0),
    meta: {
      title: "图库系统",
      requiresAuth: true
    },
    children: [
      {
        path: "",
        name: "Files",
        component: () => __vitePreload(() => import("./Files-BiIQHGd_.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]) : void 0),
        meta: {
          title: "文件管理",
          requiresAuth: true
        }
      },
      {
        path: "/live-share",
        name: "LiveShare",
        component: () => __vitePreload(() => import("./LiveShare-t0_ZeSMg.js"), true ? __vite__mapDeps([52,1,2,53,20]) : void 0),
        meta: {
          title: "动图分享",
          requiresAuth: false
        }
      },
      {
        path: "/share/:token",
        name: "ShareViewer",
        component: () => __vitePreload(() => import("./ShareViewer-Df0eB5A8.js"), true ? __vite__mapDeps([54,1,2,55,20]) : void 0),
        meta: {
          title: "文件分享",
          requiresAuth: false
        }
      },
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => __vitePreload(() => import("./Dashboard-DJx93R2S.js"), true ? __vite__mapDeps([18,1,2,3,4,5,6,7,8,19,13,20,21,22,23]) : void 0),
        meta: {
          title: "仪表盘",
          requiresAuth: true
        }
      },
      {
        path: "/admin",
        name: "AdminCenter",
        component: () => __vitePreload(() => import("./AdminCenter-Dfb2YCgd.js"), true ? __vite__mapDeps([24,1,2,25,26,13,6,7,5,8,27,28,15,12,10,20,17,23,11,29,21,30]) : void 0),
        meta: {
          title: "管理中心",
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: "/user-center",
        name: "UserCenter",
        component: () => __vitePreload(() => import("./UserCenter-M5U7DDs8.js"), true ? __vite__mapDeps([56,1,2,57,28,13,33,27,5,8,29,21,10,23]) : void 0),
        meta: {
          title: "个人设置",
          requiresAuth: true
        }
      },
      {
        path: "/settings",
        redirect: { path: "/admin", query: { section: "settings" } }
      },
      {
        path: "/notifications",
        name: "NotificationHistory",
        component: () => __vitePreload(() => import("./NotificationHistory-D6ZXMsuZ.js"), true ? __vite__mapDeps([58,1,2,59,26,14,10,11,12,8,20,13,27,21,17]) : void 0),
        meta: {
          title: "通知历史",
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => __vitePreload(() => import("./NotFound-CrrBeVqU.js"), true ? __vite__mapDeps([60,1,2,61]) : void 0),
    meta: {
      title: "页面不存在",
      requiresAuth: false
    }
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 优化路由切换性能
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 图库系统` : "图库系统";
  if (!["Login", "Register", "Maintenance", "QQCallback", "EPassCallback", "SignupConfirm"].includes(to.name)) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const baseUrl = "https://tukubackend.vtart.cn";
      const maintenanceUrl = baseUrl ? `${baseUrl}/api/system/maintenance-status` : "/api/system/maintenance-status";
      const response = await fetch(maintenanceUrl, {
        headers: token ? {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        } : {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        const isMaintenanceMode = data.maintenance_mode === true;
        if (isMaintenanceMode) {
          const authStore = useAuthStore();
          if (!authStore.user || authStore.user.role !== "admin") {
            next("/maintenance");
            return;
          }
        }
      }
    } catch (error) {
    }
  }
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    if (!authStore.token) {
      ElMessage.warning("请先登录");
      next("/login");
      return;
    }
    if (!authStore.user) {
      try {
        const success = await authStore.checkAuth();
        if (!success) {
          if (authStore.token) {
            ElMessage.warning("网络连接异常，请稍后重试");
            next("/");
            return;
          } else {
            ElMessage.warning("登录已过期，请重新登录");
            next("/login");
            return;
          }
        }
      } catch (error) {
        ElMessage.warning("登录验证失败，请重新登录");
        next("/login");
        return;
      }
    }
    if (to.meta.requiresAdmin) {
      const authStore2 = useAuthStore();
      if (!authStore2.user || authStore2.user.role !== "admin") {
        ElMessage.error("需要管理员权限");
        next("/");
        return;
      }
    }
  }
  if (to.name === "Login" || to.name === "Register") {
    const authStore = useAuthStore();
    if (authStore.token && authStore.user) {
      next("/");
      return;
    }
  }
  if (to.name === "ResetPassword") {
    const token = to.query.token;
    if (!token) {
      ElMessage.error("重置链接无效");
      next("/forgot-password");
      return;
    }
  }
  next();
});
const app = createApp(_sfc_main$1);
app.use(createPinia());
app.use(router);
app.use(installer, {
  locale: zhCn
});
app.mount("#app");
export {
  _export_sfc as _,
  api as a,
  getFilePreviewUrl as b,
  formatTime as c,
  downloadFile as d,
  copyToClipboard as e,
  formatFileSize as f,
  getCachedImageUrl as g,
  getAvatarUrl as h,
  formatPercentage as i,
  getStorageUsageColor as j,
  useEmailCode as k,
  isValidEmail as l,
  useAuthStore as u
};
//# sourceMappingURL=index--zNjtHoG.js.map
