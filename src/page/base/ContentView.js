import {Layout, Menu, Icon, Avatar, Badge, Drawer, Dropdown, notification} from 'antd';
import React, { Component } from 'react';
import '../../style/content/index.css'
import Proxy from "./Proxy";
import { Scrollbars } from 'react-custom-scrollbars';
import {Route, HashRouter, Redirect} from "react-router-dom";
import Nav from "../component/Nav";
import {isLogin} from "../component/Routes";
import { MimeStorage} from "../../scripts/localStorage";
import {$get} from "../../scripts/http";
import ListNews from "../component/ListNews";
import Chart from "./Chart";
import Analyze from "./Analyze";
import SimpleChart from "../chart/Index"
const { Header, Sider, Content } = Layout;


class ContentView extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            collapsed: false,
            selectedKeys: [],
            menus: [],
            visible: false,
            noData: true,
            placement: 'left',
            showMessage: false,
            userList: [],
            userInfo: {},
            currentMessageObj: {
              num: 0,
              list: []
            },
            messageNum: 0,
            bottom: -465,
            right: -316
        };
        this.mimeStorage = new MimeStorage();
        this.socket = window.ENV.socket
    }

    componentDidMount() {
        const mimeStorage = new MimeStorage();
        const { history, location } = this.props;
        let sessionStorageToken = mimeStorage.getItem('token') || sessionStorage.getItem('token');
        if (sessionStorageToken === "null" || !sessionStorageToken) {
            if (location.pathname !== 'login') {
                history.replace('/login')
            }
        }
        if (sessionStorageToken) {
            const userInfo =  mimeStorage.getItem('userInfo');
            this.setState({
                userInfo: userInfo
            })
            this._getMenuData();
            this._getUserList();
            this._socketCon(userInfo.id)
        }

    }

    componentWillUnmount() {
        const userInfo = this.mimeStorage.getItem('userInfo');
        if (userInfo && this.socket) {
            this.socket.emit('userOutConnect', {userId: userInfo.id});
        }
        if(this.socket) {
            this.socket.on('broadcastOutLine', (data) => {
                this._dealUserLine(data, 0)
            });
        }
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    /**
     * 获取菜单那数据
     * @return {Promise<void>}
     * @private
     */
    async _getMenuData () {
        const mimeStorage = new MimeStorage();
        const user = mimeStorage.getItem('userInfo');
        const { history, location } = this.props;
        if (!user) {
            history.replace('/login')
        }
        const res = mimeStorage.getItem('navs');
        const temp = this.dealMenus(res ? res : []);
        this.setState({
            menus: temp ? temp: []
        })
    }

    /**
     * 获取用户列表
     * @return {Promise<void>}
     */
    async _getUserList() {
        const res = await $get('/message/userList', {}, 'chart');
        const userList = res.data.data.map((item) => {
            return  {
                ...item,
                name: item.userName,
                author: '',
                id : item._id,
            }
        });
        this.setState({
            userList: userList
        });
    }

    /**
     * socket初始化
     * @return {Promise<void>}
     */
    async _socketCon (id) {
        let socket = window._socketObj;
        this.setState({
            socket: socket
        })
    }

    /**
     * 用户上线下线
     * @param data
     * @private
     */
    _dealUserLine(data, flag) {
        console.log(data);
        const findIndex = this.state.userList.findIndex((item, index) => {
            return Number(item.userId) === Number(data.userId)
        });
        if (findIndex == -1) {
            this._getUserList()
        } else {
            console.log(findIndex);
            this.state.userList[findIndex].status = flag;
            const temp = this.state.userList;
            console.log(temp);
            this.setState({
                userList: temp
            })
        }
    };
    /**
     * 处理菜单数据
     * @param res
     * @return {*}
     */
    dealMenus = (res) => {
        const result = []
        const dealArr = (arr) => {
            arr.forEach((item) => {
                item.entity = {
                    id: item.id,
                    parentMenuId: item.parentId,
                    code: item.code,
                    name: item.path,
                    icon: item.icon,
                    alias: item.name,
                    state: "ENABLE",
                    sort: 0,
                    value: item.value,
                    type: item.value ? 'admin' : 'system',
                    discription: item.desc,
                    createUserId: '',
                };
                item.childs = item.children ? item.children : [];
                delete item.id;
                delete item.name;
                delete item.code;
                delete item.desc;
                delete item.parentId;
                delete item.value;
                delete item.value;
                delete item.icon;
                delete item.system;
                delete item.path;
                delete item.parentName;
                if (item.children && item.children.length) {
                    dealArr(item.children)
                }
            })
        };
        dealArr(res);
        return res;
    };
    /**
     * 渲染菜单
     * @return {*}
     */
    renderMenu = () => {
        return (
            <Menu>
                <Menu.Item key="0" onClick={this._myMessage}>
                   <span>我的消息</span>
                </Menu.Item>
                <Menu.Item key="1" onClick={this._myOA}>
                    <span>OA系统</span>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3" onClick={this._myLoginOut}>
                    <span>退出登录</span>
                </Menu.Item>
            </Menu>
        )
    };
    /**
     * 消息队列
     */
    _myMessage = (msg) => {
        this.setState({
            visible: true,
        });
    };
    /**
     * 退出登录
     */
    _myLoginOut = async () => {
        const { history, location } = this.props;
        const mimeStorage = new MimeStorage();
        const userInfo = this.mimeStorage.getItem('userInfo');
        const socket = this.state.socket
        socket.emit('userOutConnect', {userId: userInfo.id}, (data) => {
            console.log(data)
        });
        // this.socket.emit('userOutConnect', {userId: userInfo.id});
        mimeStorage.removeItem('userName');
        mimeStorage.removeItem('token');
        mimeStorage.removeItem('userInfo');
        window._socketObj = null;
        window.location.reload();
    };
    /**
     * OA系统
     */
    _myOA = () => {
      console.log('oa')
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    /**
     * 打开消息框
     */
    _openMessage = () => {
        this.setState({
            showMessage: true,
            bottom: -6,
            right: 16,
            messageNum: 0
        })
    };

    /**
     * 关闭消息框
     */
    _closeMessage = (data) => {
        console.log(data)
        this.setState({
            showMessage: false,
            bottom: -465,
            right: -316
        })
    };

    /**
     * 关闭消息框 {num: number, list: [{type: ''}]}
     */
    _setMessageNum = (data) => {
        console.log(data);
        this.setState({
            messageNum: data.num
        })
    };

    render() {
        const user = this.state.userInfo;
        const { bottom, right, currentMessageObj, messageNum} = this.state
        return (
                <Layout>
                    <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                        <Scrollbars>
                            <Nav menus={this.state.menus}></Nav>
                        </Scrollbars>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0, height: '55px', lineHeight: '55px', display: 'flex', justifyContent: 'space-between' }}>
                            <Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                style={{marginTop: '18px'}}
                                onClick={this.toggle}
                            />
                            <div>
                                <span style={{marginRight: '8px', fontSize: '16px', cursor: 'pointer'}}>{user.name}</span>
                                <Dropdown overlay={this.renderMenu} trigger={['click']}>
                                <span style={{ marginRight: 24 }}>
                                  <Badge count={1}>
                                    <Avatar shape="circle" size={'small'} icon="user" style={{verticalAlign: 'middle'}} />
                                  </Badge>
                                </span>
                                </Dropdown>
                            </div>

                        </Header>
                        <Content style={{
                            width: '100%',
                            height: '100%'
                        }}>
                            <Scrollbars>
                            <HashRouter>
                                    {/*<Route component={Analyze} exact path="/"  onEnter={isLogin}/>*/}
                                    <Route component={Analyze} path="/analyze"  onEnter={isLogin}/>
                                    <Route component={Proxy} path="/admin" onEnter={isLogin}/>
                                    <Redirect to="/analyze" />
                            </ HashRouter>
                            </Scrollbars>
                        </Content>
                    </Layout>
                    <Drawer
                        title="我的消息"
                        placement='right'
                        closable={false}
                        onClose={this.onClose}
                        visible={this.state.visible}
                    >
                        <Scrollbars>
                            <ListNews></ListNews>
                        </Scrollbars>
                    </Drawer>
                    <div style={{position: 'fixed', bottom: bottom,right: right}}>
                            <SimpleChart closeMessage={() => this._closeMessage()} currentMessageNum={messageNum} setMessageNum={(data) => this._setMessageNum(data)}></SimpleChart>
                            <Icon type="message" onClick={this._openMessage} style={{ fontSize: '28px', color: '#08c', position: 'fixed', right: '16px', bottom: '16px',zIndex: 500 }} />
                            <Badge count={messageNum ? messageNum : ''} style={{ color: '#fff', position: 'fixed', right: '8px', bottom: '32px',zIndex: 500 }}></Badge>
                    </div>
                </Layout>
        );
    }
}

export default ContentView;
