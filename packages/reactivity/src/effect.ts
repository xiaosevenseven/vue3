

//  创建一个响应式 effect 数据变化后可以在重新执行
export function effect(fn: Function, options: object = {}) {
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    })
    _effect.run();

    Object.assign(_effect, options);    // 扩展属性
    
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;    // 暴露 effect 实例，用于 stop 等操作

    return _effect;
}

export let activeEffect: ReactiveEffect | undefined;
function preCleanEffect(effect: ReactiveEffect) {
    effect._depsLength = 0;
    effect._trackId++;  // 每次执行 effect 时，都会将 _trackId 加 1，当前同一个 effect 执行，那么 id 就是相同的
}
function postCleanEffect(effect: ReactiveEffect) {
    if (effect.deps.length > effect._depsLength) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            let dep = effect.deps[i];
            if (dep) {
                cleanDepEffect(dep, effect);
            }
        }
        effect.deps.length = effect._depsLength;
    }
}
function cleanDepEffect(dep: any, effect: ReactiveEffect) {
    dep.delete(effect);
    if (dep.size === 0) {
        dep.cleanup();
    }
}
class ReactiveEffect {
    _trackId = 0;  // 用于记录当前 effect 执行了几次
    deps = [];
    _depsLength = 0;
    _running = 0;
    public active = true;
    constructor(public fn, public scheduler) { }
    run() {
        if (!this.active) {
            // 不是激活的，执行后什么都不用做
            return this.fn();
        }
        let lastEffect = activeEffect;
        try {
            // 依赖收集
            activeEffect = this;

            // effect 执行前，需要将上一次的依赖情况 effect 清除掉
            preCleanEffect(this);
            this._running++;
            return this.fn();
        } finally {
            this._running--;
            postCleanEffect(this);
            activeEffect = lastEffect;
        }

    }
    stop() {
        this.active = false;
    }   
}

export function trackEffect(effect: ReactiveEffect, dep: Map<any, any>) {
    // 需要重新收集依赖，那么就需要将之前的依赖清除掉
    // console.log(effect, dep)

    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId);   // 更新 ID
        let oldDep = effect.deps[effect._depsLength]
        if (oldDep !== dep) {
            if (oldDep) {
                // 清除掉之前的依赖
                cleanDepEffect(oldDep, effect);
            }
            effect.deps[effect._depsLength++] = dep;
        } else {
            effect._depsLength++;
        }
    }

    // dep.set(effect, effect._trackId);
    // effect.deps[effect._depsLength++] = dep;
}

export function triggerEffects(dep: Map<any, any>) {
    for (const [effect] of dep) {
        if (effect.scheduler) {
            if (!effect._running) {
                effect.scheduler();
            }
        }
    }
}