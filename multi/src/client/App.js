import React, { Component } from 'react';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Typography from 'material-ui/Typography';
import Snackbar from 'material-ui/Snackbar';

import './App.css';
import state from '../state.js';
import Menu from './Menu.js';
import Display from './Display.js';

class App extends Component {
  constructor() {
    super();
    // Connect to the server to get state
    const ws = new WebSocket((window.location.protocol == 'https:' ? 'wss://' : 'ws//')+window.location.host);
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.initial_state) {
        if (this.state.store) {
          console.error('Already received initial state');
        } else {
          const store = createStore(state.mocks, msg.initial_state);
          this.setState({
            store: store,
            handleCommand: (command, params) => {
              ws.send(JSON.stringify({
                command: command,
                params: params,
              }));
            },
            error: '',
          });
        }
      } else if (msg.action) {
        if (this.state.store) {
          this.state.store.dispatch(msg.action);
        }
      }
    });
    ws.addEventListener('close', () => {
      this.setState({
        error: 'Connection to server lost! Please reload...'
      })
    });
    ws.addEventListener('error', () => {
      this.setState({
        error: 'Connection to server lost! Please reload...'
      })
    });
  }

  state = {
    selectedMockID: undefined,
    error: 'Connecting to server...',
    store: undefined,
    notificationOpen: false,
    notificationMessage: '',
  };

  handleMockSelect = (mockID) => {
    this.setState({selectedMockID: mockID});
  };
  handleNotificationClose = () => {
    this.setState({ notificationOpen: false });
  };
  notify = (msg) => {
    this.handleNotificationClose();
    this.setState({
      notificationOpen: true,
      notificationMessage: msg,
    });
  };

  render() {
    let content;
    if (this.state.error) {
      content = <div className="error">
        <Typography className="message" variant="display1">
          {this.state.error}
        </Typography>
      </div>;
    } else {
      content = <Provider store={this.state.store}>
        <React.Fragment>
          <Menu
            onClickMock={this.handleMockSelect}
            selectedMockID={this.state.selectedMockID}
            sendCommand={this.state.handleCommand}
            notify={this.notify}
          />
          <Display
            mockID={this.state.selectedMockID}
            sendCommand={this.state.handleCommand}
            notify={this.notify}
          />
          <Snackbar
            open={this.state.notificationOpen}
            onClose={this.handleNotificationClose}
            message={<span>{this.state.notificationMessage}</span>}
            autoHideDuration={6000}
          />
        </React.Fragment>
      </Provider>;
    }

    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
