import { endWith, map, mergeMap, Observable, OperatorFunction, scan } from "rxjs";

export function cacheScan<T, K, V>(
  getKey: (item: T) => K,
  getOb$: (item: T) => Observable<V>,
): OperatorFunction<T, Map<K, V>> {
  return (ob$) => ob$.pipe(
    mergeMap((item) => {
      const key = getKey(item)
      return getOb$(item).pipe(
        map((value) => (cache: Map<K, V>) => cache.set(key, value)),
        endWith((cache: Map<K, V>) => cache.delete(key)),
      )
    }),
    scan((cache, cb) => (cb(cache), cache), new Map<K, V>()),
  )
}
