package luck

import (
	"encoding/json"
	"errors"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
)

func (e *TaskExeServer) Start() {
	common.Log.INFO.Println("task exe server started")
	//处理新的activity消息，不代表一定有新的活动，主要是检查有效性
	go e.handleNewActivityMsg()
	go e.updateActivityPoolStatus()

}

func (e *TaskExeServer) handleNewActivityMsg() {
	sig := SigNewActivity{}
	for {
		select {
		case sig = <-e.SigNewActivity:
			go e.addNewActivity(sig.Channel, sig.UrlKey, sig.BestPos)
		default:
			time.Sleep(time.Microsecond * 200)
		}
	}
}

func (e *TaskExeServer) getRecordFromJson(channel string, urlKey string, luckBestPos int, recordJson *ActivityInfoJson) (record *ActivityRecord) {
	record = &ActivityRecord{
		ID:            channel + urlKey,
		Channel:       channel,
		UrlKey:        urlKey,
		BestLuckPrice: recordJson.BestLuckPrice,
		BestLuckPos:   luckBestPos,
		NowPos:        recordJson.CouponsCount,
		TotalPos:      totalPos,
		LeftSimpleNum: 0,
		LeftBestIf:    false,
		NextBestIf:    false,
		Finished:      recordJson.Finished,
	}
	record.LeftSimpleNum = calLeftSimpleNum(record.TotalPos, record.NowPos, record.BestLuckPos)
	record.LeftBestIf = calLeftBestIf(record.NowPos, record.BestLuckPos)
	record.NextBestIf = calNextBestIf(record.NowPos, record.BestLuckPos)
	if record.NowPos == record.TotalPos {
		record.Finished = true
	}
	return
}

func (e *TaskExeServer) addNewActivity(channel string, urlKey string, luckBestPos int) (err error) {
	//先获取记录信息
	recordJson, err := e.getRecordInfo(channel, urlKey)
	if err != nil {
		return
	}
	if recordJson.Finished {
		err = errors.New("该活动已结束")
		return
	}
	record := e.getRecordFromJson(channel, urlKey, luckBestPos, recordJson)

	err = e.PoolActivity.Add(record)
	if err != nil {
		// 没有插入新的记录
	} else {
		// 插入成功，启动一个单独的协程来处理循环这条记录
		go e.processNewActivity(record)
	}
	return
}
func calNextBestIf(now int, skip int) bool {
	return skip == now+1
}
func calLeftBestIf(now int, skip int) bool {
	return skip > now
}
func calLeftSimpleNum(total int, now int, skip int) int {
	if skip > now {
		return total - now - 1
	} else {
		return total - now
	}
}
func (e *TaskExeServer) getRecordInfo(channel string, urlKey string) (recordJson *ActivityInfoJson, err error) {
	urlRequire := strings.Replace(viper.GetString("luck_server.info_address"), "[channel]", channel, -1)
	urlRequire = strings.Replace(urlRequire, "[urlKey]", urlKey, -1)
	res, err := http.Get(urlRequire)
	defer res.Body.Close()
	if err != nil {
		return
	}
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	recordJson = new(ActivityInfoJson)
	baseJson := new(BaseJsonRst)
	baseJson.Rst = recordJson

	recordJson.Finished = true
	err = json.Unmarshal(body, baseJson)
	common.Log.INFO.Println(string(body))
	return
}

// 每条记录自己单独的抢红包逻辑
func (e *TaskExeServer) processNewActivity(record *ActivityRecord) {
	e.updateActivityPoolStatus()
	var tasks []SigNewTask
	var task SigNewTask
	ifFinished := false
	for {
		select {
		case tasks = <-e.SigNewTasks:
			//对任务进行一次排序，如果有best任务，name要放在合适的位置去循环。但是也不一定，因为别人也在一起抢
			bestTask, hasBestTask := e.pickBestTask(tasks)
			simpleTasks := e.pickSimpleTasks(tasks)

			if len(simpleTasks) > 0 {
				for i := 0; i < len(simpleTasks); i++ {
					task = simpleTasks[i]
					//根据任务类型，执行任务，并修改自己的状态，更新整体的状态
					//task.Mobile, task.ID
					e.goodLuckLogic(task, record)
					if record.NextBestIf && hasBestTask {
						e.goodLuckLogic(bestTask, record)
					}
					if record.Finished {
						ifFinished = true
						break
					}
				}
			} else {
				if hasBestTask {
					e.goodLuckLogic(bestTask, record)
				}
			}

		default:
			time.Sleep(time.Microsecond)
		}
		if ifFinished {
			break
		}
	}
}

