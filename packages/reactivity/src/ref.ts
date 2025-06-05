import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";


export function ref(value) {
    return createRef(value)
}

function createRef(value) {
    return new RefImpl(value);
}

class RefImpl {
    __v_isRef = true;
    _value;
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }
    get value() {
        trackRefValue(this)
        return this._value
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue
            this._value = newValue
            triggerRefValue(this)
        }
    }
}

function trackRefValue(ref) {
    if (activeEffect) {
        trackEffect(
            activeEffect,
            (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
        )
    }
}

function triggerRefValue(ref) {
    let dep = ref.dep;
    if (dep) {
        triggerEffects(dep)     // 触发依赖更新

    }
}

class ObjectRefImpl {
    public __v_isRef = true;
    constructor(public _object, public _key) {
        
    }
    get value() {
        return this._object[this._key]
    }
    set value(newValue) {
        this._object[this._key] = newValue
    }
}
export function toRef(object, key) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
    const ret = {}
    for (let key in object) {
        ret[key] = toRef(object, key)
    }
    return ret
}

export function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver)
            return r.__v_isRef ? r.value : r
        },
        set(target, key, value, receiver) {
            const oldValue = target[key]
            if (oldValue.__v_isRef) {
                oldValue.value = value
                return true
            }
            return Reflect.set(target, key, value, receiver)
            
        }
    })
}