import config from '../../config'

const { minItems, maxItems, minAmount, itemThreshold } = config.coinflip

export function checkCoinflipGame(data) {
  if (!data || !data.side) {
    throw new Error('A side must be selected')
  } else if (!data.items || !(Array.isArray(data.items))) {
    throw new Error('Items must be an array')
  } else if (!checkItemArray(data.items)) {
    throw new Error('Incorrect items sent')
  } else if (data.items.length < minItems || data.items.length > maxItems) {
    throw new Error('Incorrect number of items')
  } else if (!checkPrice(data.items)) {
    throw new Error('Coinflip amount is too low')
  }
}

export function checkCoinflipJoinData(data, coinflipGame) {
  if (!data || !data.game || !data.game._id || !data.items) {
    throw new Error('Malformed data received')
  } else if (!Array.isArray(data.items)) {
    throw new Error('Items must be an array')
  } else if (!checkItemArray(data.items)) {
    throw new Error('Incorrect items sent')
  } else if (data.items.length < minItems || data.items.length > maxItems) {
    throw new Error('Incorrect number of items')
  } else if (!checkCoinflipPrice(data.items, data.game)) {
    throw new Error('Incorrect price of items')
  }
}

function checkCoinflipPrice(data, coinflipGame) {
  const gameTotal = getCoinflipTotal(coinflipGame)
  const itemTotal = getItemTotal(data)
  return ((gameTotal * 1.05) >= itemTotal) && ((gameTotal * 0.95) <= itemTotal)
}

function getCoinflipTotal(game) {
  if (!game || !game.creator || !game.joiner || !game.creator.items) {
    return 0.00
  }

  let total = 0.00
  for (const index in game.creator.items) {
    const item = game.creator.items[index]
    if (item && item.price) {
      total += parseFloat(item.price)
    }
  }
  if (game.joiner.items) {
    for (const index in game.joiner.items) {
      const item = game.joiner.items[index]
      if (item && item.price) {
        total += parseFloat(item.price)
      }
    }
  }
  return Number(total).toFixed(2)
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
