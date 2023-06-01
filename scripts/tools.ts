import { ChildProcess, spawn } from "child_process";
import fs from "fs/promises";
import { dirname, relative, resolve } from "path";
import { cwd } from "process";
import { fileURLToPath } from "url";

export const envWrapper = ((): (name: string) => string => {
  if (process.platform === 'win32') {
    return (name) => `%${name}%`
  } else {
    return (name) => `"$${name}"`
  }
})()

const resolveAsCwd = (...pathArr: string[]) => relative(cwd(), resolve(dirname(fileURLToPath(import.meta.url)), ...pathArr)).replaceAll('\\', '/')

export const resolveProjectDir = async (projectName: string) => {
  if (!projectName) {
    throw new Error(`未找到工程:packages/${projectName}`)
  }
  const projectDir = resolveAsCwd(`../packages/${projectName}`)
  const projectStat = await fs.stat(projectDir).catch((e) => null)
  if (!projectStat?.isDirectory()) {
    throw new Error(`未找到工程:packages/${projectName}`)
  }
  return projectDir
}

export const runScript = (opt: {
  script: string,
  cwd?: string,
  stdio: 'pipe' | 'inherit'
}) => {
  const script = opt.script
  const cwd = opt.cwd || process.cwd()
  const childProcess = spawn(script, { shell: true, cwd, stdio: opt.stdio })
  const cb = () => childProcess.kill('SIGINT')
  process.on('SIGINT', cb)
  process.on('exit', () => process.off('SIGINT', cb))
  return childProcess
}