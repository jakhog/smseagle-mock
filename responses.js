exports.wrongAuth = {
  text: 'Invalid login or password',
  xml: {
    status: 'error',
    error_text: 'Invalid login or password'
  },
  simple: 'Invalid login or password',
  extended: {
    status: 'error',
    error_text: 'Invalid login or password'
  },
  code: 401
};

exports.wrongParams = {
  text: 'Wrong parameters',
  xml: {
    status: 'error',
    error_text: 'Wrong parameters'
  },
  simple: 'Wrong parameters',
  extended: {
    status: 'error',
    error_text: 'Wrong parameters'
  },
  code: 400
};
