import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

class AdminRoute extends Component {

  isAdmin() {
    const { user } = this.props
    return user && user.rank >= 2
  }

  render() {
    const isAdmin = this.isAdmin()
    const { component: Component, ...rest } = this.props
    return (
      <Route
        {...rest}
        render={(props) => isAdmin === true
          ? <Component {...props} />
          : <Redirect to={{pathname: '/', state: {from: props.location}}} />}
      />
    )
  }

}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user
  }
}

export default connect(
  mapStateToProps
)(AdminRoute)
