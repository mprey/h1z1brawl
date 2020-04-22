import { default as Bot } from '../bot'
import SteamUser from 'steam-user'
import SteamTotp from 'steam-totp'

Bot.prototype.createClient = function() {
  this.client = new SteamUser()
  this.client.options.promptSteamGuardCode = false

  this.logIn()

  this.client.on('loggedOn', this.loggedOn.bind(this))
  this.client.on('disconnected', this.disconnected.bind(this))
  this.client.on('steamGuard', this.steamGuard.bind(this))
  this.client.on('webSession', this.webSession.bind(this))
  this.client.on('error', this.error.bind(this))
}

Bot.prototype.logIn = function() {
  this.client.logOn({
    accountName: this.accountName,
    password: this.password,
    twoFactorCode: SteamTotp.generateAuthCode(this.sharedSecret)
  })
}

Bot.prototype.getSteamID64 = function() {
  if (this.client.steamID) { /* bot is logged in */
    return this.client.steamID.getSteamID64()
  }
  return null
}

Bot.prototype.error = function(err) {
  this.log(`error in steam-user: ${err}`)
}

Bot.prototype.logOut = function() {
  if (!this.client) {
    return
  }
  this.client.logOff()
}

Bot.prototype.webLogin = function() {
  this.log(`relogging in web session due to expiring`)
  this.client.webLogOn()
}

Bot.prototype.webSession = function(sessionId, cookies) {
  this.setSteamCookies(cookies)
}

Bot.prototype.disconnected = function(eresult, message) {
  this.log(`disconnected from Steam (${eresult} - ${message})`)
  this.logIn()
}

Bot.prototype.loggedOn = function() {
  this.log('logged onto Steam')
}

Bot.prototype.steamGuard = function(domain, callback) {
  callback(SteamTotp.generateAuthCode(this.sharedSecret))
}
