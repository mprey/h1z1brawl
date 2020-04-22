const auth = {
  steam: {
    apiKey: process.env.STEAM_API_KEY || '5EB306084E5CB78D76E3DDFBF03346A7'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'candemor de jarl'
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

const metadata = {
  name: 'H1Z1Brawl',
  url: 'h1z1brawl.com',
  email: 'support@h1z1brawl.com',
  discord: 'https://discord.gg/GMbkhkv',
  twitter: 'https://twitter.com/h1z1brawl',
  useLanding: true,
  gameId: 440,
  contextId: 2,
  gameName: 'H1Z1Brawl'
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
  minAmount: 2,
  itemThreshold: 0.10,
  game: {
    maxItems: 60,
    depositsToStart: 2
  },
  countdowns: {
    gameCountdown: 60 // 60 seconds
  },
  allowedItems: ['*'],
  numberOfPastRounds: 5,
}

const tax = {
  promo: 0.08,
  noPromo: 0.10
}

const inventory = {
  cacheTimeout: 24 * 60 * 60, //1 day
  reloadCooldown: 60,
  endpoints: {
    default: 'inventory',
    forceReload: 'inventory/force'
  }
}

const prices = {
  updateInterval: 14 * 24 * 60 * 60 * 1000, //1 day
  apiKey: process.env.BACKPACK_API || '5d771aa2d3817203cc276b55',
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

const bots = {
  domain: 'h1z1brawl.com',
  pollTime: 5 * 1000, /* 5 seconds */
  cancelTime: 2 * 60 * 1000, /* 2 minutes */
  confirmationTime: 15 * 1000, /* 15 seconds */
}

const rake = {
  automatedRakeTime: 60 * 60 * 1000, /* 1 hour */
  rakeAccount: process.env.RAKE_ACCOUNT || '76561198987351749',
  automatedRakeEnabled: false,
}

const chat = {
  minLevel: -1 
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
  database: database,
  metadata: metadata,
  bots: bots,
  rake: rake,
  chat: chat,
}
