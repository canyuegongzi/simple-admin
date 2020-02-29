import React, { Component } from 'react';
import '../css/room.css'
import {beautifyTime, parseTime} from "../../../scripts/untils";
class FriendsMessageItem extends React.Component{
    constructor(props) {
        super(props);
    }

    /**
     * 进入详情
     * @param item
     */
    enterDetail = (item) => {
        this.props.ParentPage.enterRoomPage({type: 'friend', data: {
                id: "",
                userId: item.userInfo.userId,
                status: 1,
                ip: "",
                address: "",
                wsId: "",
                userName: item.userInfo.name
            }})

    }
    render() {
        const {userInfo, messageType, message, success, src, time} = this.props.info;
        return (
            <div key={message.id+Math.random()} style={{ padding: '0 8px' }} className="list-container" onClick={(m, data) => this.enterDetail(this.props.info)}>
                <div style={{display: 'flex'}} className="list-item">
                    <div className="left">
                        <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3410572596,1015122798&fm=26&gp=0.jpg"/>
                    </div>
                    <div className="right message-right">
                        <div className="message-top">
                            <p>{userInfo.name ? userInfo.name : ''}</p>
                            <p>{beautifyTime(Number(time))}</p>
                        </div>
                        <div className="message-bottom">
                            {message ? message : ''}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default FriendsMessageItem