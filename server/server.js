import express from 'express'
import session from 'express-session'
import http from 'http'
import socketIo from 'socket.io'
import socketioJwt from 'socketio-jwt'
import bodyParser from 'body-parser'
import path from 'path'
import config from '../config'
import mongoose from 'mongoose'
import connectMongoStore from 'connect-mongo'

import { default as configureAuth } from './util/configureAuth'
import { default as updatePrices } from './util/priceUpdater'
import { default as authRoute } from './routes/auth'
import { connect as connectMongo } from './db'
import { default as connectSecureIo } from './sockets/secure'
import { default as connectPublicIo } from './sockets/public'

const app = express()
const server = http.Server(app)
const publicIo = socketIo.listen(server)
const secureIo = socketIo.listen(server, { path: '/secure' })
const MongoStore = connectMongoStore(session)

secureIo.use(socketioJwt.authorize({
  secret: config.auth.jwt.secret,
  handshake: true
}))

app.set('port', (process.env.PORT || 3001));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

connectMongo(mongoose)
connectSecureIo(secureIo)
connectPublicIo(publicIo)

app.use(session({
  secret: config.auth.jwt.secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

configureAuth(app)

app.use('/api', authRoute)


// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  })
}

server.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

updatePrices(config.prices.updateInterval) //update prices for the database! woot