// 告知分发服务器当前执行服务器的状态
func (e *TaskExeServer) updateActivityPoolStatus() {
	e.ActivityStatus.status = 1
	e.SigPoolActivityStatus <- e.ActivityStatus
}
func (e *TaskExeServer) goodLuckLogic(task SigNewTask, record *ActivityRecord) (result int) {
	recordJson, err := e.goodLuckAction(task.Mobile, record.Channel, record.UrlKey)
	if err != nil {
		//执行失败，标记任务失败，不减次数
		result = RST_CALL_ERR
		return
	}
	//RST_USER_NOT_EXIST  = 4201 //直接标记任务失败，标记用户状态为无效
	//RST_USER_TODAY_FULL = 7001 //直接标记任务失败，总次数不减
	//RST_USER_PICKED     = 4002 //直接标记任务取回，下次可以重取，总次数不减
	//RST_NO_LEFT         = 4000 //直接标记任务取回，下次可以重取，总次数不减
	//RST_ACTIVITY_PASS   = 2002 //直接标记任务取回，下次可以重取，总次数不减
	// 修改自己状态
	// 修改整体状态
	// 告知成功或失败的结果

	switch recordJson.Code {
	case RST_USER_NOT_EXIST:
	case RST_USER_TODAY_FULL:
	case RST_USER_PICKED:
	case RST_NO_LEFT:
	case RST_ACTIVITY_PASS:

	}

	record = e.getRecordFromJson(record.Channel, record.UrlKey, record.BestLuckPos, recordJson)
	err = e.PoolActivity.Update(record)
	return RST_OK
}

func (e *TaskExeServer) goodLuckAction(mobile string, channel string, urlKey string) (recordJson *ActivityInfoJson, err error) {
	urlRequire := strings.Replace(viper.GetString("luck_server.luck_address"), "[channel]", channel, -1)
	urlRequire = strings.Replace(urlRequire, "[urlKey]", urlKey, -1)
	urlRequire = strings.Replace(urlRequire, "[userPhone]", mobile, -1)
	res, err := http.Get(urlRequire)
	defer res.Body.Close()
	if err != nil {
		return
	}
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	recordJson = new(ActivityInfoJson)
	baseJson := new(BaseJsonRst)
	baseJson.Rst = recordJson

	recordJson.Finished = true
	err = json.Unmarshal(body, baseJson)
	common.Log.INFO.Println(string(body))
	return
}

func (e *TaskExeServer) pickBestTask(tasks []SigNewTask) (task SigNewTask, hasBestTask bool) {
	for i := 0; i < len(tasks); i++ {
		if tasks[i].Type == TYPE_TASK_BEST {
			task = tasks[i]
			hasBestTask = true
			return
		}
	}
	hasBestTask = false
	return
}
func (e *TaskExeServer) pickSimpleTasks(tasks []SigNewTask) (rst []SigNewTask) {
	for i := 0; i < len(tasks); i++ {
		if tasks[i].Type == TYPE_TASK_SIMPLE {
			rst = append(rst, tasks[i])
		}
	}
	return rst
}

const (
	totalPos            = 20
	RST_USER_NOT_EXIST  = 4201 //直接标记任务失败，标记用户状态为无效
	RST_USER_TODAY_FULL = 7001 //直接标记任务失败，总次数不减
	RST_USER_PICKED     = 4002 //直接标记任务取回，下次可以重取，总次数不减
	RST_NO_LEFT         = 4000 //直接标记任务取回，下次可以重取，总次数不减
	RST_ACTIVITY_PASS   = 2002 //直接标记任务取回，下次可以重取，总次数不减
	RST_CALL_ERR        = 9999 // 执行直接错误，可能HTTP
	RST_OK              = 0    //执行成功
)
