package luck

import (
	"fmt"
	"github.com/jinzhu/now"
	"math/rand"
	"strconv"
	"time"
	"yx.com/meituan-luck/common"
)

func (g *TaskGenServer) Start() {
	common.Log.INFO.Println("task gen server started")
	go g.genDailyTask()
	go g.handleNewRegTask()
	go g.handleNewUpgradeTask()
	go g.handleNewHandedTask()
	go g.waitForTaskResults()
}
func (g *TaskGenServer) delOldTasks() {
	yesterday := now.BeginningOfDay().Unix() - 24*60*60
	query := fmt.Sprintf("DELETE FROM mt_task WHERE time_gen<%d;", yesterday)
	//fmt.Println(query)
	_, _ = g.DBConn.Exec(query)
}
func (g *TaskGenServer) renewUsers() {

	query := fmt.Sprintf("update mt_user set can_today_still=1,simple_pick_times_today=0;")
	_, _ = g.DBConn.Exec(query)
}
func (g *TaskGenServer) waitForTaskResults() {
	var result TaskResult
	for {
		select {
		case result = <-g.TaskResult:
			fmt.Println("result status", result.Status)
			switch result.Status {
			case RST_USER_NOT_EXIST:
				g.callbackUserNotEXIST(result)
			case 1006:
				g.callbackUserNotEXIST(result)
			case RST_USER_TODAY_FULL:
				g.callbackUserTodayFull(result)
			case RST_USER_PICKED:
				go func() {
					//todo 如果保证一个任务不会多次取相同的用户。设置一个键用于存储失败过的任务
					time.Sleep(time.Second * 1)
					g.callbackUserPicked(result)
				}()
			case RST_NOT_GOT:
				g.callbackNotLeft(result)
			case RST_NO_LEFT:
				g.callbackNotLeft(result)
			case RST_CALL_ERR:
				g.callbackSystemErr(result)
			case RST_ACTIVITY_PASS:
				g.callbackActivityEnd(result)
			case RST_NEED_BEST_GOT_SIMPLE:
				g.callbackNotBestGotSimple(result)
			case RST_NEED_BEST_GOT_NONE:
				g.callbackNotBest(result)
			case RST_OK:
				g.callbackOK(result)

			}

		}
	}
}
func (g *TaskGenServer) callbackUserNotEXIST(result TaskResult) (err error) {
	//将用户所有未分配额任务取消
	query := fmt.Sprintf("UPDATE mt_task set status=%d,err_code=%d where uid=%d;", STATUS_TASK_FAIL, result.Status, result.Task.UserID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}
	//标记用户状态为不可用
	query = fmt.Sprintf("DELETE FROM mt_user where id=%d;", result.Task.UserID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	//todo 如果绑定微信就给微信发送消息
	//todo 用户注册时通过info接口判断其号码的有效性

	return
}

func (g *TaskGenServer) callbackUserTodayFull(result TaskResult) (err error) {
	//将用户所有未分配额任务取消
	query := fmt.Sprintf("UPDATE mt_task set status=%d where uid=%d AND status=%d;", STATUS_TASK_FAIL, result.Task.UserID, STATUS_TASK_ENTER)
	g.DBConn.Exec(query)

	query = fmt.Sprintf("UPDATE mt_task set status=%d,err_code=%d where id=%d;", STATUS_TASK_FAIL, result.Status, result.Task.ID)
	g.DBConn.Exec(query)

	query = fmt.Sprintf("UPDATE mt_user set can_today_still=0 where id=%d;", result.Task.UserID)
	g.DBConn.Exec(query)

	//todo 如果绑定微信就给微信发送消息告知今天配额已满
	return

}
func (g *TaskGenServer) callbackUserPicked(r TaskResult) (err error) {
	//本任务设置为取回，用于从新取回
	query := fmt.Sprintf("UPDATE mt_task set status=%d, precord_ids=concat(precord_ids,'%s') where id=%d;", STATUS_TASK_RESTORE, r.RecordID, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	//重新给他分配一条任务
	//var taskID int64
	//switch r.Type {
	//case TYPE_TASK_BEST:
	//	taskID, _ = g.genTaskID(4)
	//case TYPE_TASK_SIMPLE:
	//	taskID, _ = g.genTaskID(2)
	//}
	//now := time.Now().Unix()
	//g.genNewTask(taskID, r.Mobile, now, r.UserID, r.ClientId, r.Type)

	return

}
func (g *TaskGenServer) callbackNotLeft(r TaskResult) (err error) {
	//本任务设置为取回，用于从新取回
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_RESTORE, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	return
}
func (g *TaskGenServer) callbackNotBestGotSimple(r TaskResult) (err error) {
	//原任务返回，创建一条成功的普通记录
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_FINISH, r.Task.ID)
	g.DBConn.Exec(query)
	// 生成成功的普通记录，算作一条错误奖励
	nowUnix := time.Now().Unix()
	query = fmt.Sprintf("INSERT INTO mt_history(`uid`,`time`,`luck`,`is_best`,`suprise_mount`) VALUES(%d,%d,%d,%t,%d);", r.Task.UserID, nowUnix, r.Luck.Mount, false, r.Surprise.Mount)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}
	return
}
func (g *TaskGenServer) callbackNotBest(r TaskResult) (err error) {
	//本任务设置为取回，用于从新取回
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_RESTORE, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	return

}
func (g *TaskGenServer) callbackActivityEnd(r TaskResult) (err error) {
	//本任务设置为取回，用于从新取回
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_RESTORE, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	return
}
func (g *TaskGenServer) callbackSystemErr(r TaskResult) (err error) {
	//本任务设置为取回，用于从新取回
	query := fmt.Sprintf("UPDATE mt_task set status=%d,err_code=%d where id=%d;", STATUS_TASK_RESTORE, r.Status, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	return
}

func (g *TaskGenServer) callbackOK(r TaskResult) (err error) {
	nowUnix := time.Now().Unix()
	//本任务设置为完成
	fmt.Println(r)
	query := fmt.Sprintf("UPDATE mt_task set status=%d,luck=%d,time_done=%d where id=%d;", STATUS_TASK_FINISH, r.Luck.Mount, nowUnix, r.Task.ID)
	g.DBConn.Exec(query)

	// 生成成功记录
	query = fmt.Sprintf("INSERT INTO mt_history(`uid`,`time`,`luck`,`is_best`,`suprise_mount`) VALUES(%d,%d,%d,%t,%d);", r.Task.UserID, nowUnix, r.Luck.Mount, r.Luck.IsBest, r.Surprise.Mount)
	fmt.Println(query)
	g.DBConn.Exec(query)

	query = fmt.Sprintf("UPDATE mt_user set pick_money_total=pick_money_total+%d,pick_times_total=pick_times_total+1 where id=%d AND pay_end_time<%d;", r.Luck.Mount, r.Task.UserID, nowUnix)
	g.DBConn.Exec(query)

	if r.Luck.IsBest {
		if r.Task.Type == TYPE_TASK_BEST {
			query = fmt.Sprintf("UPDATE mt_user set best_pick_times_left=best_pick_times_left-1,best_pick_times_total=best_pick_times_total+1 where id=%d AND pay_end_time<%d;", r.Task.UserID, nowUnix)
		} else {
			query = fmt.Sprintf("UPDATE mt_user set best_pick_times_total=best_pick_times_total+1 where id=%d AND pay_end_time<%d;", r.Task.UserID, nowUnix)
		}
		g.DBConn.Exec(query)
	} else {
		query = fmt.Sprintf("UPDATE mt_user set simple_pick_times_today=simple_pick_times_today+1,pick_times_total=pick_times_total+1 where id=%d AND pay_end_time<%d;", r.Task.UserID, nowUnix)
		g.DBConn.Exec(query)
	}

	return
}

//生成每天的任务
func (g *TaskGenServer) genDailyTask() {
	needToGen := false
	firstLoop := true
	todayGenned := false

	for {
		persistentKey := "todayGenned" + time.Now().Format(`2006-01-02`)
		todayGenned = common.Persistent.GetBool(persistentKey)
		hour := time.Now().Hour()
		if (hour != 0 && !firstLoop) || todayGenned {
			needToGen = false
		} else {
			needToGen = true
		}
		if needToGen {
			g.delOldTasks()
			g.renewUsers()
			go g.genDailySimpleTask()
			go g.genDailyBestTask()
			todayGenned = true
			common.Persistent.SetBool(persistentKey, true)
		}

		// 确保每小时都可以执行到

		time.Sleep(time.Minute * 30)
		firstLoop = false
	}
}

//生成新注册的任务
func (g *TaskGenServer) handleNewRegTask() {

}

//生成新付费的任务
func (g *TaskGenServer) handleNewUpgradeTask() {

}

//生成手动临时请求的任务，比如从网页端单独请求一次

func (g *TaskGenServer) handleNewHandedTask() {
	var info HandlerTaskInfo
	for {
		select {
		case info = <-g.SigNewHandleTasks:
			//生成新的记录
			//每个人每天都有有效执行上线5次
			taskID, _ := g.genTaskID(3)
			now := time.Now().Unix()
			g.genNewTask(taskID, info.Mobile, now, info.UserID, info.ClientId, info.Type)
			//告知执行服务器有新的任务，过来取吧
			fmt.Println("new gen task", taskID)
			g.SigNewTaskType <- info.Type
			info.ResultChan <- taskID

		default:

		}

	}

}

func (g *TaskGenServer) genDailySimpleTask() (err error) {
	var users []User
	page := 1
	limit := 100
	dailyMaxGenNum := g.SimplePickNumDaily
	now := time.Now().Unix()
	for {
		query := fmt.Sprintf("SELECT id,mobile,pay_end_time,luck_left_num,client_id FROM mt_user WHERE (luck_left_num>0 or pay_end_time>%d) AND status=1 LIMIT %d,%d;", now, (page-1)*limit, limit)
		err = g.DBConn.Select(&users, query)
		if err != nil {
			return
		}
		for i := 0; i < len(users); i++ {
			user := users[i]
			userCanGenNum := user.LuckLeftNum
			if userCanGenNum > dailyMaxGenNum {
				userCanGenNum = dailyMaxGenNum
			}
			if user.PayEndTime > int(now) {
				userCanGenNum = dailyMaxGenNum
			}
			for userCanGenNum > 0 {
				// 生成task逻辑，完成talk才会减1
				taskID, _ := g.genTaskID(userCanGenNum + 3)
				g.genNewTask(taskID, user.Mobile, now, user.ID, user.ClientID, TYPE_TASK_SIMPLE)
				userCanGenNum--
			}
		}
		//common.Log.INFO.Printf("users num %d\n", len(users))
		if len(users) < limit {
			return
		}
		page += 1
	}
}
func (g *TaskGenServer) genDailyBestTask() (err error) {
	var users []User
	page := 1
	limit := 100
	now := time.Now().Unix()
	for {
		query := fmt.Sprintf("SELECT id,mobile,pay_end_time,luck_left_num,client_id  FROM mt_user WHERE pay_end_time>%d AND status=1 LIMIT %d,%d;", now, (page-1)*limit, limit)
		err = g.DBConn.Select(&users, query)
		if err != nil {
			return
		}
		for i := 0; i < len(users); i++ {
			user := users[i]
			taskID, _ := g.genTaskID(2)
			if err != nil {
				return
			}
			g.genNewTask(taskID, user.Mobile, now, user.ID, user.ClientID, TYPE_TASK_BEST)
		}

		if len(users) < limit {
			return
		}
		page += 1
	}
}

func (g *TaskGenServer) genNewTask(taskID int64, mobile string, time int64, uid int64, clientID string, typeTask int) {

	_, err := g.DBConn.NamedExec("INSERT INTO mt_task(id,status,mobile,time_gen,uid,client_id,type) VALUES(:id,:status,:mobile,:time_gen,:uid,:client_id,:type)", map[string]interface{}{
		"id":        taskID,
		"status":    STATUS_TASK_ENTER,
		"mobile":    mobile,
		"time_gen":  time,
		"uid":       uid,
		"client_id": clientID,
		"type":      typeTask,
	})
	common.Log.INFO.Println(err)
	common.Log.INFO.Printf("gen new task id:%d for %s\n", taskID, mobile)

}
func (g *TaskGenServer) genTaskID(firstNum int) (i int64, err error) {
	str := fmt.Sprintf("%d%d%.7d", firstNum, time.Now().Unix(), rand.Intn(100000))
	i, err = strconv.ParseInt(str, 10, 64)
	return
}

const (
	TYPE_TASK_SIMPLE        = 1
	TYPE_TASK_BEST          = 2
	TYPE_TASK_SIMPLE_HANDLE = 3
	TYPE_TASK_BEST_HANDLE   = 4
)
