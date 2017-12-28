package wechat

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"github.com/Baozisoftware/qrcode-terminal-go"
	"io"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
)

func NewWechat() *Wechat {
	jar, err := cookiejar.New(nil)
	if err != nil {
		return nil
	}

	root, err := os.Getwd()
	transport := *(http.DefaultTransport.(*http.Transport))
	transport.ResponseHeaderTimeout = 1 * time.Minute
	transport.TLSClientConfig = &tls.Config{
		InsecureSkipVerify: true,
	}

	return &Wechat{
		Debug:         true,
		DeviceId:      "e123456789002237",
		AutoReplyMode: false,
		Interactive:   false,
		AutoOpen:      false,
		MediaCount:    -1,
		Client: &http.Client{
			Transport: &transport,
			Jar:       jar,
			Timeout:   1 * time.Minute,
		},
		Request:         new(BaseRequest),
		Root:            root,
		SaveFolder:      path.Join(root, "saved"),
		MemberMap:       make(map[string]Member),
		GroupMemberList: make(map[string]Member),
	}

}

func (w *Wechat) WaitForLogin() (err error) {

	err = w.GetUUID()
	if err != nil {
		err = fmt.Errorf("get the uuid failed with error:%v", err)
	}
	err = w.GetQR()
	if err != nil {
		err = fmt.Errorf("创建二维码失败:%s", err.Error())
	}
	common.Log.INFO.Printf("扫描二维码登陆....")
	code, tip := "", 1
	for code != "200" {
		w.RedirectedUri, code, tip, err = w.waitToLogin(w.Uuid, tip)
		if err != nil {
			err = fmt.Errorf("二维码登陆失败：%s", err.Error())
			return
		}
	}
	return
}

func (w *Wechat) waitToLogin(uuid string, tip int) (redirectUri, code string, rt int, err error) {
	loginUri := fmt.Sprintf("https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?tip=%d&uuid=%s&_=%s", tip, uuid, time.Now().Unix())
	rt = tip
	resp, err := w.Client.Get(loginUri)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	re := regexp.MustCompile(`window.code=(\d+);`)
	pm := re.FindStringSubmatch(string(data))

	if len(pm) != 0 {
		code = pm[1]

	} else {
		err = errors.New("can't find the code")
		return
	}
	rt = 0
	switch code {
	case "201":
		common.Log.INFO.Printf("扫描成功，请在手机上点击确认登陆")
	case "200":
		reRedirect := regexp.MustCompile(`window.redirect_uri="(\S+?)"`)
		pmSub := reRedirect.FindStringSubmatch(string(data))

		if len(pmSub) != 0 {
			redirectUri = pmSub[1]
		} else {
			err = errors.New("regex error in window.redirect_uri")
			return
		}
		redirectUri += "&fun=new"
	case "408":
	case "0":
		err = errors.New("超时了，请重启程序")
	default:
		err = errors.New("其它错误，请重启")

	}
	return
}

func (w *Wechat) GetQR() (err error) {
	if w.Uuid == "" {
		err = errors.New("no this uuid")
		return
	}
	common.Log.INFO.Println(QrContentUrl + w.Uuid)
	qrcodeTerminal.New().Get(QrContentUrl + w.Uuid).Print()
	return
}

func (w *Wechat) SetSynKey() {

}

func (w *Wechat) AutoReplyMsg() string {
	if w.AutoReplySrc {
		return "" //not enabled
	} else {
		if len(w.ReplyMsgs) == 0 {
			return "未设置"
		}
		return w.ReplyMsgs[0]
	}

}

func (w *Wechat) GetUUID() (err error) {
	params := url.Values{}
	params.Set("appid", AppID)
	params.Set("fun", "new")
	params.Set("lang", "zh_CN")
	params.Set("_", strconv.FormatInt(time.Now().Unix(), 10))
	datas := w.Post(LoginUrl, params, false)

	re := regexp.MustCompile(`window.QRLogin.code = (\d+); window.QRLogin.uuid = "(\S+?)"`)
	pm := re.FindStringSubmatch(string(datas))
	//common.Log.WARN.Printf("%v", pm)
	if len(pm) > 0 {
		code := pm[1]
		if code != "200" {
			err = errors.New("the status error")
		} else {
			w.Uuid = pm[2]
		}
		return
	} else {
		err = errors.New("get uuid failed")
		return
	}
}

