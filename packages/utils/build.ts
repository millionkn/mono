import { rollup } from 'rollup'
import { glob } from "glob"
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, relative } from "path";
import enhancedResolve from 'enhanced-resolve';
import { promisify } from 'util';
import { init as lexerInit, parse as lexerParse } from 'es-module-lexer';
import MagicString from 'magic-string';

await lexerInit

const resolve = promisify(enhancedResolve.create({
  extensions: [".ts", ".js"]
}));

try {
  const inputs = await glob('src/**/*.ts', {
    withFileTypes: false,
    posix: true,
  })

  const bundle = await rollup({
    external: (_, importer) => !!importer,
    input: Object.fromEntries(inputs.map((path) => [relative('src', path.split('.').slice(0, -1).join('.')), path])),
    plugins: [
      nodeResolve(),
      typescript({
        clean: true,
      }),
      {
        name: 'extName',
        transform: async function (code, id) {
          const magicString = new MagicString(code)
          const [imports] = lexerParse(code)
          for (const importSpecifier of imports) {
            const { d: dynamicIndex } = importSpecifier
            const start = dynamicIndex > -1 ? importSpecifier.s + 1 : importSpecifier.s
            const end = dynamicIndex > -1 ? importSpecifier.e + -1 : importSpecifier.e
            const target = code.slice(start, end)
            if (!target.startsWith('.')) { continue }
            const targetExtNonable = await this.resolve(target, id).then((e) => e?.id)
            if (!targetExtNonable) {
              this.error(`can't resolve '${target}' in '${id}'`, start)
            }
            const targetWithExt = await resolve(dirname(id), target)
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
  await bundle.write({
    format: 'esm',
    dir: 'dist',
    sourcemap: true,
  })
  await bundle.close()
} catch (e) {
  //@ts-ignore
  console.log(e.message)
}

