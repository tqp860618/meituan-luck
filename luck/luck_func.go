package luck

import (
	"github.com/garyburd/redigo/redis"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/spf13/viper"
	"sync"
)

func NewLuck() (luck *Luck, err error) {
	redisConn, err := redis.Dial("tcp", viper.GetString("redis_address"))
	if err != nil {
		return
	}
	dbConn, err := sqlx.Connect("mysql", viper.GetString("luck_server.meituan_luck_db"))
	if err != nil {
		return
	}
	activityRecords := make(map[string]*ActivityRecord)
	luck = &Luck{
		TaskGenServer: &TaskGenServer{
			DBConn:             dbConn,
			SimplePickNumDaily: viper.GetInt("luck_server.num_simple_pick"),
		},
		TaskDisServer: &TaskDisServer{
			DBConn: dbConn,
		},
		TaskExeServer: &TaskExeServer{
			DBConn: dbConn,
			PoolActivity: &PoolActivity{
				StoreMem: activityRecords,
				StoreBack: &StorePool{
					RedisConn: redisConn,
					KeyAppend: "_meituan_luck",
					ParentKey: "_meituan_activity_p",
					Locker:    &sync.Mutex{},
				},
			},
		},
		MsgServer: &MsgServer{
			LuckServer: nil,
		},
		DBConn:    dbConn,
		RedisConn: redisConn,
	}
	luck.MsgServer.LuckServer = luck
	luck.initChans()
	return
}
func (l *Luck) initChans() {
	chanNewActivity := make(chan SigNewActivity, maxChanNewActivitySize)
	//新的活动需要在处理和消息服务间传递
	l.TaskExeServer.SigNewActivity = chanNewActivity
	l.MsgServer.SigNewActivity = chanNewActivity

	chanNewTasks := make(chan []SigNewTask, maxChanNewTasksSize)

	l.TaskExeServer.SigNewTasks = chanNewTasks
	l.TaskDisServer.SigNewTasks = chanNewTasks

	chanActivityStatus := make(chan *SigPoolActivityStatus, maxChanNewActivityStatusSize)

	l.TaskExeServer.SigPoolActivityStatus = chanActivityStatus
	l.TaskDisServer.SigPoolActivityStatus = chanActivityStatus

}
func (l *Luck) CloseConn() {
	l.RedisConn.Close()
	l.DBConn.Close()
}

const (
	maxChanNewActivitySize       = 50
	maxChanNewTasksSize          = 100
	maxChanNewActivityStatusSize = 20
)

// todo 启动时将存储的记录重新读取
