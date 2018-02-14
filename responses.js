exports.wrongAuth = {
  simple: 'Invalid login or password',
  extended: {
    status: 'error',
    error_text: 'Invalid login or password'
  },
  code: 401
};

exports.wrongParams = {
  simple: 'Wrong parameters',
  extended: {
    status: 'error',
    error_text: 'Wrong parameters'
  },
  code: 400
};
