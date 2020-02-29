import { ListView, PullToRefresh } from 'antd-mobile';
import React, { Component } from 'react';
import {PageHeader, Icon, Button, Input } from "antd";
import './css/base.css'
import {MimeStorage} from "../../scripts/localStorage";
import MessageItem from "./room/MessageItem";
import AudioItem from "./room/AudioItem";
import FileItem from "./room/FileItem";
import ImgItem from "./room/ImgItem";
import {$get} from "../../scripts/http";

class ChartRoom extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });

        this.state = {
            dataSource: ds,
            roomType : 'friend',
            messageList: [],
            list: {
                currentUser: {
                    name: '',
                    userId: '',
                    icon: ''
                },
                limit: 100,
                offset: 0,
                pageNum: 1,
                totalPage: 0,
                totalCount: 0
            },
            currentUser: {
                name: '',
                userId: '',
                icon: ''
            },
            // 当前聊天信息
            currentMessageInfo: {
                from: '',
                to: '',
                userId: '',
                message: {
                    message: '',
                    messageType: ''
                },
            },
            inputMessage: {
                message: '',
                messageType: ''
            },
            targetObj: {},
            socketObj: null,
            upLoading : false,
            pullLoading : false,
            height: document.documentElement.clientHeight * 3 / 4,
        };
    }

    componentDidMount() {
        const store = new MimeStorage();
        const indexPage = this.props.indexPage.state;
        try {
            const user = store.getItem('userInfo');
            this.setState({
                currentUser: {
                    name: user.name,
                    userId: user.id,
                    ...user
                },
                targetObj: {
                    ...this.props.indexPage.state.roomData
                },
                socketObj: window.ENV.socket
            })
            this.initChartRoomSocketEvent();
            this.getFriendMessageList(user);
        } catch (e) {
            const url = window.location.origin + window.location.pathname;
            window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
        }
    }

    /**
     * 初始化聊天
     */
    initChartRoomSocketEvent = () => {
        const socket = window.ENV.socket;
        socket.on('successMessage', (data) => {
            this.sendMessageAfter(data)
        });
        socket.on('getMessage', (data) => {
            this.getFriendsMesssage(data)
        });
    }

    /**
     * 上拉加载
     * @param page
     * @param lastPage
     */
    onEndReached = (page, lastPage) => {
        //当前页小于总页数继续请求下一页数据，否则停止请求数据
        if (Number(page) < Number(lastPage)) {
            this.setState({ upLoading: true })
            //接口请求下一页数据,完成后将upLoading设为false
        }
    }

    /**
     * 下拉刷新
     */
    onRefresh = () => {
        this.setState({ pullLoading: true })
        //接口请求第一页数据,完成后将pullLoading设为false
    }

    /**
     * 渲染行
     * @param item
     * @param i
     * @returns {*}
     */
    renderRow = (item, i) => {
        const {messageType} = item;
        const roomType = this.state.roomType
        const currentUser = this.state.currentUser
        return (
            <div>
                {
                    messageType == 'Message' ? <MessageItem info={item} selfUser={currentUser} roomType={roomType}/> :
                        messageType == 'Audio' ? <AudioItem info={item} selfUser={currentUser} roomType={roomType}/> :
                            messageType == 'File' ? <FileItem info={item} selfUser={currentUser} roomType={roomType}></FileItem> :
                                messageType == 'Img' ? <ImgItem info={item} selfUser={currentUser} roomType={roomType}/> :
                                    <p></p>
                }
            </div>
        );
    }

    /**
     * 页面退回
     */
    back() {
        this.props.indexPage.enterListPage()
    }

    /**
     * 输入框输入
     * @param e
     */
    inputMessage = (e) => {
        const info = {
            from: this.state.currentUser.userId,
            to: this.state.targetObj.data.userId,
            userId: this.state.currentUser.userId,
            message: {
                message: e.target.value,
                messageType: 'Message'
            },
        }
        this.setState({
            inputMessage: {
                message: e.target.value,
                messageType: 'Message'
            },
            currentMessageInfo: info
        })
    }

    /**
     * 发送消息
     */
    sendMessage = () => {
        const info = {
            ...this.state.currentMessageInfo,
            content: this.state.currentMessageInfo.message.message,
            type: this.state.currentMessageInfo.message.messageType
        }
        this.state.socketObj.emit('sendMessage', info, (data) => {
            console.log(data)
        });
    }

    /**
     * 消息发送成功
     */
    sendMessageAfter = (data) => {
        const messageList = this.state.messageList;
        const currentMessageInfo = this.state.currentMessageInfo;
        const rows = messageList.concat([{
            userInfo: {name: currentMessageInfo.userName, icon: '', userId: currentMessageInfo.userId},
            messageType: currentMessageInfo.message.messageType ? currentMessageInfo.message.messageType : 'Message',
            message: currentMessageInfo.message.message,
            success: data.success,
            src: '',
            time: new Date().getTime()
        }]);
        this.setState({
            messageList: rows,
            inputMessage: {
                message: '',
                messageType: 'Message'
            }
        })
    }

    /**
     * 接受消息
     * @param data
     */
    getFriendsMesssage = (data) => {
        const messageList = this.state.messageList;
        const targetUser = this.state.targetObj.data;
        const rows = messageList.concat([{
            userInfo: {name: targetUser.userName, icon: '', userId: targetUser.userId},
            messageType: data.message.message.messageType,
            message: data.message.message.message,
            success: true,
            src: '',
            time: new Date().getTime()
        }]);
        this.setState({
            messageList: rows,
        })
    }

    /**
     * 获取好友聊天记录
     * @returns {Promise<void>}
     */
    getFriendMessageList = async (user) => {
        try {
            const currentUser = user;
            const targetUser = this.props.indexPage.state.roomData.data;
            const time = new Date().setHours(0,0,0,0) - 86400000 * 3;
            const res = await $get('/message/friendMessageAll', {userId: user.id, fromId: targetUser.userId, minTime: time}, 'chart')
            const list = res.data.map((item, index) => {
                return {
                    userInfo: Number(item.from) == Number(currentUser.id) ? {name: currentUser.name, icon: '', userId: currentUser.id} : {name: targetUser.userName, icon: '', userId: targetUser.userId},
                    messageType: item.type || 'Message',
                    message: item.content || '',
                    success: true,
                    src: '',
                    time: item.time
                }
            })
            this.setState({
                messageList: list,
            })
            this.refs.messageList.scrollTo({y: 100});
        }catch (e) {
            this.setState({
                messageList: []
            })
        }
    }

    render() {
        const { list, messageList, dataSource, upLoading, pullLoading } = this.state;
        const indexPage = this.props.indexPage
        const title = indexPage && indexPage.state.roomData && indexPage.state.roomData.data ? indexPage.state.roomData.data.userName : '';
        return (
            <div>
                <PageHeader
                    style={{
                        border: '1px solid rgb(235, 237, 240)',
                    }}
                    onBack={() => this.back()}
                    title={<span>{title}</span>}
                    backIcon={<Icon type="left" />}
                />,
                <ListView
                    ref="messageList"
                    dataSource={dataSource.cloneWithRows(messageList)}
                    renderRow={(rowData, id1, i) => this.renderRow(rowData, i)}
                    initialListSize={1000}
                    pageSize={10}
                    renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                        { (list.pageNum < list.totalPage) && upLoading ?<Icon type="loading" />: null}
                    </div>)}
                    onEndReached={() => this.onEndReached(list.pageNum, list.totalPage)}
                    onEndReachedThreshold={20}
                    useBodyScroll={true}
                    className="room-container"
                    style={{
                        padding: '8px 8px 0px 8px',
                        height: "360px",
                        overflow: 'auto',
                    }}
                    // pullToRefresh={<PullToRefresh // import { PullToRefresh } from 'antd-mobile'
                    //     refreshing={pullLoading}
                    //     onRefresh={this.onRefresh}
                    // />}
                />
                <div className="search-item">
                    <Input placeholder="" size="small" value={this.state.inputMessage.message}  onInput={(event)=>{this.inputMessage(event)}} className="search-input" />
                    <Button type="primary" size="small" className="search-button" onClick={() => {this.sendMessage()}} >发送</Button>
                </div>
            </div>
        );
    }
}
export default ChartRoom