const auth = {
  steam: {
    apiKey: process.env.STEAM_API_KEY || '5EB306084E5CB78D76E3DDFBF03346A7'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'derp derp derp'
  }
}

const api = {
  host: process.env.NODE_ENV !== "production" ? 'http://localhost:3001/' : process.env.API_URL,
  url: process.env.NODE_ENV !== "production" ? 'http://localhost:3001/' : '/',
}

const app = {
  host: process.env.NODE_ENV !== "production" ? 'http://localhost:3000/' : process.env.APP_URL,
  url: process.env.NODE_ENV !== "production" ? 'http://localhost:3000/' : '/'
}

const database = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost',
  redis: process.env.REDIS_URL || ''
}

const coinflip = {
  minItems: 1,
  maxItems: 15,
  minAmount: 1.00,
  itemThreshold: 0.10,
}

const jackpot = {
  minItems: 1,
  maxItems: 15,
  minAmount: 0.25,
  itemThreshold: 0.10,
  game: {
    maxItems: 60,
    depositsToStart: 2
  },
  countdowns: {
    gameCountdown: 90
  }
}

const tax = {
  promo: 0.05,
  noPromo: 0.10
}

const inventory = {
  cacheTimeout: 24 * 60 * 60, //1 day
  reloadCooldown: 30, //2 minutes
  endpoints: {
    default: 'inventory',
    forceReload: 'inventory/force'
  }
}

const prices = {
  updateInterval: 20 * 60 * 1000 //20 minutes
}

const socket = {
  public: {
    param: 'socket-public',
    path: ''
  },
  secure: {
    param: 'socket-secure',
    path: '/secure'
  }
}

module.exports = { //not transpiled
  auth: auth,
  jackpot: jackpot,
  prices: prices,
  api: api,
  tax: tax,
  app: app,
  coinflip: coinflip,
  socket: socket,
  inventory: inventory,
  database: database
}
