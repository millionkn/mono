import { useEffect, useState } from "react";

export function useStateBy<T>(deps: Iterable<any>, getValue: () => T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [saved] = useState(() => ({
    deps: [...deps],
  }))
  const [value, setValue] = useState(() => getValue())
  useEffect(() => {
    const curDeps = [...deps]
    if (curDeps.length === saved.deps.length) {
      if (curDeps.every((v, i) => saved.deps[i] === v)) { return }
    }
    saved.deps = curDeps
    setValue(getValue())
  })
  return [value, setValue]
}