func (w *Wechat) Login() (err error) {
	common.Log.DEBUG.Printf("the redirectedUri:%v", w.RedirectedUri)

	resp, err := w.Client.Get(w.RedirectedUri)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	reader := resp.Body.(io.Reader)
	if err = xml.NewDecoder(reader).Decode(w.Request); err != nil {
		return
	}
	if w.Request.Ret != 0 {
		err = errors.New(w.Request.Message)
		return
	}

	w.Request.DeviceID = w.DeviceId

	data, err := json.Marshal(Request{
		BaseRequest: w.Request,
	})
	if err != nil {
		return
	}

	name := "webwxinit"
	newResp := new(InitResp)

	index := strings.LastIndex(w.RedirectedUri, "/")
	if index == -1 {
		index = len(w.RedirectedUri)
	}
	w.BaseUri = w.RedirectedUri[:index]

	apiUri := fmt.Sprintf("%s/%s?pass_ticket=%s&skey=%s&r=%d", w.BaseUri, name, w.Request.PassTicket, w.Request.Skey, int(time.Now().Unix()))
	if err = w.Send(apiUri, bytes.NewReader(data), newResp); err != nil {
		return
	}
	common.Log.DEBUG.Printf("the newResp:%#v", newResp)
	for _, contact := range newResp.ContactList {
		w.InitContactList = append(w.InitContactList, contact)
		// fixme 在此将初始化的记录加入到聊天人列表
		if contact.UserName[:2] == "@@" {
			w.updateGroupMembers([]Member{contact})
		}
	}

	w.ChatSet = strings.Split(newResp.ChatSet, ",")
	if len(w.ChatSet) > 0 {
		var ids []string
		for i := 0; i < len(w.ChatSet); i++ {
			if len(w.ChatSet[i]) >= 2 && w.ChatSet[i][:2] == "@@" {
				ids = append(ids, w.ChatSet[i])
			}
		}
		if len(ids) > 0 {
			w.GetRoomsMembers(ids)
		}
	}
	w.User = newResp.User
	w.SyncKey = newResp.SyncKey
	w.SyncKeyStr = ""
	for i, item := range w.SyncKey.List {

		if i == 0 {
			w.SyncKeyStr = strconv.Itoa(item.Key) + "_" + strconv.Itoa(item.Val)
			continue
		}

		w.SyncKeyStr += "|" + strconv.Itoa(item.Key) + "_" + strconv.Itoa(item.Val)

	}
	common.Log.DEBUG.Printf("the response:%+v\n", newResp)
	common.Log.DEBUG.Printf("the sync key is %s\n", w.SyncKeyStr)
	return
}

func (w *Wechat) updateGroupMembers(members []Member) {
	for i := 0; i < len(members); i++ {
		if members[i].UserName[:2] == "@@" {
			w.GroupMemberList[members[i].UserName] = members[i]
		}
	}
}
func (w *Wechat) GetContacts() (err error) {

	name, resp := "webwxgetcontact", new(MemberResp)
	apiURI := fmt.Sprintf("%s/%s?pass_ticket=%s&skey=%s&r=%s", w.BaseUri, name, w.Request.PassTicket, w.Request.Skey, w.GetUnixTime())
	if err := w.Send(apiURI, nil, resp); err != nil {
		return err
	}

	w.MemberList = resp.MemberList
	w.TotalMember = resp.MemberCount
	for _, member := range w.MemberList {
		w.MemberMap[member.UserName] = member
		//群聊
		if member.UserName[:2] == "@@" {
			w.updateGroupMembers([]Member{member})
		} else if member.VerifyFlag&8 != 0 {
			w.PublicUserList = append(w.PublicUserList, member) //公众号
		} else if member.UserName[:1] == "@" {
			w.ContactList = append(w.ContactList, member)
		}
	}
	mb := Member{}
	mb.NickName = w.User.NickName
	mb.UserName = w.User.UserName
	w.MemberMap[w.User.UserName] = mb

	if len(w.ChatSet) != 0 {
		var ids []string
		for i := 0; i < len(w.ChatSet); i++ {
			if len(w.ChatSet[i]) >= 2 && w.ChatSet[i][:2] == "@@" {
				ids = append(ids, w.ChatSet[i])
			}
		}
		if len(ids) > 0 {
			w.GetRoomsMembers(ids)
		}
	}
	for _, user := range w.ChatSet {
		exist := false
		for _, initUser := range w.InitContactList {
			if user == initUser.UserName {
				exist = true
				break
			}
		}
		if !exist {
			value, ok := w.MemberMap[user]
			if ok {
				contact := Member{
					UserName:  value.UserName,
					NickName:  value.NickName,
					Signature: value.Signature,
				}
				w.InitContactList = append(w.InitContactList, contact)
			}
		}

	}

	return
}

