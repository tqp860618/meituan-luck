package luck

import (
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"sync"
)

type Luck struct {
	PoolActivity *StorePool
	MsgServer    *MsgServer
}

type StorePool struct {
	RedisConn redis.Conn
	KeyAppend string
	ParentKey string
	Locker    *sync.Mutex
}

type MsgServer struct {
	LuckServer *Luck
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