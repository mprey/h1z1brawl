import config from '../../config'

export function getJackpotTotal(game) {
  let total = 0.00
  for (const index in game.deposits) {
    const deposit = game.deposits[index]
    for (const index in deposit.items) {
      const item = deposit.items[index]
      total += parseFloat(item.price)
    }
  }
  return total
}

export function getTotalWinnings(jackpotRound) {
  const { winner } = jackpotRound
  const comission = hasBrawlInName(winner.name) ? config.tax.promo : config.tax.noPromo
  const total = getJackpotTotal(jackpotRound)
  const tax = Number(total * comission).toFixed(2)

  const sortedItems = sortItemsDesc(getAllItems(jackpotRound))
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

export function findWinningDeposit(game, ticket) {
  let currentTicket = 0
  for (const index in game.deposits) {
    const deposit = game.deposits[index]
    const depositTickets = getDepositTotal(deposit) * 100
    currentTicket += depositTickets
    if (ticket <= currentTicket) {
      return deposit
    }
  }
}

export function getOfferTotal(jackpotOffer) {
  let total = 0.00
  for (const index in jackpotOffer.userItems) {
    total += parseFloat(jackpotOffer.userItems[index].price)
  }
  return total
}

function getAllItems(round) {
  const items = []
  for (const index in round.deposits) {
    const deposit = round.deposits[index]
    items.push(...deposit.items)
  }
  return items
}

function sortItemsDesc(items) {
  return items.sort((a, b) => b.price - a.price)
}

function hasBrawlInName(string) {
  if (!string) {
    return false
  }
  return string.toLowerCase().indexOf(config.metadata.url) !== -1
}

function getDepositTotal(deposit) {
  let total = 0.00
  for (const index in deposit.items) {
    const item = deposit.items[index]
    total += parseFloat(item.price)
  }
  return total
}
