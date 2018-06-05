import React, { Component } from 'react';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';
import randomcolor from 'randomcolor';
import { sample } from 'lodash';
import headerImage from '../../images/jeopardy.jpg';
import PlayerNameInput from './PlayerNameInput.jsx';
import Player from './Player.jsx';
import DailyDouble from './DailyDouble.jsx';
import Content from './Content.jsx';
import Question from './Question.jsx';
import soundManager from '../sounds';

export default class Game extends Component {
  constructor(props) {
    super(props);

    const { id } = props.gameData;

    if (localStorage.getItem(`jeopardy-${id}`)) {
      this.state = JSON.parse(localStorage.getItem(`jeopardy-${id}`));
    } else {
      this.state = {
        playersEntered: false,
        openForInput: false,
        showBounsCategory: false,
        currentQuestion: null,
        dailyDouble: false,
        lastPlayerKey: null,
        players: [],
        answeredQuestions: [],
        showHint: false,
        solution: false,
      };
    }
  }

  componentDidMount() {
    // Allow moderator to open/close board for players
    Mousetrap.bind('t', () => {
      this.setState({ openForInput: !this.state.openForInput });
    });

    // Allow moderator to show/hide bonus category
    Mousetrap.bind('b', () => {
      this.setState({ showBounsCategory: !this.state.showBounsCategory });
    });

    // Select random user
    Mousetrap.bind('r', () => {
      const currentPlayer = this.currentPlayer();

      if (currentPlayer) {
        this.setPlayerState(currentPlayer.key, {
          isCurrentPlayer: false,
        }, this.selectRandomPlayer.bind(this));
      } else {
        this.selectRandomPlayer();
      }
    });

    // Deselect current user
    Mousetrap.bind('shift+r', () => {
      this.resetCurrentPlayer();
    });

    // ESC current question
    Mousetrap.bind('esc', () => {
      const { lastPlayerKey } = this.state;

      this.setState({
        openForInput: false,
        currentQuestion: null,
        solution: false,
      });

      if (lastPlayerKey) {
        this.setPlayerState(lastPlayerKey, {
          isCurrentPlayer: true,
        });
      }
    });

    // Go to fullscreen
    Mousetrap.bind('shift+f', () => {
      document.documentElement.mozRequestFullScreen();
    });
  }

  componentDidUpdate() {
    const { id } = this.props.gameData;
    localStorage.setItem(`jeopardy-${id}`, JSON.stringify(this.state));
  }

  resetCurrentPlayer() {
    const currentPlayer = this.currentPlayer();

    if (currentPlayer) {
      this.setPlayerState(currentPlayer.key, {
        isCurrentPlayer: false,
      });
    }
  }

  selectRandomPlayer() {
    const randomPlayer = sample(this.state.players);
    this.setPlayerState(randomPlayer.key, {
      isCurrentPlayer: true,
    });
    this.setState({
      lastPlayerKey: randomPlayer.key,
    });
  }

  setPlayerState(key, update, callback = null) {
    const { players } = this.state;
    const index = players.findIndex(player => player.key === key);
    players[index] = { ...players[index], ...update };
    this.setState({ players }, callback);
  }

  onPlayerNameChange(event, player) {
    this.setPlayerState(player.key, {
      name: event.target.value,
    });
  }

  onTestBuzzer(player) {
    soundManager.play('buzzer');
    this.setPlayerState(player.key, {
      checked: true,
    });
  }

  onBuzzer(player) {
    const { openForInput } = this.state;

    if (openForInput && !this.currentPlayer()) {
      soundManager.play('buzzer');

      this.setState({
        openForInput: false,
      }, () => {
        this.setPlayerState(player.key, {
          isCurrentPlayer: true,
        });

        this.setState({
          lastPlayerKey: player.key,
        });
      });
    }
  }

  onAddPlayer() {
    const { players } = this.state;

    this.setState({
      players: [
        ...players,
        {
          key: players.length + 1,
          name: '',
          checked: false,
          score: 0,
          color: randomcolor({
            luminosity: 'light',
          }),
          isCurrentPlayer: false,
        },
      ],
    });
  }

  onGameStart() {
    this.setState({ playersEntered: true });
  }

  onDailyDoubleInput(event) {
    this.setState({
      dailyDoubleValue: parseInt(event.target.value, 10),
    });
  }

  onDailyDoubleSubmit() {
    const { dailyDouble } = this.state;
    this.setState({
      dailyDouble: null,
      currentQuestion: dailyDouble,
    });
  }

  areAllPlayersReady() {
    return this.state.players.length > 0 && this.state.players.every(player => player.checked === true);
  }

  currentPlayer() {
    return this.state.players.find(player => player.isCurrentPlayer);
  }

  categories() {
    const { categories, bonusCategory } = this.props.gameData;
    const { showBounsCategory } = this.state;

    const keys = Object.keys(categories);

    if (showBounsCategory || !bonusCategory) {
      return keys;
    }

    return keys.filter(key => key !== bonusCategory);
  }

