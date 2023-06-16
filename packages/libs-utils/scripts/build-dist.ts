import { buildSource, normalizePath } from "@mono/devkit";
import { relative, resolve } from "path/posix";
import { fileURLToPath } from "url";

const __dir = normalizePath(fileURLToPath(import.meta.url))
const srcDir = resolve(__dir, '../src')

try{
  await buildSource('libs-utils', 'build-target', (path) => resolve('dist', relative(srcDir, path)))
}catch(e){
  e instanceof Error && console.error( e.message)
  throw e
}
