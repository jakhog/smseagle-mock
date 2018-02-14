var express = require('express');
var bodyparser = require('body-parser');

var wrongParams = require('./responses.js').wrongParams;
var handle = require('./handle.js');
var sendSms = require('./send-sms.js');

var app = express();
app.use(bodyparser.json({type: ['text/*','json']}));

//TODO:  Parse options from commandline

app.get('/index.php/http_api/send_sms', function(req, res) {
  handle(sendSms, req.query, res, false);
});

app.post('/index.php/jsonrpc/sms', function(req, res) {
  if (req.body && req.body.params) {
    switch (req.body.method) {
      case 'sms.send_sms':
        handle(sendSms, req.body.params, res, true);
        break;
      default:
        handle.sendResponse(wrongParams, req.body.params, res, true);
    }
  } else {
    handle.sendResponse(wrongParams, req.body.params || {}, res, true);
  }
});

app.listen(8080);
