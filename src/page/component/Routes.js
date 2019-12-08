import {HashRouter, Switch, Redirect, Route} from "react-router-dom";
import React from "react";
import ContentView from "../base/ContentView";
import WrappedNormalLoginForm from "../base/Login";
import {MimeStorage} from "../../scripts/localStorage";

export default () => (
    <HashRouter>
        <Switch>
            <Route exact path="/login" component={WrappedNormalLoginForm} />
            <Route path="/" component={ContentView} />
        </Switch>
    </ HashRouter>
)
export const isLogin = (nextState, replaceState) => {
    console.log(nextState);
    const mimeStorage = new MimeStorage();
    let sessionStorageToken = mimeStorage.getItem('token') || sessionStorage.getItem('token');
    if (sessionStorageToken === "null" || !sessionStorageToken) {
        replaceState('/login')
    }
};
