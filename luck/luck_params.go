package luck

import (
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/jmoiron/sqlx"
	"sync"
)

type Luck struct {
	DBConn        *sqlx.DB
	RedisConn     redis.Conn
	MsgServer     *MsgServer
	TaskGenServer *TaskGenServer
	TaskDisServer *TaskDisServer
	TaskExeServer *TaskExeServer
}
type SigNewActivity struct {
	Channel string
	UrlKey  string
	BestPos int
}

type SigNewTask struct {
	ID       int64
	Status   int
	Mobile   string
	TimeGen  int
	UserID   int64
	WechatID string
	Type     int
}

// PoolActivity 的当前状态信息
type SigPoolActivityStatus struct {
	status int
}

type TaskGenServer struct {
	DBConn             *sqlx.DB
	SimplePickNumDaily int
}
type TaskDisServer struct {
	DBConn                *sqlx.DB
	SigNewTasks           chan []SigNewTask
	SigPoolActivityStatus chan *SigPoolActivityStatus
	ActivityStatus        *SigPoolActivityStatus
}
type TaskExeServer struct {
	DBConn                *sqlx.DB
	PoolActivity          *PoolActivity
	SigNewActivity        chan SigNewActivity
	SigNewTasks           chan []SigNewTask
	SigPoolActivityStatus chan *SigPoolActivityStatus
	ActivityStatus        *SigPoolActivityStatus
}
type MsgServer struct {
	LuckServer     *Luck
	SigNewActivity chan SigNewActivity
}

type PoolActivity struct {
	StoreMem  map[string]*ActivityRecord
	StoreBack *StorePool
}

type StorePool struct {
	RedisConn redis.Conn
	KeyAppend string
	ParentKey string
	Locker    *sync.Mutex
}

type ActivityRecord struct {
	ID            string
	Channel       string
	UrlKey        string
	BestLuckPrice int  //最佳机会的数值
	BestLuckPos   int  //最佳机会的位置
	NowPos        int  //现在的位置
	TotalPos      int  //总次数
	LeftSimpleNum int  //剩余的普通机会数
	LeftBestIf    bool //最佳位置是否还存在
	NextBestIf    bool //下一个位置是否是最佳
	Finished      bool
}
type ActivityInfoJson struct {
	CouponsCount  int  `json:"couponsCount"`
	BestLuckPrice int  `json:"bestLuck"`
	CanContinue   bool `json:"canContinue"`
	Finished      bool `json:"finished"`
	Code          int  `json:"code"`
}

type BaseJsonRst struct {
	Error string      `json:"error"`
	Rst   interface{} `json:"rst"`
}

type User struct {
	ID          int64  `db:"id"`
	Mobile      string `db:"mobile"`
	PayEndTime  int    `db:"pay_end_time"`
	LuckLeftNum int    `db:"luck_left_num"`
	WechatID    string `db:"wxid"`
}

func (r *ActivityRecord) Serialize() (str string, err error) {
	strByte, err := json.Marshal(r)
	if err != nil {
		return
	}
	str = string(strByte)
	return
}
func (r *ActivityRecord) UnSerialize(value string) (err error) {
	valueByte := []byte(value)
	err = json.Unmarshal(valueByte, r)
	if err != nil {
		return
	}
	return
}

type StoreValue interface {
	Serialize() (string, error)
	UnSerialize(string) error
}
