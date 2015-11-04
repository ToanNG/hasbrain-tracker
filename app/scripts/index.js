import React from 'react';
import {render} from 'react-dom';
import 'app.css';

var name: string = 'x';
var b: {prop1: number, prop2: string} = {
  prop1: 42,
  prop2: 'true',
};

class Hello extends React.Component {
  state = {
    message: 'Hello ES7',
  }

  tic = (message: string): void => {
    name = true;
    console.log(message + ' ' + name);
  }

  render = () => {
    let {message} = this.state;
    this.tic(message);
    return <h1>{message}</h1>;
  }
}

render(
  <Hello />,
  document.getElementById('root')
);
