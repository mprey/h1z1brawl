import React, { Component } from 'react'

class UserToggle extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    return (
      <a href="" onClick={this.handleClick} className="UserToggle">
        {this.props.children}
      </a>
    );
  }
}

export default UserToggle
