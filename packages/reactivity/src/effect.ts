

//  创建一个响应式 effect 数据变化后可以在重新执行
export function effect(fn: Function, options: object = {}) {
    const _effect = new ReactiveEffect(fn, () => {
        _effect.run();
    })
    _effect.run();
    return _effect;
}

export let activeEffect: ReactiveEffect | undefined;
class ReactiveEffect {
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
            return this.fn();
        } finally {
            activeEffect = lastEffect;
        }

    }
    stop() {
        this.active = false;
    }   
}