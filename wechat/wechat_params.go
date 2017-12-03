package wechat

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type MessageOut struct {
	ToUserName string
	Content    string
	Type       int
}

type MessageLink struct {
	XMLName xml.Name `xml:"msg"`
	Title   string   `xml:"appmsg>title"`
	Url     string   `xml:"appmsg>url"`
}

type Message struct {
	FromUserName         string
	PlayLength           int
	RecommendInfo        []string
	Content              string
	StatusNotifyUserName string
	StatusNotifyCode     int
	Status               int
	VoiceLength          int
	ToUserName           string
	ForwardFlag          int
	AppMsgType           int
	AppInfo              AppInfo
	Url                  string
	ImgStatus            int
	MsgType              int
	ImgHeight            int
	MediaId              string
	FileName             string
	FileSize             string
	FromUserNickName     string
	ToUserNickName       string
}

func (m Message) String() string {
	from := m.FromUserNickName
	to := m.ToUserNickName
	if from == "" {
		from = m.FromUserName
	}
	if to == "" {
		to = m.ToUserName
	}
	return fmt.Sprintf("[%d]%s->%s:%s\n", m.MsgType, from, to, m.Content)
}

type AppInfo struct {
	Type  int
	AppID string
}

type GetUUIDParams struct {
	AppID    string  `json:"appid"`
	Fun      string  `json:"fun"`
	Lang     string  `json:"lang"`
	UnixTime float64 `json:"-"`
}

type Response struct {
	BaseResponse *BaseResponse `json:"BaseResponse"`
}

type Request struct {
	BaseRequest *BaseRequest

	MemberCount int    `json:",omitempty"`
	MemberList  []User `json:",omitempty"`
	Topic       string `json:",omitempty"`

	ChatRoomName  string `json:",omitempty"`
	DelMemberList string `json:",omitempty"`
	AddMemberList string `json:",omitempty"`
}
type Caller interface {
	IsSuccess() bool
	Error() error
}

type BaseRequest struct {
	XMLName    xml.Name `xml:"error" json:"-"`
	Ret        int      `xml:"ret" json:"-"`
	Message    string   `xml:"message" json:"-"`
	Skey       string   `xml:"skey" json:"Skey"`
	Wxsid      string   `xml:"wxsid" json:"Sid"`
	Wxuin      int64    `xml:"wxuin" json:"Uin"`
	PassTicket string   `xml:"pass_ticket" json:"-"`
	DeviceID   string   `xml:"-" json:"DeviceID"`
}

type BaseResponse struct {
	Ret    int
	ErrMsg string
}

type MsgResp struct {
	Response
}

type InitResp struct {
	Response
	User                User    `json:"User"`
	Count               int     `json:"Count"`
	ContactList         []User  `json:"ContactList"`
	SyncKey             SyncKey `json:"SyncKey"`
	ChatSet             string  `json:"ChatSet"`
	SKey                string  `json:"SKey"`
	ClientVersion       int     `json:"ClientVersion"`
	SystemTime          int     `json:"SystemTime"`
	GrayScale           int     `json:"GrayScale"`
	InviteStartCount    int     `json:"InviteStartCount"`
	MPSubscribeMsgCount int     `json:"MPSubscribeMsgCount"`
	//MPSubscribeMsgList  string  `json:"MPSubscribeMsgList"`
	ClickReportInterval int `json:"ClickReportInterval"`
}

type SyncKey struct {
	Count int      `json:"Count"`
	List  []KeyVal `json:"List"`
}

type KeyVal struct {
	Key int `json:"Key"`
	Val int `json:"Val"`
}

func (r *Response) IsSuccess() bool {
	return r.BaseResponse.Ret == StatusSuccess
}

func (r *Response) Error() error {
	return fmt.Errorf("message:[%d,%s]", r.BaseResponse.Ret, r.BaseResponse.ErrMsg)
}

type MemberResp struct {
	Response
	MemberCount  int
	ChatRoomName string
	MemberList   []Member
	Seq          int
}

func (this *Member) IsNormal(mySelf string) bool {
	return this.VerifyFlag&8 == 0 && // 公众号/服务号
		!strings.HasPrefix(this.UserName, "@@") && // 群聊
		this.UserName != mySelf && // 自己
		!this.IsSpecail() // 特殊账号
}

func (this *Member) IsSpecail() bool {
	for i, count := 0, len(SpecialUsers); i < count; i++ {
		if this.UserName == SpecialUsers[i] {
			return true
		}
	}
	return false
}

