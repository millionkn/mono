export { }

declare global {
  interface Array<T> {
    filterMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R[]
    findMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R | null

    groupBy<K>(key: (item: T, index: number, arr: T[]) => K): Map<K, T[]>

    expand<R>(child: (item: T) => T[], select: (target: T, parent: T[]) => R): R[]

    asTreeArr<K, R>(
      selfKey: (item: T) => K,
      parentKey: (item: T, self: K) => K,
      getResult: (item: T, self: K) => R,
    ): CNode<R>[]

    scan<K>(init: K, fun: (init: K, value: T, index: number, arr: T[]) => K): K[]

    asSet<V = T>(value?: (item: T, index: number, arr: T[]) => V): Set<V>

    asMap<K, V = T>(
      key: (item: T, index: number, arr: T[]) => K,
      value?: (item: T, index: number, arr: T[]) => V,
    ): Map<K, V>

    asObject<K extends string | symbol | number, V = T>(
      key: (item: T, index: number, arr: T[]) => K,
      value?: (item: T, index: number, arr: T[]) => V,
    ): { [key in K]: V }

    getRandom(): T
    pipeLine: <R>(pipe: (e: this) => R) => PipeLine<R>
    pipe: <R>(pipe: (e: this) => R) => R

    dedup<K>(key: (obj: T) => K): T[]
  }
}

Array.prototype.filterMap = function (fun) {
  const arr: any[] = []
  this.forEach((...args) => {
    const result = fun(...args)
    if (result === undefined || result === null) { return }
    arr.push(result)
  })
  return arr
}
Array.prototype.findMap = function (fun) {
  for (let i = 0; i < this.length; i++) {
    const result = fun(this[i], i, this)
    if (result !== undefined && result !== null) { return result }
  }
  return null
}

function expand<T, R>(
  item: T,
  parent: T[],
  child: (node: T) => T[],
  select: (node: T, parent: T[]) => R,
): R[] {
  return [select(item, parent), ...child(item).flatMap((node) => expand(node, [item, ...parent], child, select))]
}

Array.prototype.expand = function (child, select) {
  return this.flatMap((item) => expand(item, [], child, select))
}

Array.prototype.scan = function (init, fun) {
  const ret: Array<typeof init> = [];
  this.reduce((pre, cur, index, arr) => {
    const next = fun(pre, cur, index, arr)
    ret.push(next)
    return next
  }, init)
  return ret
}

Array.prototype.asSet = function (value = (v) => v) {
  return new Set(this.map(value))
}
Array.prototype.asMap = function (key, value = (v) => v) {
  return new Map(this.map((...args) => [key(...args), value(...args)]))
}
Array.prototype.asObject = function (key, value = (v) => v): any {
  return Object.fromEntries(this.asMap(key, value))
}
Array.prototype.groupBy = function (getKey) {
  return this.reduce((cache, cur, index, arr) => {
    const key = getKey(cur, index, arr)
    if (!cache.has(key)) { cache.set(key, []) }
    cache.get(key).push(cur)
    return cache
  }, new Map())
}
Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.asTreeArr = function (selfKey, parentKey, getResult) {
  const arr = this.map((item) => {
    const self = selfKey(item)
    return {
      self,
      parent: parentKey(item, self),
      cnode: <CNode<ReturnType<typeof getResult>>>{
        data: getResult(item, self),
        children: [],
      },
    }
  })
  const cache = arr.asMap((e) => e.self)
  arr.forEach(({ parent, self, cnode }) => {
    if (parent === self) { return }
    const children = cache.get(parent)?.cnode.children
    if (!children) { return }
    children.push(cnode)
  })
  return arr.filter((e) => e.parent === e.self).map((e) => e.cnode)
}

Array.prototype.pipe = function (pipe) {
  return pipe(this)
}

Array.prototype.pipeLine = function (pipe) {
  return Object.pipeLineFrom(this).pipeLine(pipe)
}

Array.prototype.dedup = function (getKey) {
  const keys = new Set<any>()
  const result: any[] = []
  this.forEach((obj) => {
    const key = getKey(obj)
    if (keys.has(key)) { return }
    keys.add(key)
    result.push(obj)
  })
  return result

}