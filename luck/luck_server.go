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

func (s *MsgServer) Start() {
	port := viper.GetString("luck_server.server_address")
	common.Log.INFO.Println("Http listen on:" + port)
	rtr := mux.NewRouter()
	rtr.HandleFunc("/msg/{bestNum}/{fromUid}/{Channel}/{UrlKey}", s.msgHandler).Methods("GET")
	http.Handle("/", rtr)
	log.Fatalln(http.ListenAndServe(port, nil))
}

func (s *MsgServer) msgHandler(res http.ResponseWriter, req *http.Request) {
	isFromUser := true

	params := mux.Vars(req)
	bestNum, err := strconv.ParseInt(params["bestNum"], 10, 32)
	if err != nil {
		return
	}
	fromUid := params["fromUid"]
	channel := params["Channel"]
	urlKey := params["UrlKey"]

	//新增一条activity
	go func() {
		err := s.LuckServer.AddActivity(channel, urlKey, int(bestNum))
		if err != nil {
			// 没有插入新的记录
		} else {
			// 插入了新的记录
		}

	}()

	if fromUid[:2] == "@@" {
		isFromUser = false
	}

	//来源于分组的消息

	if isFromUser {
		//urlRequire := fmt.Sprintf("http://127.0.0.1:5036/msg/%s/%s", fromUid, url.QueryEscape("你抽中了2元红包，请打开美团客户端查看"))
		//go http.Get(urlRequire)
	}

	//回调客户端，本地日志
	common.Log.INFO.Printf("新红包链接：\t %d %s %s %s\n", bestNum, fromUid, channel, urlKey)
	io.WriteString(res, fmt.Sprintf("callback %d\t%s\t%s\t%s", bestNum, fromUid, channel, urlKey))

}
