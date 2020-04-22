import React, { Component } from 'react'
import { Grid } from 'react-bootstrap'
import config from '../../../../config'

import './FAQ.css'

class FAQ extends Component {

  render() {
    return (
      <Grid className="FAQ">
        <h2><span style={{textDecoration: "underline"}}><strong>Frequently Asked Questions</strong></span></h2>
        <h2><strong>Jackpot</strong></h2>
        <p>Jackpot is a game mode where users deposit their skins into a pot and after {config.jackpot.countdowns.gameCountdown} seconds a winner is picked. Your chance of winning depends on the amount you deposited and the size of the pot. Big deposits in relation to the pot size will result in a bigger chance of winning.</p>
        <h2><strong>Coinflip</strong></h2>
        <p>Coinflip is a game mode where two users will play against each other, depositing similar quantities resulting in similar chances to win. A coin will be flipped and the winner will get both player's items.</p>
        <h2><strong>Tax</strong></h2>
    <p>If you didn't get all the items from a jackpot or coinflip game, that's because of the site's tax. Default tax is set to { config.tax.noPromo * 100 }%, but this can be reduced to { config.tax.promo * 100 }% by adding { config.metadata.url } to your steam name and relogging on the site.</p>
        <h2><strong>Chat rules</strong></h2>
        <p>Users that spam, beg for items, harrass other users or promote other sites in chat will be muted. Repeating this kind of behavior might result in a permanent mute from the site's chat.</p>
        <h2><strong>Provably fair</strong></h2>
        <p>At every round start, a salt and a winning percentage is generated. The salt and winning percentage is encrypted into a hash string that is displayed to every user. Once the round is completed, the salt and the winning percentage is revealed to all users. Users can take the given salt and winning percentage and re-encrypt with an MD5 hash to validate the round. Alternatively, use the "verify" button on coinflip to validate hashes.</p>
        <h2><strong>Sponsor</strong></h2>
        <p>If you think your account is elegible to be sponsored (lots of followers on Youtube or other social media), just send a mail to <a href={config.metadata.email}>{config.metadata.email}</a>&nbsp;and your request will be looked over and responded.</p>
      </Grid>
    )
  }

}

export default FAQ