type User struct {
	UserName          string `json:"UserName"`
	Uin               int64  `json:"Uin"`
	NickName          string `json:"NickName"`
	HeadImgUrl        string `json:"HeadImgUrl" xml:""`
	RemarkName        string `json:"RemarkName" xml:""`
	PYInitial         string `json:"PYInitial" xml:""`
	PYQuanPin         string `json:"PYQuanPin" xml:""`
	RemarkPYInitial   string `json:"RemarkPYInitial" xml:""`
	RemarkPYQuanPin   string `json:"RemarkPYQuanPin" xml:""`
	HideInputBarFlag  int    `json:"HideInputBarFlag" xml:""`
	StarFriend        int    `json:"StarFriend" xml:""`
	Sex               int    `json:"Sex" xml:""`
	Signature         string `json:"Signature" xml:""`
	AppAccountFlag    int    `json:"AppAccountFlag" xml:""`
	VerifyFlag        int    `json:"VerifyFlag" xml:""`
	ContactFlag       int    `json:"ContactFlag" xml:""`
	WebWxPluginSwitch int    `json:"WebWxPluginSwitch" xml:""`
	HeadImgFlag       int    `json:"HeadImgFlag" xml:""`
	SnsFlag           int    `json:"SnsFlag" xml:""`
}

type Member struct {
	Uin              int64
	UserName         string
	NickName         string
	HeadImgUrl       string
	ContactFlag      int
	MemberCount      int
	MemberList       []User
	RemarkName       string
	HideInputBarFlag int
	Sex              int
	Signature        string
	VerifyFlag       int
	OwnerUin         int
	PYInitial        string
	PYQuanPin        string
	RemarkPYInitial  string
	RemarkPYQuanPin  string
	StarFriend       int
	AppAccountFlag   int
	Statues          int
	AttrStatus       int
	Province         string
	City             string
	Alias            string
	SnsFlag          int
	UniFriend        int
	DisplayName      string
	ChatRoomId       int
	KeyWord          string
	EncryChatRoomId  string
}

type NotifyParams struct {
	BaseRequest  *BaseRequest
	Code         int
	FromUserName string
	ToUserName   string
	ClientMsgId  int
}

type SyncCheckResp struct {
	RetCode  int `json:"retcode"`
	Selector int `json:"selector"`
}

type SyncParams struct {
	BaseRequest BaseRequest `json:"BaseRequest"`
	SyncKey     SyncKey     `json:"SyncKey"`
	RR          int64       `json:"rr"`
}

type SyncResp struct {
	Response
	SyncKey      SyncKey       `json:"SyncKey"`
	ContinueFlag int           `json:"ContinueFlag"`
	AddMsgList   []interface{} `json:"AddMsgList"`
}

type NotifyResp struct {
	Response
	MsgID string
}

const (
	UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36"
)

var (
	SaveSubFolders = map[string]string{"webwxgeticon": "icons",
		"webwxgetheadimg": "headimgs",
		"webwxgetmsgimg":  "msgimgs",
		"webwxgetvideo":   "videos",
		"webwxgetvoice":   "voices",
		"_showQRCodeImg":  "qrcodes",
	}
	AppID        = "wx782c26e4c19acffb"
	Lang         = "zh_CN"
	LastCheckTs  = time.Now()
	LoginUrl     = "https://login.weixin.qq.com/jslogin"
	QrUrl        = "https://login.weixin.qq.com/qrcode/"
	QrContentUrl = "https://login.weixin.qq.com/l/"
	TuringUrl    = "http://www.tuling123.com/openapi/api"
	APIKEY       = "391ad66ebad2477b908dce8e79f101e7"
	TUringUserId = "abc123"
)

type Wechat struct {
	User            User
	Root            string
	Debug           bool
	Uuid            string
	BaseUri         string
	RedirectedUri   string
	Uin             string
	Sid             string
	Skey            string
	PassTicket      string
	DeviceId        string
	BaseRequest     map[string]string
	LowSyncKey      string
	SyncKeyStr      string
	SyncHost        string
	SyncKey         SyncKey
	Users           []string
	InitContactList []User   //谈话的人
	MemberList      []Member //
	ContactList     []Member //好友
	GroupList       []string //群
	GroupMemberList []Member //群友
	PublicUserList  []Member //公众号
	SpecialUserList []Member //特殊账号

	AutoReplyMode bool //default false
	AutoOpen      bool
	Interactive   bool
	TotalMember   int
	TimeOut       int // 同步时间间隔   default:20
	MediaCount    int // -1
	SaveFolder    string
	Client        *http.Client
	Request       *BaseRequest
	MemberMap     map[string]Member
	ChatSet       []string

	AutoReply    bool     //是否自动回复
	ReplyMsgs    []string // 回复的消息列表
	AutoReplySrc bool     //默认false,自动回复，列表。true调用AI机器人。
	lastCheckTs  time.Time
}

func NewGetUUIDParams(appid, fun, lang string, times float64) *GetUUIDParams {
	return &GetUUIDParams{
		AppID:    appid,
		Fun:      fun,
		Lang:     lang,
		UnixTime: times,
	}
}
func createFile(name string, data []byte, isAppend bool) (err error) {
	oflag := os.O_CREATE | os.O_WRONLY
	if isAppend {
		oflag |= os.O_APPEND
	} else {
		oflag |= os.O_TRUNC
	}

	file, err := os.OpenFile(name, oflag, 0600)
	if err != nil {
		return
	}
	defer file.Close()

	_, err = file.Write(data)
	return
}
