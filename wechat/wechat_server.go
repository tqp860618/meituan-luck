package wechat

import (
	"io"
	"net/http"
	"github.com/gorilla/mux"
	"fmt"
	"net/url"
)

func (w *Wechat) ServerDaemon() {
	//http.HandleFunc("/msg", w.msgServer)
	rtr := mux.NewRouter()
	rtr.HandleFunc("/msg/{to}/{msg}", w.msgServer).Methods("GET")
	http.Handle("/", rtr)

	w.LogError.Fatalln(http.ListenAndServe(":5036", nil))
}

func (w *Wechat) msgServer(res http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	to := params["to"]
	msg := params["msg"]
	msg, err := url.QueryUnescape(msg)
	if err != nil {
		w.LogWarn.Printf("%v,%v", err, msg)
	}
	w.LogInfo.Printf("new http msg to %s:%s", to, msg)
	go w.SendMsg(to, msg, false)
	io.WriteString(res, fmt.Sprintf("%s:%s", to, msg))
}
