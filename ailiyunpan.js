/*
阿里云盘签到-lowking-v1.0.1
按下面配置完之后，打开阿里云盘获取token（如获取不到，等一段时间再打开），下面配置只验证过surge的，其他的自行测试
⚠️只测试过surge没有其他app自行测试
	@@ -142,8 +142,49 @@ function refreshToken() {
    })
}

function signIn() {
    return new Promise((resolve, _reject) => {
        let nowString = lk.formatDate(new Date(), 'yyyyMMdd')
        if (nowString == checkSignInRepeat) {
            lk.prependNotifyInfo('今日已经签到，无法重复签到～～')
	@@ -160,36 +201,26 @@ function signIn() {
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
                        lk.prependNotifyInfo(notifyStr)
                        lk.setVal(checkSignInRepeatKey, nowString)
                    } else {
                        lk.execFail()
