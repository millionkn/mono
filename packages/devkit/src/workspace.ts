import nxDevkit from "@nx/devkit";
import { resolve } from "path";
import { normalizePath } from "./tools";
import { readJsonSync } from "fs-extra";
import anymatch from "anymatch";

const projectGraph = await nxDevkit.createProjectGraphAsync()

export const getProjectDir = (projectName: string) => {
  const projectNode = projectGraph.nodes[projectName]
  if (!projectNode) {
    throw new Error(`未找到工程:${projectName}`)
  }
  return normalizePath(resolve(nxDevkit.workspaceRoot, projectNode.data.root))
}

const globCache: Record<string, {
  glob: string[],
  tester: (str: string) => boolean
}> = {}

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
  const findResult = Object.entries<string[]>({
    ...nxJson.namedInputs,
    ...projectJson.namedInputs,
  }).find(([key]) => key === inputName)
  if (!findResult) {
    throw new Error(`project '${projectName}' should set namedInputs:'${inputName}' `)
  }
  const rawGlobArr: string[] = findResult[1]
  if (!(rawGlobArr instanceof Array && rawGlobArr.every((v) => typeof v === 'string'))) {
    throw new Error(`project '${projectName}' invalid namedInputs:'${inputName}' `)
  }
  const globArr = rawGlobArr
    .map((rawGlob) => rawGlob.replaceAll('{workspaceRoot}', normalizePath(nxDevkit.workspaceRoot)))
    .map((rawGlob) => rawGlob.replaceAll('{projectRoot}', getProjectDir(projectName)))
  return globCache[cacheKey] = {
    glob: globArr,
    tester: anymatch(globArr)
  }
}