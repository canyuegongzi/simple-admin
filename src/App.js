import React, { Component } from 'react';
import './App.css';
import './style/base/app.css';
import BasicRoute from "./page/component/Routes";

class App extends Component {
  render() {
    return (
        <BasicRoute/>
    );
  }

  componentWillUnmount() {
    window._socketObj = null
  }
}

export default App;
