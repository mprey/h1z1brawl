const RANGE_DELIM = 0.05

export function getCoinflipTotalAndRange(game) {
  const [low, high] = getCoinflipRange(game)
  return [getCoinflipTotal(game), low, high]
}

export function getCoinflipRange(game) {
  const total = parseFloat(getCoinflipTotal(game))
  return [parseFloat(total * (1 - RANGE_DELIM)), parseFloat(total * (1 + RANGE_DELIM))]
}

export function didCreatorWin(game) {
  if (!game || !game.winningPercentage || !game.creator || !game.joiner) {
    return true
  }

  const gameTotal = getCoinflipTotal(game)
  const creatorPercent = (getUserTotal(game.creator) / gameTotal) * 100
  const didStartBlack = (game.startingSide === 'black')

  if (didStartBlack) {
    return game.winningPercentage <= creatorPercent
  } else if (!didStartBlack) {
    const percentage = 100 - creatorPercent
    return game.winningPercentage >= percentage
  }
  return false
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

export function getCoinflipTotal(game) {
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
