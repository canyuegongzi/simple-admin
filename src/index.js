import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {escapeCheckSession$} from "./session";
import {MimeStorage} from "./scripts/localStorage";
import io from "socket.io-client";

escapeCheckSession$().then( async (data) => {
    const mimeStorage = new MimeStorage();
    mimeStorage.setItem({name: 'userInfo', value: data.user, expires: 120 * 60 * 1000 });
    mimeStorage.setItem({name: 'navs', value: data.menus, expires: 120 * 60 * 1000 });
    let socket = null;
    try {
        socket = await io('http://127.0.0.1:9001', { query : {id: data.user.id}});
        window._socketObj = socket;
        window.ENV.socket = socket;
        console.log(socket)
    }catch (e) {
        console.warn(e)
    }
    ReactDOM.render(<App/>, document.getElementById('root'));
    serviceWorker.unregister();
})

