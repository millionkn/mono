export {}
declare global {
  interface Number {
    times<T>(fun: (i: number) => T): T[];
    asNumber: () => number | null
    pipeLine: <R>(pipe: (e: number) => R) => PipeLine<R>
    pipe: <R>(pipe: (e: number) => R) => R
  }
}
Number.prototype.times = function (fun) {
  return new Array(this.valueOf())
    .fill(null)
    .map((_, i) => fun(i))
}
Number.prototype.asNumber = function () {
  if (Number.isNaN(this) || Infinity === this || -Infinity === this) { return null }
  return Number(this).valueOf()
}
Number.prototype.pipe = function (pipe) {
  return pipe(this.valueOf())
}
Number.prototype.pipeLine = function (pipe) {
  return Object.pipeLineFrom(this.valueOf()).pipeLine(pipe)
}