export class PathTracker<T> {
  private sym = Symbol()
  private pathSpy = <T>(meta: T, getMeta: (pre: T, key: string | symbol) => T): any => {
    return new Proxy({} as any, {
      get: (target, p) => {
        if (this.sym === p) { return meta }
        return target[p] ||= this.pathSpy(getMeta(meta, p), getMeta)
      }
    })
  }
  constructor(
    private getMeta: (pre: T, key: string | symbol) => T
  ) {

  }

  getSpy = (initMeta: T) => this.pathSpy({
    purePath: (e: any) => e,
    meta: initMeta,
  }, (pre, key) => {
    return {
      purePath: (e) => pre.purePath(e)[key],
      meta: this.getMeta(pre.meta, key),
    }
  })
  unpack = (spy: any): null | {
    purePath: (e: any) => any,
    meta: T,
  } => {
    return !spy[this.sym] ? null : spy[this.sym]
  }
}