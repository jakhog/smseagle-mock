var http = require('http');
var https = require('https');
var url = require('url');
var querystring = require('querystring');
var datetime = require('date-and-time');

var config = require('./config.js');
var io = require('./io.js');

var msgID = 0;

var DB = {};

var folders = {
  inbox: 1,
  outbox: 2,
  sentitems: 3
};

/* --- DB fields ---
 * UpdatedInDB
 * InsertedIntoDB
 * SendingDateTime
 * DeliveryDateTime
 * Text
 * DestinationNumber
 * SenderNumber
 * Coding
 * UDH
 * SMSCNumber
 * Class
 * TextDecoded
 * [ID]
 * SenderID
 * SequencePosition
 * Status
 * StatusError
 * TPMR
 * RelativeValidity
 * CreatorID
 * RecipientID
 * Processed
 * id_folder
 * readed
 * last_reply
 * oid
 */

var calculateText = function(str) {
  var coded = '';
  for (var i = 0; i < str.length; i++) {
    coded += str.codePointAt(i).toString(16).padStart(4,'0');
  }
  return coded;
}

var updateInDB = function(id, msg) {
  if (id in DB) {
    var dbmsg = DB[id];
    // Set some values to always be the same
    dbmsg.DeliveryDateTime = null;
    dbmsg.Coding = 'Default_No_Compression';
    dbmsg.UDH = '';
    dbmsg.Class = -1;
    dbmsg.TPMR = -1;
    dbmsg.RelativeValidity = 255;
    dbmsg.CreatorID = 'admin';
    dbmsg.Processed = 't';
    dbmsg.last_reply = null; // TODO: Something else here?
    // Set values to what's in msg or keep current
    dbmsg.SendingDateTime = msg.SendingDateTime || dbmsg.SendingDateTime;
    dbmsg.DestinationNumber = msg.DestinationNumber || dbmsg.DestinationNumber;
    dbmsg.SenderNumber = msg.SenderNumber || dbmsg.SenderNumber;
    dbmsg.SMSCNumber = msg.SMSCNumber || dbmsg.SMSCNumber;
    dbmsg.TextDecoded = msg.TextDecoded || dbmsg.TextDecoded;
    dbmsg.SenderID = msg.SenderID || dbmsg.SenderID;
    dbmsg.SequencePosition = msg.SequencePosition || dbmsg.SequencePosition;
    dbmsg.Status = msg.Status || dbmsg.Status;
    dbmsg.StatusError = msg.StatusError || dbmsg.StatusError;
    dbmsg.RecipientID = msg.RecipientID || dbmsg.RecipientID;
    dbmsg.id_folder = msg.id_folder || dbmsg.id_folder;
    dbmsg.readed = msg.readed != undefined ? msg.readed : dbmsg.readed;
    dbmsg.oid = msg.oid != undefined ? msg.oid : dbmsg.oid;
    // Set some calculated values
    dbmsg.Text = calculateText(dbmsg.TextDecoded);
    dbmsg.UpdatedInDB = new Date();
    dbmsg.ID = parseInt(id);
    return true;
  } else {
    return false;
  }
}

var insertIntoDB = function(msg) {
  var id = msgID++;
  DB[id] = {
    InsertIntoDB: new Date()
  };
  updateInDB(id, msg);
  return id;
}

// Create an HTTPS agent to handle potential self-signed certificates
var httpsAgent = new https.Agent({
  rejectUnauthorized: !config.selfsigned
});
/* ----- Callback function ----- */
var callbackMsg = function(msg, callback) {
  var fwdMsg = {
    sender: msg.SenderNumber,
    timestamp: datetime.format(msg.SendingDateTime, 'YYYYMMDDHHmmss', false),
    text: msg.TextDecoded,
    msgid: msg.ID,
    modemno: msg.RecipientID,
    oid: msg.oid
  };
  if (config.apikey) fwdMsg.apikey = config.apikey;
  var query = querystring.stringify(fwdMsg);

  var purl = new url.URL(config.callbackurl);
  var path = purl.pathname;
  if (config.callbackmethod != 'POST') {
    path += '?'+query;
  }

  var requestOpts = {
    protocol: purl.protocol,
    hostname: purl.hostname,
    port: purl.port,
    path: path,
    method: config.callbackmethod == 'POST' ? 'POST' : 'GET'
  };
  var request;
  var responseCb = function(response) {
    callback(response.statusCode == 200);
  };
  if (purl.protocol == 'https:') {
    requestOpts.agent = httpsAgent;
    request = https.request(requestOpts, responseCb);
  } else {
    request = http.request(requestOpts, responseCb);
  }

  request.on('error', function(error) {
    io.error('Callback error '+error);
    callback(false);
  });
  request.setTimeout(30*1000, function() {
    request.abort();
  });

  if (config.callbackmethod == 'POST') {
    request.write(query);
  }
  request.end();
}

