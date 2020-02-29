import React, { Component } from 'react';
import {notification} from 'antd';
import './App.css';
import './style/base/app.css';
import BasicRoute from "./page/component/Routes";
import './env.js';
import {MimeStorage} from "./scripts/localStorage";
import {parseTime} from "./scripts/untils";
export const {Provider, Consumer} = React.createContext();

class App extends Component {
  constructor (props){
    super(props)
    this.state={
     socket: null
    }
  }
  render() {
    return (
        <Provider _socket={this.state.socket}>
          <BasicRoute/>
        </Provider>
    );
  }
  async componentDidMount() {
    let socket = window._socketObj;
    this.setState({
      socket: socket
    })
    await this.initCom(socket);
  }

  /**
   * 组件初始化
   * @returns {Promise<void>}
   */
  async initCom(socket) {
    const mimeStorage = new MimeStorage();
    const user = mimeStorage.getItem('userInfo');
    const token = mimeStorage.getItem('token');
    if (!token) {
      const url = window.location.origin + window.location.pathname;
      window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
    }
    socket.emit('userConnect', { userId: user.id }, (data) => {
      if (data.success) {
        const args = {
          message: `欢迎您: ${user.name}`,
          description:
              `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
          duration: 2,
        };
        notification.open(args);
      }
    });
  }
  componentWillUnmount() {
    window._socketObj = null
  }
}

export default App;
