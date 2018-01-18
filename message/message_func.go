package message

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/rapidloop/skv"
	"github.com/spf13/viper"
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
	store, err = skv.Open("/store/wechat_robot.db")
	if err != nil {
		return
	}
	return
}

func (m *MsgDis) ReceiveWeChatMsg() {
	fmt.Println("消息分发服务器已启动")
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
	common.Log.ERROR.Fatalln(http.ListenAndServe("127.0.0.1:7671", nil))
}

func (m *MsgDis) MsgHandler(source string, msg *wechat.Message, srv string) {
	actionConfigs := viper.GetStringMap("message_dis_server.task_dis")
	for nickName, action := range actionConfigs {
		if common.Md5(nickName) == source {
			switch action {
			case "meituan_group_add":
				go m.MeituanNewGroupUserHandle(msg, srv)
			case "meituan_hongbao_receive":
				go m.MeituanHongbaoReceiveHandle(msg, srv)
			case "meituan_user_reg":
				go m.MeituanRegUserHandle(msg, srv)
			case "caipiao_group_add":
				go m.CaipiaoNewGroupUserHandle(msg, srv)
			}
			break
		}
	}
}
