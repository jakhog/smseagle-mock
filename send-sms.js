var datetime = require('date-and-time');

var config = require('./config.js');
var wrongParams = require('./responses.js').wrongParams;

/*
var logMessages = function(messages) {
  messages.forEach(function(msg) {
    var str = 'SMS -';
    str += ' ID:'+msg.message_id;
    str += ' TO:'+msg.to;
    str += ' MSG:"'+msg.message+'"';
    if (msg.date) str += ' DATE:'+msg.date.toUTCString();
    if (msg.highpriority) str += ' PRIORITY';
    if (msg.unicode) str += ' UNICODE';
    if (msg.flash) str += ' FLASH';
    if (msg.oid) str += ' OID:"'+msg.oid+'"'
    if (msg.modem_no) str += ' MODEMNO:'+msg.modem_no;
    console.log(str);
  })
}
*/

var msgID = 0; // TODO: Move to state

// SendSms method
module.exports = function(params) {
  // Check Phone number(s)
  if (!params.to) return wrongParams;
  var phonesArr = params.to.split(',');
  for (var i = 0; i < phonesArr.length; i++) {
    if (!/00\d{2,}$|^\+\d{2,}$|^[1-9]\d*$/.test(phonesArr[i]))
      return wrongParams;
  }
  // Check message
  if (!params.message) return wrongParams;
  // Parse date (optional)
  var date;
  if (params.date) {
    date = datetime.parse(params.date,'YYYYMMDDHHmm',true);
    if (!date) return wrongParams;
  }
  // Check priority (optional)
  var highpriority;
  if (params.highpriority) {
    if (params.highpriority == '0') highpriority = 0;
    else if (params.highpriority == '1') highpriority = 1;
    else return wrongParams;
  }
  // Check unicode (optional)
  var unicode;
  if (params.unicode) {
    if (params.unicode == '0') unicode = 0;
    else if (params.unicode == '1') unicode = 1;
    else return wrongParams;
  }
  // Check flash (optional)
  var flash;
  if (params.flash) {
    if (params.flash == '0') flash = 0;
    else if (params.flash == '1') flash = 1;
    else return wrongParams;
  }
  // Check OID (optional)
  var oid = null;
  if (params.oid) {
    if (/^[\x00-\xFF]{0,36}$/.test(params.oid)) oid = params.oid;
    else return wrongParams;
  }
  // Check modem number (optional)
  var modem_no;
  if (params.modem_no) {
    if (params.modem_no == '0') modem_no = 0;
    else if (params.modem_no == '1') modem_no = 1;
    else return wrongParams;
  }

  // Successfull message(s)
  var msgs = [];
  phonesArr.forEach(function(to) {
    // TODO: Push message to outbox
    msgs.push({
      message_id: msgID++,
      status: 'ok'
    });
  });

  if (params.responsetype == 'xml') {
    // It doesn't seem like it sends all the messages when using XML
    return {
      extended: {
        message_id: (msgID-1),
        status: 'ok'
      }
    }
  } else {
    return {
      simple: 'OK; ID='+(msgID-1),
      extended: msgs
    }
  }
}
