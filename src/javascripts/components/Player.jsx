import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import classNames from 'classnames';

export default class Player extends Component {
  componentDidMount() {
    const { player, onBuzzer } = this.props;

    Mousetrap.bind(`shift+${player.key}`, () => {
      onBuzzer(player);
    });
  }

  render() {
    const { player } = this.props;

    return (
      <div className={classNames({
        player: true,
        'player--current': player.isCurrentPlayer,
      })} style={{ backgroundColor: player.color }}>
        <div className='player__name'>{player.name} ({player.key})</div>
        <div className='player__score'>{player.score}</div>
      </div>
    );
  }
}
