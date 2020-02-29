import React, { Component } from 'react';
import {Button, notification, Divider, Icon} from 'antd';
import ChartNav from "./ChartNav"
import './css/base.css'
import ChartRoom from "./ChartRoom";
import {MimeStorage} from "../../scripts/localStorage";
import {$get} from "../../scripts/http";

class SimpleChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initLoading: true,
            loading: false,
            data: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
            list: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
            pageType: 'list',
            roomData: {
                type: '',
                data: {}
            },
            friendList: [],
            messageList: [],
            mimeStore: new MimeStorage(),
            currentUser: {},
            targetObj: {},
        };
    }


    async componentDidMount() {
        const user = this.state.mimeStore.getItem('userInfo');
        console.log(user);
        this.setState({
            initLoading: false,
            data: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
            list: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
            currentUser: user,
            socketObj: window.ENV.socket
        });
        await this.getUserListAndGroup(user);
        this.initChartRoomSocketEvent();
        await this.getUserNessageByTo(user);

    }

    /**
     * 初始化聊天
     */
    initChartRoomSocketEvent = () => {
        this.state.socketObj.on('getMessage', (data) => {
            this.getMessageItem(data)
        });
    }
    /**
     * 接受消息
     * @param data
     */
    getMessageItem = (data) => {
        const currentMessageList = this.state.messageList;
        const currentMessageNum = this.props.currentMessageNum;
        const newMessageInfoIndex = currentMessageList.findIndex((item, i) => {
            return item.userInfo.userId == data.message.userId;
        })
        if (newMessageInfoIndex == -1) {
            currentMessageList.unshift({
                userInfo: {name: data.user.name, userId: data.message.from, icon: "", ...data.user},
                messageType: "FriendMessage",
                message: data.message.message.message,
                success: true,
                src: "",
                time: new Date().getTime(),
            })
        }else {
            currentMessageList[newMessageInfoIndex] = {
                userInfo: {name: data.user.name, userId: data.message.from, icon: "", ...data.user},
                messageType: "FriendMessage",
                message: data.message.message.message,
                success: true,
                src: "",
                time: new Date().getTime(),
            }
        }
        this.setState({
            messageList: currentMessageList
        })
        const openNotification = placement => {
            notification.info({
                message: `你有来自${data.user.name}的私信了😀😀😀😀`,
                duration: 8,
                description:
                    `${data.user.name}:${data.message.message.message}`,
                placement,
            });
        };
        if (this.state.pageType == 'list') {
            openNotification('bottomRight')
        }
        this.props.setMessageNum({
            num: currentMessageNum + 1
        })
    }

    /**
     * 退回列表组件
     */
    enterListPage() {
        this.setState({
            pageType: 'list'
        })
    }

    /**
     * 进入聊天室
     * @param data
     */
    enterRoomPage = (data= {type: 'friend', data: {}}) => {
        this.setState({
            pageType: 'room',
            roomData: {
                type: data.type,
                data: data.data
            }
        })
    }

    /**
     * 获取好友
     * @param user
     * @returns {Promise<void>}
     */
    getUserListAndGroup = async (user) => {
        try {
            const res = await $get('/message/messageRoomUserList', {userId: user.id}, 'chart')
            this.setState({
                friendList: res.data
            })
        }catch (e) {
            console.log(e)
        }
    }

    /**
     * 获取消息（）
     * @returns {Promise<*>}
     */
    getUserNessageByTo = async (user) => {
        try {
            const time = new Date().setHours(0,0,0,0) - 86400000 * 2;
            const res = await $get('/message/messageByToUser', {userId: user.id, minTime: time}, 'chart')
            const messageList = this.state.messageList;
            let rows = []
            res.data.forEach((item, index) => {
                rows.push({
                    userInfo: {name: item.fromUserInfo.name, icon: '', userId: item.fromUserInfo.id},
                    messageType: 'FriendMessage',
                    message: item.data.content,
                    success: true,
                    src: '',
                    time: item.data.time
                });
            })
            const newList = messageList.concat(rows);
            newList.sort((a, b) => {
                return parseInt(b[time]) - parseInt(a[time])
            })
            this.setState({
                messageList: newList
            })
        }catch (e) {
            console.log(e)
        }
    }

    _closeMessage = (message) => {
        this.props.closeMessage('66666')
    };
    render() {
        const friendList = this.state.friendList ? this.state.friendList : []
        const groupList = this.state.groupList ? this.state.groupList : []
        const messageList = this.state.messageList ? this.state.messageList : []
        return (
            <div className="chart-container">
                <span className="close-chart" style={{zIndex: 9999}} >
                   <Icon type="close-circle" onClick={() => this._closeMessage(44)} style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.65)' }} />
               </span>
                {this.state.pageType == 'list' ? <ChartNav friendList={friendList} messageList={messageList} groupList={groupList} indexPage={this}></ChartNav> : <ChartRoom indexPage={this}></ChartRoom>}

            </div>
        );
    }
}
export default SimpleChart
