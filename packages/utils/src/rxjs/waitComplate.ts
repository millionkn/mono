import { endWith, OperatorFunction, skipWhile } from "rxjs";

export function waitComplate<T>(emit: T): OperatorFunction<any, T> {
  return (ob$) => ob$.pipe(
    skipWhile(() => true),
    endWith(emit),
  )
}
