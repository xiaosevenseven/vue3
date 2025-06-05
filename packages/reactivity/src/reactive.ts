import { isObject } from "@vue/shared"
import { mutableHandlers } from "./baseHandler";
import { ReactiveFlags } from "./constants";

const reactiveMap = new WeakMap();

export function reactive(target: object) {
    return createReactiveObject(target)
}

function createReactiveObject(target: object) {
    // 如果不是对象直接返回
    if (!isObject(target)) {
        return target
    }
    // 如果已经代理过了，直接返回
    if (target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }
    const exitsProxy = reactiveMap.get(target)
    if (exitsProxy) {
        return exitsProxy
    }
    let proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy)
    return proxy
} 

export function toReactive(value) {
    return isObject(value) ? reactive(value) : value
}