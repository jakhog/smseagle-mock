import React, { Component } from 'react';
import { connect } from 'react-redux'
import Button from 'material-ui/Button';

import './MockList.css';

class MockList extends Component {
  handleClick = (mockID) => {
    return (e) => {
      if (typeof this.props.onClickMock === 'function') {
        this.props.onClickMock(mockID, e);
      }
    }
  }
  render() {
    return (
      <div className="mock-list">
        {this.props.mockIDs.map((mockID) => {
          if (mockID === this.props.selectedMockID) {
            return <Button key={mockID} color="inherit" variant="raised">{mockID}</Button>
          } else {
            return <Button key={mockID} color="inherit" onClick={this.handleClick(mockID)}>{mockID}</Button>
          }
        })}
      </div>
    )
  }
}

const CurrentMockList = connect(
  (state) => {
    return {
      mockIDs: Object.keys(state.mocks)
    }
  }
)(MockList);

export default CurrentMockList;
