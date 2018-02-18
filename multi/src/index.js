import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import blue from 'material-ui/colors/blue';
import amber from 'material-ui/colors/amber';

import './client/index.css';
import App from './client/App';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: amber,
  }
});

// Render the DOM
ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
  ,document.getElementById('root')
);
