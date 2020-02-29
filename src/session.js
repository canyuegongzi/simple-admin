import QS from 'query-string';
import {MimeStorage} from "./scripts/localStorage";
import {getURLParameters} from "./scripts/url-params";
import {$get, $post} from "./scripts/http";
import {data} from "./data/menu";

export const escapeCheckSession$ = () =>  {
    return new Promise(async ( resolve) => {
        const mimeStorage = new MimeStorage();
        const params = getURLParameters(window.location.href);
        const uriSplit = decodeURI(window.location.href).split('?token=');
        const [href, search] = window.location.href.split('?')
        const { hideMenus } = QS.parse(search);
        let sessionStorageToken = mimeStorage.getItem('token') || sessionStorage.getItem('token');
        const arr = window.location.href.split('?token');
        if (uriSplit[1]) {
            sessionStorageToken = uriSplit[1];
            mimeStorage.setItem({name: 'token', value: sessionStorageToken, expires: 120 * 60 * 1000 });
            window.location.href = uriSplit[0];
        }
        if (sessionStorageToken === "null" || !sessionStorageToken) {
            const url = window.location.origin + window.location.pathname;
            window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
        }
        const token = sessionStorageToken;
        mimeStorage.setItem({name: 'token', value: sessionStorageToken, expires: 120 * 60 * 1000 });
        const user = await $post('/user/findUserToken', { token: sessionStorageToken}, 'bsp');
        if (user.data) {
            try {
                const menus = await $get('/authority/sysMenus', {user: user.data.name, system: 'aggregation'});
                const chartInfo = await $post('/message/addMessageUser', {...user.data, userId: user.data.id, userName: user.data.name}, 'chart');
                console.log(chartInfo)
                if (menus && menus.data) {
                    resolve({ menus: menus.data, user: user.data })
                }else {
                    resolve({menus: [], user: user.data})
                }
            } catch (e) {
                console.log(e)
                const url = window.location.origin + window.location.pathname;
                window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
                resolve({ menus: [], user: {}})
            }
        }else {
            const url = window.location.origin + window.location.pathname;
            window.location.href = window.ENV.domain + window.ENV.casDomain + '?redirectUrl=' + url;
            resolve({ menus: [], user: {}})
        }

    });
};
