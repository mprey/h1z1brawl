let accounts = {}

if (process.env.NODE_ENV === "production") {
  accounts = {}
} else {
  accounts = {}
}

const settings = {
  adminIDs: [76561198309370875, 76561198123588820],
  domain: 'h1z1brawl.com',
  pollTime: 10 * 1000, /* 10 seconds */
  cancelTime: 2 * 60 * 1000, /* 2 minutes */
  confirmationTime: 15 * 1000 /* 15 seconds */
}

module.exports = {
  accounts: accounts,
  settings: settings
}
