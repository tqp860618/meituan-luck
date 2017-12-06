package luck

import (
	"time"
	"yx.com/meituan-luck/common"
)

func (d *TaskDisServer) Start() {
	common.Log.INFO.Println("task dis server started")
	go d.handleNewActivityStatusChange()
	go d.loopDisTasks()
}

// 接收执行服务器的状态变化，好进行每次迭代分配任务
func (d *TaskDisServer) handleNewActivityStatusChange() {
	var status *SigPoolActivityStatus
	for {
		select {
		case status = <-d.SigPoolActivityStatus:
			d.ActivityStatus = status
			//最新的status
		default:
			time.Sleep(time.Microsecond * 20)
		}
	}
}
func (d *TaskDisServer) loopDisTasks() {
	for {

		//todo 从数据库查询记录，根据执行服务器的状态进行分配

		time.Sleep(time.Microsecond * 10)
	}

}

const (
	eachDisNums = 100
)
