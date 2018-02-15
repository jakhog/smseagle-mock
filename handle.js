var config = require('./config.js');
var responses = require('./responses.js');

// Some generic checks
var genericChecks = function(params, jsonrpc) {
  // Check that we actually got params
  if (!params)
    return responses.wrongParams;
  // Check the authentication
  if (params.login != config.login || params.pass != config.pass)
    return responses.wrongAuth;
  // Check the response type (optional)
  if (params.responsetype) {
    if (jsonrpc) {
      if (params.responsetype != 'simple' && params.responsetype != 'extended')
        return responses.wrongParams;
    } else {
      if (params.responsetype != 'text' && params.responsetype != 'xml')
        return responses.wrongParams;
    }
  }
  // Request looks OK so far
  return null;
};

var generateXML = function(lines, obj) {
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      generateXML(lines, {
        item: array[i]
      });
    }
  } else {
    for (var key in obj) {
      if (typeof obj[key] == 'object') {
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
    if (params.responsetype == 'extended') {
      res.send({result: result.extended});
    } else {
      res.send({result: result.simple});
    }
  } else {
    if (params.responsetype == 'xml') {
      // Generate XML
      var lines = [];
      lines.push('<xml>');
      generateXML(lines, result.xml);
      lines.push('</xml>');
      res.send(lines.join('\n'));
    } else {
      res.send(result.text);
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
