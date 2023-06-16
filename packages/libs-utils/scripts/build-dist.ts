import { buildSource, normalizePath } from "@mono/devkit";
import { relative, resolve } from "path/posix";
import { fileURLToPath } from "url";

const __dir = normalizePath(fileURLToPath(import.meta.url))
const srcDir = resolve(__dir, '../src')

await buildSource('libs-utils', (path) => resolve('dist', relative(srcDir, path)))