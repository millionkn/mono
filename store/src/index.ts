import { exec } from "child_process";

exec(`npx nx watch --projects=${process.argv.slice(2).join(',')} --includeDependencies -- echo %NX_PROJECT_NAME%`)