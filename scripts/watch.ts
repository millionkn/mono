import { argv } from "process"
import { runScript, resolveProjectDir, envWrapper } from "./tools"
import kill from 'tree-kill'
const selfChange = argv[2]
if (selfChange !== '--ignore' && selfChange !== '--emit') {
  throw new Error('未设置selfChange:--ignore或--emit')
}

const projectName = argv[3]
await resolveProjectDir(projectName)

const watcher = runScript({
  stdio: 'pipe',
  script: `nx watch --projects=${projectName} --includeDependentProjects -- echo ${envWrapper('NX_PROJECT_NAME')}`,
})
let executor = runScript({
  stdio: 'inherit',
  script: `nx ${argv[4]} ${projectName}`
})
watcher.stdout!.on('data', async (data: Buffer) => {
  if (data.toString() === projectName) {
    if (selfChange === '--ignore') { return }
  }
  await new Promise<null>((res, rej) => {
    if (executor.killed || executor.exitCode !== null) { 
      res(null) 
    }else{
      kill(executor.pid!, (err) => err ? rej(err) : res(null))
    }
  })
  console.log(`rebuild depends...`)
  executor = runScript({
    stdio: 'inherit',
    script: `nx ${argv[4]} ${projectName}`
  })
})