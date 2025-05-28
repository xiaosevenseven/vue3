
import { track } from "./reactiveEffect"

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow'
}
export const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        track(target, key)
        // 收集依赖
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        // 触发依赖
        return Reflect.set(target, key, value, receiver)
    }
}
