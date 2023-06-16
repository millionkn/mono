export {}
declare global {
  interface ObjectConstructor {
    pipeLineFrom<T>(obj: T): PipeLine<T>
  }
}
Object.pipeLineFrom = (value) => {
  return {
    unpack: (pipe = (v: any) => v) => pipe(value),
    pipeLine: (pipe) => Object.pipeLineFrom(pipe(value))
  }
}