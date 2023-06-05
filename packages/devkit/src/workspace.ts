import nxDevkit from "@nx/devkit";
import { resolve } from "path";
import { normalizePath } from "./tools";
import { readJson, readJsonSync } from "fs-extra";

const projectGraph = await nxDevkit.createProjectGraphAsync()

export const getProjectDir = (projectName: string) => {
  const projectNode = projectGraph.nodes[projectName]
  if (!projectNode) {
    throw new Error(`未找到工程:${projectName}`)
  }
  return normalizePath(resolve(nxDevkit.workspaceRoot, projectNode.data.root))
}

const globCache: Record<string, string[]> = {}

export const getProjectNamedInputs = (projectName: string, inputName: string) => {
  const cacheKey = JSON.stringify([projectName, inputName])
  if (globCache[cacheKey]) { return globCache[cacheKey] }
  const nxJson = readJsonSync(resolve(nxDevkit.workspaceRoot, 'nx.json')).catch(() => null)
  if (typeof nxJson !== 'object' || nxJson instanceof Array || nxJson === null) {
    throw new Error(`nx.json is invalid`)
  }
  const projectJson = readJsonSync(resolve(getProjectDir(projectName), 'project.json')).catch(() => null)
  if (typeof projectJson !== 'object' || projectJson instanceof Array || projectJson === null) {
    throw new Error(`${projectName}/project.json is invalid`)
  }
  const findResult = Object.entries({
    ...nxJson.namedInputs,
    ...projectJson.namedInputs,
  }).find(([key]) => key === inputName)
  if (!findResult) { return null }
  const globArr: string[] = findResult[1] as any
  if (globArr instanceof Array && globArr.every((v) => typeof v === 'string')) {
    return globCache[cacheKey] = globArr.map((glob) => glob.replaceAll('{workspaceRoot}', normalizePath(nxDevkit.workspaceRoot)).replaceAll('{projectRoot}', getProjectDir(projectName)))
  }
  throw new Error(`project '${projectName}' invalid namedInputs:'${inputName}' `)
}