import 'isomorphic-fetch';

import {
  API_SERVER,
  RUNNING_TEST_SERVER,
  GET_TODAY_ACTIVITY,
  GET_TODAY_ACTIVITY_SUCCESS,
  GET_TODAY_ACTIVITY_FAIL,
  START_ACTIVITY,
  START_ACTIVITY_SUCCESS,
  START_ACTIVITY_FAIL,
  SUBMIT_ANSWER,
  SUBMIT_ANSWER_SUCCESS,
  SUBMIT_ANSWER_FAIL,
} from 'constants/ActionTypes';

export function getTodayActivity(token) {
  return {
    types: [GET_TODAY_ACTIVITY, GET_TODAY_ACTIVITY_SUCCESS, GET_TODAY_ACTIVITY_FAIL],
    api: fetch(`${API_SERVER}/api/story/today`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }),
  };
}

export function giveUpActivity(token, activityId) {
  return {
    types: ['GIVE_UP_ACTIVITY', 'GIVE_UP_ACTIVITY_SUCCESS', 'GIVE_UP_ACTIVITY_FAIL'],
    api: fetch(`${API_SERVER}/api/story/giveup`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
      }),
    }),
  };
}

export function createActivity(token, activityId) {
  return {
    types: ['CREATE_ACTIVITY', 'CREATE_ACTIVITY_SUCCESS', 'CREATE_ACTIVITY_FAIL'],
    api: fetch(`${API_SERVER}/api/story/create`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
      }),
    }),
  };
}

export function startActivity(token, activityId) {
  return {
    types: [START_ACTIVITY, START_ACTIVITY_SUCCESS, START_ACTIVITY_FAIL],
    api: fetch(`${API_SERVER}/api/story/start`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
      }),
    }),
  };
}

export function showKnowledge(token, activityId) {
  return {
    types: ['SHOW_KNOWLEDGE', 'SHOW_KNOWLEDGE_SUCCESS', 'SHOW_KNOWLEDGE_FAIL'],
    api: fetch(`${API_SERVER}/api/story/show-knowledge`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity: activityId,
      }),
    }),
  };
}

// export function submitAnswer(token, storyId, targetRepo) {
//   return dispatch => {
//     dispatch({ type: SUBMIT_ANSWER })
//     return fetch(`${API_SERVER}/api/circle/build`, {
//       method: 'post',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         story: storyId,
//         repo: targetRepo,
//       }),
//     }).then((data) => {
//       dispatch({ type: SUBMIT_ANSWER_SUCCESS, result: data })
//     }).catch(() => {
//       dispatch({ type: SUBMIT_ANSWER_FAIL })
//     })
//   }
// }

export function submitAnswer(token, userId, activityNo, githubRepo) {
  return dispatch => {
    return fetch(`${RUNNING_TEST_SERVER}/api/test`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        activity_no: activityNo,
        github_repo: githubRepo,
      }),
    }).then(response => {
      if(response.status === 200) {
        return response.json()
      } else {
        return response.text().then((err)=>{
          throw new Error('Error: ' + err)
        })
      }
    }).then(result => {
      return result
    })
  }
}

export function submitAnswerCpp(token, userId, activityNo, githubRepo) {
  return dispatch => {
    return fetch(`http://54.169.226.33/api/test`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        activity_no: activityNo,
        github_repo: githubRepo,
      }),
    }).then(response => {
      if(response.status === 200) {
        return response.text()
      } else {
        return response.text().then((err)=>{
          throw new Error('Error: ' + err)
        })
      }
    }).then(result => {
      return result
    })
  }
}

export function submitAnswerJava(token, userId, activityNo, githubRepo) {
  return dispatch => {
    return fetch(`http://54.255.179.180/api/test`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        activity_no: activityNo,
        github_repo: githubRepo,
      }),
    }).then(response => {
      if(response.status === 200) {
        return response.text()
      } else {
        return response.text().then((err)=>{
          throw new Error('Error: ' + err)
        })
      }
    }).then(result => {
      return result
    })
  }
}

export function update(token, storyId, body) {
  return {
    types: ['UPDATE_STORY', 'UPDATE_STORY_SUCCESS', 'UPDATE_STORY_FAIL'],
    api: fetch(`${API_SERVER}/api/story/update/${storyId}`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),
  };
}
