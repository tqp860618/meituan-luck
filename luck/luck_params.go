package luck

import (
	"encoding/json"
	"github.com/garyburd/redigo/redis"
	"github.com/jmoiron/sqlx"

	"sync"
	"yx.com/meituan-luck/common"
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
	ID               int64  `db:"id"`
	Status           int    `db:"status"`
	Mobile           string `db:"mobile"`
	TimeGen          int    `db:"time_gen"`
	UserID           int64  `db:"uid"`
	ClientId         string `db:"client_id"`
	Type             int    `db:"type"`
	PrecordIdsString string `db:"precord_ids"`
	PrecordIds       []string
}

// PoolActivity 的当前状态信息
type SigPoolActivityStatus struct {
	status           int
	PoolSize         int
	BestLuckChance   int
	SimpleLuckChance int
	ID               string
	Chan             chan []SigNewTask
	RepeatTry        int
}

type HandlerTaskInfo struct {
	Type       int
	Mobile     string
	UserID     int64
	ClientId   string
	ResultChan chan int64
}
type TaskGenServer struct {
	DBConn                  *sqlx.DB
	SimplePickNumDaily      int
	TaskResult              chan TaskResult
	SigNewHandleTasks       chan HandlerTaskInfo
	SigNewHandleTasksResult chan int64
	SigNewTaskType          chan int
}
type TaskDisServer struct {
	DBConn                *sqlx.DB
	SigNewTasks           chan []SigNewTask
	SigPoolActivityStatus chan *SigPoolActivityStatus
	ActivityStatus        *SigPoolActivityStatus
	TasksDisLocker        *sync.Mutex
}
type TaskExeServer struct {
	DBConn                *sqlx.DB
	SigNewHandleTasks     chan bool
	PoolActivity          *PoolActivity
	SigNewActivity        chan SigNewActivity
	SigNewTasks           chan []SigNewTask
	SigNewTaskType        chan int
	SigPoolActivityStatus chan *SigPoolActivityStatus
	ActivityStatus        *SigPoolActivityStatus
	ActivityLocker        *sync.Mutex
	TaskResult            chan TaskResult
}
type TaskResult struct {
	Task     *SigNewTask
	Status   int
	RecordID string
	Luck     *MyLuckData
	Surprise *MyLuckData
}
type MsgServer struct {
	LuckServer     *Luck
	SigNewActivity chan SigNewActivity
}

type PoolActivity struct {
	StoreMem      map[string]*ActivityRecord
	StoreBack     *StorePool
	ActivityChans map[string]chan []SigNewTask
}

type StorePool struct {
	RedisConn redis.Conn
	KeyAppend string
	ParentKey string
	Locker    *sync.Mutex
}

type ActivityRecord struct {
	ID             string
	Channel        string
	UrlKey         string
	BestLuckPrice  int  //最佳机会的数值
	BestLuckPos    int  //最佳机会的位置
	NowPos         int  //现在的位置
	TotalPos       int  //总次数
	LeftSimpleNum  int  //剩余的普通机会数
	LeftBestIf     bool //最佳位置是否还存在
	NextBestIf     bool //下一个位置是否是最佳
	Finished       bool
	WaitingForJobs bool
}
type ActivityInfoJson struct {
	CouponsCount  int         `json:"couponsCount"`
	BestLuckPrice int         `json:"bestLuck"`
	CanContinue   bool        `json:"canContinue"`
	Finished      bool        `json:"finished"`
	Code          int         `json:"code"`
	Msg           string      `json:"msg"`
	Luck          *MyLuckData `json:"luck"`
	Surprise      *MyLuckData `json:"surprise"`
}
type MyLuckData struct {
	Mount  int    `json:"mount"`
	Limit  int    `json:"limit"`
	IsBest bool   `json:"isBest"`
	Name   string `json:"name"`
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
	ClientID    string `db:"clientID"`
}

func (r *ActivityRecord) Serialize() (str string, err error) {
	strByte, err := json.Marshal(r)
	if err != nil {
		common.Log.ERROR.Println(err)
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
