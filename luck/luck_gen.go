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
	go g.waitForNewRegTask()
	go g.waitForNewUpgradeTask()
	go g.waitForNewHandedTask()
}

//生成每天的任务
func (g *TaskGenServer) genDailyTask() {
	needToGen := false
	firstLoop := true
	todayGenned := false
	persistentKey := "todayGenned" + time.Now().Format(`2006-01-02`)
	todayGenned = common.Persistent.GetBool(persistentKey)

	for {
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
func (g *TaskGenServer) waitForNewRegTask() {

}

//生成新付费的任务
func (g *TaskGenServer) waitForNewUpgradeTask() {

}

//生成手动临时请求的任务，比如从网页端单独请求一次

func (g *TaskGenServer) waitForNewHandedTask() {

}

func (g *TaskGenServer) genDailySimpleTask() (err error) {
	var users []User
	page := 1
	limit := 100
	dailyMaxGenNum := g.SimplePickNumDaily
	now := time.Now().Unix()
	for {
		query := fmt.Sprintf("SELECT id,mobile,pay_end_time,luck_left_num,wxid FROM mt_user WHERE luck_left_num>0 AND status=1 LIMIT %d,%d;", (page-1)*limit, limit)
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
			for userCanGenNum > 0 {
				// 生成task逻辑，完成talk才会减1
				taskID, _ := g.genTaskID(userCanGenNum + 3)
				_, err = g.DBConn.NamedExec("INSERT INTO mt_task(id,status,mobile,time_gen,uid,wxid,type) VALUES(:id,:status,:mobile,:time_gen,:uid,:wxid,:type)", map[string]interface{}{
					"id":       taskID,
					"status":   0,
					"mobile":   user.Mobile,
					"time_gen": now,
					"uid":      user.ID,
					"wxid":     user.WechatID,
					"type":     1,
				})
				common.Log.INFO.Printf("gen simple task id:%d for %s\n", taskID, user.Mobile)
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
			g.DBConn.NamedExec("INSERT INTO mt_task(id,status,mobile,time_gen,uid,wxid,type) VALUES(:id,:status,:mobile,:time_gen,:uid,:wxid,:type)", map[string]interface{}{
				"id":       taskID,
				"status":   0,
				"mobile":   user.Mobile,
				"time_gen": now,
				"uid":      user.ID,
				"wxid":     user.WechatID,
				"type":     2,
			})
			common.Log.INFO.Printf("gen best task id:%d for %s\n", taskID, user.Mobile)
		}

		if len(users) < limit {
			return
		}
		page += 1
	}

}
func (g *TaskGenServer) genTaskID(firstNum int) (i int64, err error) {
	str := fmt.Sprintf("%d%d%.7d", firstNum, time.Now().Unix(), rand.Intn(1000000))
	i, err = strconv.ParseInt(str, 10, 64)
	return
}
