import { rollup } from 'rollup'
import { glob } from "glob"
import tsPlugin from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, relative, resolve } from 'path/posix';
import MagicString from 'magic-string';
import { normalizePath } from './tools.js';
const fse = await import('fs-extra')
const lexer = await import('es-module-lexer')
import { getProjectDir, getProjectNamedInputs } from './workspace.js';
import { createTsImportResolver } from './createTsImportResolver.js';

await lexer.init

export async function buildSource(
  projectName: string,
  namedInputs: string,
  getOutputDir: (normalizedPath: string) => string,
) {
  const projectDir = getProjectDir(projectName)
  const tsModuleResolver = createTsImportResolver(resolve(projectDir, 'tsconfig.json'))
  const sourceInputs = getProjectNamedInputs(projectName, namedInputs)
  const inputs = await glob(sourceInputs.glob, {
    withFileTypes: false,
    posix: false,
    absolute: true,
  }).then((arr) => arr.map(normalizePath))
  const bundle = await rollup({
    external: (_, importer) => !!importer,
    input: Object.fromEntries(inputs.map((input) => {
      const outputDir = dirname(normalizePath(getOutputDir(normalizePath(input))))
      const fileNameWithOutExt = relative(dirname(input), input).replace(/\.ts$/, '').replace(/\.tsx$/, '')
      return [resolve(outputDir, fileNameWithOutExt), input]
    })),
    plugins: [
      tsPlugin({
        clean: true,
        tsconfig: `${projectDir}/tsconfig.json`,
        check: false,
      }),
      nodeResolve({
        rootDir: projectDir
      }),
      {
        name: 'extName',
        transform: async function (code, id) {
          id = normalizePath(id)
          const magicString = new MagicString(code)
          const [imports] = lexer.parse(code)
          for (const importSpecifier of imports) {
            const start = importSpecifier.d > -1 ? importSpecifier.s + 1 : importSpecifier.s
            const end = importSpecifier.d > -1 ? importSpecifier.e + -1 : importSpecifier.e
            const target = code.slice(start, end)
            const resolvedModule = tsModuleResolver(id, target)
            if (!resolvedModule) { continue }
            if (resolvedModule.isExternalLibraryImport) { continue }
            const importTarget = relative(dirname(id), resolvedModule.resolvedFileName)
              .replace(/\.ts$/, `.js`)
              .replace(/\.tsx$/, `.jsx`)
            magicString.update(start, end, importTarget.startsWith('.') ? importTarget : `./${importTarget}`)
          }
          return {
            code: magicString.toString(),
            map: magicString.generateMap(),
          }
        }
      }
    ],
  })
  await fse.ensureDir(`${projectDir}/dist`)
  await fse.emptyDir(`${projectDir}/dist`)
  await bundle.write({
    format: 'esm',
    dir: `${projectDir}/dist`,
    sourcemap: true,
  })
  await bundle.close()
}
