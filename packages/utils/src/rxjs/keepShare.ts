import { MonoTypeOperatorFunction, Observable, share } from "rxjs";

export function keepShare<T>(config: {
  disposeDelay: number,
}): MonoTypeOperatorFunction<T> {
  return (ob$) => ob$.pipe(share(), (ob$) => new Observable((subscriber) => {
    const subscription = ob$.subscribe(subscriber)
    return () => setTimeout(() => subscription.unsubscribe(), config.disposeDelay)
  }))
}