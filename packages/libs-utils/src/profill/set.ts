

export { }
declare global {
  interface Set<T> {
    map<R>(cb: (item: T, index: number, arr: T[]) => R): R[]
    pipeLine: <R>(pipe: (e: this) => R) => PipeLine<R>
    pipe: <R>(pipe: (e: this) => R) => R
  }
}
Set.prototype.map = function (cb) {
  return [...this].map((item, index, arr) => cb(item, index, arr))
}
Set.prototype.pipe = function (pipe) {
  return pipe(this)
}
Set.prototype.pipeLine = function (pipe) {
  return Object.pipeLineFrom(this).pipeLine(pipe)
}