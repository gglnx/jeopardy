import React, { Component } from 'react';
import soundManager from '../sounds';

export default class DailyDouble extends Component {
  componentDidMount() {
    soundManager.play('dailydouble');
  }

  componentWillUnmount() {
    soundManager.stop('dailydouble');
  }

  render() {
    const { onDailyDoubleInput, onDailyDoubleSubmit, dailyDouble, currentPlayer } = this.props;

    const min = dailyDouble.value;
    const max = Math.max(currentPlayer.score, 500);

    return (
      <div className='daily-double'>
        <h1 className='daily-double__headline'>Daily Double!</h1>
        <input className='daily-double__input' onChange={onDailyDoubleInput} type='number' min={min} max={max} />
        <div className='daily-double__min-max'>{min} / {max}</div>
        <div className='button button--green' onClick={onDailyDoubleSubmit}>Setzen</div>
      </div>
    );
  }
}
