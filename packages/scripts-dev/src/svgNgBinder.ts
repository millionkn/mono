import { readFile, writeFile } from "fs/promises"
import { glob } from "glob"
import { resolve } from "path/posix"
import convert from "xml-js"
import { TmplAstNode, parseTemplate } from "@angular/compiler"
import * as entities from 'entities'
import { argv } from "process"

const __TmplAstNodeVisit: TmplAstNode['visit'] = () => { throw 'todo' }
type Visitor_3<T> = typeof __TmplAstNodeVisit<T> extends ((v: infer P) => any) ? P : never

function createVisitor3<T>(defalutValue: (node: TmplAstNode) => T, opt: { [key in keyof Visitor_3<T>]?: Visitor_3<T>[key] }): Visitor_3<T> {
  return {
    visitElement(e) { return defalutValue(e) },
    visitTemplate(e) { return defalutValue(e) },
    visitContent(e) { return defalutValue(e) },
    visitVariable(e) { return defalutValue(e) },
    visitReference(e) { return defalutValue(e) },
    visitTextAttribute(e) { return defalutValue(e) },
    visitBoundAttribute(e) { return defalutValue(e) },
    visitBoundEvent(e) { return defalutValue(e) },
    visitText(e) { return defalutValue(e) },
    visitBoundText(e) { return defalutValue(e) },
    visitIcu(e) { return defalutValue(e) },
    ...opt,
  }
}

const inputPathArg = argv[2]
const outputPathArg = argv[3]
if (!inputPathArg || !outputPathArg) {
  throw new Error('路径错误')
}

await glob(resolve(inputPathArg, '**/*.html'), { posix: true }).then(async (targetPathArr) => {
  for (const targetPath of targetPathArr) {
    const outputPath = resolve(outputPathArg, targetPath.replace(/\.html$/, '.svg'))
    console.log(`转换${targetPath}`)
    const ast = await readFile(targetPath)
      .then((buffer) => parseTemplate(buffer.toString(), targetPath))
    const findSvgNode = (nodes: TmplAstNode[]): TmplAstNode | null => {
      for (const node of nodes) {
        const target = node.visit(createVisitor3(() => null, {
          visitElement: (elem) => elem,
        }))
        if (target === null) { continue }
        if (target.name === ':svg:svg') { return target }
        const childResult = findSvgNode(target.children)
        if (childResult !== null) { return childResult }
      }
      return null
    }
    const svgTarget = findSvgNode(ast.nodes)
    let bindValueIndex = 0
    const buildJs = (
      node: TmplAstNode,
      preBoundTextArr: [string, string][],
    ): convert.Element => {
      return node.visit(createVisitor3<convert.Element>((e) => {
        throw new Error(`unknown syntax:${e.toString().slice(0, 30)}`)
      }, {
        visitElement: (e) => {
          if (e.name === ':svg:style') {
            return {
              type: 'element',
              name: 'style',
              elements: [
                {
                  type: 'text',
                  text: e.children.map((e) => e.sourceSpan.toString()).join('\n')
                }
              ],
            }
          }
          const xBindArr = e.inputs.filter((input) => e.outputs.find((output) => input.name === output.name))
          const inputArr = e.inputs.filter((input) => !xBindArr.find((e) => e.name === input.name))
          const outputArr = e.outputs.filter((output) => !xBindArr.find((e) => e.name === output.name))
          const curBoundTextArr: [string, string][] = []
          const elements = e.children.map((node) => buildJs(node, curBoundTextArr))

          const meta = {
            attrs: [
              ...xBindArr.map((e) => e.sourceSpan.toString()),
              ...inputArr.map((e) => e.sourceSpan.toString()),
              ...outputArr.map((e) => e.sourceSpan.toString()),
              ...e.references.map((e) => e.sourceSpan.toString()),
            ],
            boundTextArr: curBoundTextArr,
          }
          return {
            type: 'element',
            name: e.name.slice(5),
            elements,
            attributes: Object.fromEntries([
              ...e.attributes.map((attr) => [attr.name.replace(/^:/, ''), attr.value || '']),
              ...!Object.values(meta).find((e) => e.length > 0) ? [] : [['data-ngencode', entities.encode(JSON.stringify(meta))]]
            ]),
          }
        },
        visitText: (e) => {
          return {
            type: 'text',
            text: e.value,
          }
        },
        visitBoundText: (e) => {
          const alias = `$$${bindValueIndex++}`
          preBoundTextArr.push([alias, e.sourceSpan.toString()])
          return {
            type: 'text',
            text: alias,
          }
        }
      }))
    }
    if (!svgTarget) { throw new Error('not found svg') }
    await writeFile(outputPath, convert.js2xml({
      elements: [buildJs(svgTarget, [])],
    }))
    console.log(`已生成${outputPath}`)
  }
})

await glob(resolve(inputPathArg, '**/*.svg'), { posix: true }).then(async (targetPathArr) => {
  for (const targetPath of targetPathArr) {
    const outputPath = resolve(outputPathArg, targetPath.replace(/\.svg$/, '.html'))
    console.log(`转换${targetPath}`)
    const svgTemplate = await readFile(targetPath).then((buffer) => buffer.toString())
    const boundTextArr: [string, string][] = []
    const str1 = svgTemplate.replaceAll(/data-ngencode="(.*?)"/g, (str, meta) => {
      const saved: { attrs: string[], boundTextArr: [string, string][] } = JSON.parse(entities.decode(meta))
      boundTextArr.push(...saved.boundTextArr)
      return ['', ...saved.attrs, ''].join(' ')
    })
    const str2 = boundTextArr.reduce((pre, [tag, data]) => pre.replace(tag, data), str1)
    await writeFile(outputPath, str2)
  }
})