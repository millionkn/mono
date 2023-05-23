import { rollup } from 'rollup'
import { glob } from "glob"
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, relative } from "path/posix";
import enhancedResolve from 'enhanced-resolve';
import { promisify } from 'util';
import { init as lexerInit, parse as lexerParse } from 'es-module-lexer';
import MagicString from 'magic-string';
import { argv } from 'process';
import { resolveAsCwd } from './tools';
import { stat } from 'fs/promises';
import fse from 'fs-extra';

const projectName = argv[2]
if (!projectName) {
  throw new Error(`未找到工程:packages/${projectName}`)
}
const projectDir = resolveAsCwd(`../packages/${projectName}`)
const projectStat = await stat(projectDir).catch((e) => null)
if (!projectStat?.isDirectory()) {
  throw new Error(`未找到工程:packages/${projectName}`)
}

await lexerInit

const resolveFile = promisify(enhancedResolve.create({
  extensions: [".ts", ".js"]
}));

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
      nodeResolve({
        rootDir: projectDir
      }),
      typescript({
        clean: true,
        tsconfig: `${projectDir}/tsconfig.json`,
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
            if (!target.startsWith('.')) { continue }
            const targetExtNonable = await this.resolve(target, id).then((e) => e?.id)
            if (!targetExtNonable) {
              this.error(`can't resolve '${target}' in '${id}'`, start)
            }
            const targetWithExt = await resolveFile(dirname(id), target)
            if (!targetWithExt) { continue }
            if (targetWithExt === targetExtNonable) { continue }
            magicString.update(start, end, target.concat('.js'))
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
}

