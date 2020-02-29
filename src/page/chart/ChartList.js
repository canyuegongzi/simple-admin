import {ListView, PullToRefresh} from 'antd-mobile';
import SimpleChart from "./Index";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {Icon} from "antd";
import FriendsMessageItem from "./message/FriendsMessageItem";
import GroupMessageItem from "./message/GroupMessageItem";
import NoticeMessageItem from "./message/NoticeMessageItem";
import RequestItem from "./message/RequestItem";
import {MimeStorage} from "../../scripts/localStorage";


function MyBody(props) {
    return (
        <div className="am-list-body my-body">
            <span style={{ display: 'none' }}>you can custom body wrap element</span>
            {props.children}
        </div>
    );
}
class ChartList extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
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
            currentUser: {},
            socketObj: null,
            upLoading : false,
            pullLoading : false,
            height: document.documentElement.clientHeight * 3 / 4,
            dataSource: ds,
            isLoading: true,
        };
    }

    componentDidMount() {
        const store = new MimeStorage();
        try {
            const user = store.getItem('userInfo');
            this.setState({
                currentUser: {
                    name: user.name,
                    userId: user.id,
                    ...user
                },
                socketObj: window.ENV.socket
            })
        } catch (e) {
            const url = window.location.origin + window.location.pathname;
            window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
        }
    }

    onEndReached = (event) => {

    }

    enterRoom(data, data1, data2) {
        console.log(data)
        console.log(data1)
        console.log(data2)
        this.props.ChartPage.enterRoomPage({type: 'friend', data})
    }

    //获取item进行展示
    renderRow = (item, i) => {
        const {messageType} = item;
        const ParentPage = this.props.ChartPage;
        const currentUser = this.state.currentUser
        return (
            <div>
                {
                    messageType == 'FriendMessage' ? <FriendsMessageItem info={item} ItemPage={this} ParentPage={ParentPage} selfUser={currentUser}/> :
                        messageType == 'GroupMessage' ? <GroupMessageItem info={item} ItemPage={this} selfUser={currentUser}/> :
                            messageType == 'NoticeMessage' ? <NoticeMessageItem info={item} ItemPage={this} selfUser={currentUser}/> :
                                messageType == 'RequestMessage' ? <RequestItem info={item} ItemPage={this} selfUser={currentUser}/> :
                                    <p></p>
                }
            </div>
        );
    }

    render() {
        const { list, dataSource, upLoading, pullLoading } = this.state;
        const messageList = this.props.messageList;
        const separator = (sectionID, rowID) => (
            <div
                key={`${sectionID}-${rowID}`}
                style={{
                    backgroundColor: '#F5F5F9',
                    height: 2,
                    borderTop: '1px solid #ECECED',
                    borderBottom: '1px solid #ECECED',
                }}
            />
        );
        return (
            <ListView
                ref="messageList"
                dataSource={dataSource.cloneWithRows(messageList)}
                renderRow={(rowData, id1, i) => this.renderRow(rowData, i)}
                initialListSize={1000}
                renderBodyComponent={() => <MyBody />}
                renderSeparator={separator}
                pageSize={10}
                renderFooter={() => (<div style={{ padding: 30, textAlign: 'center' }}>
                    { (list.pageNum < list.totalPage) && upLoading ?<Icon type="loading" />: null}
                </div>)}
                onEndReached={() => this.onEndReached(list.pageNum, list.totalPage)}
                onEndReachedThreshold={20}
                useBodyScroll={true}
                className="container"
                style={{
                    height: "400px",
                    overflow: 'auto',
                }}
                // pullToRefresh={<PullToRefresh // import { PullToRefresh } from 'antd-mobile'
                //     refreshing={pullLoading}
                //     onRefresh={this.onRefresh}
                //     />
                // }
            />
        );
    }
}
export default ChartList