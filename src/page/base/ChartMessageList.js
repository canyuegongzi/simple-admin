import React, { Component } from 'react';
import Chat from 'chat-react';
import '../css/chartMessage.css';
import {MimeStorage} from "../../scripts/localStorage";
export default class ChartMessageList extends React.Component {
    constructor(props) {
        super(props);
        this.mimeStorage = new MimeStorage();
        this.userInfo = this.mimeStorage.getItem('userInfo');
    }
    state = {
        inputValue: '',
        messages: [],
        timestamp: new Date().getTime(),
        list: []
    };
    setInputfoucs = () => {
        this.chat.refs.input.inputFocus();  //set input foucus
    };
    setScrollTop = () => {
        this.chat.refs.message.setScrollTop(1200);  //set scrollTop position
    };
    sendMessage = (v) => {
        console.log(v);
        const {value} = v;
        if (!value) return;
        this.props.getSendMessage(v);
        this.setState({ timestamp: new Date().getTime(), inputValue: ''});

    };
    _onScrollFun = (e) => {
        console.log(e)
    };
    _loader = (e) => {
      console.log('加载')
    };
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            list: nextProps.currentMessageList
        })
    };

    render() {
        const {inputValue, messages } = this.state;
        const { userInfo, currentMessageList, timestamp } = this.props;
        const currentUserInfo = {
            ...userInfo,
            avatar: "http://qiniu.canyuegongzi.xyz/avatar.svg",
            userId: userInfo.id,
            name: userInfo.name,
        };
        const noData = this.props.noData;
        return (
            <Chat
                ref={el => this.chat = el}
                className="my-chat-box"
                noData={noData}
                dataSource={currentMessageList}
                userInfo={currentUserInfo}
                value={inputValue}
                // onScroll={this._onScrollFun}
                noDataEle={<div>无数据</div>}
                loader = {this._loader}
                sendMessage={this.sendMessage}
                timestamp={timestamp}
                placeholder="请输入"
                messageListStyle={{width: '250px', height: '310px', position: 'absolute', top : '45px', bottom: '48px'}}
            />
        );
    }
}
