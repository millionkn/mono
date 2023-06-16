// import { spawn } from "child_process";

// export const runScript = (opt: {
//   script: string,
//   cwd?: string,
//   stdio: 'pipe' | 'inherit'
// }) => {
//   const script = opt.script
//   const cwd = opt.cwd || process.cwd()
//   const childProcess = spawn(script, { shell: true, cwd, stdio: opt.stdio })
//   const cb = () => childProcess.kill('SIGINT')
//   process.on('SIGINT', cb)
//   process.on('exit', () => process.off('SIGINT', cb))
//   return childProcess
// }