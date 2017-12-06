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
			PoolActivity: &StorePool{
				RedisConn: redisConn,
				KeyAppend: "_meituan_luck",
				ParentKey: "_meituan_activity_p",
				Locker:    &sync.Mutex{},
			},
		},
		MsgServer: &MsgServer{
			LuckServer: nil,
		},
		DBConn:    dbConn,
		RedisConn: redisConn,
	}
	luck.MsgServer.LuckServer = luck
	return
}
func (l *Luck) InitChans() {
	chanNewActivity := make(chan MsgNewActivity, maxChanNewActivitySize)
	//新的活动需要在处理和消息服务间传递
	l.TaskExeServer.ChanNewActivity = chanNewActivity
	l.MsgServer.ChanNewActivity = chanNewActivity

}
func (l *Luck) CloseConn() {
	l.RedisConn.Close()
	l.DBConn.Close()
}

const (
	maxChanNewActivitySize = 5
)

// todo 启动时将存储的记录重新读取