func (w *Wechat) getSyncMsg() (msgs []*Message, err error) {
	name := "webwxsync"
	syncResp := new(SyncResp)
	urlRequest := fmt.Sprintf("%s/%s?sid=%s&pass_ticket=%s&skey=%s", w.BaseUri, name, w.Request.Sid, w.Request.PassTicket, w.Request.Skey)
	params := SyncParams{
		BaseRequest: *w.Request,
		SyncKey:     w.SyncKey,
		RR:          ^time.Now().Unix(),
	}
	data, err := json.Marshal(params)

	common.Log.DEBUG.Printf(urlRequest)
	common.Log.DEBUG.Printf(string(data))

	if err := w.Send(urlRequest, bytes.NewReader(data), syncResp); err != nil {
		common.Log.INFO.Printf("w.Send(%s,%s,%+v) with error:%v", urlRequest, string(data), syncResp, err)
		return nil, err
	}
	if syncResp.BaseResponse.Ret == 0 {
		w.SyncKey = syncResp.SyncKey
		w.SyncKeyStr = ""
		for i, item := range w.SyncKey.List {
			if i == 0 {
				w.SyncKeyStr = strconv.Itoa(item.Key) + "_" + strconv.Itoa(item.Val)
				continue
			}
			w.SyncKeyStr += "|" + strconv.Itoa(item.Key) + "_" + strconv.Itoa(item.Val)
		}
	}
	msgs = syncResp.AddMsgList
	for _, msg := range msgs {
		if nickNameFrom, ok := w.MemberMap[msg.FromUserName]; ok {
			msg.FromUserNickName = nickNameFrom.NickName
			msg.FromUserHeadImgUrl = nickNameFrom.HeadImgUrl
		}
		if nickNameTo, ok := w.MemberMap[msg.ToUserName]; ok {
			msg.ToUserNickName = nickNameTo.NickName
			msg.ToUserHeadImgUrl = nickNameTo.HeadImgUrl
		}
		msg.Content = strings.Replace(msg.Content, "&lt;", "<", -1)
		msg.Content = strings.Replace(msg.Content, "&gt;", ">", -1)
		msg.Content = strings.Replace(msg.Content, " ", " ", 1)
	}

	return
}

//同步守护goroutine
func (w *Wechat) SyncDaemon(msgIn chan *Message) {
	for {
		w.lastCheckTs = time.Now()
		resp, err := w.SyncCheck()
		if err != nil {
			common.Log.WARN.Printf("w.SyncCheck() with error:%+v\n", err)
			continue
		}
		if resp.RetCode == 1100 && resp.Selector == 4 {
			w.GetContacts()
		} else if resp.RetCode == 1101 {
			common.Log.ERROR.Fatalln("从其他设备上登陆")
		}
		w.UpPackMsg(msgIn)
		if time.Now().Sub(w.lastCheckTs).Seconds() <= 20 {
			time.Sleep(time.Second * time.Duration(time.Now().Sub(w.lastCheckTs).Seconds()))
		}
	}
}

