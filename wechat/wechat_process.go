package wechat

import (
	"regexp"
	"net/http"
	"strings"
	"github.com/spf13/cast"
)

func (w *Wechat) MsgProcessDaemon(msgIn chan Message) {
	msg := Message{}
	reMeituanUrl := regexp.MustCompile(`activity\.waimai\.meituan\.com\/coupon\/sharechannel\/([\w\d]+)\?urlKey=([\w\d]+)`)
	for {
		select {
		case msg = <-msgIn:
			w.LogInfo.Printf("%v", msg)
			switch msg.MsgType {
			case 49:
				//链接
				//美团红包分享链接
				pm := reMeituanUrl.FindStringSubmatch(msg.Url)
				if len(pm) != 0 {
					channel := pm[1]
					urlKey := pm[2]
					url := strings.Replace(w.Meituan.MTAutoTouch, "[fromType]", cast.ToString(msg.MsgType), -1)
					url = strings.Replace(url, "[fromUid]", msg.FromUserName, -1)
					url = strings.Replace(url, "[channel]", channel, -1)
					url = strings.Replace(url, "[urlKey]", urlKey, -1)
					go http.Get(url)
					w.LogInfo.Println("回调:" + url)
				}
			default:

			}
		}
	}
}
