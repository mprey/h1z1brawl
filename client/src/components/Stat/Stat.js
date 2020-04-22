import React, { Component } from 'react'

import './Stat.css'

class Stat extends Component {

  render() {
    return (
      <div className="Stat">
        <p className="Stat__Data">
          {this.props.loading ? (
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
          ) : (
            this.props.data
          )}
        </p>
        <p className="Stat__Title">{this.props.title}</p>
      </div>
    )
  }

}

export default Stat
