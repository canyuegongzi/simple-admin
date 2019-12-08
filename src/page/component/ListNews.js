import React, { Component } from 'react';
import {Avatar, Button, Icon, Layout, List, Menu, Skeleton} from "antd";
const count =5;
class ListNews extends React.Component {
    state = {
        initLoading: true,
        loading: false,
        data: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
        list: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
    };

    componentDidMount() {
        this.setState({
            initLoading: false,
            data: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
            list: [{message: '消息1', title: '消息', loading: true}, {message: '消息1', title: '消息', loading: true}],
        });
    }

    /**
     * 获取消息
     */
    getData = () => {
        const data = [{ loading: true, message: '消息1', title: '消息' }, { loading: true, message: '消息1', title: '消息' }, { loading: true, message: '消息1', title: '消息' }, { loading: true, message: '消息1', title: '消息' }];
        this.setState({
            loading: true,
            initLoading: true,
            list: this.state.data.concat(data),
            data: this.state.data.concat(data),
        });
        setTimeout(() => {
            this.setState({
                loading: false,
                initLoading: false,

            });
            window.dispatchEvent(new Event('resize'));
        }, 1500)

    };

    onLoadMore = () => {
        this.getData()
        // this.getData(res => {
        //     const data = this.state.data.concat(res.results);
        //     this.setState(
        //         {
        //             data,
        //             list: data,
        //             loading: false,
        //         },
        //         () => {
        //             // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
        //             // In real scene, you can using public method of react-virtualized:
        //             // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        //             window.dispatchEvent(new Event('resize'));
        //         },
        //     );
        // });
    };

    render() {
        const { initLoading, loading, list } = this.state;
        console.log(list);
        const loadMore =
            !initLoading && !loading ? (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: 12,
                        height: 32,
                        lineHeight: '32px',
                    }}
                >
                    <Button onClick={this.onLoadMore}>loading more</Button>
                </div>
            ) : null;

        return (
            <List
                className="demo-loadmore-list"
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={list}
                renderItem={item => (
                    <List.Item style={{color: '#000000'}}>
                        <List.Item.Meta
                            avatar={
                                <Avatar shape="circle" size={'small'} icon="user" style={{verticalAlign: 'middle'}}  />
                            }
                            title={<a href={'blog.canyuegongzi.xyz'}>{item.title}</a>}
                            // description={item.title}
                        />
                    </List.Item>
                )}
            />
        );
    }
}
export default ListNews
