import React, { Component } from 'react';
import ContentIframe from "./ContentIframe";
import emitter from "../../scripts/events";
class Proxy extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url:'',
            currentItem: {},
        }
    }
    componentDidMount(){
        // 声明一个自定义事件
        // 在组件装载完成以后

        this.eventEmitter = emitter.addListener("iframeChange", this._pushUrl);
    }
    // 组件销毁前移除事件监听
    componentWillUnmount(){
        if (this.eventEmitter) {
            emitter.removeListener('iframeChange', this._pushUrl);
        }

    }
    _pushUrl = (msg) => {
        console.log(msg);
        if (msg.type === 'admin') {
            this.setState({
                url: msg.value
            });
        } else {
            this.setState({
                url: ''
            });
        }

    };
    render() {
        return (
            <div style={{
                height: '100%',
                width: '100%',
            }}>
                <ContentIframe url={this.state.url}></ContentIframe>
            </div>
        );
    }
}

export default Proxy
