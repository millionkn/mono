export { }

declare global {
  interface Number {
    times<T>(fun: (i: number) => T): T[];
    asNumber: (pipe?: (value: number) => number | string | null) => number | null
    pipe: <T>(fun: (i: number) => T) => T
  }

  interface String {
    asNumber: (pipe?: (value: number) => number | string | null) => number | null
    pipe: <T>(fun: (str: string) => T) => T
  }

  interface Array<T> {
    filterMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R[]
    findMap<R>(fun: (item: T, index: number, arr: T[]) => R | null): R | null

    groupBy<K>(key: (item: T, index: number, arr: T[]) => K): Map<K, T[]>

    expand<R>(child: (item: T) => T[], select: (target: T, parent: T[]) => R): R[]

    scan<K>(init: K, fun: (init: K, value: T, index: number, arr: T[]) => K): K[]

    asSet<V = T>(value?: (item: T, index: number, arr: T[]) => V): Set<V>

    asMap<K, V = T>(
      key: (item: T, index: number, arr: T[]) => K,
      value?: (item: T, index: number, arr: T[]) => V,
    ): Map<K, V>

    asObject<K extends string | symbol, V = T>(
      key: (item: T, index: number, arr: T[]) => K,
      value?: (item: T, index: number, arr: T[]) => V,
    ): { [key in K]: V }

    getRandom(): T

    pipe: <K>(fun: (self: T[]) => K) => K
  }

  interface Set<T> {
    map<R>(cb: (item: T, index: number, arr: T[]) => R): R[]
  }

  interface Math {
    isInArea(point: [number, number] | null, area: [number, number][]): boolean
    avg(...arr: number[]): number
    WGS84ToMercator(point: [number, number]): [number, number]
    distance(p1: [number, number], p2: [number, number]): number
  }

  interface Map<K, V> {
    mapValue<R>(fun: (entities: readonly [K, V], index: number) => R): Map<K, R>
    asArray<R>(mapper: (entries: [K, V], index: number) => R): R[]
  }

  type Type<T> = new (...args: any[]) => T

  type AsyncAble<T> = T | PromiseLike<T>

  type UnpackArray<T> = T extends Array<infer X> ? X : T
}

Number.prototype.times = function (fun) {
  return new Array(this.valueOf())
    .fill(null)
    .map((_, i) => fun(i))
}

Number.prototype.asNumber = function (pipe) {
  if (Number.isNaN(this) || Infinity === this || -Infinity === this) { return null }
  if (!pipe) { return Number(this) }
  return pipe(Number(this))?.asNumber() ?? null
}

Number.prototype.pipe = function (pipe) {
  return pipe(this as any)
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

Array.prototype.pipe = function (pipe) {
  return pipe(this)
}


Set.prototype.map = function (cb) {
  return [...this].map((item, index, arr) => cb(item, index, arr))
}

Math.isInArea = function (point, area) {
  if (!(point instanceof Array) || area.length <= 2) { return false }
  const [pointX, pointY] = point || []
  if ((typeof pointX !== 'number') || (typeof pointY !== 'number')) { return false }
  return 1 === (1 & area
    .map(([x, y]): [number, number] => [x - pointX, y - pointY])
    .filter((cur, index, arr) => {
      const pre = arr.at(index - 1)!
      if (pre[0] * cur[0] > 0) { return false }
      if (pre[1] < 0 && cur[1] < 0) { return false }
      if (pre[0] > cur[0]) {
        cur[0] * pre[1] >= cur[1] * pre[0]
      } else {
        cur[0] * pre[1] <= cur[1] * pre[0]
      }
    }).length)
}
Math.WGS84ToMercator = function ([lng, lat]) {
  const earthRad = 6378137.0; //地球半径
  const param = lat * Math.PI / 180;
  return [
    lng * Math.PI / 180 * earthRad,
    earthRad / 2 * Math.log((1.0 + Math.sin(param)) / (1.0 - Math.sin(param))),
  ]
}
Math.distance = function ([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

Math.avg = function (...arr) {
  if (arr.length === 0) { return NaN }
  return arr.reduce((pre, cur) => pre + cur / arr.length, 0)
}

String.prototype.asNumber = function (pipe) {
  return Number(this || NaN).asNumber(pipe)
}
String.prototype.pipe = function (pipe) {
  return pipe(this as any)
}

Map.prototype.asArray = function (mapper) {
  return [...this.entries()].map(([k, v], index) => mapper([k, v], index))
}

Map.prototype.mapValue = function (fun) {
  return new Map([...this.entries()].map(([key, value], index) => [key, fun([key, value], index)]))
}

