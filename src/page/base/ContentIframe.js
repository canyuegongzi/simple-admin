import React, { Component } from 'react';
import Iframe from 'react-iframe'
class ContentIframe extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
                <Iframe url={this.props.url}
                        width="100%"
                        height="100%"
                        id="myId"
                        className="myClassname"
                        display="initial"
                        position="relative"/>
        );
    }
}

export default ContentIframe
