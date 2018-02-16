var datetime = require('date-and-time');

var mailbox = require('./mailbox.js');
var wrongParams = require('./responses.js').wrongParams;

var generateTextTable = function(messages, fields) {
  var lines = [];
  // Header line first
  lines.push(fields.join(';'));
  // Then all messages
  messages.forEach(function(msg) {
    var line = [];
    fields.forEach(function(field) {
      var val = msg[field];
      if (val != null && val.constructor == Date) {
        line.push(datetime.format(val, '"YYYY-MM-DD HH:mm:ss"', false));
      } else if (val != undefined && val != null) {
        line.push('"'+val+'"');
      } else {
        line.push('""');
      }
    });
    lines.push(line.join(';'));
  });
  return lines.join('\n');
}

var filterFields = function(messages, fields) {
  var result = [];
  messages.forEach(function(msg) {
    var filtered = {};
    fields.forEach(function(field) {
      var val = msg[field];
      if (val != null && val.constructor == Date) {
        filtered[field] = datetime.format(val, 'YYYY-MM-DD HH:mm:ss', false);
      } else if (val != undefined && val != null) {
        filtered[field] = val.toString();
      } else {
        filtered[field] = null;
      }
    });
    result.push(filtered);
  })
  return result;
}

var generateResponse = function(messages, type, folder) {
  if (type == 'text') {
    var fields = [
      'UpdatedInDB', 'InsertIntoDB', 'SendingDateTime', 'DeliveryDateTime',
      'Text', 'DestinationNumber', 'Coding', 'UDH', 'SMSCNumber', 'Class',
      'TextDecoded', 'ID', 'SenderID', 'SequencePosition', 'Status',
      'StatusError', 'TPMR', 'RelativeValidity', 'CreatorID', 'id_folder'
    ];
    if (folder == 'inbox') fields.push('readed', 'oid');
    return generateTextTable(messages, fields);
  } else {
    var fields;
    if (folder == 'inbox') {
      fields = [
        'UpdatedInDB', 'ReceivingDateTime', 'Text', 'SenderNumber', 'Coding',
        'UDH', 'SMSCNumber', 'Class', 'TextDecoded', 'ID', 'RecipientID',
        'Processed', 'id_folder', 'readed', 'last_reply', 'oid'
      ];
    } else {
      fields = [
        'UpdatedInDB', 'InsertIntoDB', 'SendingDateTime', 'DeliveryDateTime',
        'Text', 'DestinationNumber', 'Coding', 'UDH', 'SMSCNumber', 'Class',
        'TextDecoded', 'ID', 'SenderID', 'SequencePosition', 'Status',
        'StatusError', 'TPMR', 'RelativeValidity', 'CreatorID', 'id_folder'
      ];
    }
    var filtered = filterFields(messages, fields);
    if (type == 'simple') {
      return filtered;
    } else {
      return {
        messages: filtered,
        status: 'ok'
      };
    }
  }
};

// ReadSms method
module.exports = function(params) {
  var selector = {};
  // Check folder
  if (params.folder != 'inbox' && params.folder != 'outbox' && params.folder != 'sentitems') {
    return wrongParams(params);
  } else {
    selector.folder = params.folder;
  }
  // Check idfrom (optional)
  if (params.idfrom) {
    if (!/\d+/.test(params.idfrom)) return wrongParams(params);
    else selector.idfrom = parseInt(params.idfrom);
  }
  // Check from (optional)
  if (params.from) {
    if (params.folder != 'inbox') return wrongParams(params);
    else if (!/00\d{2,}$|^\+\d{2,}$|^[1-9]\d*$/.test(params.from)) return wrongParams(params);
    else selector.from = params.from;
  }
  // Check to (optional)
  if (params.to) {
    if (params.folder == 'inbox') return wrongParams(params);
    else if (!/00\d{2,}$|^\+\d{2,}$|^[1-9]\d*$/.test(params.to)) return wrongParams(params);
    else selector.to = params.to;
  }
  // Check datefrom (optional)
  if (params.datefrom) {
    selector.datefrom = datetime.parse(params.datefrom,'YYYYMMDDHHmm',false);
    if (!selector.datefrom) return wrongParams(params);
  }
  // Check dateto (optional)
  if (params.dateto) {
    selector.dateto = datetime.parse(params.dateto,'YYYYMMDDHHmm',false);
    if (!selector.dateto) return wrongParams(params);
  }
  // Check unread (optional)
  if (params.unread) {
    if (params.unread == '0') selector.unread = false;
    else if (params.unread == '1') selector.unread = true;
    else return wrongParams(params);
  }
  // TODO: Custom folder not supported

  // Get messages from mailbox
  var result = mailbox.readSMS(selector);
  if (result == null) return wrongParams(params);
  else return { response: generateResponse(result, params.responsetype, params.folder) };
}
