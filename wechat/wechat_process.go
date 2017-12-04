package wechat

import (
	"github.com/spf13/viper"
	"net/http"
	"regexp"
	"strings"
	"yx.com/meituan-luck/common"
)

func (w *Wechat) MsgProcessDaemon(msgIn chan Message) {
	msg := Message{}
	reMeituanUrl := regexp.MustCompile(`activity\.waimai\.meituan\.com/coupon/sharechannel/([\w\d]+)\?urlKey=([\w\d]+)`)
	reBestNum := regexp.MustCompile(`第(\d+)个领取的`)
	for {
		select {
		case msg = <-msgIn:
			common.Log.INFO.Printf("%v", msg)
			switch msg.MsgType {
			case 49:
				//链接
				//美团红包分享链接
				pm := reMeituanUrl.FindStringSubmatch(msg.Url)
				pmBestNum := reBestNum.FindStringSubmatch(msg.Content)
				if len(pm) != 0 && len(pmBestNum) != 0 {
					channel := pm[1]
					urlKey := pm[2]
					urlTmp := viper.GetString("weixin_server.meituan_luck_server")

					url := strings.Replace(urlTmp, "[luckNum]", pmBestNum[1], -1)
					url = strings.Replace(url, "[fromUid]", msg.FromUserName, -1)
					url = strings.Replace(url, "[channel]", channel, -1)
					url = strings.Replace(url, "[urlKey]", urlKey, -1)
					go http.Get(url)
					common.Log.INFO.Println("回调:" + url)
				}
			default:

			}
		}
	}
}
