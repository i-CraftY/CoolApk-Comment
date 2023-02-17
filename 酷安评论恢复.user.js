// ==UserScript==
// @name         酷安评论恢复
// @version      0.1
// @description  coolapk comment come back
// @connect api.coolapk.com
// @author       CCrafty
// @match        https://*.coolapk.com/*
// @icon         https://www.coolapk.com/favicon.ico
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcss.com/crypto-js/3.1.9-1/crypto-js.min.js
// @require      https://cdn.staticfile.org/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';
    $('.feed-hot-reply').remove()
    // get token
    const getRandomDEVICE_ID = () => {
        let id = [10, 6, 6, 6, 14];
        id = id.map((i) => Math.random().toString(36).substring(2, i));
        return id.join('-');
    };

    const get_app_token = () => {
        const DEVICE_ID = getRandomDEVICE_ID();
        const now = Math.round(new Date().getTime() / 1000);
        const hex_now = '0x' + now.toString(16);
        const md5_now = CryptoJS.MD5(now.toString()).toString();
        const s = 'token://com.coolapk.market/c67ef5943784d09750dcfbb31020f0ab?' + md5_now + '$' + DEVICE_ID + '&com.coolapk.market';
        const md5_s = CryptoJS.MD5(window.btoa(s)).toString();
        const token = md5_s + DEVICE_ID + hex_now;
        return token;
    };

    const base_url = 'https://api.coolapk.com';

    const getHeaders = () => ({
        'X-Requested-With': 'XMLHttpRequest',
        'X-App-Id': 'com.coolapk.market',
        'X-App-Token': get_app_token(),
        'X-Sdk-Int': '29',
        'X-Sdk-Locale': 'zh-CN',
        'X-App-Version': '11.0',
        'X-Api-Version': '11',
        'X-App-Code': '2101202',
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 10; Redmi K30 5G MIUI/V12.0.3.0.QGICMXM) (#Build; Redmi; Redmi K30 5G; QKQ1.191222.002 test-keys; 10) +CoolMarket/11.0-2101202',
    });

    // parse data
    const fid = window.location.href.match("feed/(\\d+)?")[1];
    let PAGE = 0;
    let FPAGE = 0;
    let HAVESUB = [];

    function getReply() {
        PAGE += 1;
        let FULL_URL = base_url + `/v6/feed/replyList?id=${fid}listType=lastupdate_desc&page=${PAGE}&discussMode=1&feedType=feed&blockStatus=0&fromFeedAuthor=0`;
        GM_xmlhttpRequest({
            url: FULL_URL,
            method: "GET",
            headers: getHeaders(),
            onload: function (xhr) {
                console.log(FULL_URL)
                let data = JSON.parse(xhr.responseText);
                console.log(data.data.length)
                setTimeout(() => {
                    if (data.data.length != 0) {
                        data.data.forEach(arr => {
                            const avatar = arr.userInfo.userAvatar;
                            const time = new Date(arr.dateline * 1000);
                            const content = arr.message;
                            const username = arr.username;
                            const subReply = arr.replyRows;
                            const likeNum = arr.likenum;
                            const id = arr.id;
                            let replyArea = `<div class="${id}" style="display: flex;justify-content: space-around;padding: 10px 0;border-top: 1px solid #F5F5F5;margin: 10px 1.5% 0 1.5%;"><div class="userinfo-item" style="display: flex;flex-direction: row;width: 100%;"><div class="avatar-item" style="height: 32px;width: 32px;"><img src=${avatar} alt = "" style = "width: 100%;height: 100%;border-radius: 50%;margin-top: 4px;" ></img></div ><div class="username-item" style="margin-left: 8px;"><p style="color: #212121;font-size: 15px;line-height: 150%;">${username}</p><p style="color: #BDBDBD;font-size: 12px;line-height: 150%;">${time}&nbsp;<span style="padding-left: 15px;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkIwNUE3NEZEOTE4QjExRThBMTI3QTUzNkQ2MjE3Njg2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkIwNUE3NEZFOTE4QjExRThBMTI3QTUzNkQ2MjE3Njg2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjA1QTc0RkI5MThCMTFFOEExMjdBNTM2RDYyMTc2ODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjA1QTc0RkM5MThCMTFFOEExMjdBNTM2RDYyMTc2ODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7QqikCAAABEklEQVR42mL8//8/w0AAFnyS+/btiwVS7kDMCcR/SDDzOxDvcHJyWoJLESMuHwMtDQdSKyj0WDjQ8lXYJJjwaAqjQojiNAOfxexUsJiDnDiGxel/KBtEMxKwCKaGBUr/IStxQcEZIJ4AxD+BmJmA2r/QkCoAYlOyUzUUPAQmkGWkhC8wYQYSspiJCHNYgQaxk2ApSC0rIXVMDAMERi0etXjU4lGLRy0eHhb/BlaLP4k1EKr2N0WtTCiQAVZ1/tCWIzENAVCLVIYaFoMq9OVA/I/Ipg8oFNkosRgmxwz1BVXb7fji+CcV0tBPcixeSQWLV5Lck4C2n6KAlB8QC0ITDjEAFDXvgXgTvkYi40B12gACDAARDkP30DpcHAAAAABJRU5ErkJggg==) no-repeat; background-size: contain"></span></p></div><div class="feed-message" style="margin: 16px;padding-bottom: 10px;"><p style="font-size: 16px;color: #212121;">${content}</p></div><div class="feed-like"><a style="padding-left: 20px;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQzNzU2MDFFOTJERDExRThCMkFBRjczOTIyMDQ0REExIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQzNzU2MDFGOTJERDExRThCMkFBRjczOTIyMDQ0REExIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDM3NTYwMUM5MkREMTFFOEIyQUFGNzM5MjIwNDREQTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDM3NTYwMUQ5MkREMTFFOEIyQUFGNzM5MjIwNDREQTEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4zNPnzAAAC9ElEQVR42uyaTWgTQRTHt6XWWpQqilBFBdE2lR5qLxZPOSkqIqgXtRdFqApiBYmF0h68uR705AeCWqjWix5UUDyIBwUP4geCbVS8tGoFET9ail+N/zEvOLzMJptkZzJT+uDHZF6GbP47M2/ezG5FKpXypoJVTAshSyQSKncr6AcxMAqegRvgMvgepQDf9/+VlTpuDugDTfS5HmwAZ8BbsFtHj+gQsg40B3y3AFwAp0mk1UK6QrTZD7ptFrIaxJnvI/ilaNsLVtgq5LDCtwcsBw+Yfwb1jHVCloIdzPcS3AYjNOFH2PfrbRRyEFQx3ymQie9j4Br73rqhNQfsZb4PtJbINsrqM20T0gHmMp8IsROmVvYohFTRsJJNCDhrMkWJQsg2muiyXQSfXBNylNUnwUnTSWNJQpAwxmkRlO0meOOUkIAF8EQ50vjKEnpjFYrNzP0IPCzwp1IF8J6i4bIoe6RTkcHqnhv1lNY8BWtKFoLeWIiinbnFXuO6oZE0j65VV2qP9IBZinTkt8FpsQgckhczfrerUeyjBFBskGaH+NEvtHbkMzGHjhfxp7+BGnCE3cDt4FiWEIhYjOIWaCnwQlcpKcxn94libT44INUbsoYW9UQxIjI9YsImWf2Pao50FCnCpDUoAkzWHNmpiO8DYDhEWmLKGlk9qRLSyhpd8X2/PSD8lkNIrSI5TaqGVjVrNGzhsOIL8KDO4yBd1qTwJV0U0jhVhbyjhdL5oZXUcfhgYruxkvmGXBSyhMKv80JyRiyXhKgilpM9EmP1cb5guyrklff/TNnpoTUU5eGDKaujQwfnhcTyRSxXhKgi1mAuIT8Vi5ANtkWxvX3NG8kbqyegTd4x0ssAL0JcrE3DrlE8Y1zrpR/ZyfbYUzx3kYUMMCFiE7Mr5EXjXvbTXF12PigZy9g58Nzy+XIPXMopBPvzHyg2een3Rmy0O2CrJx0BBUYtiBGbFXE43EljcbzMf/4zuOulT3g2gq9BDadfc7LN/gowAKLJoYR52iBjAAAAAElFTkSuQmCC);-webkit-background-size: contain;background-size: contain;background-repeat: no-repeat;color: #757575;">${likeNum}</a></div></div ></div >`
                            const pic = arr.pic;
                            if (pic != '') {
                                let replyAreaWP = replyArea.replace(`${content}`, `${content}<a href="${pic}" style="font-size: 16px;color: #0f9d58;" target="_blank">查看图片</a>`)
                                $('#feed-detail').append(replyAreaWP)

                            } else {
                                $('#feed-detail').append(replyArea)
                            };
                            if (subReply.length != 0) {
                                HAVESUB.push(id)
                                subReply.forEach(subArr => {
                                    const subAv = subArr.userInfo.userAvatar;
                                    const subTime = new Date(subArr.dateline * 1000);
                                    const subContent = subArr.message;
                                    const subUserName = subArr.username;
                                    const rUserName = subArr.rusername;
                                    const subLikeNum = subArr.likenum;
                                    const subPic = subArr.pic;
                                    let subReplyArea = replyArea
                                        .replace('margin: 10px 1.5% 0 1.5%;', 'margin: 10px 1.5% 0 1.5%;margin-left: 100px;')
                                        .replace(`<p style="color: #212121;font-size: 15px;line-height: 150%;">${username}</p>`, `<p style="color: #212121;font-size: 15px;line-height: 150%;">${subUserName}</p><p style="color: #212121;font-size: 15px;line-height: 150%;margin-left: initial;">回复@${rUserName}</p>`)
                                        .replace(`${content}`, `${subContent}`)
                                        .replace(`${time}`, `${subTime}`)
                                        .replace(`${avatar}`, `${subAv}`)
                                        .replace(`${likeNum}`, `${subLikeNum}`)
                                    if (subPic != '') {
                                        subReplyArea = subReplyArea.replace(`${subContent}`, `${subContent}<a href="${subPic}" style="font-size: 16px;color: #0f9d58;" target="_blank">查看图片</a>`)
                                    }
                                    $('#feed-detail').append(subReplyArea);
                                })
                            }
                        })
                        getReply();
                    }
                }, 1000);

            }
        });
    }
    getReply();
    setTimeout(() => {
        console.log(HAVESUB);
    }, 3000);
})();