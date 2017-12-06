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
type MsgNewActivity struct {
	Channel string
	UrlKey  string
	BestNum int
}
type TaskGenServer struct {
	DBConn             *sqlx.DB
	SimplePickNumDaily int
}
type TaskDisServer struct {
	DBConn *sqlx.DB
}
type TaskExeServer struct {
	DBConn          *sqlx.DB
	PoolActivity    *StorePool
	ChanNewActivity chan MsgNewActivity
}
type MsgServer struct {
	LuckServer      *Luck
	ChanNewActivity chan MsgNewActivity
}

type StorePool struct {
	RedisConn redis.Conn
	KeyAppend string
	ParentKey string
	Locker    *sync.Mutex
}

type ActivityRecord struct {
	Channel     string
	UrlKey      string
	LuckBestNum int
	LeftCount   int
	BestLuck    int
	CanContinue bool
	Finished    bool
}
type ActivityInfoJson struct {
	CouponsCount int  `json:"couponsCount"`
	BestLuck     int  `json:"bestLuck"`
	CanContinue  bool `json:"canContinue"`
	Finished     bool `json:"finished"`
	Code         int  `json:"code"`
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
