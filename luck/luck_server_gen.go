package luck

import (
	"fmt"
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
func (g *TaskGenServer) waitForTaskResults() {
	var result TaskResult
	for {
		select {
		case result = <-g.TaskResult:
			switch result.Status {
			case RST_USER_NOT_EXIST:
				g.callbackUserNotEXIST(result.Task.UserID)
			case RST_USER_TODAY_FULL:
				g.callbackUserTodayFull(result.Task.UserID)
			case RST_USER_PICKED:
				go func() {
					//todo 如果保证一个任务不会多次取相同的用户。设置一个键用于存储失败过的任务
					time.Sleep(time.Second * 1)
					g.callbackUserPicked(result)
				}()

			case RST_NO_LEFT:
				g.callbackNotLeft(result)
			case RST_CALL_ERR:
				g.callbackSystemErr(result)
			case RST_ACTIVITY_PASS:
				g.callbackActivityEnd(result)

			case RST_OK:
				g.callbackOK(result)

			}

		}
	}
}
func (g *TaskGenServer) callbackUserNotEXIST(uid int64) (err error) {
	//将用户所有未分配额任务取消
	query := fmt.Sprintf("UPDATE mt_task set status=%d where uid=%d AND status=%d;", STATUS_TASK_FAIL, uid, STATUS_TASK_ENTER)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}
	//标记用户状态为不可用
	query = fmt.Sprintf("UPDATE mt_user set status=0 where id=%d;", uid)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	//todo 如果绑定微信就给微信发送消息
	//todo 用户注册时通过info接口判断其号码的有效性

	return
}

func (g *TaskGenServer) callbackUserTodayFull(uid int64) (err error) {
	//将用户所有未分配额任务取消
	query := fmt.Sprintf("UPDATE mt_task set status=%d where uid=%d AND status=%d;", STATUS_TASK_FAIL, uid, STATUS_TASK_ENTER)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}
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
	//g.genNewTask(taskID, r.Mobile, now, r.UserID, r.WechatID, r.Type)

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
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_RESTORE, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	return
}

func (g *TaskGenServer) callbackOK(r TaskResult) (err error) {
	//本任务设置为完成
	query := fmt.Sprintf("UPDATE mt_task set status=%d where id=%d;", STATUS_TASK_FINISH, r.Task.ID)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
	}

	//减少相应的次数
	now := time.Now().Unix()
	//只处理非付费用户的次数
	query = fmt.Sprintf("UPDATE mt_user set luck_left_time=luck_left_time-1 where id=%d AND pay_end_time<%d;", r.Task.UserID, now)
	_, err = g.DBConn.Exec(query)
	if err != nil {
		return
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

}

func (g *TaskGenServer) genDailySimpleTask() (err error) {
	var users []User
	page := 1
	limit := 100
	dailyMaxGenNum := g.SimplePickNumDaily
	now := time.Now().Unix()
	for {
		query := fmt.Sprintf("SELECT id,mobile,pay_end_time,luck_left_num,wxid FROM mt_user WHERE (luck_left_num>0 or pay_end_time>%d) AND status=1 LIMIT %d,%d;", now, (page-1)*limit, limit)
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
				g.genNewTask(taskID, user.Mobile, now, user.ID, user.WechatID, TYPE_TASK_SIMPLE)
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
		query := fmt.Sprintf("SELECT id,mobile,pay_end_time,luck_left_num,wxid  FROM mt_user WHERE pay_end_time>%d AND status=1 LIMIT %d,%d;", now, (page-1)*limit, limit)
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
			g.genNewTask(taskID, user.Mobile, now, user.ID, user.WechatID, TYPE_TASK_BEST)
		}

		if len(users) < limit {
			return
		}
		page += 1
	}
}

func (g *TaskGenServer) genNewTask(taskID int64, mobile string, time int64, uid int64, wxid string, typeTask int) {

	g.DBConn.NamedExec("INSERT INTO mt_task(id,status,mobile,time_gen,uid,wxid,type) VALUES(:id,:status,:mobile,:time_gen,:uid,:wxid,:type)", map[string]interface{}{
		"id":       taskID,
		"status":   STATUS_TASK_ENTER,
		"mobile":   mobile,
		"time_gen": time,
		"uid":      uid,
		"wxid":     wxid,
		"type":     typeTask,
	})
	common.Log.INFO.Printf("gen new task id:%d for %s\n", taskID, mobile)

}
func (g *TaskGenServer) genTaskID(firstNum int) (i int64, err error) {
	str := fmt.Sprintf("%d%d%.7d", firstNum, time.Now().Unix(), rand.Intn(1000000))
	i, err = strconv.ParseInt(str, 10, 64)
	return
}

const (
	TYPE_TASK_SIMPLE        = 1
	TYPE_TASK_BEST          = 2
	TYPE_TASK_SIMPLE_HANDLE = 3
	TYPE_TASK_BEST_HANDLE   = 4
)
