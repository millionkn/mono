let index = 0
let str = new Date().toISOString()

export function snowFlake(): string {
  const curStr = new Date().toISOString()
  if (curStr !== str) {
    str = curStr
    index = 0
  }
  return `${curStr}${(index++).toString().padStart(8, '0')}`
}