func (w *Wechat) UpPackMsg(msgIn chan *Message) {
	msgs, err := w.getSyncMsg()
	if err != nil {
		common.Log.ERROR.Printf("w.getSyncMsg() error:%+v\n", err)
	}
	for _, msg := range msgs {

		switch msg.MsgType {
		case 1:
			//文字
			if msg.FromUserName[:2] == "@@" {
				//群消息，暂时不处理
				if msg.FromUserNickName == "" {
					contentSlice := strings.Split(msg.Content, ":<br/>")
					msg.Content = contentSlice[1]
				}
			} else {
				if w.AutoReply {
					go w.SendMsg(msg.FromUserName, w.AutoReplyMsg(), false)
				}
			}
			if msg.ToUserNickName == "" {
				if user, ok := w.MemberMap[msg.ToUserName]; ok {
					msg.ToUserNickName = user.NickName
				}
			}
			if msg.FromUserNickName == "" {
				if user, ok := w.MemberMap[msg.FromUserNickName]; ok {
					msg.FromUserNickName = user.NickName
				}
			}
			msgIn <- msg
		case 3:
			//图片
		case 34:
			//语音
		case 47:
			//动画表情
		case 49:
			//链接
			msg.Content = strings.Replace(msg.Content, "<br/>", "", -1)
			msgLink := MessageLink{}
			err := xml.Unmarshal([]byte(msg.Content), &msgLink)
			if err != nil {
				common.Log.ERROR.Printf("%v", err)
			} else {
				msg.Content = msgLink.Title
				msg.Url = msgLink.Url
			}

			msgIn <- msg
		case 51:
			common.Log.INFO.Printf("联系人信息消息：%v", msg)
			//获取联系人信息成功
		case 62:
			common.Log.INFO.Printf("小视频消息：%v", msg)
			msgIn <- msg
			//获得一段小视频
		case 10002:
			common.Log.INFO.Printf("撤回消息：%v", msg)
			msgIn <- msg
			//撤回一条消息
		case 10000:
			common.Log.INFO.Printf("提示类消息：%v", msg)
			//devctang刚刚把你添加到通讯录，现在可以开始聊天了。
			msgIn <- msg
			//红包消息
		case 37:
			common.Log.INFO.Printf("有新朋友加你：%v", msg)
			msgIn <- msg
		default:
			common.Log.INFO.Printf("未处理消息：%v", msg)
			msgIn <- msg
		}

	}

}

func (w *Wechat) MsgDaemon(msgOut chan MessageOut, autoReply chan int) {
	msg := MessageOut{}
	var autoMode int
	for {
		select {
		case msg = <-msgOut:
			common.Log.INFO.Printf("the msg to send %+v", msg)
			w.SendMsg(msg.ToUserName, msg.Content, false)
		case autoMode = <-autoReply:
			common.Log.INFO.Printf("the autoreply mode:", autoMode)
			if autoMode == 1 {
				w.AutoReply = true
			} else if autoMode == 0 {
				w.AutoReply = false
			}
		}
	}
}

func (w *Wechat) StatusNotify() (err error) {
	statusURL := w.BaseUri + fmt.Sprintf("/webwxstatusnotify?lang=zh_CN&pass_ticket=%s", w.Request.PassTicket)
	resp := new(NotifyResp)
	data, err := json.Marshal(NotifyParams{
		BaseRequest:  w.Request,
		Code:         3,
		FromUserName: w.User.UserName,
		ToUserName:   w.User.UserName,
		ClientMsgId:  w.GetUnixTime(),
	})

	if err := w.Send(statusURL, bytes.NewReader(data), resp); err != nil {
		return err
	}

	return
}

func (w *Wechat) GetContactsInBatch() (err error) {
	resp := new(MemberResp)
	apiUrl := fmt.Sprintf("https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact?type=ex&r=%s&pass_ticket=%s", w.GetUnixTime(), w.Request.PassTicket)
	if err := w.Send(apiUrl, nil, resp); err != nil {
		return err
	}
	return
}

func (w *Wechat) TestCheck() (err error) {
	/*for _, host := range Hosts {
		w.SyncHost = host
	}*/
	w.SyncHost = SyncHosts[0]

	return
}

