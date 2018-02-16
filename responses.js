exports.wrongAuth = function(params) {
  var result = { code: 401 };
  if (params.responsetype == 'extended' || params.responsetype == 'xml') {
    result.response = {
      status: 'error',
      error_text: 'Invalid login or password'
    };
  } else {
    result.response = 'Invalid login or password';
  }
  return result;
};

exports.wrongParams = function(params) {
  var result = { code: 400 };
  if (params.responsetype == 'extended' || params.responsetype == 'xml') {
    result.response = {
      status: 'error',
      error_text: 'Wrong parameters'
    };
  } else {
    result.response = 'Wrong parameters';
  }
  return result;
};
