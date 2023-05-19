import { dirname, relative } from "path";
import { fileURLToPath } from "url";

export const cwdPath = (path: string) => relative(process.cwd(), dirname(fileURLToPath(path))).replaceAll('\\', '/')