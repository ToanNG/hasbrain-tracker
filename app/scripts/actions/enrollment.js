import 'isomorphic-fetch';

import { API_SERVER } from 'constants/ActionTypes';
import { switchTo } from 'containers/Router';

export function enroll(token, learningPathId) {
  return dispatch => {
    fetch(`${API_SERVER}/api/enrollment/create`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        learning_path: learningPathId,
      }),
    })
    .then(response => response.json())
    .then(result => dispatch(switchTo('home')))
  };
}
