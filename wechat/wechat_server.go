package wechat

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"net"
	"net/http"
	"net/url"
	"yx.com/meituan-luck/common"
)

func (w *Wechat) ServerDaemon(portMsg chan string) {
	//http.HandleFunc("/msg", w.msgServer)
	rtr := mux.NewRouter()
	listener, _ := net.Listen("tcp", "127.0.0.1:0")
	portMsg <- fmt.Sprintf("%s:%d", listener.Addr().(*net.TCPAddr).IP, listener.Addr().(*net.TCPAddr).Port)

	// func handle list
	w.ServerHandleFuncMsgSend(rtr)
	w.ServerHandleFuncAddMember(rtr)
	w.ServerHandleFuncGetRoomMembersCount(rtr)
	w.ServerHandleFuncAddRoom(rtr)
	w.ServerHandleFuncGetMarketGroups(rtr)
	w.ServerHandleFuncVerifyFriend(rtr)

	http.Handle("/", rtr)
	common.Log.ERROR.Fatalln(http.Serve(listener, nil))
}

func (w *Wechat) ServerHandleFuncMsgSend(rtr *mux.Router) {
	rtr.HandleFunc("/msg_send/{to}/{msg}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		to := params["to"]
		msg := params["msg"]
		msg, err := url.QueryUnescape(msg)
		if err != nil {
			common.Log.WARN.Printf("%v,%v", err, msg)
		}
		common.Log.INFO.Printf("msg_send: %s:%s", to, msg)
		go w.SendMsg(to, msg, false)
		io.WriteString(res, fmt.Sprintf("%s:%s", to, msg))
	}).Methods("GET")
}
func (w *Wechat) ServerHandleFuncAddMember(rtr *mux.Router) {
	rtr.HandleFunc("/room_add_member/{roomName}/{memberId}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		roomName := params["roomName"]
		memberId := params["memberId"]
		common.Log.INFO.Printf("room_add_member: %s:%s", roomName, memberId)
		w.AddRoomMember(roomName, []string{memberId})
		io.WriteString(res, fmt.Sprintf("%s:%s", roomName, memberId))
	}).Methods("GET")
}

func (w *Wechat) ServerHandleFuncGetRoomMembersCount(rtr *mux.Router) {
	rtr.HandleFunc("/room_members_count/{roomName}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		roomName := params["roomName"]
		common.Log.INFO.Printf("room_members_count: %s:%s", roomName)
		count := w.GetRoomMembersCount(roomName)
		w.serverResp(res, map[string]interface{}{
			"count": count,
		})
	}).Methods("GET")
}
func (w *Wechat) ServerHandleFuncGetMarketGroups(rtr *mux.Router) {
	rtr.HandleFunc("/market_groups/{roomTag}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		roomTag := params["roomTag"]
		common.Log.INFO.Printf("market_groups: %s:%s", roomTag)
		w.serverResp(res, map[string]interface{}{
			"Rooms": w.GetRoomsByTag(roomTag),
		})
	}).Methods("GET")
}

func (w *Wechat) ServerHandleFuncAddRoom(rtr *mux.Router) {
	rtr.HandleFunc("/room_add/{nickName}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		nickName := params["nickName"]

		common.Log.INFO.Printf("room_add: %s", nickName)
		roomName, err := w.CreateRoom(nickName)
		if err != nil {
			w.serverResp(res, map[string]interface{}{}, err)
			return
		}
		w.serverResp(res, map[string]interface{}{
			"roomName": roomName,
		})
	}).Methods("GET")
}
func (w *Wechat) ServerHandleFuncVerifyFriend(rtr *mux.Router) {
	rtr.HandleFunc("/verify_friend/{nickName}/{ticket}", func(res http.ResponseWriter, req *http.Request) {
		params := mux.Vars(req)
		nickName := params["nickName"]
		ticket := params["ticket"]

		common.Log.INFO.Printf("room_add: %s,%s", nickName, ticket)
		err := w.VerifyFriend(nickName, ticket)
		if err != nil {
			w.serverResp(res, map[string]interface{}{}, err)
			return
		}
		w.serverResp(res, map[string]interface{}{})
	}).Methods("GET")
}

func (w *Wechat) serverResp(res http.ResponseWriter, data interface{}, errs ...error) {
	errMsg := ""
	if len(errs) > 0 {
		errMsg = fmt.Sprintf("%v", errs[0])
	}

	jsonData, err := json.Marshal(map[string]interface{}{
		"data":   data,
		"errmsg": errMsg,
	})
	if err != nil {
		common.Log.ERROR.Println(errs)
		return
	}
	io.WriteString(res, string(jsonData))
}
