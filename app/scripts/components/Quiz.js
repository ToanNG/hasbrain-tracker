import React, { Component, PropTypes } from 'react';

class Quiz extends Component {
  static propTypes = {
    // items: PropTypes.object.isRequired,
  }

  render = () => {
    const items = this.props.items;

    return (
      <div>Hello</div>
      // items.map(q => {
      //    <div>Test</div>
      //  })
    );
  }
}

export default Quiz;
