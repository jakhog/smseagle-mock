var datetime = require('date-and-time');

var config = require('./config.js');
var wrongParams = require('./responses.js').wrongParams;
var mailbox = require('./mailbox.js');

// SendSms method
module.exports = function(params) {
  // Check Phone number(s)
  if (!params.to) return wrongParams(params);
  var phonesArr = params.to.split(',');
  for (var i = 0; i < phonesArr.length; i++) {
    if (!/00\d{2,}$|^\+\d{2,}$|^[1-9]\d*$/.test(phonesArr[i]))
      return wrongParams(params);
  }
  // Check message
  if (!params.message) return wrongParams(params);
  // Parse date (optional)
  var date;
  if (params.date) {
    date = datetime.parse(params.date,'YYYYMMDDHHmm',false);
    if (!date) return wrongParams(params);
  }
  // Check priority (optional)
  var highpriority;
  if (params.highpriority) {
    if (params.highpriority == '0') highpriority = 0;
    else if (params.highpriority == '1') highpriority = 1;
    else return wrongParams(params);
  }
  // Check unicode (optional)
  var unicode;
  if (params.unicode) {
    if (params.unicode == '0') unicode = 0;
    else if (params.unicode == '1') unicode = 1;
    else return wrongParams(params);
  }
  // Check flash (optional)
  var flash;
  if (params.flash) {
    if (params.flash == '0') flash = 0;
    else if (params.flash == '1') flash = 1;
    else return wrongParams(params);
  }
  // Check OID (optional)
  var oid = null;
  if (params.oid) {
    if (/^[\x00-\xFF]{0,36}$/.test(params.oid)) oid = params.oid;
    else return wrongParams(params);
  }
  // Check modem number (optional)
  var modem_no;
  if (params.modem_no) {
    if (params.modem_no == '1') modem_no = 1;
    else if (params.modem_no == '2') modem_no = 2;
    else return wrongParams(params);
  }

  // Successfull message(s)
  var msgs = [];
  phonesArr.forEach(function(to) {
    var msgID = mailbox.putInOutbox({
      to: to,
      from: modem_no == 2 ? config.smseagle2 : config.smseagle1,
      message: params.message,
      date: date,
      oid: oid
    });
    msgs.push({
      message_id: msgID,
      status: 'ok'
    });
  });

  var lastMsg = msgs[msgs.length-1];
  if (params.responsetype == 'text' || params.responsetype == 'simple') {
    return { response: 'OK; ID='+lastMsg.message_id };
  } else if (params.responsetype == 'xml') {
    return { response: lastMsg };
  } else { //params.responsetype == 'extended'
    return { response: msgs.length > 1 ? msgs : lastMsg };
  }
}
