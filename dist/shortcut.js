"use strict";
exports.__esModule = true;
;
var SHORTCUTS_MODULES = ["meta", "ctrl", "shift", "alt"];
var KeyboardShortcut = /** @class */ (function () {
    function KeyboardShortcut() {
        this._D = document.body;
        this._listeners = {};
        this._keydownHandler = this._keydownHandler.bind(this);
    }
    KeyboardShortcut.prototype._keydownHandler = function (e) {
        var code = (e.code || e.key), 
        // @ts-ignore
        keyCode = code.substring(code.startsWith("Key") ? 3 : 0), keys = [], filter = [16, 17, 18, 91, 93];
        e.metaKey && keys.push('meta');
        e.ctrlKey && keys.push('ctrl');
        e.shiftKey && keys.push('shift');
        e.altKey && keys.push('alt');
        if (filter.filter(function (n) { return n === e.keyCode; }).length == 0)
            keys.push(keyCode.toLowerCase());
        var k = keys.join("+"), l = this._listeners[k];
        if (l) {
            e.hotKeys = k;
            l(e), l.propagate && e.stopPropagation(), e.preventDefault();
        }
    };
    KeyboardShortcut.prototype.get = function () {
        var len = arguments.length, ar = arguments, t = this;
        var el = this._D, call, isDone = false, sequence = {};
        if (len === 2) {
            el = ar[0], call = ar[1];
        }
        else if (typeof (ar[0]) === 'function') {
            call = ar[0];
        }
        var element = this._element(el), hotKeys = { code: '' };
        var hotKeysHandler = function (e) {
            var _a;
            var type = e.type, ev = e;
            if ("keydown" === type) {
                isDone = false,
                    hotKeys.alt = e.altKey,
                    hotKeys.shift = e.shiftKey,
                    hotKeys.ctrl = e.ctrlKey,
                    hotKeys.meta = e.metaKey,
                    hotKeys.keyCode = e.keyCode,
                    // @ts-ignore
                    hotKeys.code = e.code.substring(e.code.startsWith("Key") ? 3 : 0);
                SHORTCUTS_MODULES.map(function (k) {
                    if (ev[k + 'Key'] && !(k in sequence))
                        sequence[k] = Object.keys(sequence).length;
                });
            }
            else if ("keyup" === type) {
                if (Object.keys(sequence).length == 0)
                    return;
                if (isDone) {
                    doneFunc();
                    console.log("新快捷热键为:", (_a = hotKeys.keys) === null || _a === void 0 ? void 0 : _a.join(" + ")), sequence = {};
                    return;
                }
                isDone = true;
            }
        };
        var doneFunc = function () {
            hotKeys.keys = Object.keys(sequence).concat(hotKeys.code);
            var ok = call(hotKeys);
            if (ok) {
                t._removeEvent(element, "keydown", hotKeysHandler);
                t._removeEvent(element, "keyup", hotKeysHandler);
            }
        };
        return this
            ._addEvent(element, "keydown", hotKeysHandler)
            ._addEvent(element, "keyup", hotKeysHandler);
    };
    KeyboardShortcut.prototype.on = function () {
        var len = arguments.length, ar = arguments;
        var el, keys, l, propagate = false;
        if (len === 4) {
            el = ar[0], keys = ar[1], l = ar[2], propagate = ar[3];
        }
        else if (len === 3 && typeof (ar[len - 1]) === 'function') {
            el = ar[0], keys = ar[1], l = ar[2];
        }
        else if (len === 3) {
            el = this._D, keys = ar[0], l = ar[1], propagate = ar[2];
        }
        else {
            el = this._D, keys = ar[0], l = ar[1];
        }
        return this._bind(el, keys, l, propagate, false);
    };
    KeyboardShortcut.prototype.once = function () {
        var len = arguments.length, ar = arguments;
        var el, keys, l, propagate = false;
        if (len === 4) {
            el = ar[0], keys = ar[1], l = ar[2], propagate = ar[3];
        }
        else if (len === 3 && typeof (ar[len - 1]) === 'function') {
            el = ar[0], keys = ar[1], l = ar[2];
        }
        else if (len === 3) {
            el = this._D, keys = ar[0], l = ar[1], propagate = ar[2];
        }
        else {
            el = this._D, keys = ar[0], l = ar[1];
        }
        return this._bind(el, keys, l, propagate, true);
    };
    KeyboardShortcut.prototype.off = function (p) {
        var t = typeof p, s = t === 'string';
        var el;
        if (s) {
            // 是快捷键
            if (p.indexOf("+") > 0) {
                el = document.querySelector("[aria-keyshortcuts='" + p + "']");
            }
            else {
                el = document.querySelector(p);
            }
        }
        else {
            if ("tagName" in p) {
                el = p;
            }
            else {
                p = this._compose(p);
                el = document.querySelector("[aria-keyshortcuts='" + p + "']");
            }
        }
        if (el) {
            var keys = el.getAttribute("aria-keyshortcuts");
            this._removeEvent(el, "keydown", this._keydownHandler);
            delete this._listeners[keys];
        }
        return this;
    };
    KeyboardShortcut.prototype._addEvent = function (el, type, l, once) {
        el === null || el === void 0 ? void 0 : el.addEventListener(type, l, { capture: false, once: once });
        return this;
    };
    KeyboardShortcut.prototype._removeEvent = function (el, type, l) {
        el === null || el === void 0 ? void 0 : el.removeEventListener(type, l, false);
        el === null || el === void 0 ? void 0 : el.removeAttribute("aria-keyshortcuts");
        return this;
    };
    KeyboardShortcut.prototype._bind = function (el, keys, l, propagate, once) {
        var ks = this._compose(keys), element = this._element(el);
        this._listeners[ks] = l;
        this._listeners[ks].propagate = propagate;
        once == false && element.setAttribute("aria-keyshortcuts", ks);
        this._addEvent(element, "keydown", this._keydownHandler, once);
        return this;
    };
    KeyboardShortcut.prototype._compose = function (keys) {
        // 把快捷键组合为字符串，做为关键词。如: ctrl+a 或 ctrl+shift+a 或 meta+a
        var k;
        if (typeof (keys) === "string") {
            var ar = keys.split('+');
            // @ts-ignore
            k = { code: ar[ar.length - 1] || '+' }; // 如果最后一个字符是空的，当作加号(+)处理
            SHORTCUTS_MODULES.map(function (s) {
                k[s] = keys.indexOf(s) != -1;
            });
        }
        else {
            k = keys;
        }
        var h = [];
        k.meta && h.push('meta');
        k.ctrl && h.push('ctrl');
        k.shift && h.push('shift');
        k.alt && h.push('alt');
        h.push(k.code.toLowerCase());
        return h.join("+");
    };
    KeyboardShortcut.prototype._element = function (el) {
        return typeof (el) === "string" ? document.querySelector(el) : el;
    };
    return KeyboardShortcut;
}());
var ListenKeys = new KeyboardShortcut();
// @ts-ignore
//if (typeof window !== "undefined") window.ListenKeys = ListenKeys;
exports["default"] = ListenKeys;
//# sourceMappingURL=shortcut.js.map