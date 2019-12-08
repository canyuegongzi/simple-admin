/**
 * @description 常用工具函数
 * @author fei_yong
 * @date 2019-09-27 14:46
 */

/**
 * 格式化时间
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns
 */
export function parseTime (time, cFormat) {
    if (arguments.length === 0) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return timeStr
}
/**
 * 计算时间属于当年的第几周
 * @param time {string} '2019-02-3'
 * @returns {string}
 */
export const getYearWeek = function (time) {
    const today = new Date(time)
    let firstDay = new Date(today.getFullYear(), 0, 1)
    const dayOfWeek = firstDay.getDay()
    let spendDay = 1
    if (dayOfWeek != 0) {
        spendDay = 7 - dayOfWeek + 1
    }
    firstDay = new Date(today.getFullYear(), 0, 1 + spendDay)
    const d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000)
    const result = Math.ceil(d / 7)
    return `${today.getFullYear()}年第${result + 1}周`
}
/**
 * 获取几天前的日期
 * @param day {number} 0: 当前的额时间 1：一天后的时间 -1 ：一天前的时间
 * @param time ? {string} 2017-01-2
 */
export const getTimeByBeforeDay = function (day, time){
    const today = time ? new Date(time) : new Date()
    const targetdayMilliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day
    today.setTime(targetdayMilliseconds) // 注意，这行是关键代码
    const tYear = today.getFullYear()
    let tMonth = today.getMonth()
    let tDate = today.getDate()
    tMonth = doHandleMonth(tMonth + 1)
    tDate = doHandleMonth(tDate)
    return tYear + "-" + tMonth + "-" + tDate
}
/**
 * 拼接月数
 * @param month
 * @returns {string}
 */
export const doHandleMonth = function (month){
    let m = month
    if (month.toString().length == 1){
        m = "0" + month
    }
    return m
}
/**
 * 计算时间是否超出
 * @param time
 */
export const getOutTime = function (time) {
    const afterTime = getTimeByBeforeDay(-1)
    return new Date(time) > new Date(afterTime)
}
/**
 * 递归遍历对象属性
 * @param pathArry {Array} []
 * @param paths
 * @param obj {object} {}
 * @returns {*}
 */
export const getObjKeyPath = (pathArry = [], paths, obj) => {
    for (const key in obj){
        const type = obj[key].constructor.name
        if (type == "Object"){
            if (!paths){
                paths = []
            }
            paths.push(key)
            getObjKeyPath(pathArry, paths, obj[key])
        } else {
            if (!paths){
                pathArry.push([key])
            } else {
                const arry = paths.concat()
                arry.push(key)
                pathArry.push(arry)
            }
        }
    }
    return pathArry
}
/**
 * 比较两个对象(可以是嵌套的深层对象)
 * @param obj1 {object}
 * @param obj2 {object}
 * @returns {boolean}
 */
export const objIsEqual = (obj1, obj2) => {
    const keys1 = getObjKeyPath([], null, obj1)
    const keys2 = getObjKeyPath([], null, obj2)
    let bigObj = null
    let smallObj = null
    let keys = null
    if (keys1.length >= keys2.length){
        bigObj = obj1
        smallObj = obj2
        keys = keys1
    } else {
        bigObj = obj2
        smallObj = obj1
        keys = keys2
    }
    for (const i in keys){
        let val1 = bigObj
        let val2 = smallObj
        for (const j in keys[i]){
            const key = keys[i][j]
            val1 = val1[key]
            val2 = val2[key]
            if (val2 == undefined){
                return false
            }
        }
        if (val1 != val2){
            return false
        }
    }
    return true
}
/**
 * 计算时间数组
 * @type {{getYear: (function(*=, *=): Array), getQuarter, getMonths: (function(*=, *=): Array)}}
 */
export const getDateUtils = {
    getMonths: (num = 12, time) => {
        const d = time ? new Date(time) : new Date()
        const result = []
        for (let i = 0; i < num; i++) {
            d.setMonth(d.getMonth() - 1)
            let m = d.getMonth() + 1
            m = m < 10 ? "0" + m : m
            result.push(`${d.getFullYear()}-${m}`)
        }
        return result.reverse()
    },
    getYear: (num = 3, time) => {
        const d = time ? new Date(time) : new Date()
        const result = []
        for (let i = 0; i < num; i++) {
            d.setFullYear(d.getFullYear() - 1)
            result.push(d.getFullYear())
        }
        return result.reverse()
    },
    getQuarter: (num = 4, time) => {
        const d = time ? new Date(time) : new Date()
        let year = d.getFullYear()
        const month = d.getMonth() + 1
        const arr = []
        let q = Math.floor((month + 2) / 3)
        for (let i = 0; i < 4; i++) {
            if (--q < 1) {
                q = 4
                year--
            }
            arr.push(year + "Q" + q)
        }
        return arr.reverse()
    }
}

/**
 * 计算时间属于当年的第几周
 * @param time {string} '2019-02-3'
 * @returns {string}
 */
export const getYearWeekNumber = function (time) {
    const today = new Date(time)
    let firstDay = new Date(today.getFullYear(), 0, 1)
    const dayOfWeek = firstDay.getDay()
    let spendDay = 1
    if (dayOfWeek != 0) {
        spendDay = 7 - dayOfWeek + 1
    }
    firstDay = new Date(today.getFullYear(), 0, 1 + spendDay)
    const d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000)
    const result = Math.ceil(d / 7)
    return `${today.getFullYear()}-${result + 1}`
}
/**
 * 获取offsetTop
 * @param {Element} elem
 */
export const offsetTop = function (elem){
    var top = elem.offsetTop
    var parent = elem.offsetParent
    while (parent){
        top += parent.offsetTop
        parent = parent.offsetParent
    }
    return top
}
/**
 * 获取offsetLeft
 * @param {Element} elem
 */
export const offsetLeft = function (elem){
    var left = elem.offsetLeft
    var parent = elem.offsetParent
    while (parent){
        left += parent.offsetLeft
        parent = parent.offsetParent
    }
    return left
}
/**
 * 除法精确函数(解决js浮点除法的不精确)
 * @param arg1
 * @param arg2
 * @return {number}
 */
export const divisionMethod = (arg1,arg2) => {
    let t1 = 0, t2 = 0, r1, r2;
    try {
        t1 = arg1.toString().split(".")[1].length
    } catch (e) {
        console.log(e)
    }
    try {
        t2 = arg2.toString().split(".")[1].length
    } catch (e) {
        console.log(e)
    }
    // with (Math) {
    //     r1 = Number(arg1.toString().replace(".", ""))
    //     r2 = Number(arg2.toString().replace(".", ""))
    //     return (r1 / r2) * pow(10, t2 - t1);
    // }
}
