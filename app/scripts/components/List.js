import React, { Component, PropTypes } from 'react';

class List extends Component {
  _handleClick = id => {
    var { onClickItem } = this.props;
    onClickItem && onClickItem(id);
  }

  render = () => {
    var { dataSource } = this.props;
    return (
      <ul>
        {dataSource.map((item, key) =>
          <li key={key}>
            {item.title}
          </li>
        )}
      </ul>
    );
  }
}

export default List;
