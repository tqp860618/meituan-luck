package wechat

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/viper"
	"net/http"
	"strings"
	"yx.com/meituan-luck/common"
)

func (w *Wechat) MsgOut(msgIn chan *Message, ipPortChan chan string) {
	msg := new(Message)
	//"msg_dis_server_callback": "http://127.0.0.1:7671/[fromUid]/[msgType]/[msgCallBack]/[msgJson]"

	var ipPort string
	ipPort = <-ipPortChan

	for {
		select {
		case msg = <-msgIn:
			urlRequest := viper.GetString("weixin_server.msg_dis_server_callback")

			urlRequest = strings.Replace(urlRequest, "[msgCallBack]", ipPort, -1)
			urlRequest = strings.Replace(urlRequest, "[source]", common.Md5(w.User.NickName), -1)
			urlRequest = strings.Replace(urlRequest, "[fromUid]", msg.FromUserName, -1)
			urlRequest = strings.Replace(urlRequest, "[msgType]", fmt.Sprintf("%d", msg.MsgType), -1)
			jsonData, _ := json.Marshal(msg)

			urlRequest = strings.Replace(urlRequest, "[msgJson]", common.UrlEscape(string(jsonData)), -1)
			fmt.Println(urlRequest)
			go http.Get(urlRequest)
		}
	}
}
