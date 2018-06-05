import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import classNames from 'classnames';

export default class PlayerNameInput extends Component {
  static defaultProps = {
    onTestBuzzer: () => {},
    onPlayerNameChange: () => {},
    player: {
      key: '1',
    },
  };

  componentDidMount() {
    const { player, onTestBuzzer } = this.props;

    Mousetrap.bind(`shift+${player.key}`, () => {
      onTestBuzzer(player);
      Mousetrap.unbind(`shift+${player.key}`);
    });
  }

  componentWillUnmount() {
    const { player } = this.props;

    Mousetrap.unbind(`shift+${player.key}`);
  }

  render() {
    const { player, onPlayerNameChange } = this.props;

    return (
      <div className='player-name-input'>
        <div className='player-name-input__key'>{player.key}</div>
        <input className='player-name-input__name' type='text' value={player.name} onChange={(event) => {
          onPlayerNameChange(event, player);
        }} />
        <div className='player-name-input__buzzer-test'>
          <button className={classNames({
            control: true,
            'control--okay': player.checked,
          })} disabled={true} />
        </div>
      </div>
    );
  }
}
