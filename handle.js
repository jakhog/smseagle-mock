var config = require('./config.js');
var responses = require('./responses.js');

// Some generic checks
var genericChecks = function(params, jsonrpc) {
  // Check that we actually got params
  if (!params)
    return responses.wrongParams({});
  // Make sure we have a response type (it's optional)
  if (params.responsetype) {
    if (jsonrpc) {
      if (params.responsetype != 'simple' && params.responsetype != 'extended')
        return responses.wrongParams(params);
    } else {
      if (params.responsetype != 'text' && params.responsetype != 'xml')
        return responses.wrongParams(params);
    }
  } else {
    if (jsonrpc) {
      params.responsetype = 'simple';
    } else {
      params.responsetype = 'text';
    }
  }
  // Check the authentication
  if (params.login != config.login || params.pass != config.pass)
    return responses.wrongAuth;
  // Request looks OK so far
  return null;
};

var generateXML = function(lines, obj) {
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      generateXML(lines, {
        item: obj[i]
      });
    }
  } else {
    for (var key in obj) {
      if (obj[key] == undefined || obj[key] == null) {
        lines.push('<'+key+'/>');
      } else if (typeof obj[key] == 'object') {
        lines.push('<'+key+'>');
        generateXML(lines, obj[key]);
        lines.push('</'+key+'>');
      } else {
        lines.push('<'+key+'>'+obj[key]+'</'+key+'>');
      }
    }
  }
}

var sendResponse = function(result, params, res, jsonrpc) {
  res.status(result.code || 200);
  if (jsonrpc) {
    res.send({result: result.response});
  } else {
    if (params.responsetype == 'xml') {
      // Generate XML
      var lines = [];
      lines.push('<xml>');
      generateXML(lines, result.response);
      lines.push('</xml>');
      res.send(lines.join('\n'));
    } else {
      res.send(result.response);
    }
  }
};

// Return handling function
module.exports = function(method, params, res, jsonrpc) {
  // Do generic checks
  var result = genericChecks(params, jsonrpc);
  // If everything looks OK, let the method handle the specifics
  if (!result) result = method(params);
  // Write the result back to the client
  sendResponse(result, params, res, jsonrpc);
};

module.exports.sendResponse = sendResponse;
