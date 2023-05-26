import { MonoTypeOperatorFunction, Observable, share, timer } from "rxjs";

export function keepShare<T>(config: {
  disposeDelay: number,
}): MonoTypeOperatorFunction<T> {
  return (ob$) => ob$.pipe(share(), (ob$) => new Observable((subscriber) => {
    const subscription = ob$.subscribe(subscriber)
    return () => timer(config.disposeDelay).subscribe(() => {
      subscription.unsubscribe()
    })
  }))
}