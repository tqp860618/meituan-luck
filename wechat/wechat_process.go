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
	// todo 匹配 http://dpurl.cn/s/za68rv

	reMeituanUrl := regexp.MustCompile(`activity\.waimai\.meituan\.com/coupon/sharechannel/([\w\d]+)\?urlKey=([\w\d]+)`)
	reBestNum := regexp.MustCompile(`第(\d+)个领取的`)
	reShortUrl := regexp.MustCompile(`dpurl\.cn/s/[\d\w]+`)
	for {
		select {
		case msg = <-msgIn:
			common.Log.INFO.Printf("%v", msg)
			switch msg.MsgType {
			case 49:
				//链接
				//美团红包分享链接
				pm := reMeituanUrl.FindStringSubmatch(msg.Url)
				pmShortUrl := reShortUrl.FindStringSubmatch(msg.Url)
				pmBestNum := reBestNum.FindStringSubmatch(msg.Content)

				if (len(pm) != 0 || len(pmShortUrl) != 0) && len(pmBestNum) != 0 {
					if len(pmShortUrl) != 0 {
						realUrl := w.getMTShortURL(msg.Url)
						if realUrl != "" {
							pm = reMeituanUrl.FindStringSubmatch(realUrl)
						}
					}
					if len(pm) >= 3 {
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

				}
			default:

			}
		}
	}
}
func (w *Wechat) getMTShortURL(urlRequire string) (rst string) {
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	res, err := client.Get(urlRequire)
	if err != nil {
		return
	}
	defer res.Body.Close()

	loc := res.Header.Get("Location")
	if loc != "" {
		res, err = client.Get(loc)
		if err != nil {
			return
		}
		defer res.Body.Close()
		rst = res.Header.Get("Location")
	}

	return
}
