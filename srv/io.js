var readline = require('readline');
var mailbox = require('./mailbox.js');

/* -- Expected incoming message fields --
 * to
 * from
 * message
 * date
 * oid
 */

exports.init = function() {
  readline.createInterface({
    input: process.stdin,
    terminal: false
  }).on('line', function(line) {
    var incoming = /^\s*INCOMING\s+(\+?\d+)\s+(\+?\d+)\s+"((?:[^"\\]|\\.)*)"\s*$/.exec(line);
    if (incoming != null) {
      // -- Incoming message --
      mailbox.putInInbox({
        from: incoming[1],
        to: incoming[2],
        message: incoming[3], // TODO unescape
        date: new Date(),
        oid: null
      });
      // Log
      var str = 'RECV=';
      str += new Date();
      str += ' FROM:'+incoming[1];
      str += ' TO:'+incoming[2];
      str += ' MESSAGE:'+incoming[3];
      console.log(str);
    } else {
      exports.error('Unknown command');
    }
  }).on('close', function() {
    //process.exit(0);
  });
}

exports.logSentMessage = function(msg) {
  var str = 'SENT=';
  str += msg.SendingDateTime;
  str += ' FROM:'+msg.SenderNumber;
  str += ' TO:'+msg.DestinationNumber;
  str += ' MESSAGE:"'+msg.TextDecoded+'"'
  str += ' OID:'+msg.oid;
  console.log(str);
};

exports.logForwardedMessage = function(msg) {
  var str = 'FWD=';
  str += msg.SendingDateTime;
  str += ' FROM:'+msg.SenderNumber;
  str += ' TO:'+msg.DestinationNumber;
  str += ' MESSAGE:"'+msg.TextDecoded+'"'
  str += ' OID:'+msg.oid;
  console.log(str);
}

exports.error = function(msg) {
  console.log('ERROR='+msg);
}
