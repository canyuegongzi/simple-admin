import React, { Component } from 'react';
import '../css/room.css'
import {MimeStorage} from "../../../scripts/localStorage";
class MessageItem extends React.Component{
    constructor(props) {
        super(props);
        this.minmeStore = new MimeStorage()
    }

    render() {
        const {  userInfo, messageType, message, src, time} = this.props.info;
        const userSelf = this.props.selfUser;
        const roomType = this.props.roomType;
        return (
            <div>
            {
                Number(userInfo.userId) === Number(userSelf.id) ?
                    <div className="message-color message-list-item message-list-item-self">
                        <span className="message-info message-info-self">{message}</span>
                        <div className="self-user-icon">
                            <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3410572596,1015122798&fm=26&gp=0.jpg" alt=""/>
                        </div>
                        {roomType == 'group' ? <span>{userInfo.name}</span> : null}
                    </div>
                    :
                    <div className="message-color message-list-item">
                        <div className="user-icon">
                            <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3410572596,1015122798&fm=26&gp=0.jpg" alt=""/>
                        </div>
                        {roomType == 'group' ? <span>{userInfo.name}</span> : null}
                        <span className="message-info">{message}</span>
                    </div>
            }
            </div>

        )
    }
}
export default MessageItem