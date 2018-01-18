package luck

import (
	"fmt"
	"github.com/garyburd/redigo/redis"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/spf13/viper"
	"sync"
	"time"
	"yx.com/meituan-luck/common"
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
	activityChans := make(map[string]chan []SigNewTask, 100)
	chanTaskResult := make(chan TaskResult, 1000)
	luck = &Luck{
		TaskGenServer: &TaskGenServer{
			DBConn:             dbConn,
			SimplePickNumDaily: viper.GetInt("luck_server.num_simple_pick"),
			TaskResult:         chanTaskResult,
		},
		TaskDisServer: &TaskDisServer{
			DBConn:         dbConn,
			TasksDisLocker: &sync.Mutex{},
		},
		TaskExeServer: &TaskExeServer{
			ActivityStatus: &SigPoolActivityStatus{
				status: 0,
			},
			DBConn:     dbConn,
			TaskResult: chanTaskResult,

			ActivityLocker: &sync.Mutex{},
			PoolActivity: &PoolActivity{
				ActivityChans: activityChans,
				StoreMem:      activityRecords,
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

//状态机 每隔一秒汇报当前的整个服务器状态值
func (luck *Luck) StatusReport() {
	for {
		var workingActivitiesNum = 0
		var waitingActivitiesNum = 0
		var waitingSimpleNum = 0
		var waitingBestNum = 0
		records := luck.TaskExeServer.PoolActivity.StoreMem
		for _, record := range records {
			if record.WaitingForJobs {
				waitingActivitiesNum++
				if record.LeftSimpleNum > 0 {
					waitingSimpleNum += record.LeftSimpleNum
				}
				if record.LeftBestIf {
					waitingBestNum += 1
				}
			} else {
				workingActivitiesNum++
			}
		}

		type tmpStruct struct {
			Count int `db:"count"`
		}
		var tmps []tmpStruct
		query := fmt.Sprintf("SELECT count(1) as `count` FROM mt_user WHERE status=1;")
		err := luck.DBConn.Select(&tmps, query)
		if err != nil {
			return
		}
		userAllNum := tmps[0].Count

		var tmps1 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=0 AND type=1;")
		err = luck.DBConn.Select(&tmps1, query)
		if err != nil {
			return
		}
		taskUnPickSimple := tmps1[0].Count

		var tmps11 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=0 AND type=2;")
		err = luck.DBConn.Select(&tmps11, query)
		if err != nil {
			return
		}
		taskUnPickBest := tmps11[0].Count

		var tmps2 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=3;")
		err = luck.DBConn.Select(&tmps2, query)
		if err != nil {
			return
		}
		taskFailed := tmps2[0].Count

		var tmps3 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=4;")
		err = luck.DBConn.Select(&tmps3, query)
		if err != nil {
			return
		}
		taskRestore := tmps3[0].Count

		var tmps4 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=2;")
		err = luck.DBConn.Select(&tmps4, query)
		if err != nil {
			return
		}
		taskFinished := tmps4[0].Count

		var tmps5 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=1 and type=1;")
		err = luck.DBConn.Select(&tmps5, query)
		if err != nil {
			return
		}
		taskUndoSimple := tmps5[0].Count

		var tmps51 []tmpStruct
		query = fmt.Sprintf("SELECT count(1) as `count` FROM mt_task WHERE status=1 and type=2;")
		err = luck.DBConn.Select(&tmps51, query)
		if err != nil {
			return
		}
		taskUndoBest := tmps51[0].Count

		luck.Logf("______________________________________________________________________________________________________________")
		luck.Logf("活动数(工作)\t活动数(等待)\t用户总数\t任务数(未取出)\t任务数(等待执行)\t失败数\t取回数\t成功数\t")
		luck.Logf("%d\t\t%d(s%d,b%d)\t%d\t\t%d(s%d,b%d)\t%d(s%d,b%d)\t\t%d\t%d\t%d",
			workingActivitiesNum,
			waitingActivitiesNum, waitingSimpleNum, waitingBestNum,
			userAllNum,
			taskUnPickSimple+taskUnPickBest, taskUnPickSimple, taskUnPickBest,
			taskUndoSimple+taskUndoBest, taskUndoSimple, taskUndoBest,
			taskFailed, taskRestore, taskFinished,
		)

		time.Sleep(time.Second)
	}

}
func (luck *Luck) Logf(format string, v ...interface{}) {
	common.Log.INFO.Printf("[status]"+format, v...)
}
func (luck *Luck) initChans() {
	chanNewActivity := make(chan SigNewActivity, maxChanNewActivitySize)
	//新的活动需要在处理和消息服务间传递
	luck.TaskExeServer.SigNewActivity = chanNewActivity
	luck.MsgServer.SigNewActivity = chanNewActivity

	chanNewTasks := make(chan []SigNewTask, maxChanNewTasksSize)

	luck.TaskExeServer.SigNewTasks = chanNewTasks
	luck.TaskDisServer.SigNewTasks = chanNewTasks

	chanNewTaskType := make(chan int, maxChanNewTasksSize)
	luck.TaskExeServer.SigNewTaskType = chanNewTaskType
	luck.TaskGenServer.SigNewTaskType = chanNewTaskType

	luck.TaskGenServer.SigNewHandleTasks = make(chan HandlerTaskInfo, maxChanNewTasksSize)
	luck.TaskGenServer.SigNewHandleTasksResult = make(chan int64, maxChanNewTasksSize)

	chanActivityStatus := make(chan *SigPoolActivityStatus, maxChanNewActivityStatusSize)

	luck.TaskExeServer.SigPoolActivityStatus = chanActivityStatus
	luck.TaskDisServer.SigPoolActivityStatus = chanActivityStatus

	chanNewHandleTasks := make(chan bool)
	luck.TaskExeServer.SigNewHandleTasks = chanNewHandleTasks

}
func (luck *Luck) CloseConn() {
	luck.RedisConn.Close()
	luck.DBConn.Close()
}

const (
	maxChanNewActivitySize       = 50
	maxChanNewTasksSize          = 1000
	maxChanNewActivityStatusSize = 2000
)
