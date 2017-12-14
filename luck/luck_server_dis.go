package luck

import (
	"errors"
	"fmt"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
)

func (d *TaskDisServer) Start() {
	d.Logln("分配服务器已启动")
	//d.restoreUnExeTasks()
	d.unsetUnExeTasks()
	go d.handleActivityStatusChange()

}

func (d *TaskDisServer) unsetUnExeTasks() {
	query := fmt.Sprintf("UPDATE mt_task SET status=0 where status=1;")
	//fmt.Println(query)
	_, _ = d.DBConn.Exec(query)
}

func (d *TaskDisServer) restoreUnExeTasks() {
	var tasks []SigNewTask
	query := fmt.Sprintf("SELECT id,status,mobile,time_gen,uid,wxid,type FROM mt_task WHERE status=1 ORDER BY id ASC")
	d.DBConn.Select(&tasks, query)
	if len(tasks) > 0 {
		d.SigNewTasks <- tasks
	}
}

// 接收执行服务器的状态变化，好进行每次迭代分配任务
func (d *TaskDisServer) handleActivityStatusChange() {
	var status *SigPoolActivityStatus
	for {
		select {
		case status = <-d.SigPoolActivityStatus:
			//d.Logln("接收到执行服务器状态变化", status)
			status.RepeatTry = 10
			err := d.recordStatusChangeAction(status)
			if err != nil {
				status.Chan <- []SigNewTask{}
			}

		default:
			time.Sleep(time.Microsecond * 20)
		}
	}
}
func (d *TaskDisServer) recordStatusChangeAction(status *SigPoolActivityStatus) (err error) {
	//最新的status
	bestNum := status.BestLuckChance
	simpleNum := status.SimpleLuckChance
	var tastsRst []SigNewTask
	if bestNum > 0 {
		err, tasksBest := d.getTasks(TYPE_TASK_BEST, bestNum, status.ID)
		if err != nil {
			common.Log.ERROR.Println(err)
			return err
		}
		if len(tasksBest) > 0 {
			tastsRst = append(tastsRst, tasksBest...)

		} else {
			if status.RepeatTry <= 0 {
				err = errors.New("no tasks")
				return err
			}
			status.RepeatTry -= 1
			time.Sleep(time.Second * 1)
			d.recordStatusChangeAction(status)
		}

	}
	if simpleNum > 0 {
		err, tasksSimple := d.getTasks(TYPE_TASK_SIMPLE, simpleNum, status.ID)
		if err != nil {
			common.Log.ERROR.Println(err)
		}
		if len(tasksSimple) > 0 {
			tastsRst = append(tastsRst, tasksSimple...)

		} else {
			time.Sleep(time.Second * 1)
			d.recordStatusChangeAction(status)
		}
	}
	if len(tastsRst) > 0 {
		status.Chan <- tastsRst
	}

	return
}
func (d *TaskDisServer) getTasks(cateType int, num int, recordID string) (err error, tasks []SigNewTask) {
	var tasksTmp []SigNewTask
	var tasksTmp2 []SigNewTask
	query := fmt.Sprintf("SELECT id,status,mobile,time_gen,uid,wxid,type,precord_ids FROM mt_task WHERE type=%d and status=0 GROUP BY uid ORDER BY id ASC LIMIT 0,%d;", cateType, num*8)
	//fmt.Println(query)
	err = d.DBConn.Select(&tasksTmp, query)

	query = fmt.Sprintf("SELECT id,status,mobile,time_gen,uid,wxid,type,precord_ids FROM mt_task WHERE type=%d and status=4 GROUP BY uid ORDER BY id ASC LIMIT 0,%d;", cateType, num*8)
	//fmt.Println(query)
	err = d.DBConn.Select(&tasksTmp2, query)
	tasksTmp = append(tasksTmp, tasksTmp2...)

	if len(tasksTmp) > 0 {
		for i := 0; i < len(tasksTmp); i++ {
			if strings.IndexAny(tasksTmp[i].PrecordIdsString, recordID) == -1 {
				tasks = append(tasks, tasksTmp[i])
			}
		}
		if len(tasks) >= num {
			tasks = tasks[:num]
		}

		if len(tasks) > 0 {
			err = d.updateTasksStatus(tasks, STATUS_TASK_OUT)
		}

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
	//fmt.Println(query)
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
