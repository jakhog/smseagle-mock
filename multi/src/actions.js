exports.ADD_MOCK = 'ADD_MOCK'
exports.REMOVE_MOCK = 'REMOVE_MOCK'
exports.APPEND_OUTPUT = 'APPEND_OUTPUT'
exports.SET_ERROR = 'SET_ERROR'
exports.SET_STATE = 'SET_STATE'

exports.addMock = function(mock) {
  return { type: exports.ADD_MOCK, mock: mock }
}

exports.removeMock = function(mockID) {
  return { type: exports.REMOVE_MOCK, mockID: mockID }
}

exports.appendOutput = function(mockID, line) {
  return { type: exports.APPEND_OUTPUT, mockID: mockID, line: line }
}

exports.setError = function(mockID, error) {
  return { type: exports.SET_ERROR, mockID: mockID, error_text: error}
}

exports.setState = function(mockID, state) {
  return { type: exports.SET_STATE, mockID: mockID, state: state}
}
