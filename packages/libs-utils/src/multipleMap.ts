type CacheNode<R> = {
  cache: Map<any, CacheNode<R>>
  addCount: (i: number) => void,
  saved: null | { value: R }
}

export class MultipleMap<V>{
  private _size = 0
  get size() { return this._size }
  private cacheRoot: CacheNode<V> = {
    cache: new Map(),
    saved: null,
    addCount: (i) => this._size += i
  }
  set(keys: readonly any[], value: V) {
    const target = keys.reduce((cur: typeof this.cacheRoot, key): CacheNode<V> => {
      if (!cur.cache.has(key)) {
        let size = 0
        cur.cache.set(key, {
          saved: null,
          cache: new Map(),
          addCount: (i) => {
            size += i
            if (i < 0) {
              if (size < 0) { throw new Error() }
              if (size === 0) { cur.cache.delete(key) }
            }
            cur.addCount(i)
          },
        })
      }
      return cur.cache.get(key)!
    }, this.cacheRoot)
    if (target.saved === null) { target.addCount(1) }
    return target.saved = { value }
  }
  remove(keys: readonly any[]) {
    const target = keys.reduce((cur: null | typeof this.cacheRoot, key): null | CacheNode<V> => {
      if (cur === null) { return null }
      return cur.cache.get(key) || null
    }, this.cacheRoot)
    if (!target) { return null }
    const saved = target.saved
    target.saved = null
    target.addCount(-1)
    return saved
  }
  get(keys: readonly any[]) {
    const target = keys.reduce((cur: null | typeof this.cacheRoot, key): null | CacheNode<V> => {
      if (cur === null) { return null }
      return cur.cache.get(key) || null
    }, this.cacheRoot)
    return target?.saved || null
  }
}