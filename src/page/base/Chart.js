import React, { Component } from 'react';
import '../css/chart.css';
import {Tabs, Icon, List, Avatar, Input, Button} from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import {MimeStorage} from "../../scripts/localStorage";
import ChartMessageList from "./ChartMessageList";
import {$get} from "../../scripts/http";
const { TabPane } = Tabs;
class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.socket = window._socketObj;
        this.mimeStorage = new MimeStorage();
        this.user = this.mimeStorage.getItem('userInfo');
        this.userList = this.props.userList;
        this.userListMap = new Map();
        // 聊天信息
        this.currentMessageInfo = {};
        this.state = {
            pageFlag: 1,
            url:'',
            message: {type: '', message: ''},
            currentItem: {},
            currentUser: {name: ''},
            messageList: [],
            // 当前用户的消息列表
            currentMessageList: [
                  {
                    timestamp: new Date().getTime(),
                    userInfo: {
                        address: "地址",
                        age: "20",
                        avatar: "http://qiniu.canyuegongzi.xyz/avatar.svg",
                        desc: "这是root用户",
                        id: 1,
                        name: "root",
                        nick: "root",
                        status: 0,
                        userId: 1,
                    },
                    value: "ee"
                }
            ]
        }
    }
    componentDidMount(){
        const { history, location } = this.props;
        if (!this.socket) {
            history.replace('/login')
            return
        }
        // 声明一个自定义事件
        // 在组件装载完成以后
        this.socket.on('successMessage', (data) => {
            if (data.success) {
                this.setState({
                    message: {
                        type: '',
                        message: ''
                    }
                });
                // this._successEmitMessage(this.currentMessageInfo);
            } else {
                // this._failEmitMessage(this.currentMessageInfo)
            }

        });
        this.socket.on('getMessage', (data) => {
            console.log(data)
            this._getMessageInfo(data)
        });
    }

    _closeMessage = (message) => {
        this.props.closeMessage('66666')
    };

    /**
     * 查询用户信息
     * @private
     */
    _findUser(val) {
        const userList = this.userList;
        const currentUser = userList.find((item) => {
            return item.userId == val;
        });
        return currentUser ? currentUser : null
    }

    /**
     * 接受消息
     * @param val
     * @private
     */
    _getMessageInfo = async (data) => {
        const userList = this.userList;
        const currentUser = userList.find((item, index) => {
            return Number(item.userId) == Number(data.message.from)
        });
        const message = {
            timestamp: new Date().getTime(),
            userInfo: {...currentUser,  avatar: "http://qiniu.canyuegongzi.xyz/avatar.svg"},
            value: data.message.message
        };
        let list = [];
        const {currentMessageList = []} = this.state;
        list = [...currentMessageList];
        list.push(message);
        console.log(list);
        await this.setState({currentMessageList: list, timestamp: message.timestamp});
    };

    /**
     * 消息页返回列表
     * @private
     */
    _messageBack = (val) => {
        console.log('back');
        this.setState({
            pageFlag: 1
        })
    };
    /**
     * 面板切换
     * @param val
     * @private
     */
    _paneChange = async (val) => {
        if(val == '2') {
            await this._getUserMessageList()
        }
    };

    /**
     * 获取消息列表
     * @private
     */
    async _getUserMessageList () {
        const res = await $get('/message/userMessageList', {to: this.user.id}, 'chart');
        const messageList = res.data.data.map((item, index) => {
            const user = this._findUser(item.from);
            return {
                ...item,
                message: item.content,
                user: user.name,
                id: item._id,
                _fromUser: user
            }
        });
        this.setState({
            messageList : messageList
        });
    }

    /**
     * 代开消息页面
     * @param val
     * @private
     */
    _interMessage = (val, flag) =>  {
        if (flag == 'user') {
            this.setState({
                currentUser: val,
                pageFlag: 0,
                message: {type: '1', message: ''},
            })
        } else {
            this.setState({
                pageFlag: 0,
                message: {type: '1', message: ''},
                currentUser: val._fromUser
                //currentMessageList: []
            })
        }
    };
    /**
     * 消息页面
     * @param props
     * @return {*}
     * @private
     */
    _renderTabBar = (props) => {
        return (
            <span style={{cursor: 'pointer', color: 'rgba(255, 255, 255, 0.65)', position: 'absolute', top: 0, width: '100%', zIndex: 999, borderBottom: '1px solid #e8e8e8', display: 'block', height: '45px', lineHeight: '45px', paddingLeft: '12px'}} onClick={() => this._messageBack()}><Icon type="left" style={{marginRight: '8px'}} />返回 <span style={{left: '50%', transform: 'translateX(-50%)',position: 'absolute'}}>{this.state.currentUser.name}</span></span>
        )
    };
    /**
     * 发送消息
     */
    _getSendMessage = (val) => {
        const targetUser = this.state.currentUser;
        this.currentMessageInfo = val;
        const info = {
            from: this.user.id,
            to: targetUser.userId,
            userId: this.user.id,
            message: val.value,
        };
        console.log(info);
        this.socket.emit('sendMessage', info, (data) => {
            console.log(data)
            let list = [];
            const {currentMessageList = []} = this.state;
            list = [...currentMessageList];
            list.push(this.currentMessageInfo);
            console.log(list);
            this.setState({currentMessageList: list, timestamp:  new Date().getTime()});
        });
    };

    /**
     * 消息发送成功回调
     */
    _successEmitMessage = (v) => {
        const {value} = v;
        if (!value) return;
        let list = [];
        if (this.state.currentMessageList.length) {
            list = [...this.state.currentMessageList];
        } else {
            list = []
        }
        // const {currentMessageList = []} = this.state;
        list.push(v);
        this.setState({currentMessageList: list, timestamp: new Date().getTime()});
    };
    /**
     * 消息发送失败回调
     */
    _failEmitMessage = (v) => {
        const {value} = v;
        if (!value) return;
        let list = [];
        if (this.state.currentMessageList.length) {
            list = [...this.state.currentMessageList];
        } else {
            list = []
        }
        // const {currentMessageList = []} = this.state;
        list.push(v);
        this.setState({currentMessageList: list, timestamp: new Date().getTime()});
    };
    /**
     * 消息列表滚动
     */
    _onScrollFun = (e) => {
        console.log(e)
    };
    render() {
        const userList = this.props.userList;
        const noData = this.state.noData
        return (
           <div className="chart-container" style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 555, color: 'rgba(255, 255, 255, 0.65)',
               background: '#001529'}}>
               <div>
                   {this.state.pageFlag == 1 ?
                       <Tabs defaultActiveKey="1" onChange= {this._paneChange} tabBarStyle={{color: 'rgba(255, 255, 255, 0.65)', marginBottom: 0}}>
                           <TabPane style={{height: '100%'}}
                                    tab={<span><Icon type="unordered-list" />人员</span>} key="1">
                               <div className="list-user" style={{height: '100%'}}>
                                   <Scrollbars style={{ height: 355}}>
                                       {
                                           userList.map((item) => {
                                               return (
                                                   <div style={{color: '#fff'}} className="list-item" key={item.id} onClick={() => this._interMessage(item, 'user')}>
                                                       <div className="list-left">
                                                           <img src={item.author}></img>
                                                           <span>{item.name}</span>
                                                       </div>
                                                       <span style={{fontSize: '12px'}}>{item.status ? '在线': '离线'}</span>
                                                   </div>)
                                           })
                                       }
                                   </Scrollbars>
                               </div>

                           </TabPane>
                           <TabPane tab={<span><Icon type="aliwangwang" />消息</span>} key="2">
                               <div className="list-user" style={{height: '100%'}}>
                                   <Scrollbars style={{ height: 355}}>
                                       {
                                           this.state.messageList.map((item) => {
                                               return (
                                                   <div style={{color: '#ffffff', display: 'flex'}} className="list-item" key={item.id} onClick={() => this._interMessage(item, 'message')}>
                                                       <span> {item.user}</span>
                                                       <span> {item.message}</span>
                                                   </div>
                                               )
                                           })
                                       }
                                   </Scrollbars>
                               </div>
                           </TabPane>
                       </Tabs> :
                       <Tabs defaultActiveKey="1" className="messageLLLL" renderTabBar={this._renderTabBar} tabBarStyle={{color: 'rgba(255, 255, 255, 0.65)', height: '350px',position: 'relative', marginBottom: 0}}>
                           <TabPane style={{height: '100%'}}
                                    tab={<span onClick={() => this._messageBack()}><Icon type="left" />返回 小明</span>} key="1">
                               <div className="list-message-user" style={{ height: '350px', width: '100%'}}>
                                   <ChartMessageList timestamp={this.state.timestamp} noData={noData} userInfo={this.user} currentMessageList={this.state.currentMessageList} getSendMessage={this._getSendMessage}></ChartMessageList>
                               </div>
                           </TabPane>
                       </Tabs>
                   }

               </div>
               <span className="close-chart" >
                   <Icon type="close-circle" onClick={() => this._closeMessage(44)} style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.65)' }} />
               </span>
           </div>
        );
    }
}

export default Chart
