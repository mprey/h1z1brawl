import { jackpot } from '../../config'

const { minItems, maxItems, minAmount, itemThreshold } = jackpot

export function checkJackpotItems(items) {
  if (!items || !(Array.isArray(items))) {
    throw new Error('Invalid item data received')
  } else if (!checkItemArray(items)) {
    throw new Error('Invalid items received')
  } else if (items.length < minItems || items.length > maxItems) {
    throw new Error(`Items must be between ${minItems} and ${maxItems}`)
  } else if (!checkPrice(items)) {
    throw new Error(`Items must value at least $${minAmount}`)
  }
}

function getItemTotal(items) {
  let total = 0.00
  for (var key in items) {
    total += parseFloat(items[key].price)
  }
  return Number(total).toFixed(2)
}

function isItem(item) {
  return item && item.hasOwnProperty('assetid') && item.hasOwnProperty('price') && item.hasOwnProperty('name') && item.hasOwnProperty('icon_url')
}

function checkPrice(items) {
  let total = 0.00
  for (var key in items) {
    total += Number(items[key].price)
  }
  return total >= minAmount
}

function checkItemArray(items) {
  for (var key in items) {
    const item = items[key]
    if (!isItem(item)) {
      return false
    } else if (item.price < itemThreshold) {
      return false
    }
  }
  return true;
}
