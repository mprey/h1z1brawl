import { Bot } from '../db'

export function addBot(accountName, password, sharedSecret, identitySecret) {
    return new Bot({ accountName, password, sharedSecret, identitySecret }).save()
}

export function removeBot(accountName) {
    return Bot.find({ accountName }).remove().exec()
}