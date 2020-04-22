export function calculateLevel(totalWon) {
  let level = -1 + Math.sqrt(parseFloat(totalWon))
  if (level < 0) {
    level = 0
  }
  return level
}
