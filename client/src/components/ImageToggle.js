import React, { Component } from 'react'

class ImageToggle extends Component {

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
      <img src={this.props.image} onClick={this.handleClick} alt="image">
        {this.props.children}
      </img>
    );
  }

}

export default ImageToggle
