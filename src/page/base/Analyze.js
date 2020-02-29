import React, { Component } from 'react';
import ContentIframe from "./ContentIframe";
import emitter from "../../scripts/events";
import SimpleChart from "../chart/Index"
class Analyze extends React.Component {
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

        // this.eventEmitter = emitter.addListener("iframeChange", this._pushUrl);
    }
    render() {
        return (
            <div style={{
                height: '100%',
                width: '100%',
            }}>
                <span>分析页面</span>
                {/*<SimpleChart></SimpleChart>*/}
            </div>
        );
    }
}

export default Analyze
