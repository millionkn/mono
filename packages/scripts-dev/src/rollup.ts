import { rollup } from 'rollup'
import { glob } from "glob"
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, relative, resolve } from 'path';
import { init as lexerInit, parse as lexerParse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { argv } from 'process';
import { createTsImportResolver, resolveProjectDir } from './tools';
import fse from 'fs-extra';

const projectDir = resolveProjectDir(argv[2])
await lexerInit
const tsModuleResolver = createTsImportResolver(resolve(projectDir, 'tsconfig.json'))

try {
  const inputs = await glob(`${projectDir}/src/**/*.ts`, {
    withFileTypes: false,
    posix: true,
    absolute: false,
  })
  const bundle = await rollup({
    external: (_, importer) => !!importer,
    input: Object.fromEntries(inputs.map((path) => [relative(`${projectDir}/src`, path.split('.').slice(0, -1).join('.')), `./${path}`])),
    plugins: [
      typescript({
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
          id = id.replaceAll('\\', '/')
          const magicString = new MagicString(code)
          const [imports] = lexerParse(code)
          for (const importSpecifier of imports) {
            const start = importSpecifier.d > -1 ? importSpecifier.s + 1 : importSpecifier.s
            const end = importSpecifier.d > -1 ? importSpecifier.e + -1 : importSpecifier.e
            const target = code.slice(start, end)
            const resolvedModule = tsModuleResolver(id, target)
            if (!resolvedModule) { continue }
            if (resolvedModule.isExternalLibraryImport) { continue }
            const importTarget = relative(dirname(id), resolvedModule.resolvedFileName)
              .replaceAll('\\', '/')
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
} catch (e) {
  //@ts-ignore
  console.log(e.message)
  throw e
}