import React, { Component } from 'react'
import { Grid } from 'react-bootstrap'
import config from '../../../config'

class TOS extends Component {

  render() {
    return (
      <Grid className="FAQ">
        <h2><span style={{ textDecoration: "underline" }}><strong>Terms and Conditions of Service</strong></span></h2>
        <p>By using { config.metadata.url } you agree to the Terms and Conditions of Service described below.</p>
        <p>Item prices shown on the site do not represent any real life value and are intended for entertainment purposes only. {config.metadata.name} does not offer the opportunity to win real money.</p>
        <p>You must be at least 18 years old to play on {config.metadata.url}</p>
        <p>If you do not agree with any of these terms and conditions, you are not allowed to use {config.metadata.url} and must leave the site.</p>
        <h2><strong>Limitation of Liability</strong></h2>
        <p>You enter this website and use its services at your own risk. The website and the games are provided without any warranty whatsoever, whether expressed or implied. It is not guaranteed that the website is fit for its purpose, free from errors or will be accessible without interruptions.</p>
        <p>The website and its owners shall not be liable and assume no responsibility for any loss, costs, expenses or damages, whether direct, indirect, special, consequential, incidental or otherwise, arising in relation to your use of the website or your participation in the games.</p>
        <p>{config.metadata.name} reserves the right to cease the games at any time without previous notice.</p>
        <h2><strong>Item losses and refunds</strong></h2>
        <p>If any loss occurred during the course of a game caused by a software or network issue, the user will have 24 hours to make a claim by creating a support ticket in the <a href={config.metadata.discord} target="_blank" rel="noopener">Discord</a> server,&nbsp;providing all the evidence required in the "Support" section or the Discord support channel.</p>
        <p>It is recommended to withdraw the winnings from any game as soon as possible to avoid any kind of problem.</p>
        <p>Refunds will be made using any items that hold the same value shown on the site as the items affected by the problem.</p>
        <h2><strong>Code of Conduct</strong></h2>
        <p>Users must be respectful and polite to each other at any time. Any spam, harassment, staff impersonating and website advertisement is forbidden and may result in website/chat restrictions.</p>
        <p>The website and its owners also reserve the right to block any user&rsquo;s account for scam attempt or bug exploit, including item price abusing.</p>
        <h2><strong>Privacy</strong></h2>
        <p>By using the website and/or any of its services you acknowledge that your Steam Profile, name and avatar may be shared with other {config.metadata.url} users. {config.metadata.name} does not store, share or ask for any personal information of its users.</p>
        <h2><strong>Affiliation</strong></h2>
        <p>{config.metadata.name} is in no way affiliated with Valve Corporation, {config.metadata.gameName} or any other trademarks of the Valve Corporation.</p>
      </Grid>
    )
  }

}

export default TOS
