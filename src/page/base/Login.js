import React from 'react'
import '../css/login.css'
import { Form, Icon, Input, Button, Checkbox, message, notification } from 'antd';
import { withRouter } from 'react-router-dom';
import {$get, $post} from "../../scripts/http";
import {MimeStorage} from "../../scripts/localStorage";
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.isLogging = false;
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.isLogging = true;
                const params = { name: values.userName, password: values.password };
                $post('/user/login', params).then((res) => {
                    const mimeStorage = new MimeStorage();
                    if (res.success) {
                        mimeStorage.setItem({name: 'token', value: res.data.accessToken, expires: 120 * 60 * 1000 });
                        mimeStorage.setItem({name: 'userName', value: params.name, expires: 120 * 60 * 1000 });
                        $get('/user/getUserInfoByName', {name: values.userName}).then(res => {
                            console.log(res.data)
                            mimeStorage.setItem({name: 'userInfo', value: res.data, expires: 120 * 60 * 1000 });
                            this.props.history.push('/');
                        })
                    }else {
                        message.error(res.message);
                        this.isLogging = false;
                    }
                    this.isLogging = false;
                });
                console.log(values)
            }
        });
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
                <FormItem>
                    {getFieldDecorator('userName', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: true,
                    })(
                        <Checkbox>Remember me</Checkbox>
                    )}
                    <a className="login-form-forgot" href="">Forgot password</a>
                    <Button type="primary" htmlType="submit" className="login-form-button"
                            loading={this.isLogging ? true : false}>
                        {this.isLogging ? 'Loging' : 'Login'}
                    </Button>
                    Or <a href="">register now!</a>
                </FormItem>
            </Form>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default withRouter (WrappedNormalLoginForm)
