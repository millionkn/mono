import { useEffect, useState } from "react";

export function useDebounceTime<T>(time: number, value: T) {
  const [result, setResult] = useState(() => value)
  useEffect(() => {
    if (result === value) { return }
    const timeout = setTimeout(() => setResult(value), time)
    return () => clearTimeout(timeout)
  }, [time, value])
  return result
}