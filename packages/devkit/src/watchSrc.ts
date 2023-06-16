// import { envWrapper, normalizePath } from "./tools"
// import kill from 'tree-kill'
// import { Observable, debounceTime, filter, fromEvent, map, shareReplay, switchMap } from "rxjs"
// import { runScript } from "./runScript"
// import { relative } from "path/posix"
// import { getProjectDir } from "./workspace"
// import { watch } from "fs"

// export function watchSource(project: string) {
//   const change$ = new Observable<{ project: string, file: string }>((subscriber) => {
//     const watcher = runScript({
//       stdio: 'pipe',
//       script: `nx watch --projects=${project} --includeDependentProjects -- echo "${envWrapper('NX_PROJECT_NAME')}/${envWrapper('NX_FILE_CHANGES')}"`,
//     })

//     const subscribtion = fromEvent(watcher.stdout!, 'data').pipe(
//       map((data: any): string => data.toString()),
//       map((data) => {
//         const [project, ...file] = data.toString().split('/')
//         return {
//           project: project.trim(),
//           file: normalizePath(file.join('/').trim()),
//         }
//       }),
//       filter((emit) => {
//         const projectDir = getProjectDir(emit.project)
//         const file = normalizePath()
//         return relative(projectDir, emit.file).startsWith('src')
//       }),
//     ).subscribe(subscriber)
//     return () => {
//       kill(watcher.pid!, (err) => err && console.log(`结束进程异常:${err.message}`))
//       subscribtion.unsubscribe()
//     }
//   }).pipe(
//     shareReplay({ refCount: true, bufferSize: 1 }),
//     (ob$): typeof ob$ => new Observable((subscriber) => {
//       const subscribtion = ob$.subscribe(subscriber)
//       return () => setTimeout(() => subscribtion.unsubscribe(), 200)
//     }),
//   )
//   return {
//     self: change$.pipe(
//       filter((e) => e.project === project),
//       debounceTime(200),
//     ),
//     deps: change$.pipe(
//       filter((e) => e.project !== project),
//       debounceTime(200),
//     ),
//   }
// }