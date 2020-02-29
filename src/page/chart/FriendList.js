import { ListView } from 'antd-mobile';
import SimpleChart from "./Index";
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

function MyBody(props) {
    return (
        <div className="am-list-body my-body">
            <span style={{ display: 'none' }}>you can custom body wrap element</span>
            {props.children}
        </div>
    );
}

class FriendList extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this.state = {
            dataSource: ds,
            isLoading: true,
            height: document.documentElement.clientHeight * 3 / 4,
        };
    }

    componentDidMount() {
        const hei = document.documentElement.clientHeight - ReactDOM.findDOMNode(this.lv).parentNode.offsetTop;
        this.setState({
            isLoading: false,
            height: hei,
        });
    }

    enterRoom(data, data1, data2) {
        this.props.FriendPage.enterRoomPage({type: 'friend', data})
    }
    render() {
        const friendsList = this.props.friendList;
        const { dataSource } = this.state;
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
        const row = (rowData, sectionID, rowID) => {
            return (
                <div key={rowID} style={{ padding: '0 8px' }} className="list-container" onClick={(m, data) => this.enterRoom(rowData, sectionID, rowID)}>
                    <div style={{display: 'flex'}} className="list-item">
                        <div className="left">
                            <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3410572596,1015122798&fm=26&gp=0.jpg" alt=""/>
                        </div>
                        <div className="right">
                            {rowData.userName}
                        </div>
                        <div className="friend-status">
                            {rowData.status && rowData.status == 1 ? '在线' : '离线'}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <ListView
                ref={el => this.lv = el}
                dataSource={dataSource.cloneWithRows(friendsList)}
                renderBodyComponent={() => <MyBody />}
                renderRow={row}
                renderSeparator={separator}
                style={{
                    height: "400px",
                    overflow: 'auto',
                }}
                pageSize={4}
                onScroll={() => { console.log('scroll'); }}
                scrollRenderAheadDistance={500}
                onEndReachedThreshold={10}
            />
        );
    }
}
export default FriendList