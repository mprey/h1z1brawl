import config from '../../config'

export function getCoinflipTotal(game) {
  const joiner = getJoinerTotal(game), creator = getCreatorTotal(game)
  return joiner + creator
}

export function getJoinerTotal(game) {
  if (!game || !game.joiner || !game.joiner.items) {
    return 0.00
  }

  let total = 0.00
  for (const index in game.joiner.items) {
    const item = game.joiner.items[index]
    if (item && item.price) {
      total += parseFloat(item.price)
    }
  }
  return total
}

function getAllItems(game) {
  if (game.creator.items && game.joiner.items) {
    return [...game.creator.items, ...game.joiner.items]
  }
  return []
}

function sortItemsDesc(items) {
  return items.sort((a, b) => b.price - a.price)
}

export function getTotalWinnings(game, winner) {
  const commission = hasBrawlInName(winner) ? config.tax.promo : config.tax.noPromo
  const total = getCoinflipTotal(game)
  const tax = Number(total * commission).toFixed(2)

  const sortedItems = sortItemsDesc(getAllItems(game))
  let totalTaxed = 0.00
  const itemsForTax = []

  for (const index in sortedItems) {
    const item = sortedItems[index]
    if (item.price <= (tax - totalTaxed)) {
      itemsForTax.push(item)
      totalTaxed += parseFloat(item.price)
    }
  }

  const winnings = sortedItems.filter((test) => {
    for (const index in itemsForTax) {
      const item = itemsForTax[index]
      if (item.assetid === test.assetid) {
        return false
      }
    }
    return true
  })
  return { winnings, rake: itemsForTax }
}

export function getUserTotal(user) {
  if (!user || !user.items) {
    return 0.00
  }

  let total = 0.00
  for (const index in user.items) {
    const item = user.items[index]
    if (item && item.price) {
      total += parseFloat(item.price)
    }
  }
  return total
}

export function getCreatorTotal(game) {
  if (!game || !game.creator || !game.creator.items) {
    return 0.00
  }

  let total = 0.00
  for (const index in game.creator.items) {
    const item = game.creator.items[index]
    if (item && item.price) {
      total += parseFloat(item.price)
    }
  }
  return total
}

export function hasBrawlInName(user) {
  if (!user || !user.name) {
    return false
  }
  return user.name.toLowerCase().indexOf('h1z1brawl.com') !== -1
}