/* ---------- Exposed functions ---------- */
/* -- Expected incoming message fields --
 * to
 * from
 * message
 * date
 * oid
 */

exports.putInInbox = function(msg) {
  // Check if we are expecting messages on this number
  if (config.smseagle1 != msg.to && config.smseagle2 != msg.to)
    return undefined;
  var smseagleID = config.smseagle1 == msg.to ? 'smseagle1' : 'smseagle2';

  // TODO: Find OID of last message sent to this number

  return insertIntoDB({
    SendingDateTime: new Date(),
    DestinationNumber: msg.to,
    SenderNumber: msg.from,
    SMSCNumber: msg.to,
    TextDecoded: msg.message,
    SenderID: smseagleID,
    SequencePosition: 1,
    Status: 'SendingOKNoReport',
    StatusError: -1,
    RecipientID: smseagleID,
    id_folder: folders.inbox,
    readed: false,
    oid: msg.oid || null
  });
}

exports.putInOutbox = function(msg) {
  // Check if we can send messages from this number
  if (config.smseagle1 != msg.from && config.smseagle2 != msg.from)
    return undefined;
  var smseagleID = config.smseagle1 == msg.from ? 'smseagle1' : 'smseagle2';

  return insertIntoDB({
    SendingDateTime: msg.date || new Date(),
    DestinationNumber: msg.to,
    SenderNumber: msg.from,
    SMSCNumber: msg.to,
    TextDecoded: msg.message,
    SenderID: smseagleID,
    SequencePosition: 0,
    Status: 'Sending',
    StatusError: -1,
    RecipientID: smseagleID,
    id_folder: folders.outbox,
    readed: true,
    oid: msg.oid || null
  });
}

exports.readSMS = function(selector) {
  if (selector.folder in folders) {
    selector.id_folder = folders[selector.folder];
    // Set defaults to selector
    selector.idfrom = selector.idfrom || 0;
    selector.datefrom = selector.datefrom || -Infinity;
    selector.dateto = selector.dateto || Infinity;
    selector.limit = selector.limit || Infinity;
    selector.unread = selector.unread || false;
    // Get the messages
    var msgs = [];
    for (var id in DB) {
      var msg = DB[id];
      if (msgs.length == selector.limit) break;
      if (msg.id_folder != selector.id_folder) continue;
      if (msg.ID < selector.idfrom) continue;
      if (msg.SendingDateTime < selector.datefrom) continue;
      if (msg.SendingDateTime > selector.dateto) continue;
      if (selector.id_folder == folders.inbox) {
        if (selector.unread && msg.readed) continue;
        if (selector.from && selector.from != msg.from) continue;
      } else {
        if (selector.to && selector.to != msg.to) continue;
      }
      // Should return this message
      msgs.push(msg);
    }
    return msgs;
  } else {
    return null;
  }
}

exports.getFolderLength = function(folder) {
  if (folder in folders) {
    var id_folder = folders[folder];
    var count = 0;
    for (var id in DB) {
      if (DB[id].id_folder == id_folder)
        count++;
    }
    return count;
  } else {
    return undefined;
  }
}

exports.init = function() {
  setInterval(function() {
    var now = new Date();
    // Loop through messages
    for (var id in DB) {
      var msg = DB[id];
      if (msg.id_folder == folders.outbox) {
        // Send outgoing messages on scheduled time
        if (msg.SendingDateTime < now) {
          updateInDB(id, {
            id_folder: folders.sentitems,
            SendingDateTime: now
          });
          io.logSentMessage(msg);
        }
      } else if (msg.id_folder == folders.inbox) {
        // Forward inbox messages using callback
        if (msg._forwarded) continue;

        // We should only try for 24h
        var sinceReceived = now-msg.SendingDateTime;
        if (sinceReceived > 24*60*60*1000) continue;
        // We should only try every two minutes
        if (msg._forwardTry) {
          var sinceLast = now-msg._forwardTry;
          if (sinceLast < 2*60*1000) continue;
        }

        // Try now
        msg._forwarded = false;
        msg._forwardTry = now;
        callbackMsg(msg, function(success) {
          if (success) {
            msg._forwarded = true;
            io.logForwardedMessage(msg);
          }
        })
      }
    }
  }, 5000);
}
