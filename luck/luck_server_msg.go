package luck

import (
	"encoding/json"
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
	m.Logln("消息服务器已启动")
	port := viper.GetString("luck_server.server_address")
	rtr := mux.NewRouter()
	rtr.HandleFunc("/new_activity/{bestPos}/{fromUid}/{Channel}/{UrlKey}", m.newActivityHandler).Methods("GET")
	rtr.HandleFunc("/new_task/{mobile}/{type}/{userID}/{clientID}", m.newTaskHandler).Methods("GET")
	http.Handle("/", rtr)
	log.Fatalln(http.ListenAndServe(port, nil))
}

func (m *MsgServer) newTaskHandler(res http.ResponseWriter, req *http.Request) {
	params := mux.Vars(req)
	taskType, _ := strconv.Atoi(params["type"])
	userID, _ := strconv.ParseInt(params["userID"], 10, 64)
	clientID := params["clientID"]

	resultChan := make(chan int64, 1)
	m.LuckServer.TaskGenServer.SigNewHandleTasks <- HandlerTaskInfo{
		Type:       taskType,
		UserID:     userID,
		ClientId:   clientID,
		Mobile:     params["mobile"],
		ResultChan: resultChan,
	}
	newTaskId := <-resultChan
	fmt.Println("gen new task2", newTaskId)
	jsonBytes, _ := json.Marshal(map[string]string{
		"taskId": fmt.Sprintf("%d", newTaskId),
	})
	res.Write(jsonBytes)
}
func (m *MsgServer) newActivityHandler(res http.ResponseWriter, req *http.Request) {
	isFromUser := true

	params := mux.Vars(req)
	bestPos, err := strconv.ParseInt(params["bestPos"], 10, 32)
	if err != nil {
		return
	}
	fromUid := params["fromUid"]
	channel := params["Channel"]
	urlKey := params["UrlKey"]
	common.Log.INFO.Printf("new activity:%v,%v,%v，%fromUid\n", channel, urlKey, int(bestPos), fromUid)
	m.Logf("new activity:%v,%v,%v，%fromUid\n", channel, urlKey, int(bestPos), fromUid)
	//新增一条activity

	m.SigNewActivity <- SigNewActivity{
		Channel: channel,
		UrlKey:  urlKey,
		BestPos: int(bestPos),
	}

	if fromUid[:2] == "@@" {
		isFromUser = false
	}

	//来源于分组的消息

	if isFromUser {
		//urlRequire := fmt.Sprintf("http://127.0.0.1:5036/msg_send/%s/%s", fromUid, url.QueryEscape("你抽中了2元红包，请打开美团客户端查看"))
		//go http.Get(urlRequire)
	}

	//回调客户端，本地日志
	io.WriteString(res, fmt.Sprintf("callback %d\t%m\t%m\t%m", bestPos, fromUid, channel, urlKey))

}
func (m *MsgServer) Logln(v ...interface{}) {
	v = append([]interface{}{"[msg]"}, v...)
	common.Log.INFO.Println(v...)
}

func (m *MsgServer) Logf(format string, v ...interface{}) {
	common.Log.INFO.Printf(format, v...)
}
