import { spawn } from "child_process";
import path, { relative, resolve } from "path";
import { cwd } from "process";
import ts from 'typescript';
import nxDevkit from "@nx/devkit";
import { glob } from "glob";

export const envWrapper = ((): (name: string) => string => {
  if (process.platform === 'win32') {
    return (name) => `%${name}%`
  } else {
    return (name) => `$${name}`
  }
})()
const projectGraph = await nxDevkit.createProjectGraphAsync({
  exitOnError: true,
  resetDaemonClient: true,
})

export const resolveProjectDir = (projectName: string) => {
  const projectNode = projectGraph.nodes[projectName]
  if (!projectNode) {
    throw new Error(`未找到工程:${projectName}`)
  }
  const result = relative(cwd(), resolve(nxDevkit.workspaceRoot, projectNode.data.root)).replaceAll('\\', '/')
  return `./${result}`
}
export const isInProjectSrc =(projectName: string, file: string) => {
  const projectNode = projectGraph.nodes[projectName]
  if (!projectNode) {
    throw new Error(`未找到工程:${projectName}`)
  }
  return !relative(resolve(projectNode.data.root, 'src'), file).startsWith('..')
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

export function createTsImportResolver(tsConfigPath: string) {
  const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(tsConfig.config, ts.sys, path.dirname(tsConfigPath));
  const host = ts.createCompilerHost(options, true);
  return (source: string, importTarget: string) => ts
    .resolveModuleName(importTarget, source, options, host)
    .resolvedModule
}