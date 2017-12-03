package luck

import (
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"log"
	"net/http"
	"net/url"
)

func Main() {
	rtr := mux.NewRouter()
	rtr.HandleFunc("/msg/{msgType}/{fromUid}/{channel}/{urlKey}", msgServer).Methods("GET")
	http.Handle("/", rtr)
	log.Fatalln(http.ListenAndServe(":6036", nil))

}

func msgServer(res http.ResponseWriter, req *http.Request) {
	isFromUser := true

	params := mux.Vars(req)
	msgType := params["msgType"]
	fromUid := params["fromUid"]
	channel := params["channel"]
	urlKey := params["urlKey"]
	fmt.Printf("callback %s\t%s\t%s\t%s", msgType, fromUid, channel, urlKey)
	io.WriteString(res, fmt.Sprintf("callback %s\t%s\t%s\t%s", msgType, fromUid, channel, urlKey))

	if fromUid[:2] == "@@" {
		isFromUser = false
	}

	//来源于分组的消息

	if isFromUser {
		urlRequire := fmt.Sprintf("http://127.0.0.1:5036/msg/%s/%s", fromUid, url.QueryEscape("你抽中了2元红包，请打开美团客户端查看"))
		go http.Get(urlRequire)
	}

}
