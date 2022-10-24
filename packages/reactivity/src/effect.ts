export let activeEffect = undefined

// 清除依赖收集

function cleanupEffect(effect) {
  const {deps} = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)  // 解除effect 重新依赖收集
  }
  effect.deps.length = 0
}

class ReactiveEffect {
  // 默认是激活状态
  public active = true
  public parent = null
  public deps = []

  constructor(public fn) {
  }

  run() {
    // 如果非激活 执行函数 不需要进行依赖收集
    if (!this.active) this.fn()

    // 依赖收集  核心就是将当前的 effect 和渲染属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this
      cleanupEffect(this)
      return this.fn()
    } finally {
      activeEffect = this.active
      this.parent = null
    }
  }

  stop() {
    if (this.active) {
      this.active = false
      cleanupEffect(this) // 停止收集effect
    }

  }
}


export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner

}

// 一个effect 对应多个属性  一个属性对应多个effect  多对多

const targetMao = new WeakMap()

export function track(target, type, key) {
  if (!activeEffect) return
  let depsMap = targetMao.get(target)
  if (!depsMap) {
    targetMao.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps && activeEffect.deps.push(dep)  // 让effect记录对应的dep  用于清理
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMao.get(target)
  if (!depsMap) return // 无引用
  let effects = depsMap.get(key) // 找到属性对应的effect
  // 拷贝一份再执行 防止关联引用
  if (effects) {
    effects = [...effects]
    effects.forEach(effects => {
      if (effects !== activeEffect) effects.run()
    })
  }
}
