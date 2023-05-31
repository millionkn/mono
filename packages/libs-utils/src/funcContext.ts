import { MultipleMap } from "./multipleMap"

export class FuncContext {
  private cache1 = new MultipleMap<any>()
  withCache = <R>(deps: any[], getResult: (cacheIndex: number) => R): R => {
    const result = this.cache1.get(deps)
    if (!!result) { return result.value }
    return this.cache1.set(deps, getResult(this.cache1.size)).value
  }

  batchExecutor<Input, G extends readonly any[], R>(
    groupBy: (input: Input) => G,
    fun: (
      weakUp: (...args: any[]) => void,
      inputArr: Input[],
      groupBy: G,
    ) => Generator<void, () => Promise<R[]>, {}>): (input: Input) => Promise<R> {
    const cache = new MultipleMap<{
      batch: Input[],
      gen: Generator<void, () => Promise<R[]>, {}>,
      setWeakUp: (value: boolean) => void,
      promise: Promise<R[]>,
      res: (getResult: () => Promise<R[]>) => void,
      rej: (e: unknown) => void,
    }>()
    return async (arg1): Promise<R> => {
      const keys = groupBy(arg1)
      let saved = cache.get(keys)
      if (!saved) {
        let weakUp = true
        const batch: Input[] = []
        let res: (getResult: () => Promise<R[]>) => void = () => { }
        let rej: (e: unknown) => void = () => { }
        const gen = fun(() => {
          if (weakUp === true) { return }
          weakUp = true
          const r = gen.next({})
          weakUp = false
          if (r.done === true) { res(r.value) }
        }, batch, keys)
        weakUp = false
        saved = cache.set(keys, {
          gen,
          batch,
          setWeakUp: (v) => weakUp = v,
          res: (e) => res(e),
          rej: (e) => rej(e),
          promise: new Promise<() => Promise<R[]>>((_res, _rej) => {
            res = (e) => {
              res = () => { }
              rej = () => { }
              cache.remove(keys)
              _res(e)
            }
            rej = (e) => {
              res = () => { }
              rej = () => { }
              cache.remove(keys)
              _rej(e)
            }
          }).then(async (fun) => {
            const result = await fun()
            if (result.length !== batch.length) { throw new Error('batch返回长度不正确') }
            return result
          }),
        })
      }
      let index = saved.value.batch.length
      saved.value.batch.push(arg1)
      try {
        saved.value.setWeakUp(true)
        const nextResult = saved.value.gen.next({})
        saved.value.setWeakUp(false)
        if (nextResult.done) { saved.value.res(nextResult.value) }
      } catch (e) {
        saved.value.rej(e)
      }
      return saved.value.promise.then((arr) => arr[index])
    }
  }
}
