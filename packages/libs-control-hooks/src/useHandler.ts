import { useStateBy } from "./useStateBy";

export function useHandler<Args extends any[], R extends unknown>(
  deps: Iterable<any>,
  func: (...args: Args) => R,
) {
  const [saved] = useStateBy(deps, () => {
    const saved = {
      value: func,
      result: (...args: Args) => saved.value(...args),
    }
    return saved
  })
  saved.value = func
  return saved.result
}