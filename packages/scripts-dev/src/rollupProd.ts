import nxDevkit, { getProjects } from "@nx/devkit";

const projectGraph = await nxDevkit.createProjectGraphAsync()
const node = projectGraph.nodes['project-template-server']
projectGraph.dependencies
const a = nxDevkit.getDependentPackagesForProject(projectGraph,'project-template-server')
console.log(projectGraph.externalNodes)
