import { spawn } from "child_process";
import path, { relative, resolve } from "path";
import { cwd } from "process";
import ts from 'typescript';
import nxDevkit from "@nx/devkit";

export const envWrapper = ((): (name: string) => string => {
  if (process.platform === 'win32') {
    return (name) => `%${name}%`
  } else {
    return (name) => `$${name}`
  }
})()

export const resolveProjectDir = (graph: nxDevkit.ProjectGraph, projectName: string) => {
  const projectNode = graph.nodes[projectName]
  if (!projectNode) {
    throw new Error(`未找到工程:${projectName}`)
  }
  const result = relative(cwd(), resolve(nxDevkit.workspaceRoot, projectNode.data.root)).replaceAll('\\', '/')
  return `./${result}`
}

export function createTsImportResolver(tsConfigPath: string) {
  const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(tsConfig.config, ts.sys, path.dirname(tsConfigPath));
  const host = ts.createCompilerHost(options, true);
  return (source: string, importTarget: string) => ts
    .resolveModuleName(importTarget, source, options, host)
    .resolvedModule
}