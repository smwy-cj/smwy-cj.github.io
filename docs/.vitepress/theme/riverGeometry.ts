// One artwork-space path drives the current, boat and complementary split masks.
export const riverLine = [
  [0, .9], [.1, .84], [.22, .76], [.34, .68], [.46, .61],
  [.57, .54], [.67, .44], [.76, .32], [.84, .21], [.93, .13], [1, .07]
] as const
export const sceneAspect = 1485 / 1059
export function riverY(x: number) {
  const next = riverLine.findIndex(p => p[0] >= x)
  if (next <= 0) return riverLine[0][1]
  const a = riverLine[next - 1], b = riverLine[next]
  return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])
}
export function sceneCover(width: number, height: number) {
  const aspect = width / height
  return { x: Math.min(1, aspect / sceneAspect), y: Math.min(1, sceneAspect / aspect) }
}
export function riverX(y: number) {
  const next = riverLine.findIndex(p => p[1] <= y)
  if (next < 0) return 1
  if (next === 0) return 0
  const a = riverLine[next - 1], b = riverLine[next]
  return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])
}
export function scenePoint(x: number, y: number, width: number, height: number) {
  const cover = sceneCover(width, height)
  return { x: ((x - .5) / cover.x + .5) * width, y: ((y - .5) / cover.y + .5) * height }
}
export function riverClips(width: number, height: number) {
  const line = riverLine.map(([x, y]) => {
    const p = scenePoint(x, y, width, height)
    return `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`
  })
  const start = scenePoint(0, .9, width, height).y
  const end = scenePoint(1, .07, width, height).y
  return [
    `polygon(-100% -100%, 200% -100%, 200% ${end}px, ${[...line].reverse().join(', ')}, -100% ${start}px)`,
    `polygon(-100% 200%, 200% 200%, 200% ${end}px, ${[...line].reverse().join(', ')}, -100% ${start}px)`
  ]
}
