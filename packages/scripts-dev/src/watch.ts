import { argv } from "process"
import { runScript, resolveProjectDir, envWrapper, isInProjectSrc } from "./tools"
import kill from 'tree-kill'
import { debounceTime, filter, fromEvent, map, switchMap } from "rxjs"
const selfChange = argv[2]
if (selfChange !== '--ignore' && selfChange !== '--emit') {
  throw new Error('未设置selfChange:--ignore或--emit')
}

const projectName = argv[3]
resolveProjectDir(projectName)
const watcher = runScript({
  stdio: 'pipe',
  script: `nx watch --projects=${projectName} --includeDependentProjects -- echo "${envWrapper('NX_PROJECT_NAME')}/${envWrapper('NX_FILE_CHANGES')}"`,
})
let executor = runScript({
  stdio: 'inherit',
  script: `nx ${argv[4]} ${projectName}`
})
fromEvent(watcher.stdout!, 'data').pipe(
  map((data: any): string => data.toString()),
  map((data) => {
    const [projectName, ...fileName] = data.toString().split('/')
    return {
      projectName: projectName.trim(),
      fileName: fileName.join('/').trim(),
    }
  }),
  (ob$) => {
    if (selfChange !== '--ignore') { return ob$ }
    return ob$.pipe(filter((emit) => projectName !== emit.projectName))
  },
  filter((emit) => isInProjectSrc(emit.projectName, emit.fileName)),
  debounceTime(200),
  switchMap(() => new Promise<null>((res) => {
    if (executor.killed || executor.exitCode !== null) {
      return res(null)
    }
    kill(executor.pid!, (err) => {
      if (err) { console.log(`结束进程异常:${err.message}`) }
      res(null)
    })
  })),
).subscribe(() => {
  console.log(`rebuild depends...`)
  executor = runScript({
    stdio: 'inherit',
    script: `nx ${argv[4]} ${projectName}`
  })
})