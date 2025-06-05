
import { isObject } from "@vue/shared"
import { track, trigger } from "./reactiveEffect"
import { reactive } from "./reactive"
import { ReactiveFlags } from "./constants"


export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        track(target, key)
        let res = Reflect.get(target, key, receiver)
        if (isObject(res)) {
            return reactive(res)
        }
        // 收集依赖
        return res
    },
    set(target, key, value, receiver) {
        // 触发依赖
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
            trigger(target, key, value, oldValue)
        }
        return result
    }
}