func (w *Wechat) SyncCheck() (resp SyncCheckResp, err error) {
	params := url.Values{}
	curTime := strconv.FormatInt(time.Now().Unix(), 10)
	params.Set("r", curTime)
	params.Set("sid", w.Request.Sid)
	params.Set("uin", strconv.FormatInt(int64(w.Request.Uin), 10))
	params.Set("skey", w.Request.Skey)
	params.Set("deviceid", w.Request.DeviceID)
	params.Set("synckey", w.SyncKeyStr)
	params.Set("_", curTime)
	checkUrl := fmt.Sprintf("https://%s/cgi-bin/mmwebwx-bin/synccheck", w.SyncHost)
	Url, err := url.Parse(checkUrl)
	if err != nil {
		return
	}
	Url.RawQuery = params.Encode()
	//common.Log.INFO.Printf(Url.String())

	ret, err := w.Client.Get(Url.String())
	if err != nil {
		common.Log.ERROR.Printf("the error is :%+v", err)
		return
	}
	defer ret.Body.Close()

	body, err := ioutil.ReadAll(ret.Body)

	if err != nil {
		return
	}
	common.Log.DEBUG.Printf(string(body))
	resp = SyncCheckResp{}
	reRedirect := regexp.MustCompile(`window.synccheck={retcode:"(\d+)",selector:"(\d+)"}`)
	pmSub := reRedirect.FindStringSubmatch(string(body))
	common.Log.DEBUG.Printf("the data:%+v", pmSub)
	if len(pmSub) != 0 {
		resp.RetCode, err = strconv.Atoi(pmSub[1])
		resp.Selector, err = strconv.Atoi(pmSub[2])
		common.Log.DEBUG.Printf("the resp:%+v", resp)

	} else {
		err = errors.New("regex error in window.redirect_uri")
		return
	}
	return
}

func (w *Wechat) SendMsg(toUserName, message string, isFile bool) (err error) {
	resp := new(MsgResp)

	apiUrl := fmt.Sprintf("%s/webwxsendmsg?pass_ticket=%s", w.BaseUri, w.Request.PassTicket)
	clientMsgId := strconv.Itoa(w.GetUnixTime()) + "0" + strconv.Itoa(rand.Int())[3:6]
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	msg := make(map[string]interface{})
	msg["Type"] = 1
	msg["Content"] = message
	msg["FromUserName"] = w.User.UserName
	msg["LocalID"] = clientMsgId
	msg["ClientMsgId"] = clientMsgId
	msg["ToUserName"] = toUserName
	params["Msg"] = msg
	data, err := json.Marshal(params)
	if err != nil {
		common.Log.INFO.Printf("json.Marshal(%v):%v\n", params, err)
	}
	if err := w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.Send(%s,%v):%v", apiUrl, string(data), err)
	}

	return
}

func (w *Wechat) GetGroupName(id string) (name string) {
	return
}

func (w *Wechat) SendMsgToAll(word string) (err error) {

	return
}

func (w *Wechat) SendImage(name, fileName string) (err error) {

	return
}
func (w *Wechat) GetRoomsMembers(roomIDs []string) (roomsInfo []Member, err error) {
	resp := new(BatchContactResp)
	apiUrl := fmt.Sprintf("%s/webwxbatchgetcontact?type=ex&r=%s&pass_ticket=%s", w.BaseUri, w.GetUnixTime(), w.Request.PassTicket)
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	params["Count"] = len(roomIDs)
	params["List"] = []map[string]string{}
	var l []map[string]string
	for i := 0; i < len(roomIDs); i++ {
		l = append(l, map[string]string{
			"UserName":        roomIDs[i],
			"EncryChatRoomId": "",
		})
	}
	params["List"] = l

	data, _ := json.Marshal(params)
	if err = w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.AddRoomMember(%s,%v):%v", apiUrl, string(data), err)
		return
	}
	//if nickNameTo, ok := w.MemberMap[msg.ToUserName]; ok {
	if len(resp.ContactList) == 0 {
		err = errors.New("not exist")
		return
	}
	roomsInfo = resp.ContactList
	w.updateGroupMembers(roomsInfo)
	return
}
func (w *Wechat) GetRoomMembers(roomID string) (roomInfo Member, err error) {
	infos, err := w.GetRoomsMembers([]string{roomID})
	if err != nil {
		return
	}
	if len(infos) < 0 {
		err = errors.New("not exist")
	}
	roomInfo = infos[0]
	return
}

