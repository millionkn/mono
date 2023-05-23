import { dirname, relative, resolve } from "path";
import { cwd } from "process";
import { fileURLToPath } from "url";

export const getEnv = ((): (name: string) => string => {
  if (process.platform === 'win32') {
    return (name) => `%${name}%`
  } else {
    return (name) => `"$${name}"`
  }
})()

export const resolveAsCwd = (...pathArr: string[]) => relative(cwd(), resolve(dirname(fileURLToPath(import.meta.url)), ...pathArr)).replaceAll('\\', '/')