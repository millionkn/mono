export {}

declare global{
  interface Math {
    isInArea(point: [number, number] | null, area: [number, number][]): boolean
    avg(...arr: number[]): number
    WGS84ToMercator(point: [number, number]): [number, number]
    distance(p1: [number, number], p2: [number, number]): number
  }
}
Math.isInArea = function (point, area) {
  if (!(point instanceof Array) || area.length <= 2) { return false }
  const [pointX, pointY] = point || []
  if ((typeof pointX !== 'number') || (typeof pointY !== 'number')) { return false }
  return 1 === (1 & area
    .map(([x, y]): [number, number] => [x - pointX, y - pointY])
    .filter((cur, index, arr) => {
      const pre = arr[(arr.length + index) % arr.length]
      if (pre[0] * cur[0] > 0) { return false }
      if (pre[1] < 0 && cur[1] < 0) { return false }
      if (pre[0] > cur[0]) {
        cur[0] * pre[1] >= cur[1] * pre[0]
      } else {
        cur[0] * pre[1] <= cur[1] * pre[0]
      }
    }).length)
}
Math.WGS84ToMercator = function ([lng, lat]) {
  const earthRad = 6378137.0; //地球半径
  const param = lat * Math.PI / 180;
  return [
    lng * Math.PI / 180 * earthRad,
    earthRad / 2 * Math.log((1.0 + Math.sin(param)) / (1.0 - Math.sin(param))),
  ]
}
Math.distance = function ([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

Math.avg = function (...arr) {
  if (arr.length === 0) { return NaN }
  return arr.reduce((pre, cur) => pre + cur / arr.length, 0)
}