func (w *Wechat) GetRoomsByTag(tag string) (rooms []map[string]interface{}) {
	//w.GroupList
	for _, member := range w.GroupMemberList {
		if strings.Index(member.NickName, tag) != -1 {
			rooms = append(rooms, map[string]interface{}{
				"GroupName": member.UserName,
				"NickName":  member.NickName,
				"Count":     member.MemberCount,
			})
		}
	}
	return
}
func (w *Wechat) GetRoomMembersCount(roomID string) int {
	if roomInfo, ok := w.GetRoomMembers(roomID); ok != nil {
		return len(roomInfo.MemberList)
	}
	return 0
}

func (w *Wechat) AddRoomMember(roomName string, memberList []string) (err error) {
	resp := new(AddRoomMemberResp)

	apiUrl := fmt.Sprintf("%s/webwxupdatechatroom?pass_ticket=%s&fun=addmember", w.BaseUri, w.Request.PassTicket)
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	params["AddMemberList"] = strings.Join(memberList, ",")
	params["ChatRoomName"] = roomName
	data, _ := json.Marshal(params)
	if err = w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.AddRoomMember(%s,%v):%v", apiUrl, string(data), err)
		return
	} else {
		common.Log.INFO.Printf("AddRoomMember:%v", resp)
	}
	return
}

func (w *Wechat) RenameRoom(roomName, newNickName string) (err error) {
	resp := new(Response)
	apiUrl := fmt.Sprintf("%s/webwxcreatechatroom?pass_ticket=%s&fun=modtopic", w.BaseUri, w.Request.PassTicket)
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request

	params["ChatRoomName"] = roomName
	params["NewTopic"] = newNickName

	data, _ := json.Marshal(params)
	if err := w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.RenameRoom(%s,%v):%v", apiUrl, string(data), err)
	}
	return
}
func (w *Wechat) getInit2Members() (members []string) {
	for i := 0; i < len(w.MemberList); i++ {
		if strings.Index(w.MemberList[i].RemarkName, "_##_") != -1 {
			members = append(members, w.MemberList[i].UserName)
		}
	}
	return
}
func (w *Wechat) getRoomLeaders() (members []string) {
	for i := 0; i < len(w.MemberList); i++ {
		if strings.Index(w.MemberList[i].RemarkName, "_%%_") != -1 {
			members = append(members, w.MemberList[i].UserName)
		}
	}
	return
}

//verify_friend

func (w *Wechat) VerifyFriend(userName string, ticket string) (err error) {
	resp := new(MsgResp)
	apiUrl := fmt.Sprintf("%s/webwxverifyuser?pass_ticket=%s&fun=addmember&r=%d", w.BaseUri, w.Request.PassTicket, int(time.Now().Unix()))
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	params["Opcode"] = 3
	params["SceneListCount"] = 1
	params["SceneList"] = []int{33}
	params["VerifyContent"] = ""
	params["VerifyUserListSize"] = 1
	params["skey"] = w.Request.Skey
	params["VerifyUserList"] = []map[string]string{
		{
			"Value":            userName,
			"VerifyUserTicket": ticket,
		},
	}

	data, _ := json.Marshal(params)
	if err = w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.VerifyFriend(%s,%v):%v", apiUrl, string(data), err)
		return
	}
	return
}

