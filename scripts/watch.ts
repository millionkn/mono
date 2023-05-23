import { argv } from "process";

console.log(argv.slice(2))

//exec(`npx nx watch --projects=${process.argv.slice(2).join(',')} --includeDependencies -- echo ${getEnv('NX_PROJECT_NAME')}`)

export {}