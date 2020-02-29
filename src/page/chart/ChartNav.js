import React, { Component } from 'react';
import { Tabs, Icon } from 'antd';
import "./css/nav.css"
import FriendList from "./FriendList";
import ChartList from "./ChartList";
import GroupList from "./GroupList";
const { TabPane } = Tabs;

class ChartNav extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: 'redTab',
            hidden: false,
            fullScreen: false,
            selectTab: 'message'
        };
    }

    render() {
        const friendList = this.props.friendList;
        const groupList = this.props.groupList;
        const messageList = this.props.messageList
        return (
            <Tabs defaultActiveKey="message" size="small" tabBarStyle={{color: 'rgba(255, 255, 255, 0.65)'}}>
                <TabPane
                    tab={
                        <span>
                            <Icon type="aliwangwang" />
                            消息
                        </span>
                    }
                    key="message"
                >
                    <ChartList ChartPage={this.props.indexPage} messageList={messageList}></ChartList>
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <Icon type="team" />
                          群组
                        </span>
                    }
                    key="group"
                >
                    <GroupList GroupPage={this.props.indexPage}></GroupList>
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <Icon type="user" />
                            好友
                        </span>
                    }
                    key="friend"
                >
                    <FriendList FriendPage={this.props.indexPage} friendList={friendList}></FriendList>
                </TabPane>
            </Tabs>
        );
    }
}
export default ChartNav
