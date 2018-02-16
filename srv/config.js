// Default config
exports.login = 'admin';
exports.pass = 'password';

exports.smseagle1 = '+4712345678';
exports.smseagle2 = '+4787654321';

exports.callbackurl = 'https://localhost:8082/';
exports.callbackmethod = 'POST';
exports.apikey = '';
exports.selfsigned = true;

/* --- Read config from file --- */
var fs = require('fs');
var ini = require('ini');

exports.read = function() {
  try {
    if (process.argv[2]) {
      var config = ini.parse(fs.readFileSync(process.argv[2], 'utf-8'));
      // Accept changes
      exports.login = config.login || exports.login;
      exports.pass = config.pass || exports.pass;
      exports.smseagle1 = config.smseagle1 || exports.smseagle1;
      exports.smseagle2 = config.smseagle2 || exports.smseagle2;
      exports.callbackurl = config.callbackurl || exports.callbackurl;
      exports.callbackmethod = config.callbackmethod || exports.callbackmethod;
      exports.apikey = config.apikey || exports.apikey;
      exports.selfsigned = config.selfsigned || exports.selfsigned;
    }
  } catch (e) {}
}
