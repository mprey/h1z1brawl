export function isTradeURL(input) {
  if (!input || input.length === 0) {
    return false
  }
  
  return ~input.indexOf('token=')
}
