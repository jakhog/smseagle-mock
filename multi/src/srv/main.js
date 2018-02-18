var express = require('express');
var http = require('http');
var websockets = require('ws');
var redux = require('redux');
var eventemitter = require('events');

var actions = require('../actions.js');
var state = require('../state.js');
var mocks = require('./mocks.js');

var events = new eventemitter();
/* ----- Create redux store ----- */
var store = redux.createStore(
  state.mocks,
  redux.applyMiddleware(function() {
    return function(next) {
      return function(action) {
        events.emit('action', action);
        return next(action);
      }
    }
  })
);

/* ----- Normal HTTP app ----- */
var app = express();
app.use(express.static('./build/'));

var handleCommand = function(command, params) {
  switch (command) {
    case 'new_mock':
      mocks.newMock(store, params);
      break;
    case 'stop_mock':
      mocks.stopMock(store, params);
      break;
    case 'remove_mock':
      mocks.removeMock(store, params);
      break;
    case 'send_sms':
      mocks.sendSMS(params);
      break;
  }
}

var server = http.createServer(app);
/* ----- WS server ----- */
var ws = new websockets.Server({ server });

ws.on('connection', function(client, req) {
  client.send(JSON.stringify({
    initial_state: store.getState()
  }));

  client.on('message', function(data) {
    var msg = JSON.parse(data);
    if (msg.command && msg.params) {
      handleCommand(msg.command, msg.params);
    }
  });

  var actionForward = function(action) {
    client.send(JSON.stringify({
      action: action
    }));
  };
  events.addListener('action', actionForward);
  client.on('close', function() {
    events.removeListener('action', actionForward);
  });
  client.on('error', function() {
    events.removeListener('action', actionForward);
  });
});
ws.on('error', function() {}); //TODO: Should we handle errors?

/* ----- Start server ----- */
server.listen(8080);
