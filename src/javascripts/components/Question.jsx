import React, { Component } from 'react';
import Mousetrap from 'mousetrap';
import Content from './Content.jsx';
import soundManager from '../sounds';

export default class Question extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showHint: false,
    };
  }

  componentDidMount() {
    const { question } = this.props;

    // Show hint
    Mousetrap.bind('h', () => {
      const { showHint } = this.state;

      if (question && question.hint) {
        this.setState({
          showHint: !showHint,
        });
      }
    });

    Mousetrap.bind('p', () => {
      soundManager.play('waiting');
    });

    Mousetrap.bind('shift+p', () => {
      soundManager.stop('waiting');
    });
  }

  componentDidUpdate() {
    const { currentPlayer } = this.props;

    if (currentPlayer) {
      soundManager.stop('waiting');
    }
  }

  render() {
    const { showHint } = this.state;
    const { question, currentPlayer, dailyDoubleValue, onWrongAnswer, onCorrectAnswer, onNoAnswer } = this.props;

    return (
      <div className='question'>
        <div className='question__category'>
          {question.category}
        </div>

        {currentPlayer && (<div className='question__current-player' style={{ backgroundColor: currentPlayer.color }}>
          {currentPlayer.name}
        </div>)}

        <div className='question__content'>
          {!showHint && <Content type={question.answer.type} content={question.answer.content} />}
          {showHint && <Content type={question.hint.type} content={question.hint.content} />}
        </div>

        <div className='question__actions'>
          <button className='button button--red' onClick={() => {
            onWrongAnswer(question);
          }} disabled={!currentPlayer}>Falsch</button>
          <button className='button' onClick={() => {
            onNoAnswer(question);
          }} disabled={dailyDoubleValue}>Keine Antwort</button>
          <button className='button button--green' onClick={() => {
            onCorrectAnswer(question);
          }} disabled={!currentPlayer}>Richtig</button>
        </div>
      </div>
    );
  }
}
