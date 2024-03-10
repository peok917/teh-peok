

interface HotKeys {
    alt?: boolean;  // 是否按下 Alt 键
    ctrl?: boolean;  // 是否按下 Ctrl 键
    meta?: boolean;  // 是否按下 Meta 键
    shift?: boolean;  // 是否按下 Shift 键
    keyCode?: number;  // 按键码，如 65=A
    code: string;  // 按键名称，如 A

    keys?: Array<string>; // 逻辑使用属性，已知按下的键，如 ['alt', 'a']
};

interface HotKeysEvent extends KeyboardEvent {
    hotKeys: string;
}

const SHORTCUTS_MODULES = ["meta","ctrl","shift","alt"];

class KeyboardShortcut {
    protected _listeners: any;
    protected _D: HTMLElement = document.body;

    constructor() {
        this._listeners = {};
        this._keydownHandler = this._keydownHandler.bind(this)
    }

    protected _keydownHandler(e: HotKeysEvent) {
        const code = (e.code || e.key),
            // @ts-ignore
            keyCode = code.substring(code.startsWith("Key") ? 3 : 0),
            keys = [], filter = [16,17,18,91,93];

        e.metaKey && keys.push('meta')
        e.ctrlKey && keys.push('ctrl')
        e.shiftKey && keys.push('shift')
        e.altKey && keys.push('alt')

        if (filter.filter(n => n === e.keyCode).length == 0)
            keys.push(keyCode.toLowerCase())

        const k = keys.join("+"), l = this._listeners[k]
        if (l) {
            e.hotKeys = k
            l(e),l.propagate && e.stopPropagation(), e.preventDefault()
        }
    }


    get() {
        const len = arguments.length, ar = arguments, t = this
        let el: string | Element = this._D, call: (e: HotKeys) => boolean, isDone = false, sequence: any = {}

        if (len === 2) {
            el = ar[0], call = ar[1]
        } else if (typeof(ar[0]) === 'function') {
            call = ar[0]
        }

        const element = this._element(el), hotKeys:HotKeys = { code: '' };

        const hotKeysHandler = (e: KeyboardEvent) => {
            const { type } = e, ev = e as any;
            if ("keydown" === type) {
                isDone = false,
                    hotKeys.alt = e.altKey,
                    hotKeys.shift = e.shiftKey,
                    hotKeys.ctrl = e.ctrlKey,
                    hotKeys.meta = e.metaKey,
                    hotKeys.keyCode = e.keyCode,
                    // @ts-ignore
                    hotKeys.code = e.code.substring(e.code.startsWith("Key") ? 3 : 0);

                SHORTCUTS_MODULES.map(k => {
                    if (ev[k + 'Key'] && !(k in sequence)) sequence[k] = Object.keys(sequence).length;
                })

            } else if ("keyup" === type) {
                if (Object.keys(sequence).length == 0) return;

                if (isDone) {
                    doneFunc()
                    console.log("新快捷热键为:", hotKeys.keys?.join(" + ")), sequence = {}
                    return;
                }
                isDone = true;
            }
        };
        const doneFunc = () => {
            hotKeys.keys = Object.keys(sequence).concat(hotKeys.code)
            const ok = call(hotKeys)
            if (ok) {
                t._removeEvent(element, "keydown", hotKeysHandler)
                t._removeEvent(element, "keyup", hotKeysHandler)
            }
        };

        return this
            ._addEvent(element,"keydown", hotKeysHandler)
            ._addEvent(element,"keyup", hotKeysHandler)
    }


    on() {
        const len = arguments.length, ar = arguments
        let el: string | Element, keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate: boolean = false

        if (len === 4) {
            el = ar[0], keys = ar[1], l = ar[2], propagate = ar[3]
        } else if (len === 3 && typeof(ar[len - 1]) === 'function') {
            el = ar[0], keys = ar[1], l = ar[2]
        } else if (len === 3) {
            el = this._D, keys = ar[0], l = ar[1], propagate = ar[2]
        } else {
            el = this._D, keys = ar[0], l = ar[1]
        }

        return this._bind(el, keys, l, propagate, false)
    }
    once() {
        const len = arguments.length, ar = arguments
        let el: string | Element, keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate: boolean = false

        if (len === 4) {
            el = ar[0], keys = ar[1], l = ar[2], propagate = ar[3]
        } else if (len === 3 && typeof(ar[len - 1]) === 'function') {
            el = ar[0], keys = ar[1], l = ar[2]
        } else if (len === 3) {
            el = this._D, keys = ar[0], l = ar[1], propagate = ar[2]
        } else {
            el = this._D, keys = ar[0], l = ar[1]
        }

        return this._bind(el, keys, l, propagate, true)
    }


    off(p: any) {
        const t = typeof p, s = t === 'string'

        let el;
        if (s) {
            // 是快捷键
            if (p.indexOf("+") > 0) {
                el = document.querySelector("[aria-keyshortcuts='" + p +"']")
            } else {
                el = document.querySelector(p)
            }
        } else {
            if ("tagName" in p) {
                el = p
            } else {
                p = this._compose(p)
                el = document.querySelector("[aria-keyshortcuts='" + p +"']")
            }
        }

        if (el) {
            const keys = el.getAttribute("aria-keyshortcuts")
            this._removeEvent(el, "keydown", this._keydownHandler)
            delete this._listeners[keys]
        }

        return this
    }


    protected _addEvent(el: HTMLElement, type: string, l: any, once?: boolean) {
        el?.addEventListener(type, l, {capture: false, once});
        return this
    }
    protected _removeEvent(el: HTMLElement, type: string, l: any) {
        el?.removeEventListener(type, l, false);
        el?.removeAttribute("aria-keyshortcuts")
        return this
    }
    protected _bind(el: string | Element, keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate: boolean, once: boolean) {
        const ks = this._compose(keys), element = this._element(el)
        this._listeners[ks] = l
        this._listeners[ks].propagate = propagate
        once == false && element.setAttribute("aria-keyshortcuts", ks)
        this._addEvent(element, "keydown", this._keydownHandler, once);

        return this
    }
    protected _compose(keys: HotKeys | string): string {
        // 把快捷键组合为字符串，做为关键词。如: ctrl+a 或 ctrl+shift+a 或 meta+a
        let k: any
        if (typeof (keys) === "string") {
            const ar = keys.split('+')
            // @ts-ignore
            k = {code: ar[ar.length - 1] || '+'} // 如果最后一个字符是空的，当作加号(+)处理
            SHORTCUTS_MODULES.map(s => {
                k[s] = keys.indexOf(s) != -1
            })
        } else {
            k = keys
        }

        const h = [];
        k.meta && h.push('meta')
        k.ctrl && h.push('ctrl')
        k.shift && h.push('shift')
        k.alt && h.push('alt')
        h.push(k.code.toLowerCase())
        return h.join("+")
    }
    protected _element(el: any): HTMLElement {
        return typeof (el) === "string" ? document.querySelector(el) : el;
    }

}


const ListenKeys = new KeyboardShortcut();

// @ts-ignore
//if (typeof window !== "undefined") window.ListenKeys = ListenKeys;

export default ListenKeys;
