import { activeEffect } from "./effect"

const targetMap = new WeakMap();    // 存储对象和属性的依赖关系

export const createDep = (cleanup: Function) => {

}
export function track(target: object, key: unknown) {

    /**
     * activeEffect 存在说明这个 key 是在 effect 中被使用的
     * 不存在，则说明是在 effect 外被使用的，不需要收集依赖
     */
    if (activeEffect) {
        console.log('track', activeEffect, target, key)

        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key,  createDep(() => depsMap.delete(key)))
        }
        console.log('targetMap', targetMap)
    }
}