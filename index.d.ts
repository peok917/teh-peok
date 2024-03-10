// LICENSE is MIT
//
// Copyright (c) 2023
//

/**
 * 热键设置
 */
interface HotKeys {
    alt?: boolean;  // 是否按下 Alt 键
    ctrl?: boolean;  // 是否按下 Ctrl 键
    meta?: boolean;  // 是否按下 Meta 键
    shift?: boolean;  // 是否按下 Shift 键
    keyCode?: number;  // 按键码，如 65=A
    code: string;  // 按键名称，如 A

    keys?: Array<string>; // 逻辑使用属性，已知按下的键，如 ['alt', 'a']
}

/**
 * 热键事件
 */
interface HotKeysEvent extends KeyboardEvent {
    hotKeys: string;
}

/**
 * 热键管理
 */
interface ListenKeys {

    /**
     * 采集快捷键，事件绑定到 body 节点<br>
     * 监听 keydown(按下) 和 keyup(弹起) 事件，按下事件被触发时捕捉当前键码，弹起事件被触发时快捷键捕获完成，并且触发 [call] 回调函数。<br>
     * 设置成功后需要使用 closeKeys 关闭事件。
     * @param call 回调函数，需要返回一个布尔值，表示是否成功。
     */
    getHotKeys(call: (e: HotKeys) => boolean): void;

    /**
     * 采集快捷键<br>
     * 监听 keydown(按下) 和 keyup(弹起) 事件，按下事件被触发时捕捉当前键码，弹起事件被触发时快捷键捕获完成，并且触发 [call] 回调函数。<br>
     * 设置成功后需要使用 closeKeys 关闭事件。
     * @param elOrSelectors 需要监听的控件，或 document.querySelector 查询规则
     * @param call 回调函数，需要返回一个布尔值，表示是否成功。
     */
    getHotKeys(elOrSelectors: string | Element, call: (e: HotKeys) => boolean): void;


    /**
     * 监听快捷键，事件绑定到 body 中
     * @param keys 需要监听的键，如 ctrl+a  ctrl+shift+a  meta+a
     * @param l 需要触发的回调函数
     * @param propagate 是否允许向上传递事件响应，默认为允许
     */
    on(keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate?: boolean): ListenKeys;

    /**
     * 监听快捷键
     * @param elOrSelectors 需要监听的控件，支持 document.querySelector 查询规则。也可以使用 [bindKeyDown] 函数触发事件
     * @param keys 需要监听的键，如 ctrl+a  ctrl+shift+a  meta+a
     * @param l 需要触发的回调函数
     * @param propagate 是否允许向上传递事件响应，默认为允许
     */
    on(elOrSelectors: string | Element, keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate?: boolean): ListenKeys;

    /**
     * 监听快捷键，事件绑定到 body 中，仅执行一次
     * @param keys 需要监听的键，如 ctrl+a  ctrl+shift+a  meta+a
     * @param l 需要触发的回调函数
     * @param propagate 是否允许向上传递事件响应，默认为允许
     */
    once(keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate?: boolean): ListenKeys;

    /**
     * 监听快捷键，仅执行一次
     * @param elOrSelectors 需要监听的控件，支持 document.querySelector 查询规则。也可以使用 [bindKeyDown] 函数触发事件
     * @param keys 需要监听的键，如 ctrl+a  ctrl+shift+a  meta+a
     * @param l 需要触发的回调函数
     * @param propagate 是否允许向上传递事件响应，默认为允许
     */
    once(elOrSelectors: string | Element, keys: HotKeys | string, l: (e: HotKeysEvent) => void, propagate?: boolean): ListenKeys;


    /**
     * 关闭监听的快捷键
     * @param selectors 已监听的快捷键或者控件，如果是控件支持 document.querySelector 查询规则
     */
    off(selectors: string | Element | HotKeys): ListenKeys;


}

declare const ListenKeys: ListenKeys;

export default ListenKeys