  renderPlayersDialog() {
    const { players } = this.state;

    return (
      <div className='players-input'>
        <div className='players-input__content'>
          {players.map(player => (
            <PlayerNameInput
              key={`player-${player.key}`}
              player={player}
              onPlayerNameChange={this.onPlayerNameChange.bind(this)}
              onTestBuzzer={this.onTestBuzzer.bind(this)}
            />
          ))}
        </div>

        <div className='players-input__footer'>
          <button className='button' onClick={this.onAddPlayer.bind(this)}>Spieler_in hinzufügen</button>
          <button className='button button--green' onClick={this.onGameStart.bind(this)} disabled={!this.areAllPlayersReady()}>Spiel starten</button>
        </div>
      </div>
    );
  }

  onWrongAnswer(question) {
    const currentPlayer = this.currentPlayer();
    const { dailyDoubleValue } = this.state;

    this.setPlayerState(currentPlayer.key, {
      score: currentPlayer.score - (dailyDoubleValue || question.value),
    }, () => {
      this.resetCurrentPlayer();

      if (dailyDoubleValue) {
        this.selectRandomPlayer();
        this.setState({
          dailyDoubleValue: false,
          openForInput: false,
          currentQuestion: null,
          solution: question.solution ? question : false,
          answeredQuestions: [
            ...this.state.answeredQuestions,
            `${question.category} ${question.value}`,
          ],
        });
      } else {
        this.setState({ openForInput: true });
      }
    });
  }

  onNoAnswer(question) {
    this.selectRandomPlayer();
    this.setState({
      openForInput: false,
      currentQuestion: null,
      answeredQuestions: [
        ...this.state.answeredQuestions,
        `${question.category} ${question.value}`,
      ],
      solution: question.solution ? question : false,
    });
  }

  onCorrectAnswer(question) {
    const currentPlayer = this.currentPlayer();
    const { dailyDoubleValue } = this.state;

    this.setPlayerState(currentPlayer.key, {
      score: currentPlayer.score + (dailyDoubleValue || question.value),
    }, () => {
      this.setState({
        answeredQuestions: [
          ...this.state.answeredQuestions,
          `${question.category} ${question.value}`,
        ],
        openForInput: false,
        currentQuestion: null,
        dailyDoubleValue: null,
        solution: question.solution ? question : false,
      });
    });
  }

  render() {
    const { title, values, categories } = this.props.gameData;
    const { players, openForInput, playersEntered, currentQuestion, answeredQuestions, dailyDouble, solution, dailyDoubleValue } = this.state;

    return (
      <div className='game'>
        <div className='game__title'>{title}</div>
        <div className='game__buzzer-status'>
          <button
            disabled={true}
            className={classNames({
              control: true,
              'control--small': true,
              'control--okay': openForInput,
            })}
          />
        </div>

        <div className='game__board'>
          <table className='board'>
            <colgroup>
              {this.categories().map(category => (
                <col key={category} style={{ width: `${100 / this.categories().length}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {this.categories().map(category => (
                  <th className='board__category' key={category}>{category}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((value, index) => (
                <tr key={value}>
                  {this.categories().map(category => (
                    <td key={`${value}-${category}`} className='board__value'>
                      <div className='board__value-inner'>
                        <button
                          className={classNames({
                            'board__value-button': true,
                            'board__value-button--answered': answeredQuestions.find(q => q === `${category} ${value}`),
                          })}
                          disabled={answeredQuestions.find(q => q === `${category} ${value}`) && true}
                          onClick={() => {
                            if (this.currentPlayer()) {
                              if (categories[category][index].daily) {
                                this.setState({
                                  showHint: false,
                                  dailyDouble: {
                                    ...categories[category][index],
                                    index,
                                    category,
                                    value,
                                  },
                                });
                              } else {
                                this.resetCurrentPlayer();
                                this.setState({
                                  showHint: false,
                                  openForInput: true,
                                  dailyDouble: false,
                                  currentQuestion: {
                                    ...categories[category][index],
                                    index,
                                    category,
                                    value,
                                  },
                                });
                              }
                            }
                          }}
                        >{value}</button>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {playersEntered && (<div className='game__players'>
          <table className='players'>
            <colgroup>
              {players.map(player => (
                <col key={player.key} style={{ width: `${100 / players.length}%`}} />
              ))}
            </colgroup>
            <tbody>
              <tr>
                {players.map(player => (
                  <td key={player.key} className='players__player'>
                    <Player player={player} onBuzzer={this.onBuzzer.bind(this)} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>)}

        {solution && (<div className='question'>
          <div className='question__category'>
            {solution.category}
          </div>

          <div className='question__content'>
            <Content type={solution.solution.type} content={solution.solution.content} />
          </div>
        </div>)}

        {dailyDouble && <DailyDouble
          onDailyDoubleInput={this.onDailyDoubleInput.bind(this)}
          onDailyDoubleSubmit={this.onDailyDoubleSubmit.bind(this)}
          dailyDouble={dailyDouble}
          currentPlayer={this.currentPlayer()}
        />}

        {currentQuestion && <Question
          question={currentQuestion}
          currentPlayer={this.currentPlayer()}
          dailyDoubleValue={dailyDoubleValue}
          onWrongAnswer={this.onWrongAnswer.bind(this)}
          onCorrectAnswer={this.onCorrectAnswer.bind(this)}
          onNoAnswer={this.onNoAnswer.bind(this)}
        />}

        {!playersEntered && this.renderPlayersDialog()}
      </div>
    );
  }
}
