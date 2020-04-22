import React, { Component } from 'react'
import { Grid } from 'react-bootstrap'

class Support extends Component {
    render() {
        return (
            <Grid className="FAQ">
                <h2><strong>Refunds:</strong></h2>
                <p>You can get refunds / offers resent from flips that didn't send a winning offer because of any bot / software / network problem.</p>
                <p>Here is what you have to do in order to recieve the offer:</p>
                <p>Join the discord channel and create a ticket on the #create-ticket channel. <br />Follow the instructions shown on the channel to create the ticket.</p>
                <p>Make sure you add the following info:</p>
                <p>Your SteamID (If you don't know how to find it you can use this webpage: steamidfinder.com).<br />Your Steam Trade Link (<a href="https://steamcommunity.com/id/me/tradeoffers/privacy" target="_blank" rel="noopener">Here</a>).<br />Game Round ID (it can be found on your jackpot / coinflip history).<br />Trade ID from your deposit / failed trade (it can be found on the trade sent by the bot in your trade history: <a href="https://steamcommunity.com/my/tradeoffers" target="_blank" rel="noopener">Here</a>).<br />Description of the issue you're having.</p>
                <p>Sending fake information or asking for refunds you already recieved may result in a ban from the site.</p>
                <p>Please always wait for a response from an admin or support member.<br />Do not spam the support channel or private message any of the admins / support members as this may result in a ban from the site.</p>
                <p>Your ticket will be reviewed and resolved as soon as possible. Thank you for your patience!</p>
                <h2><strong>Any other matter:</strong></h2>
                <p>Feel free to send a support ticket using the discord channel in case you have any other problem with the site or want to make any kind of suggestion.</p>
                <p>Please always keep in mind that we're humans and aren't online 24 hours a day, so getting a response might take some time (normally just a few minutes, almost always less than 24 hours).</p>
                <p>Thank you for using our site!</p>
            </Grid>
        )
    }
}

export default Support