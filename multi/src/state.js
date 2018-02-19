var actions = require('./actions.js');

var initialState = {
  mocks: {},
};

/* -- Mock structure --
 * frp_server
 * frp_port
 * login
 * pass
 * smseagle1
 * smseagle2
 * callbackurl
 * callbackmethod
 * apikey
 * selfsigned
 * output []
 * state
 * error_text
 */

exports.mocks = function(state, action) {
  if (typeof state === 'undefined') return initialState;

  var newMocks = Object.assign({}, state.mocks);
  switch (action.type) {
    case actions.ADD_MOCK:
      if (action.mock.id && !(action.mock.id in newMocks)) {
        newMocks[action.mock.id] = {
          frp_server: action.mock.frp_server || '',
          frp_port: action.mock.frp_port || 7000,
          login: action.mock.login || 'admin',
          pass: action.mock.frp_server || 'password',
          smseagle1: action.mock.smseagle1 || '+123',
          smseagle2: action.mock.smseagle2 || '+321',
          callbackurl: action.mock.callbackurl || '',
          callbackmethod: action.mock.callbackmethod || 'POST',
          apikey: action.mock.apikey || '',
          selfsigned: action.mock.selfsigned || false,
          state: 'starting',
          error_text: '',
          output: [],
        };
      }
      break;
    case actions.REMOVE_MOCK:
      if (action.mockID in newMocks) {
        delete newMocks[action.mockID];
      }
      break;
    case actions.SET_STATE:
      if (action.mockID in newMocks) {
        newMocks[action.mockID] = Object.assign({}, newMocks[action.mockID], {
          state: action.state,
        })
      }
      break;
    case actions.SET_ERROR:
      if (action.mockID in newMocks) {
        newMocks[action.mockID] = Object.assign({}, newMocks[action.mockID], {
          state: 'error',
          error_text: action.error_text,
        })
      }
      break;
    case actions.APPEND_OUTPUT:
      if (action.mockID in newMocks) {
        var newOutput = newMocks[action.mockID].output.slice();
        newOutput.push(action.line);
        newMocks[action.mockID] = Object.assign({}, newMocks[action.mockID], {
          output: newOutput
        })
      }
      break;
    case '@@redux/INIT':
      break;
    default:
      console.error('Unhandled action:', action);
  }
  return { mocks: newMocks };
}
