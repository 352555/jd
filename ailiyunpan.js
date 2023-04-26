/*
阿里云盘签到-lowking-v1.0.1
按下面配置完之后，打开阿里云盘获取token（如获取不到，等一段时间再打开），下面配置只验证过surge的，其他的自行测试
⚠️只测试过surge没有其他app自行测试
hostname = auth.aliyundrive.com
************************
Surge 4.2.0+ 脚本配置:
************************
[Script]
# > 阿里云盘签到
https://auth.aliyundrive.com/v2/account/token
阿里云盘签到cookie = requires-body=1,type=http-response,pattern=https:\/\/auth.aliyundrive.com\/v2\/account\/token,script-path=https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js
阿里云盘签到 = type=cron,cronexp="0 10 0 * * ?",wake-system=1,script-path=https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js
************************
QuantumultX 脚本配置:
************************
[rewrite_local]
#阿里云盘签到cookie
^https:\/\/auth.aliyundrive.com\/v2\/account\/token url script-response-body https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js
[task_local]
0 10 0 * * ? https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js
************************
LOON 脚本配置:
************************
[Script]
http-response https:\/\/auth.aliyundrive.com\/v2\/account\/token script-path=https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js, requires-body=true, timeout=10, tag=阿里云盘签到cookie
cron "0 10 0 * * ?" script-path=https://raw.githubusercontent.com/lowking/Scripts/master/ali/aliYunPanCheckIn.js, tag=阿里云盘签到
*/
const lk = new ToolKit(`阿里云盘签到`, `AliYunPanCheckIn`, {"httpApi": "ffff@10.0.0.19:6166"})
const aliYunPanTokenKey = 'lkAliYunPanTokenKey'
let aliYunPanToken = !lk.getVal(aliYunPanTokenKey) ? '' : lk.getVal(aliYunPanTokenKey)
const aliYunPanRefreshTokenKey = 'lkAliYunPanRefreshTokenKey'
let aliYunPanRefreshToken = !lk.getVal(aliYunPanRefreshTokenKey) ? '' : lk.getVal(aliYunPanRefreshTokenKey)
const checkSignInRepeatKey = 'aliYunPanSignInRepeat'
const checkSignInRepeat = !lk.getVal(checkSignInRepeatKey) ? '' : lk.getVal(checkSignInRepeatKey)
lk.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 D/C501C6D2-FAF6-4DA8-B65B-7B8B392901EB"
if(!lk.isExecComm) {
    if (lk.isRequest()) {
        getCookie()
        lk.done()
    } else {
        lk.boxJsJsonBuilder({
            "icons": [
                "https://raw.githubusercontent.com/lowking/Scripts/master/doc/icon/aliYunPana.png",
                "https://raw.githubusercontent.com/lowking/Scripts/master/doc/icon/aliYunPan.png"
            ],
            "settings": [
                {
                    "id": aliYunPanTokenKey,
                    "name": "阿里云盘token",
                    "val": "",
                    "type": "text",
                    "desc": "阿里云盘token"
                }, {
                    "id": aliYunPanRefreshTokenKey,
                    "name": "阿里云盘refresh_token",
                    "val": "",
                    "type": "text",
                    "desc": "阿里云盘refresh_token"
                }
            ],
            "keys": [aliYunPanTokenKey, aliYunPanRefreshTokenKey]
        }, {
            "script_url": "https://github.com/lowking/Scripts/blob/master/ali/aliYunPanCheckIn.js",
            "author": "@lowking",
            "repo": "https://github.com/lowking/Scripts",
        })
        all()
    }
}
function getCookie() {
    if (lk.isGetCookie(/\/v2\/account\/token/)) {
        lk.log(`开始获取cookie`)
        let data = lk.getResponseBody()
        // lk.log(`获取到的cookie：${data}`)
        try {
            data = JSON.parse(data)
            let refreshToken = data["refresh_token"]
            if (refreshToken) {
                lk.setVal(aliYunPanRefreshTokenKey, refreshToken)
                lk.appendNotifyInfo('🎉成功获取阿里云盘refresh_token，可以关闭相应脚本')
            } else {
                lk.execFail()
                lk.appendNotifyInfo('❌获取阿里云盘token失败，请稍后再试')
            }
        } catch (e) {
            lk.execFail()
            lk.appendNotifyInfo('❌获取阿里云盘token失败')
        }
        lk.msg('')
    }
}
async function all() {
    let hasNeedSendNotify = true
    if (aliYunPanRefreshToken == '') {
        lk.execFail()
        lk.appendNotifyInfo(`⚠️请先打开阿里云盘登录获取refresh_token`)
    } else {
        await refreshToken()
        let hasAlreadySignIn = await signIn()
    }
    if (hasNeedSendNotify) {
        lk.msg(``)
    }
    lk.done()
}
function refreshToken() {
    return new Promise((resolve, _reject) => {
        const t = '获取token'
        let url = {
            url: 'https://auth.aliyundrive.com/v2/account/token',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
                "grant_type": "refresh_token",
                "app_id": "pJZInNHN2dZWk8qg",
                "refresh_token": aliYunPanRefreshToken
            })
        }
        lk.post(url, (error, _response, data) => {
            try {
                if (error) {
                    lk.execFail()
                    lk.appendNotifyInfo(`❌${t}失败，请稍后再试`)
                } else {
                    let dataObj = JSON.parse(data)
                    if (dataObj.hasOwnProperty("refresh_token")) {
                        aliYunPanToken = `Bearer ${dataObj["access_token"]}`
                        aliYunPanRefreshToken = dataObj["refresh_token"]
                        lk.setVal(aliYunPanTokenKey, aliYunPanToken)
                        lk.setVal(aliYunPanRefreshTokenKey, aliYunPanRefreshToken)
                    } else {
                        lk.execFail()
                        lk.appendNotifyInfo(dataObj.message)
                    }
                }
            } catch (e) {
                lk.logErr(e)
                lk.log(`阿里云盘返回数据：${data}`)
                lk.execFail()
                lk.appendNotifyInfo(`❌${t}错误，请带上日志联系作者，或稍后再试`)
            } finally {
                resolve()
            }
        })
    })
}
function signIn() {
    return new Promise((resolve, _reject) => {
        let nowString = lk.formatDate(new Date(), 'yyyyMMdd')
        if (nowString == checkSignInRepeat) {
            lk.prependNotifyInfo('今日已经签到，无法重复签到～～')
            resolve(1)
            return
        }
        const t = '签到'
        let url = {
            url: 'https://member.aliyundrive.com/v1/activity/sign_in_list',
            headers: {
                "Content-Type": "application/json",
                Authorization: aliYunPanToken,
                "User-Agent": lk.userAgent
            },
            body: JSON.stringify({})
        }
        lk.post(url, (error, _response, data) => {
            try {
                if (error) {
                    lk.execFail()
                    lk.appendNotifyInfo(`❌${t}失败，请稍后再试`)
                } else {
                    lk.log(data)
                    let dataObj = JSON.parse(data)
                    if (dataObj.success) {
                        let notice = ""
                        let prefix = ""
                        let rewardName = ""
                        let desp = ""
                        if (dataObj?.result?.signInLogs.length > 0) {
                            dataObj.result.signInLogs.forEach((l) => {
                                if (l?.status != "miss") {
                                    prefix = `第${l?.day}天`
                                    rewardName = l?.reward?.name
                                    desp = l?.reward?.description
                                }
                            })
                        }
                        let notifyStr = `🎉${prefix}${t}成功`
                        if (rewardName) {
                            notice = `${rewardName.trim()}${!desp ? "" : "-" + desp.trim()}`
                        }
                        if (notice) {
                            notifyStr = `${notifyStr}，获得【${notice}】`
                        }
