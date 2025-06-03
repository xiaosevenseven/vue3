import { activeEffect, trackEffect, triggerEffects } from "./effect"

const targetMap = new WeakMap();    // 存储对象和属性的依赖关系

export const createDep = (cleanup: Function, key: unknown) => {
    const dep = new Map() as any;
    dep.key = key;
    dep.cleanup = cleanup;
    return dep;
}

// 收集依赖
export function track(target: object, key: unknown) {

    /**
     * activeEffect 存在说明这个 key 是在 effect 中被使用的
     * 不存在，则说明是在 effect 外被使用的，不需要收集依赖
     */
    if (activeEffect) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(
                key,  
                dep = createDep(() => depsMap.delete(key), key) // 后面用于清理不需要的属性
            )
        }
        // 将当前的 effect 放到 dep 映射表中，后续可以根据值的变化触发此 dep 中存放的 effect
        trackEffect(activeEffect, dep)
    } 
}

// 触发依赖
export function trigger(target: object, key: unknown, newValue: unknown, oldValue: unknown) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        // never been tracked
        return
    }
    let dep = depsMap.get(key)
    if (dep) {
        triggerEffects(dep)
    }
}