import { rollup } from 'rollup'
import { glob } from "glob"
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, relative, resolve } from 'path';
import { init as lexerInit, parse as lexerParse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { createTsImportResolver, resolveProjectDir } from './tools';
import fse from 'fs-extra';
import nxDevkit from "@nx/devkit";

const projectGraph = await nxDevkit.createProjectGraphAsync({
  exitOnError: true,
  resetDaemonClient: true,
})
await lexerInit

export async function rollupGlob(
  projectName: string,
  pattern: string,
  output: (input: string) => string,
) {
  const projectDir = resolveProjectDir(projectGraph, projectName)
  const tsModuleResolver = createTsImportResolver(resolve(projectDir, 'tsconfig.json'))
  const inputs = await glob(resolve(projectDir, pattern), {
    withFileTypes: false,
    posix: true,
    absolute: false,
  })
  return inputs
  // const bundle = await rollup({
  //   external: (_, importer) => !!importer,
  //   input: Object.fromEntries(inputs.map((path) => [relative(`${projectDir}/src`, path.split('.').slice(0, -1).join('.')), `./${path}`])),
  //   plugins: [
  //     typescript({
  //       clean: true,
  //       tsconfig: `${projectDir}/tsconfig.json`,
  //       check: false,
  //     }),
  //     nodeResolve({
  //       rootDir: projectDir
  //     }),
  //     {
  //       name: 'extName',
  //       transform: async function (code, id) {
  //         id = id.replaceAll('\\', '/')
  //         const magicString = new MagicString(code)
  //         const [imports] = lexerParse(code)
  //         for (const importSpecifier of imports) {
  //           const start = importSpecifier.d > -1 ? importSpecifier.s + 1 : importSpecifier.s
  //           const end = importSpecifier.d > -1 ? importSpecifier.e + -1 : importSpecifier.e
  //           const target = code.slice(start, end)
  //           const resolvedModule = tsModuleResolver(id, target)
  //           if (!resolvedModule) { continue }
  //           if (resolvedModule.isExternalLibraryImport) { continue }
  //           const importTarget = relative(dirname(id), resolvedModule.resolvedFileName)
  //             .replaceAll('\\', '/')
  //             .replace(/\.ts$/, `.js`)
  //             .replace(/\.tsx$/, `.jsx`)
  //           magicString.update(start, end, importTarget.startsWith('.') ? importTarget : `./${importTarget}`)
  //         }
  //         return {
  //           code: magicString.toString(),
  //           map: magicString.generateMap(),
  //         }
  //       }
  //     }
  //   ],
  // })
  // await fse.ensureDir(`${projectDir}/dist`)
  // await fse.emptyDir(`${projectDir}/dist`)
  // await bundle.write({
  //   format: 'esm',
  //   dir: `${projectDir}/dist`,
  //   sourcemap: true,
  // })
  // await bundle.close()
}
