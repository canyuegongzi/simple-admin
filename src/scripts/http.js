import Qs from 'qs'

import UAParser from 'ua-parser-js'
import {MimeStorage} from "./localStorage";
const axios = require('axios')
const CACHE = new Map()
const HEADER = { CACHE: 'X-Cache', QUIET: 'X-Quiet' };

let redirected = false;

const { name: browserName } = new UAParser().getBrowser()
axios.interceptors.request.use(config => {
    const mimeStorage = new MimeStorage();
    if (!/(arcgis|7xp3u9)/.test(config.url)) { // arcgis相关请求，不加token
        config.headers.token = localStorage.getItem('token') || ''
    }
    console.log(mimeStorage.getItem('token'))
    config.headers.token = mimeStorage.getItem('token') ? mimeStorage.getItem('token') : '123456'
    return config
})

axios.interceptors.response.use(
    resp => {
        const { code, data, message } = resp.data
        const quiet = resp.config.headers[HEADER.QUIET]
        return data
    }, ({ response }) => {
        alert('服务错误')
    }
)

const parseReq = (path, method = 'get', params = {}) => {
    const headers = {}
    if (browserName === 'IE') { // ie浏览器强行去除缓存
        params.timeStamp = new Date().getTime()
    }
    if (/^!/.test(path)) {
        if (method === 'get') {
            headers[HEADER.CACHE] = path + Qs.stringify(params)
        }
        // 所有请求均添加静默请求
        headers[HEADER.QUIET] = true
    }
    return [path.replace(/^!/, ''), headers]
}

export const $get = (path, params = {}, server = 'wbw') => {
    const [url, headers] = parseReq(path, 'get', params)
    const cacheId = headers[HEADER.CACHE]
    axios.defaults.baseURL = getBaseUrl(server)
    if (cacheId && CACHE.has(cacheId)) {
        return Promise.resolve(CACHE.get(cacheId))
    } else {
        return axios({ url, params, headers })
    }
}

export const $post = (path, data = {}, server = 'wbw') => {
    const [url, headers] = parseReq(path, 'post')
    // 调用系统用后服务，忽略token
    if (server == 'scus') {
        axios.defaults.headers.post = Object.assign(axios.defaults.headers.post, { 'ignore-token': true })
    }
    axios.defaults.baseURL = getBaseUrl(server)
    console.log(axios.defaults.baseURL)
    return axios({ url, data: data, method: 'post', headers })
}

export const $put = (path, data = {}, server = 'wbw') => {
    const [url, headers] = parseReq(path, 'put')
    axios.defaults.baseURL = getBaseUrl(server)
    return axios({
        url,
        data: Qs.stringify(data),
        method: 'put',
        headers
    })
}

export const $delete = (path, data = {}, server = 'wbw') => {
    const [url,
        headers
    ] = parseReq(path, 'delete')
    axios.defaults.baseURL = getBaseUrl(server)
    return axios({ url, data, method: 'delete', headers })
}

/**
 * adw: 分析诊断 wmds 数据检测服务  wbw 网格基础信息  scus 用户中心 files 文件服务 esms 环境标准 bims 环境基础 bsps 用户权限
 * @param name
 * @returns {string|string|*}
 */
function getBaseUrl (name) {
    switch (name) {
        case 'wbw':
            // return 'http://127.0.0.1:8881';
            return 'http://47.106.104.22:8881';
        case 'admin':
            // return 'http://127.0.0.1:8881';
            return 'http://47.106.104.22:8881';
        case 'chart':
            // return 'http://127.0.0.1:8884';
            return 'http://47.106.104.22:8884';
        default:
            // return 'http://127.0.0.1:8881';
            return 'http://47.106.104.22:8881';
    }
}
