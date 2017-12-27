package message

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/rapidloop/skv"
	"net/http"
	"yx.com/meituan-luck/common"
	"yx.com/meituan-luck/wechat"
)

func New() *MsgDis {
	var m = new(MsgDis)
	m.KVStore, _ = m.initKVStore()
	return m
}

func (m *MsgDis) Close() {
	m.KVStore.Close()
}
func (m *MsgDis) initKVStore() (store *skv.KVStore, err error) {
	store, err = skv.Open("./message.db")
	if err != nil {
		return
	}
	return
}

func (m *MsgDis) ReceiveWeChatMsg() {
	rtr := mux.NewRouter()
	rtr.HandleFunc("/{source}/{fromUid}/{msgType}/{callBackServer}/{msgJson}", func(res http.ResponseWriter, req *http.Request) {

		params := mux.Vars(req)
		//fromUid := params["fromUid"]
		//msgType := params["msgType"]
		source := params["source"]
		callBackServer := params["callBackServer"]
		msgStr := common.UrlUnEscape(params["msgJson"])

		var msg = new(wechat.Message)
		err := json.Unmarshal([]byte(msgStr), msg)
		if err != nil {
			common.Log.ERROR.Println(err)
			return
		}
		if msg.MsgId != "" {
			go m.MsgHandler(source, msg, callBackServer)
		}

	}).Methods("GET")
	http.Handle("/", rtr)
	common.Log.ERROR.Fatalln(http.ListenAndServe(":7671", nil))
}

func (m *MsgDis) MsgHandler(source string, msg *wechat.Message, srv string) {
	switch source {
	case common.Md5("牛牛"):
		go m.MeituanNewGroupUserHandle(msg, srv)
	case common.Md5("唐生"):
		go m.MeituanHongbaoReceiveHandle(msg, srv)
	case common.Md5("tanggo"):
		go m.MeituanHongbaoReceiveHandle(msg, srv)
	case common.Md5("小雪"): // 美团红包注册服务
	case common.Md5("小菜头"): // 彩票
		go m.CaipiaoNewGroupUserHandle(msg, srv)
	}

}
