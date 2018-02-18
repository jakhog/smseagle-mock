import React, { Component } from 'react';
import { connect } from 'react-redux'
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/Button';
import red from 'material-ui/colors/red';
import green from 'material-ui/colors/green';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import Radio, { RadioGroup } from 'material-ui/Radio';
import TextField from 'material-ui/TextField';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';

import './Display.css';

class Display extends Component {
  state = {
    open: false,
    fields: {
      from: '',
      to: '',
      message: '',
    }
  }

  notify = (msg) => {
    if (typeof this.props.notify === 'function') {
      this.props.notify(msg);
    }
  }

  handleStop = () => {
    if (typeof this.props.sendCommand === 'function') {
      this.props.sendCommand('stop_mock', this.props.mockID);
      this.notify('Stopping mock...');
    }
  }
  handleRemove = () => {
    if (typeof this.props.sendCommand === 'function') {
      this.props.sendCommand('remove_mock', this.props.mockID);
      this.notify('Removing mock...');
    }
  }

  handleOpen = () => {
    this.setState({ open: true });
  }
  handleClose = () => {
    this.setState({ open: false });
  }
  handleChange = (e) => {
    const fields = this.state.fields;
    fields[e.target.id] = e.target.value;
    this.setState({ fields: fields });
  }
  handleSendSMS = () => {
    if (typeof this.props.sendCommand === 'function') {
      // Check that we have something in all fields
      const fields = this.state.fields;
      if (
        fields.from && fields.to && fields.message
      ) {
        this.props.sendCommand('send_sms', {...fields, mockID: this.props.mockID} );
        this.handleClose();
        this.notify('Sending SMS!');
      } else {
        // Something was wrong
        this.notify('Missing values');
      }
    }
  }

  render() {
    if (this.props.mock) {
      const mock = this.props.mock;
      const fields = this.state.fields;

      let status = '';
      if (mock.state === 'error') {
        status = <span style={{color: red[500]}}>Error: {mock.error_text}</span>
      } else if (mock.state === 'starting') {
        status = 'Starting...';
      } else if (mock.state === 'running') {
        status = <span style={{color: green[500]}}>Running</span>
      } else if (mock.state === 'stopping') {
        status = 'Stopping...';
      } else if (mock.state === 'stopped') {
        status = 'Stopped';
      }

      let stopRemoveButton = <Button variant="raised" color="primary" onClick={this.handleStop} style={{backgroundColor: red[500]}}>Stop</Button>;
      if (mock.state === 'stopped') {
        stopRemoveButton = <Button variant="raised" color="primary" onClick={this.handleRemove} style={{backgroundColor: red[500]}}>Remove</Button>;
      }

      return (
        <div className="display">
          <Dialog open={this.state.open} onClose={this.handleClose}>
            <DialogTitle>Send SMS</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense" type="text" fullWidth
                id="from" label="From"
                value={fields.from} onChange={this.handleChange}
              />
              <p></p>
              <FormControl component="fieldset">
                <FormLabel component="legend">To</FormLabel>
                <RadioGroup value={fields.to} onChange={this.handleChange}>
                  <FormControlLabel value={mock.smseagle1} control={<Radio id="to"/>} label={mock.smseagle1} />
                  <FormControlLabel value={mock.smseagle2} control={<Radio id="to"/>} label={mock.smseagle2} />
                </RadioGroup>
              </FormControl>
              <TextField
                margin="dense" type="text" fullWidth
                id="message" label="Message"
                value={fields.message} onChange={this.handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.handleSendSMS} color="primary">
                Send
              </Button>
            </DialogActions>
          </Dialog>
          <div className="header">
            <Typography variant="title" className="status">
               Status: {status}
            </Typography>
            <Button variant="raised" color="primary" onClick={this.handleOpen}>Send SMS</Button>
            {stopRemoveButton}
          </div>
          <p></p>
          <Typography variant="subheading">Configuration</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Proxy server:</TableCell>
                <TableCell>{mock.frp_server}</TableCell>
                <TableCell>Proxy port:</TableCell>
                <TableCell>{mock.frp_port}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Callback URL:</TableCell>
                <TableCell>{mock.callbackurl}</TableCell>
                <TableCell>Callback method:</TableCell>
                <TableCell>{mock.callbackmethod}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>API key:</TableCell>
                <TableCell>{mock.apikey}</TableCell>
                <TableCell>Accept self-signed certificates:</TableCell>
                <TableCell><Checkbox checked={mock.selfsigned} disabled/></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Login:</TableCell>
                <TableCell>{mock.login}</TableCell>
                <TableCell>Password:</TableCell>
                <TableCell>{mock.pass}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Modem 1 number:</TableCell>
                <TableCell>{mock.smseagle1}</TableCell>
                <TableCell>Modem 2 number:</TableCell>
                <TableCell>{mock.smseagle2}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p></p>
          <Typography variant="subheading">Output</Typography>
          <pre>
            { mock.output.join('\n') }
          </pre>
        </div>
      );
    } else {
      return (
        <div className="no-selected">
          <Typography className="message" variant="display1">
            Please select or create a device in the top menu...
          </Typography>
        </div>
      )
    }

  }
}

const CurrentMockDisplay = connect(
  (state, props) => {
    return {
      mock: state.mocks[props.mockID]
    }
  }
)(Display);

export default CurrentMockDisplay;
