export {}
declare global {
  interface Map<K, V> {
    mapValue<R>(fun: (entities: readonly [K, V], index: number) => R): Map<K, R>
    asArray<R>(mapper: (entries: [K, V], index: number) => R): R[]
    pipeLine: <R>(pipe: (e: this) => R) => PipeLine<R>
    pipe: <R>(pipe: (e: this) => R) => R
  }
}
Map.prototype.asArray = function (mapper) {
  return [...this.entries()].map(([k, v], index) => mapper([k, v], index))
}
Map.prototype.mapValue = function (fun) {
  return new Map([...this.entries()].map(([key, value], index) => [key, fun([key, value], index)]))
};
Map.prototype.pipe = function (pipe) {
  return pipe(this)
}
Map.prototype.pipeLine = function (pipe) {
  return Object.pipeLineFrom(this).pipeLine(pipe)
}