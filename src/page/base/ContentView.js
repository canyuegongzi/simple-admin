import {Layout, Menu, Icon, Avatar, Badge, Drawer, Dropdown, notification} from 'antd';
import React, { Component } from 'react';
import '../../style/content/index.css'
import Proxy from "./Proxy";
import io from 'socket.io-client';
import { Scrollbars } from 'react-custom-scrollbars';
import { Route, HashRouter } from "react-router-dom";
import Nav from "../component/Nav";
import {isLogin} from "../component/Routes";
import { MimeStorage} from "../../scripts/localStorage";
import {$get} from "../../scripts/http";
import ListNews from "../component/ListNews";
import {parseTime} from "../../scripts/untils";
import Chart from "./Chart";
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
            userList: []
        };
        this.mimeStorage = new MimeStorage();
        this.socket = null
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
            this._getMenuData();
            this._getUserList();
            this._socketCon(userInfo.id)
        }

    }

    componentWillUnmount() {
        const userInfo = this.mimeStorage.getItem('userInfo');
        if (userInfo) {
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
        console.log(this.menus)
    };
    /**
     * 获取菜单那数据
     * @return {Promise<void>}
     * @private
     */
    async _getMenuData () {
        const mimeStorage = new MimeStorage();
        const user = mimeStorage.getItem('userName');
        const { history, location } = this.props;
        if (!user) {
            history.replace('/login')
        }
        const res = await $get('/authority/sysMenus?system=aggregation&user='+user+'', {}, 'admin')
        const temp = this.dealMenus(res.data ? res.data : []);
        mimeStorage.setItem({name: 'menus', value: temp, expires: 120 * 60 * 1000});
        this.setState({
            menus: temp ? temp[0].childs : []
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
        console.log(res.data.data)
    }

    /**
     * socket初始化
     * @return {Promise<void>}
     */
    async _socketCon (id) {
        let socket = null;
        if (!window._socketObj) { // http://47.106.104.22:9001
            socket = io('http://127.0.0.1:9001', { //指定后台的url地址
                query : {
                    id
                }, //如果需要的话添加 path 路径以及其他可选项
            });
            window._socketObj = socket;
        } else {
            socket = window._socketObj
        }
        this.socket = socket;
        socket.on('connect', () => {
            socket.emit('userConnect', { userId: id });
        });
        socket.on('successLine', (data) => {
            const user = this.mimeStorage.getItem('userName');
            const args = {
                message: `欢迎您: ${user}`,
                description:
                    `${parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')}`,
                duration: 2,
            };
            notification.open(args);
        });
        socket.on('broadcastLine', (data) => {
            this._dealUserLine(data, 1)
        });
        socket.on('broadcastOutLine', (data) => {
            console.log(data);
            this._dealUserLine(data, 0)
        });
        socket.on('getMessage', (data) => {
            console.log(data)
        });
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
                    // value: "http://canyuegongzi.xyz/simple-file-center-web/#/fileManage/categoryList?hideMenus=true",
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
        console.log(msg);
        this.setState({
            visible: true,
        });
    };
    /**
     * 退出登录
     */
    _myLoginOut = () => {
        const { history, location } = this.props;
        const mimeStorage = new MimeStorage();
        const userInfo = this.mimeStorage.getItem('userInfo');
        this.socket.emit('userOutConnect', {userId: userInfo.id});
        mimeStorage.removeItem('userName');
        mimeStorage.removeItem('token');
        mimeStorage.removeItem('userInfo');
        window._socketObj = null;
        history.replace('/login')
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
            showMessage: true
        })
    };

    /**
     * 关闭消息框
     */
    _closeMessage = (data) => {
        this.setState({
            showMessage: false
        })
    };

    render() {
        return (
                <Layout>
                    <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                        <Scrollbars>
                            <Nav menus={this.state.menus}></Nav>
                        </Scrollbars>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0, height: '48px', lineHeight: '48px', display: 'flex', justifyContent: 'space-between' }}>
                            <Icon
                                className="trigger"
                                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                style={{marginTop: '18px'}}
                                onClick={this.toggle}
                            />
                            <Dropdown overlay={this.renderMenu} trigger={['click']}>
                                <span style={{ marginRight: 24 }}>
                                  <Badge count={1}>
                                    <Avatar shape="circle" size={'small'} icon="user" style={{verticalAlign: 'middle'}} />
                                  </Badge>
                                </span>
                            </Dropdown>
                        </Header>
                        <Content style={{
                            width: '100%',
                            height: '100%'
                        }}>
                            <Scrollbars>
                            <HashRouter>
                                    <Route component={Proxy} onEnter={isLogin}/>
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
                    {this.state.showMessage ?
                        <Chart socket={this.socket} closeMessage={this._closeMessage} parent={this} userList={this.state.userList}></Chart> : <Icon type="message" onClick={this._openMessage} style={{ fontSize: '24px', color: '#08c', position: 'fixed', right: '16px', bottom: '16px',zIndex: 500 }} />
                    }

                </Layout>
        );
    }
}

export default ContentView;
