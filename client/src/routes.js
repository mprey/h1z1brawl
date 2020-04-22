import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { AdminRake, AdminTradeOffers, Coinflip, Jackpot, History, AdminRoute } from './containers'
import { FAQ, Giveaway, NotFound, TOS, Support } from './components'


const Routes = ({ secureSocket, publicSocket }) => (
  <main>
    <Switch>
      <Route exact path="/" render={props => <Jackpot secureSocket={secureSocket} publicSocket={publicSocket} {...props} />} />
      <Route path="/jackpot" render={props => <Jackpot secureSocket={secureSocket} publicSocket={publicSocket} {...props} />} />
      <Route path="/coinflip" render={props => <Coinflip secureSocket={secureSocket} publicSocket={publicSocket} {...props} />} />
      <Route path="/faq" component={FAQ} />
      <Route path="/tos" component={TOS} />
      <Route path="/support" component={Support} />
      <Route path="/history" render={props => <History publicSocket={publicSocket} {...props} />} />
      <Route path="/giveaway" component={Giveaway} />
      <AdminRoute path="/admin/rake" component={AdminRake} />
      <AdminRoute path="/admin/trades" component={AdminTradeOffers} />
      <Route component={NotFound} />
    </Switch>
  </main>
)

export default Routes
