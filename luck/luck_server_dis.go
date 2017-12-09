package luck

import (
	"fmt"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
)

func (d *TaskDisServer) Start() {
	d.Logln("分配服务器已启动")
	go d.handleActivityStatusChange()
}

// 接收执行服务器的状态变化，好进行每次迭代分配任务
func (d *TaskDisServer) handleActivityStatusChange() {
	var status *SigPoolActivityStatus
	for {
		select {
		case status = <-d.SigPoolActivityStatus:
			d.Logln("接收到执行服务器状态变化", status)

			d.ActivityStatus = status
			//最新的status
			bestNum := d.ActivityStatus.BestLuckChance
			simpleNum := d.ActivityStatus.SimpleLuckChance

			if bestNum > 0 {
				err, tasksBest := d.getTasks(TYPE_TASK_BEST, bestNum)
				if err != nil {
					common.Log.ERROR.Println(err)
				}
				d.SigNewTasks <- tasksBest

			}
			if simpleNum > 0 {
				err, tasksSimple := d.getTasks(TYPE_TASK_SIMPLE, simpleNum)
				if err != nil {
					common.Log.ERROR.Println(err)
				}

				d.SigNewTasks <- tasksSimple
			}
		default:
			time.Sleep(time.Microsecond * 20)
		}
	}
}
func (d *TaskDisServer) getTasks(cateType int, num int) (err error, tasks []SigNewTask) {
	query := fmt.Sprintf("SELECT id,status,mobile,time_gen,uid,wxid,type FROM mt_task WHERE type=%d and (status=0 or status=4) ORDER BY id ASC LIMIT 0,%d;", cateType, num)
	err = d.DBConn.Select(&tasks, query)
	if len(tasks) > 0 {
		err = d.updateTasksStatus(tasks, STATUS_TASK_OUT)
	}

	if err != nil {
		return
	}
	return
}

func (d *TaskDisServer) updateTasksStatus(tasks []SigNewTask, status int) (err error) {
	var ids []string
	for i := 0; i < len(tasks); i++ {
		ids = append(ids, fmt.Sprintf("%d", tasks[i].ID))
	}
	query := fmt.Sprintf("UPDATE mt_task SET status=%d where id in(%s);", status, strings.Join(ids, ","))
	_, err = d.DBConn.Exec(query)
	return
}

func (d *TaskDisServer) Logln(v ...interface{}) {
	v = append([]interface{}{"[dis]"}, v...)
	common.Log.INFO.Println(v...)
}

func (d *TaskDisServer) Logf(format string, v ...interface{}) {
	common.Log.INFO.Printf(format, v...)
}

const (
	eachDisNums         = 100
	STATUS_TASK_ENTER   = 0
	STATUS_TASK_OUT     = 1
	STATUS_TASK_FINISH  = 2
	STATUS_TASK_FAIL    = 3
	STATUS_TASK_RESTORE = 4
)

// todo 任务的执行失败，也使用信号传递到这里来执行数据库设置。
