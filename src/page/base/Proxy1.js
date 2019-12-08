import React, { Component } from 'react';
import Iframe from 'react-iframe'
class Proxy1 extends React.Component {
    state = {
        collapsed: false,
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render() {
        return (
            <div style={{
                height: '100%',
                width: '100%',
            }}>
                <Iframe url="http://127.0.0.1:8080/#/userManage/userList?hideMenus=true"
                        width="100%"
                        height="100%"
                        id="myId"
                        className="myClassname"
                        display="initial"
                        position="relative"/>
            </div>
        );
    }
}

export default Proxy1
