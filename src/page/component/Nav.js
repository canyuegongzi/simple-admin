import React, { Component } from 'react';
import {withRouter} from "react-router-dom";
import {Icon, Layout, Menu} from "antd";
import emitter from "../../scripts/events"
import {MimeStorage} from "../../scripts/localStorage";
const { SubMenu } = Menu;

class Nav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            selectedKeys: [],
            menus: []
        };
        this.timer = null
    }
    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };
    componentDidMount() {
        const mimeStorage = new MimeStorage();
        const menus = mimeStorage.getItem('menus');
        if (menus) {
            const { hash } = window.location;
            const list = this.props.menus;
            const hashStr = hash.substr(1);
            let currentItem = {};
            const findUrl = (arr) => {
                arr.forEach((item) => {
                    if (item.entity.name == hashStr) {
                        console.log(item.entity)
                        currentItem = item.entity
                    }
                    if (item.childs) {
                        findUrl(item.childs)
                    }
                })
            };
            findUrl(menus);
            setTimeout(() => {
                this._gotoUrl(currentItem)
            },1000)
        }
    }

    /**
     * 渲染菜单
     * @param RouterTree
     * @param callback
     * @return {*}
     * @private
     */
    _sidebarTree = (RouterTree, callback) => {
        // 判断是否有效的数组,且长度大于0[再去递归才有意义]
        let isValidArr = value => value && Array.isArray(value);
        let isValidArrChild = value =>
            value && value.childs && Array.isArray(value.childs) && value.childs.length > 0;
        function recursive(Arr) {
            if (isValidArr(Arr)) {
                return Arr.map(ArrItem => {
                    if (isValidArrChild(ArrItem)) {
                        return (
                            <SubMenu
                                key={ArrItem.entity.id}
                                title={
                                    <div>
                                        {ArrItem.entity.icon ? <Icon type={ArrItem.entity.icon} theme="outlined" /> : null}
                                        <span>{ArrItem.entity.alias}</span>
                                    </div>
                                }
                            >
                                {recursive(ArrItem.childs)}
                            </SubMenu>
                        );
                    }
                    return (
                        <Menu.Item key={ArrItem.entity.id} onClick={() => callback(ArrItem.entity)}>
                            {ArrItem.entity.icon ? <Icon type={ArrItem.entity.icon} theme="outlined" /> : null}
                            <span>{ArrItem.entity.alias}</span>
                        </Menu.Item>
                    );
                });
            }
        }
        if (RouterTree) {
            return recursive(RouterTree);
        } else {
            return null
        }

    };
    /**
     * 菜单跳转
     * @param item
     * @private
     */
    _gotoUrl = item => {
        emitter.emit("iframeChange",item);
        this.setState({
            selectedKeys: [item.key],
        });
        const { history, location } = this.props;
        if (location.pathname === item.name) {
            return;
        } else {
            if (/^(http:\/\/|https:\/\/)/.test(item.value)) {
                history.push('/admin' + item.name);
                if (this.timer) {
                    clearTimeout(this.timer)
                }
                setTimeout(() => {
                    emitter.emit("iframeChange",item);
                }, 500)
            } else {
                history.push(item.name);
            }

        }
    };
    render() {
        const menus = this.props.menus;
        return (
            <div>
                <div className="logo" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    {this._sidebarTree(menus, this._gotoUrl)}
                </Menu>
            </div>
        );
    }
}

export default withRouter(Nav)
