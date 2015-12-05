import React, { Component } from 'react';
import Loader from 'react-loaders';
import 'loaders.css/src/animations/ball-scale-multiple.scss';

class Image extends Component {
  static defaultProps = {
    loader: <Loader type='ball-scale-multiple' />,
    onLoad: () => undefined,
    onError: () => undefined,
  }

  state = { isLoading: true }

  componentDidMount = () => {
    this._checkValidImage();
  }

  _checkValidImage = () => {
    let image = document.createElement('img');
    image.src = this.props.src;
    image.onload = this._handleLoad;
    image.onerror = this._handleError;
  }

  _handleLoad = () => {
    this.setState({ isLoading: false }, () => this.props.onLoad());
  }

  _handleError = () => {
    this.setState({ isLoading: true }, () => this.props.onError());
  }

  render = () => {
    let { src, className, style, loader } = this.props;
    let { isLoading } = this.state;

    if (!isLoading) {
      style = {
        ...style,
        background: `url(${src}) center/cover no-repeat #CCC`,
      };
    }

    return (
      <div className={className} style={style}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#CCC',
          opacity: +isLoading,
          transition: 'opacity 500ms',
        }}>
          {loader}
        </div>
      </div>
    );
  }
}

export default Image;
