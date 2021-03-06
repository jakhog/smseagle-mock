var express = require('express');
var bodyparser = require('body-parser');

var config = require('./config.js');
var wrongParams = require('./responses.js').wrongParams;
var mailbox = require('./mailbox.js');
var io = require('./io.js');
var handle = require('./handle.js');
var sendSms = require('./send-sms.js');
var readSms = require('./read-sms.js');

config.read();
mailbox.init();
io.init();

var app = express();
app.use(bodyparser.json({type: ['text/*','json']}));

app.get('/index.php/http_api/send_sms', function(req, res) {
  handle(sendSms, req.query, res, false);
});

app.get('/index.php/http_api/read_sms', function(req, res) {
  handle(readSms, req.query, res, false);
});

app.post('/index.php/jsonrpc/sms', function(req, res) {
  if (req.body && req.body.params) {
    switch (req.body.method) {
      case 'sms.send_sms':
        handle(sendSms, req.body.params, res, true);
        break;
      case 'sms.read_sms':
        handle(readSms, req.body.params, res, true);
        break;
      default:
        // Not a valid request
        handle.sendResponse(wrongParams(req.body.params), req.body.params, res, true);
    }
  } else {
    // Not a valid request
    handle.sendResponse(wrongParams(req.body.params || {}), req.body.params || {}, res, true);
  }
});

app.listen(config.port, function() {
  console.log('SMSeagle mock API listening on '+config.port);
});
