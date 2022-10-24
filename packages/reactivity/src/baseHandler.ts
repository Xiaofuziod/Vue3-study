import {track, trigger} from "./effect";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
    get(target: any, p: string | symbol, receiver: any): any {
        if (p === ReactiveFlags.IS_REACTIVE) return true
        track(target, 'get', p)
        return Reflect.get(target, p, receiver)
    },
    set(target: any, p: string | symbol, value: any, receiver: any): boolean {
        let oldValue = target[p]
        let result = Reflect.set(target, p, value, receiver)
        if (oldValue !== value) { // 发生了变化 要执行更新
            trigger(target, 'set', p, value, oldValue)
        }
        return result
    }
}