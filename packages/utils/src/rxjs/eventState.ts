import { filter, groupBy, map, Observable, OperatorFunction, switchMap } from "rxjs";

export function eventState<T, K>(getKey: (item: T, index: number) => K): OperatorFunction<T[], {
  key: K,
  ob$: Observable<T>,
}> {
  return (ob$) => ob$.pipe(
    map((arr) => new Map(arr.map((value, index) => [getKey(value, index), value]))),
    (ob$) => ob$.pipe(
      switchMap((arr) => arr),
      groupBy(([key]) => key, {
        duration: (gob$) => ob$.pipe(filter((cache) => !cache.has(gob$.key)))
      }),
      map((gob$) => {
        return {
          key: gob$.key,
          ob$: gob$.pipe(
            map(([_, value]) => value)
          )
        }
      })
    )
  )
}
