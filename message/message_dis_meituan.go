package message

import (
	"fmt"
	"github.com/spf13/viper"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
	"yx.com/meituan-luck/wechat"
)

const MeituanRoomNick = "*美团|饿了么*外卖红包互助群"
const HongcaiRoomNick = "*网易红彩*方案互助群"

func (m *MsgDis) meituanHongbaoLogic(msg *wechat.Message, srv string) {
	if msg.MsgType == 49 {
		reMeituanUrl := regexp.MustCompile(`activity\.waimai\.meituan\.com/coupon/sharechannel/([\w\d]+)\?urlKey=([\w\d]+)`)
		reBestNum := regexp.MustCompile(`第(\d+)个领取的`)
		reShortUrl := regexp.MustCompile(`dpurl\.cn/s/[\d\w]+`)
		pm := reMeituanUrl.FindStringSubmatch(msg.Url)
		pmShortUrl := reShortUrl.FindStringSubmatch(msg.Url)
		pmBestNum := reBestNum.FindStringSubmatch(msg.Content)

		if (len(pm) != 0 || len(pmShortUrl) != 0) && len(pmBestNum) != 0 {
			if len(pmShortUrl) != 0 {
				// 匹配 http://dpurl.cn/s/za68rv
				realUrl := m.getMTShortURL(msg.Url)
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
	}
}
func (m *MsgDis) getMTShortURL(urlRequire string) (rst string) {
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

func (m *MsgDis) sendMsg(srv string, toUid string, text string) {
	common.SleepRandn(4000)
	urlTemp := "http://%s/msg_send/%s/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, toUid, url.QueryEscape(text))
	http.Get(urlTemp)
}

func (m *MsgDis) addRoomMember(srv string, uid string, groupName string) {
	urlTemp := "http://%s/room_add_member/%s/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, groupName, uid)
	http.Get(urlTemp)
}

func (m *MsgDis) verifyFriend(srv string, userName string, ticket string) {

	urlTemp := "http://%s/verify_friend/%s/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, userName, ticket)
	http.Get(urlTemp)
}

func (m *MsgDis) newRoom(srv string, nickName string) (roomName string, err error) {
	resp := new(AddNewRoomResponse)
	urlTemp := "http://%s/room_add/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, nickName)
	err = common.HttpGet(urlTemp, resp)
	if err != nil {
		return
	}
	roomName = resp.Data.RoomName
	return
}
func (m *MsgDis) getRoomMembersCount(srv string, roomName string) (count int, err error) {
	resp := new(RoomMembersCountResponse)
	urlTemp := "http://%s/room_members_count/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, roomName)
	err = common.HttpGet(urlTemp, resp)
	if err != nil {
		return
	}
	count = resp.Data.Count
	return
}

func (m *MsgDis) meituanNewFriendLogic(msg *wechat.Message, srv string) {
	welcomeMsg := "您好，感谢关注，回复【外卖群】可以直接加群"
	if msg.MsgType == 37 {
		common.SleepRandn(10000)
		m.verifyFriend(srv, msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
		common.SleepRandn(4000)
		m.sendMsg(srv, msg.RecommendInfo.UserName, welcomeMsg)
	}
	if msg.MsgType == 10000 {
		if strings.Index(msg.Content, "刚刚把你添加到通讯录") != -1 {
			// 向这个人回复一条欢迎消息

			go m.sendMsg(srv, msg.FromUserName, welcomeMsg)
		}
	}
}
func (m *MsgDis) caipiaoNewFriendLogic(msg *wechat.Message, srv string) {
	welcomeMsg := "您好，感谢关注，回复【红彩群】可以直接加群"
	//需要验证
	if msg.MsgType == 37 {
		common.SleepRandn(10000)
		m.verifyFriend(srv, msg.RecommendInfo.UserName, msg.RecommendInfo.Ticket)
		common.SleepRandn(4000)
		m.sendMsg(srv, msg.RecommendInfo.UserName, welcomeMsg)
	}
	//无需要正，但是要再加好友才能拉群
	if msg.MsgType == 10000 {
		if strings.Index(msg.Content, "刚刚把你添加到通讯录") != -1 {
			// 向这个人回复一条欢迎消息
			go m.sendMsg(srv, msg.FromUserName, welcomeMsg)
		}
	}
}
func (m *MsgDis) MeituanHongbaoReceiveHandle(msg *wechat.Message, srv string) {
	go m.meituanHongbaoLogic(msg, srv)
}

func (m *MsgDis) MeituanNewGroupUserHandle(msg *wechat.Message, srv string) {
	go m.meituanNewFriendLogic(msg, srv)
	go m.meituanTalkLogic(msg, srv)
}

func (m *MsgDis) CaipiaoNewGroupUserHandle(msg *wechat.Message, srv string) {
	go m.caipiaoNewFriendLogic(msg, srv)
	go m.caipiaoTalkLogic(msg, srv)
}

func (m *MsgDis) getMarketGroupsForTag(msg *wechat.Message, srv string, roomNick string) (groups []map[string]interface{}, err error) {
	resp := new(RoomListResponse)
	urlTemp := "http://%s/market_groups/%s"
	urlTemp = fmt.Sprintf(urlTemp, srv, roomNick)
	err = common.HttpGet(urlTemp, resp)
	if err != nil {
		return
	}
	groups = resp.Data.Rooms
	return

}
func (m *MsgDis) MeituanRegUserHandle(msg *wechat.Message, srv string) {

}

func (m *MsgDis) addToMarketingGroup(msg *wechat.Message, srv string, roomNick string, roomMaxUserNum int, groupRole string) {
	var groupAddedNickName = ""
	m.KVStore.Get(roomNick+msg.FromUserName, &groupAddedNickName)
	if groupAddedNickName != "" {
		go m.sendMsg(srv, msg.FromUserName, "你已经加过群【"+groupAddedNickName+"】")
	} else {
		nowGroupName := ""
		roomIndex := 10
		groupsAll, _ := m.getMarketGroupsForTag(msg, srv, roomNick)
		if len(groupsAll) > 0 {
			nowGroupName = func(groups []map[string]interface{}) string {
				maxIndex := 0
				maxGroupName := ""
				for i := 0; i < len(groups); i++ {
					nickIndexStr := strings.Trim(strings.Replace(groups[i]["NickName"].(string), roomNick, "", -1), " ")
					nickIndex, _ := strconv.Atoi(nickIndexStr)
					if nickIndex > maxIndex && int(groups[i]["Count"].(float64)) < roomMaxUserNum {
						maxIndex = nickIndex
						maxGroupName = groups[i]["GroupName"].(string)
						groupAddedNickName = groups[i]["NickName"].(string)
					}
				}
				return maxGroupName
			}(groupsAll)
		}
		roomIndex += len(groupsAll)
		if nowGroupName == "" {
			groupAddedNickName = roomNick + " " + strconv.Itoa(roomIndex)
			nowGroupName, _ = m.newRoom(srv, groupAddedNickName)
		}

		// 邀请用户到群组
		if nowGroupName != "" {
			go m.sendMsg(srv, nowGroupName, "群主邀请【"+msg.FromUserNickName+"】加群")
			go m.sendMsg(srv, msg.FromUserName, msg.FromUserNickName+"，新成员请注意本群规则：\n"+groupRole)
			go m.addRoomMember(srv, msg.FromUserName, nowGroupName)
			go m.sendMsg(srv, msg.FromUserName, "成功添加到：【"+groupAddedNickName+"】")
			m.KVStore.Put(roomNick+msg.FromUserName, groupAddedNickName)
		} else {
			go m.sendMsg(srv, msg.FromUserName, "出了点问题，请加唯一客服微信：xiaoqiang886")
		}
	}

}
func (m *MsgDis) meituanTalkLogic(msg *wechat.Message, srv string) {
	if msg.MsgType == 1 && len(msg.FromUserName) > 2 && !m.isRoom(msg.FromUserName) && !m.isWechatOfficial(msg.FromUserName) {
		if strings.Index(msg.Content, "外卖群") != -1 {
			roomMaxUserNum := 500
			go m.addToMarketingGroup(msg, srv, MeituanRoomNick, roomMaxUserNum, "1 本群不聊闲，仅发布外卖红包；\n2 任何广告、情色内容不得出现，一律剔除；\n3 请注意私下交易风险；\n4 不得把群内方案分享出去，一经发现永久剔除\n5 群友在抢红包后，自觉为报位置\n5 进群先修改昵称，模板：[广州]李小丫")
		} else {
			go m.sendHelpTips(srv, msg.FromUserName, "请回复\"外卖群\"，加入美团饿了么外卖互助群组。——"+time.Now().Format(`2006-01-02`))
		}
	}
}
func (m *MsgDis) caipiaoTalkLogic(msg *wechat.Message, srv string) {
	if msg.MsgType == 1 && len(msg.FromUserName) > 2 && !m.isRoom(msg.FromUserName) && !m.isWechatOfficial(msg.FromUserName) {
		if strings.Index(msg.Content, "红彩群") != -1 {
			roomMaxUserNum := 500
			go m.addToMarketingGroup(msg, srv, HongcaiRoomNick, roomMaxUserNum, "1 本群不聊闲，仅可发布网易红彩方案或自行组织合买；\n2 任何广告、情色内容不得出现，一律剔除；\n3 请注意私下交易风险；\n4 不得把群内方案分享出去，一经发现永久剔除\n5 进群先修改昵称，模板：[广州]王小强")
		} else {
			go m.sendHelpTips(srv, msg.FromUserName, "请回复\"红彩群\"，加入网易红彩互助群组。——"+time.Now().Format(`2006-01-02`))
		}
	}
}
func (m *MsgDis) sendHelpTips(srv string, toUid string, text string) {
	if !m.ifDidToday(toUid + text) {
		m.didToday(toUid + text)
		m.sendMsg(srv, toUid, text)
	}
}

func (m *MsgDis) ifDidToday(key string) bool {
	hashKey := common.Md5(key + common.Today())
	value := false
	m.KVStore.Get(hashKey, &value)
	return value
}
func (m *MsgDis) didToday(key string) {
	hashKey := common.Md5(key + common.Today())
	m.KVStore.Put(hashKey, true)
}

func (m *MsgDis) isRoom(id string) bool {
	return len(id) > 2 && id[:2] == "@@"
}

func (m *MsgDis) isWechatOfficial(id string) bool {
	return len(id) >= 1 && id[:1] != "@"
}
