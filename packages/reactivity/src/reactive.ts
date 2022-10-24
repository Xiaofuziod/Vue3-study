// 将数据转换为proxy数据
import {isObject} from "@vue/shared";
import {mutableHandlers, ReactiveFlags} from "./baseHandler";

const reactiveMap = new WeakMap(); // key 只能是对象

export function reactive(target) {
    if (!isObject(target)) return
    // 是否proxy过
    // debugger
    if (target[ReactiveFlags.IS_REACTIVE]) return target
    // 代理多次 返回同一个
    let existingProxy = reactiveMap.get(target)
    if (existingProxy) return existingProxy
    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)
    return proxy;
}