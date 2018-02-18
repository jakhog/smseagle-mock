import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Dialog, { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';

import MockList from './MockList.js';

class Menu extends Component {
  state = {
    open: false,
    fields: {
      /*
      id: '',
      frp_server: '',
      frp_port: '',
      login: '',
      pass: '',
      smseagle1: '',
      smseagle2: '',
      callbackurl: '',
      callbackmethod: 'POST',
      apikey: '',
      selfsigned: false,
      */
      id: '',
      frp_server: 'smseagle.cbs.test',
      frp_port: '7001',
      login: 'admin',
      pass: 'password',
      smseagle1: '12345678',
      smseagle2: '87654321',
      callbackurl: 'https://smseagle.cbs.test/sms/',
      callbackmethod: 'POST',
      apikey: 'apikeytest',
      selfsigned: true,
    },
  };

  notify = (msg) => {
    if (typeof this.props.notify === 'function') {
      this.props.notify(msg);
    }
  }

  handleOpen = () => {
    const fields = this.state.fields;
    fields.id = '';
    this.setState({ open: true, fields: fields });
  }
  handleClose = () => {
    this.setState({ open: false });
  };
  handleCreate = () => {
    if (typeof this.props.sendCommand === 'function') {
      // Check that we have something in all fields
      const fields = this.state.fields;
      if (
        fields.id && fields.frp_server && fields.frp_port &&
        fields.login && fields.pass && fields.smseagle1 && fields.smseagle2 &&
        fields.callbackurl && fields.callbackmethod && fields.selfsigned !== undefined &&
        (fields.callbackmethod === 'GET' || fields.callbackmethod === 'POST')
      ) {
        this.props.sendCommand('new_mock', fields);
        this.handleClose();
        this.notify('Creating "'+fields.id+'"');
      } else {
        // Something was wrong
        this.notify('Missing values');
      }
    }
  }
  handleChange = (e) => {
    const fields = this.state.fields;
    fields[e.target.id] = e.target.value;
    this.setState({ fields: fields });
  }
  handleCheckboxChange = (e) => {
    const fields = this.state.fields;
    fields[e.target.id] = e.target.checked;
    this.setState({ fields: fields });
  }
  handleMockClick = (mockID, e) => {
    if (typeof this.props.onClickMock === 'function') {
      this.props.onClickMock(mockID, e);
    }
  }

  render() {
    const fields = this.state.fields;
    return (
      <React.Fragment>
        <AppBar position="static">
          <Toolbar>
            <MockList onClickMock={this.handleMockClick} selectedMockID={this.props.selectedMockID} />
            <Button variant="raised" color="secondary" onClick={this.handleOpen}>NEW</Button>
          </Toolbar>
        </AppBar>
        <Dialog open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>Create new SMSeagle mock</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense" type="text" fullWidth autoFocus
              id="id" label="ID"
              value={fields.id} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="text" fullWidth
              id="frp_server" label="FRP server"
              value={fields.frp_server} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="number" fullWidth
              id="frp_port" label="FRP port"
              value={fields.frp_port} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="text" fullWidth
              id="login" label="Login"
              value={fields.login} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="text" fullWidth
              id="pass" label="Password"
              value={fields.pass} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="text" fullWidth
              id="smseagle1" label="Modem 1 number"
              value={fields.smseagle1} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="text" fullWidth
              id="smseagle2" label="Modem 2 number"
              value={fields.smseagle2} onChange={this.handleChange}
            />
            <TextField
              margin="dense" type="url" fullWidth
              id="callbackurl" label="Callback URL"
              value={fields.callbackurl} onChange={this.handleChange}
            />
            <p></p>
            <FormControl component="fieldset">
              <FormLabel component="legend">Callback method</FormLabel>
              <RadioGroup value={fields.callbackmethod} onChange={this.handleChange}>
                <FormControlLabel value="GET" control={<Radio id="callbackmethod"/>} label="GET" />
                <FormControlLabel value="POST" control={<Radio id="callbackmethod"/>} label="POST" />
              </RadioGroup>
            </FormControl>
            <TextField
              margin="dense" type="text" fullWidth
              id="apikey" label="API key"
              value={fields.apikey} onChange={this.handleChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  id="selfsigned" value="true" color="primary"
                  checked={fields.selfsigned} onChange={this.handleCheckboxChange}
                />
              }
              label="Accept self-signed certificates"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleCreate} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default Menu;
