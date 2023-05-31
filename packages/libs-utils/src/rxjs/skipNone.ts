import { filter, OperatorFunction } from "rxjs";

export function skipNone<T>(): OperatorFunction<T | null | undefined, T> {
  return (ob$): any => ob$.pipe(filter((x) => x !== null && x !== undefined))
}

export const randomNum = Math.random()