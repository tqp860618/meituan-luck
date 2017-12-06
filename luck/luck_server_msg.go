package luck

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/spf13/viper"
	"io"
	"log"
	"net/http"
	"strconv"
	"yx.com/meituan-luck/common"
)

func (m *MsgServer) Start() {
	port := viper.GetString("luck_server.server_address")
	common.Log.INFO.Println("Http listen on:" + port)
	rtr := mux.NewRouter()
	rtr.HandleFunc("/new_activity/{bestPos}/{fromUid}/{Channel}/{UrlKey}", m.msgHandler).Methods("GET")
	http.Handle("/", rtr)
	log.Fatalln(http.ListenAndServe(port, nil))
}

func (m *MsgServer) msgHandler(res http.ResponseWriter, req *http.Request) {
	isFromUser := true

	params := mux.Vars(req)
	bestPos, err := strconv.ParseInt(params["bestPos"], 10, 32)
	if err != nil {
		return
	}
	fromUid := params["fromUid"]
	channel := params["Channel"]
	urlKey := params["UrlKey"]

	//新增一条activity
	go func() {
		m.SigNewActivity <- SigNewActivity{
			Channel: channel,
			UrlKey:  urlKey,
			BestPos: int(bestPos),
		}

	}()

	if fromUid[:2] == "@@" {
		isFromUser = false
	}

	//来源于分组的消息

	if isFromUser {
		//urlRequire := fmt.Sprintf("http://127.0.0.1:5036/msg_send/%s/%s", fromUid, url.QueryEscape("你抽中了2元红包，请打开美团客户端查看"))
		//go http.Get(urlRequire)
	}

	//回调客户端，本地日志
	common.Log.INFO.Printf("新红包链接：\t %d %m %m %m\n", bestPos, fromUid, channel, urlKey)
	io.WriteString(res, fmt.Sprintf("callback %d\t%m\t%m\t%m", bestPos, fromUid, channel, urlKey))

}
