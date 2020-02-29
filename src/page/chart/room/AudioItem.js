import React, { Component } from 'react';
import '../css/room.css'
class AudioItem extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        const {  userInfo, messageType, message, src, time} = this.props.info
        const roomType = this.props.params
        return (
            <div className="message-color message-list-item">
                <div className="user-icon">
                    <img src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3410572596,1015122798&fm=26&gp=0.jpg" alt=""/>
                </div>
                {roomType == 'group' ? <span>{userInfo.name}</span> : null}
                <span className="message-info">{message}</span>
            </div>
        )
    }
}
export default AudioItem