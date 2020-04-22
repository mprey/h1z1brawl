import { jackpot } from '../../../config'

export function getJackpotStats(round, user) { //jackpot amount, current players, amount deposited, chance to win, items
  const jackpotTotal = getJackpotTotal(round)
  const numPlayers = round.deposits.length
  const numDeposited = getUserDepositedAmount(round, user)
  const chance = numDeposited === 0.00 ? '0.00%' : `${Number(numDeposited / jackpotTotal * 100).toFixed(2)}%`
  const items = `${getTotalJackpotItems(round)}/${jackpot.game.maxItems}`

  return [`$${Number(jackpotTotal).toFixed(2)}`, numPlayers, `$${Number(numDeposited).toFixed(2)}`, chance, items]
}

export function getWinnerChance(round) {
  const total = getJackpotTotal(round)
  let winnerTotal = 0.00
  for (const index in round.deposits) {
    const deposit = round.deposits[index]
    if (deposit.id === round.winner.id) {
      for (const index in deposit.items) {
        winnerTotal += parseFloat(deposit.items[index].price)
      }
    }
  }
  return winnerTotal / total * 100
}

export function getDepositChance(round, deposit) {
  const total = getJackpotTotal(round)
  let depositTotal = 0.00
  for (const index in deposit.items) {
    depositTotal += parseFloat(deposit.items[index].price)
  }
  return depositTotal / total
}

export function getSortedItems(round) {
  const array = []
  for (const index in round.deposits) {
    array.push(...round.deposits[index].items)
  }
  return array.sort((a, b) => b.price - a.price)
}

export function getTotalJackpotItems(round) {
  if (!round || !round.deposits) {
    return 0
  }

  let items = 0
  for (const index in round.deposits) {
    const deposit = round.deposits[index]
    items += deposit.items.length
  }
  return items
}

export function getJackpotTotal(round) {
  if (!round || !round.deposits) {
    return 0
  }

  let total = 0.00
  for (const index in round.deposits) {
    const deposit = round.deposits[index]
    for (const index in deposit.items) {
      const item = deposit.items[index]
      total += parseFloat(item.price)
    }
  }
  return Number(total).toFixed(2)
}

function getUserDepositedAmount(round, user) {
  let total = 0.00
  if (!user) {
    return total
  }
  
  for (const index in round.deposits) {
    const deposit = round.deposits[index]
    if (deposit.id === user._id) {
      for (const index in deposit.items) {
        total += parseFloat(deposit.items[index].price)
      }
    }
  }
  return total
}
