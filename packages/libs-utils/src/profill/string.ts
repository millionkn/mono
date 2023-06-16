export {}
declare global {
  interface String {
    asNumber: () => number | null
    pipeLine: <R>(pipe: (e: string) => R) => PipeLine<R>
    pipe: <R>(pipe: (e: string) => R) => R
  }
}
String.prototype.asNumber = function () {
  return Number(this || NaN).asNumber()
}
String.prototype.pipe = function (pipe) {
  return pipe(this.valueOf())
}
String.prototype.pipeLine = function (pipe) {
  return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe)
}