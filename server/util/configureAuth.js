import passport from 'passport'
import { Strategy as SteamStrategy } from 'passport-steam'
import jwt from 'jsonwebtoken'
import { User } from '../db'
import config from '../../config'

const configure = (app) => {

  app.use(passport.initialize())
  app.use(passport.session())

  const addJwt = (user) => {
    const token = jwt.sign({ id: user._id }, config.auth.jwt.secret, {
      expiresIn: "2 days"
    })
    return Object.assign({}, user.toJSON(), {token})
  }

  passport.use(new SteamStrategy({
    returnURL: `${config.api.host}api/auth/steam/return`,
    realm: config.api.host,
    apiKey: config.auth.steam.apiKey
  }, function(identifier, profile, done) {
    const id = identifier.match(/\d+$/)[0];
    const { displayName, photos } = profile, photo = photos[2].value

    const promise = User.findOneAndUpdate({ _id: id }, { name: displayName, image: photo }, { upsert: true, new: true, returnNewDocument: true }).exec()
    promise.then(user => {
      const tokened = addJwt(user)
      done(null, tokened)
    })
    .catch(err => {
      console.log('Mongoose Error: ', err)
      done(err)
    })
  }))

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((obj, done) => {
    done(null, obj)
  })

}

export default configure
