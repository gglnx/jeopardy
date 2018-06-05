import React, { Component, Fragment } from 'react';

export default class Content extends Component {
  render() {
    const { type, content } = this.props;

    switch (type) {
      case 'text':
        return <Fragment>{content}</Fragment>;
      case 'image':
        return <img src={content} className='content' />;
      case 'video':
        return <video src={content} autoPlay={true} className='content' controls={true} />;
      default:
        return <Fragment>Unbekannter Typ</Fragment>;
    }
  }
}
