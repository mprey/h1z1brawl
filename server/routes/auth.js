import { Router } from 'express'
import { User } from '../db'
import passport from 'passport'
import config from '../../config'

const router = Router()

router.get('/auth/steam', passport.authenticate('steam'))

router.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(config.app.url)
  }
)

router.get('/auth/reload', (req, res) => {
  if (!req.user) {
    return res.end(200)
  }
  const token = (' ' + req.user.token).slice(1)
  User.findById(req.user._id).exec()
    .then(weird => {
      const user = weird.toObject()
      user.token = token
      req.login(user, (err) => {
        if (err) return res.end(200)
        res.end(JSON.stringify(req.user))
      })
    })
})

router.get('/auth/loadAuth', (req, res) => {
  res.end(JSON.stringify(req.user))
})

router.get('/auth/logout', (req, res) => {
  req.logout()
  res.redirect(config.app.url)
})

export default router
