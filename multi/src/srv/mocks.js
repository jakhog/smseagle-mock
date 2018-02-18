var portfinder = require('portfinder');
var fs = require('fs');
var os = require('os');
var path = require('path');
var ini = require('ini');
var child_process = require('child_process');

var actions = require('../actions.js');

var runningMocks = {};

var dispatchLines = function(stream, store, mockID) {
  stream.setEncoding('utf-8');
  var data = '';
  stream.on('data', function(chunk) {
    data += chunk;
    // Dispatch lines
    var nl;
    while ((nl = data.indexOf('\n')) >= 0) {
      store.dispatch(actions.appendOutput(mockID, data.substring(0,nl)))
      data = data.substring(nl+1);
    }
  });
};

var forkProcess = function(store, mock) {
  mock.child = child_process.fork('./main.js', [mock.mock_ini, mock.frpc_ini], {
    silent: true,
    cwd: path.join(__dirname,'../../../'),
  });
  dispatchLines(mock.child.stdout, store, mock.id);
  mock.child.on('error', function(err) {
    store.dispatch(actions.setError(mock.id, err.toString()));
    console.error(err);
  });
  mock.child.on('exit', function(code) {
    store.dispatch(actions.setState(mock.id, 'stopped'));
    mock.isrunning = false;
  });
  store.dispatch(actions.setState(mock.id, 'running'));
  mock.isrunning = true;
}

var writeConfigFiles = function(store, mock) {
  // Make temporary directory for files
  fs.mkdtemp(path.join(os.tmpdir(), 'mockconfig-'), function(err, dir) {
    if (err) {
      store.dispatch(actions.setError(mock.id, 'Couldnt create temporary directory'));
      console.error(err);
    } else {
      // Make FRP.ini config
      var frpcINI = {
        common: {
          server_addr: mock.params.frp_server,
          server_port: mock.params.frp_port
        }
      };
      frpcINI[mock.id] = {
        type: 'tcp',
        local_ip: '127.0.0.1',
        local_port: mock.port,
        remote_port: 0
      };
      var mockINI = {
        login: mock.params.login,
        pass: mock.params.pass,
        smseagle1: mock.params.smseagle1,
        smseagle2: mock.params.smseagle2,
        callbackurl: mock.params.callbackurl,
        callbackmethod: mock.params.callbackmethod,
        apikey: mock.params.apikey,
        selfsigned: mock.params.selfsigned,
        port: mock.port
      }

      // Write the .ini files
      fs.writeFile(dir+'/frpc.ini', ini.stringify(frpcINI), function(err) {
        if (err) {
          store.dispatch(actions.setError(mock.id, 'Couldnt write config file'));
          console.error(err);
        } else {
          mock.frpc_ini = dir+'/frpc.ini';
          fs.writeFile(dir+'/mock.ini', ini.stringify(mockINI), function(err) {
            if (err) {
              store.dispatch(actions.setError(mock.id, 'Couldnt write config file'));
              console.error(err);
            } else {
              mock.mock_ini = dir+'/mock.ini';
              forkProcess(store, mock);
            }
          });
        }
      });
    }
  });
}

exports.newMock = function(store, mock) {
  var mockID = mock.id;
  // Create the mock (will have status 'starting')
  store.dispatch(actions.addMock(mock));

  // Find a free port to use
  portfinder.getPort(function (err, port) {
    if (err) {
      store.dispatch(actions.setError(mockID, 'No free ports'));
      console.error(err);
    } else {
      // Create a new entry in our map to keep track of status
      runningMocks[mock.id] = {
        id: mock.id,
        params: mock,
        port: port,
      };
      // Write temporary config files for the mock to use
      writeConfigFiles(store, runningMocks[mock.id]);
    }
  });
}

exports.stopMock = function(store, mockID) {
  if (mockID in runningMocks) {
    store.dispatch(actions.setState(mockID, 'stopping'));
    runningMocks[mockID].child.kill();
  }
}

exports.removeMock = function(store, mockID) {
  if (mockID in runningMocks && !runningMocks[mockID].isrunning) {
    delete runningMocks[mockID];
    store.dispatch(actions.removeMock(mockID));
  }
}

exports.sendSMS = function(params) {
  if (params.mockID in runningMocks) {
    var mock = runningMocks[params.mockID];
    mock.child.stdin.write('INCOMING '+params.from+' '+params.to+' "'+params.message.replace('"','\\"')+'"\n');
  }
}