func (w *Wechat) CreateRoom(nickName string) (roomName string, err error) {
	initMembers := w.getInit2Members()
	if len(initMembers) < 2 {
		err = errors.New("at least with 2 users init")
		return
	}
	leaders := w.getRoomLeaders()
	addMembers := append(initMembers, leaders...)

	resp := new(CreateRoomResp)
	apiUrl := fmt.Sprintf("%s/webwxcreatechatroom?pass_ticket=%s&fun=addmember", w.BaseUri, w.Request.PassTicket)
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	params["MemberList"] = []map[string]string{}
	var l []map[string]string

	for i := 0; i < len(addMembers); i++ {
		l = append(l, map[string]string{
			"UserName": addMembers[i],
		})
	}
	params["MemberList"] = l
	params["MemberCount"] = len(l)
	params["Topic"] = nickName
	data, _ := json.Marshal(params)
	if err = w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.AddRoomMember(%s,%v):%v", apiUrl, string(data), err)
		return
	}
	if resp.ChatRoomName == "" {
		err = errors.New(resp.BaseResponse.ErrMsg)
		return
	}
	roomName = resp.ChatRoomName
	w.DelMembersFromRoom(roomName, initMembers)
	//err = w.RenameRoom(roomName, nickName)
	w.GetRoomsMembers([]string{roomName})
	return
}

func (w *Wechat) DelMembersFromRoom(roomName string, memberIds []string) (err error) {
	resp := new(MsgResp)
	apiUrl := fmt.Sprintf("%s/webwxupdatechatroom?pass_ticket=%s&fun=delmember", w.BaseUri, w.Request.PassTicket)
	params := make(map[string]interface{})
	params["BaseRequest"] = w.Request
	params["ChatRoomName"] = roomName
	params["DelMemberList"] = strings.Join(memberIds, ",")
	data, _ := json.Marshal(params)
	if err = w.Send(apiUrl, bytes.NewReader(data), resp); err != nil {
		common.Log.WARN.Printf("w.DelMembersFromRoom(%s,%v):%v", apiUrl, string(data), err)
		return
	}
	return
}

func (w *Wechat) PullMsg() {
	return
}

func (w *Wechat) Post(url string, data url.Values, jsonFmt bool) (result string) {
	//req.Header.Set("User-agent", UserAgent)

	resp, err := w.Client.PostForm(url, data)

	//req.Header.Set("ContentType", "application/json; charset=UTF-8")

	if err != nil {
		return
	}
	defer resp.Body.Close()
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}

	result = string(respBody)
	return
}

func (w *Wechat) Send(apiURI string, body io.Reader, call Caller) (err error) {
	method := "GET"
	if body != nil {
		method = "POST"
	}

	req, err := http.NewRequest(method, apiURI, body)
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	req.Header.Set("UserAgent", UserAgent)
	resp, err := w.Client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	reader := resp.Body.(io.Reader)

	if err = json.NewDecoder(reader).Decode(call); err != nil {
		common.Log.WARN.Printf("the error:%+v", err)
		return
	}
	if !call.IsSuccess() {
		common.Log.INFO.Println(call)
		return call.Error()
	}
	return
}

func (w *Wechat) SendTest(apiURI string, body io.Reader, call Caller) (err error) {
	method := "GET"
	if body != nil {
		method = "POST"
	}

	req, err := http.NewRequest(method, apiURI, body)
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	resp, err := w.Client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	reader := resp.Body.(io.Reader)

	respBody, err := ioutil.ReadAll(reader)
	common.Log.INFO.Printf("the respBody:%s", string(respBody))

	if err = json.NewDecoder(reader).Decode(call); err != nil {
		common.Log.INFO.Printf("the error:%+v", err)
		return
	}
	if !call.IsSuccess() {
		return call.Error()
	}
	return
}

func (w *Wechat) GetTuringReply(msg string) (retMsg string, err error) {
	params := url.Values{}
	params.Add("key", TUringUserId)
	params.Add("info", msg)
	params.Add("userid", TUringUserId)
	data, err := json.Marshal(params)
	if err != nil {
		return "", err
	}
	req, err := http.NewRequest("POST", TuringUrl, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	dt, _ := ioutil.ReadAll(resp.Body)
	return string(dt), nil
}

func (w *Wechat) SetCookies() {
	//w.Client.Jar.SetCookies(u, cookies)

}

func (w *Wechat) GetUnixTime() int {
	return int(time.Now().Unix())
}
