import React, { Component } from 'react'
import { Circle } from 'react-progressbar.js'

export default class CountDownTimer extends Component {
  //props (totalSeconds, secondsRemaining, color)
  constructor(props) {
    super(props)

    this.tick = this.tick.bind(this)

    this.state = {
      percent: (props.secondsRemaining / props.totalSeconds),
      seconds: props.secondsRemaining
    }

    this.interval = setInterval(this.tick, 1000)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.secondsRemaining !== this.props.secondsRemaining || nextProps.totalSeconds !== this.props.totalSeconds) {
      this.setState({
        percent: (nextProps.secondsRemaining / nextProps.totalSeconds),
        seconds: nextProps.secondsRemaining
      })
    }
  }

  tick() {
    if (this.props.freeze) {
      return
    }

    const seconds = this.state.seconds - 1

    if (seconds <= 0) {
      this.setState({ percent: 0, seconds: 0 })
      clearInterval(this.interval)
      if (this.props.onComplete) {
        setTimeout(this.props.onComplete, 1000) /* wait for the animation to finish */
      }
    } else {
      this.setState({ percent: (seconds / this.props.totalSeconds), seconds })
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    this.interval = null
  }

  render() {
    const { percent, seconds } = this.state
    return (
      <Circle
        progress={percent}
        options={{duration: 1000, color: this.props.color}}
        containerStyle={{width: this.props.width ? this.props.width : '40px', height: this.props.height ? this.props.height : '40px'}}
        text={this.props.noText ? null : seconds + ''}
      />
    )
  }

}
