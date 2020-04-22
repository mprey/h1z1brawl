class Bot {

  constructor({ accountName, password, sharedSecret, identitySecret, adminIDs, pollTime, cancelTime, confirmationTime, domain }) {
    this.accountName = accountName
    this.password = password
    this.sharedSecret = sharedSecret
    this.identitySecret = identitySecret
    this.adminIDs = adminIDs
    this.pollTime = pollTime
    this.cancelTime = cancelTime
    this.confirmationTime = confirmationTime
    this.domain = domain
    this.enabled = false

    this.log = this.log.bind(this)
  }

  log(message) {
    console.log(`${this.accountName} - ${message}`)
  }

  init() {
    this.createClient()
    this.createManager()
  }

}

export default Bot

require('./components/client')
require('./components/tradeOffer')
require('./components/coinflip')
require('./components/jackpot')
require('./components/admin')
