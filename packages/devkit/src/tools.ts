import { resolve, relative } from "path";
import { cwd } from "process";

export const envWrapper = ((): (name: string) => string => {
  if (process.platform === 'win32') {
    return (name) => `%${name}%`
  } else {
    return (name) => `$${name}`
  }
})()

export const normalizePath = (path: string) => {
  const base = cwd()
  return relative(base, resolve(base, path)).replaceAll('\\', '/')
}

