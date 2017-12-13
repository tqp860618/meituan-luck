package luck

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/spf13/viper"
	"io/ioutil"
	"math"
	"net/http"
	"strings"
	"time"
	"yx.com/meituan-luck/common"
)

func (e *TaskExeServer) Start() {
	e.Logln("执行服务器已启动")
	// 每次重启时重新获取活动信息
	// 定时重新获取活动信息
	go e.restoreUsefulActivity()
	go e.handleNewActivityMsg()
	go e.waitForNewTasks()
	//go e.repeatBroadcastStatusChange()
	go e.repeatUpdateRecordInfoFromRemote()
}

func (e *TaskExeServer) getRecords() map[string]*ActivityRecord {
	return e.PoolActivity.StoreMem
}
func (e *TaskExeServer) waitForNewTasks() {
	e.Logln("等待新的任务分配")
	var tasks []SigNewTask
	for {
		select {
		case tasks = <-e.SigNewTasks:
			//进行二次分配到具体的activity上
			bestTasks := e.pickBestTasks(tasks)
			simpleTasks := e.pickSimpleTasks(tasks)
			bestTasksIndex := 0
			simpleTasksIndex := 0
			records := e.getRecords()
			for _, record := range records {
				if record.WaitingForJobs {
					var disTasks []SigNewTask
					//防止越界，并没有分配足够多的任务
					if record.LeftBestIf && bestTasksIndex < len(bestTasks) {
						disTasks = append(disTasks, bestTasks[bestTasksIndex])
						bestTasksIndex += 1
					}
					if record.LeftSimpleNum > 0 {
						dsize := int(math.Min(float64(len(simpleTasks)), float64(record.LeftSimpleNum)))
						if dsize+simpleTasksIndex > len(simpleTasks) {
							dsize = len(simpleTasks)
						}
						fmt.Println(dsize, simpleTasksIndex, simpleTasks)
						disTasks = append(disTasks, simpleTasks[simpleTasksIndex:dsize]...)
						simpleTasksIndex += dsize
					}
					//如果 chan未初始化好的情况
					if len(disTasks) > 0 {
						if len(disTasks) > 0 && (e.PoolActivity.ActivityChans[record.ID] != nil) {
							e.PoolActivity.ActivityChans[record.ID] <- disTasks
						} else {
							time.Sleep(time.Second)
							e.SigNewTasks <- disTasks
							// 如果还未初始化好，则将任务从新给回
						}
					}

				}
			}
			// 没有分配完，则重新分配
			if bestTasksIndex <= len(bestTasks)-1 {
				time.Sleep(time.Microsecond * 100)
				e.SigNewTasks <- bestTasks[bestTasksIndex:]
			}
			if simpleTasksIndex <= len(simpleTasks)-1 {
				time.Sleep(time.Microsecond * 100)
				e.SigNewTasks <- simpleTasks[simpleTasksIndex:]
			}

		default:
			time.Sleep(time.Microsecond * 10)

		}
	}

}
func (e *TaskExeServer) restoreUsefulActivity() {
	e.PoolActivity.FetchRecordsFromStore()
	for _, record := range e.getRecords() {
		e.updateRecord(record)
		if record.Finished {
			e.PoolActivity.Delete(record)
		} else {
			e.PoolActivity.Update(record)
			go e.processActivity(record)
		}
	}
	//e.updateActivityPoolStatus()
}

func (e *TaskExeServer) updateRecord(record *ActivityRecord) {
	recordJson, err := e.getRecordInfo(record.Channel, record.UrlKey)
	if err == nil {
		e.getRecordFromJson(record, record.Channel, record.UrlKey, record.BestLuckPos, recordJson)
	}
}

func (e *TaskExeServer) repeatUpdateRecordInfoFromRemote() {
	for {
		for _, record := range e.getRecords() {
			recordJson, err := e.getRecordInfo(record.Channel, record.UrlKey)
			if err == nil {
				e.getRecordFromJson(record, record.Channel, record.UrlKey, record.BestLuckPos, recordJson)
			}
			if record.Finished {
				e.PoolActivity.Delete(record)
			} else {
				e.PoolActivity.Update(record)
			}
		}
		time.Sleep(time.Second * 20)
	}

}

func (e *TaskExeServer) handleNewActivityMsg() {
	sig := SigNewActivity{}
	for {
		select {
		case sig = <-e.SigNewActivity:
			e.Logln(sig.Channel, sig.UrlKey, sig.BestPos)
			go e.addNewActivity(sig.Channel, sig.UrlKey, sig.BestPos)
		default:
			time.Sleep(time.Microsecond * 200)
		}
	}
}

func (e *TaskExeServer) getRecordFromJson(record *ActivityRecord, channel string, urlKey string, luckBestPos int, recordJson *ActivityInfoJson) {

	record.ID = channel + urlKey
	record.Channel = channel
	record.UrlKey = urlKey
	record.BestLuckPos = luckBestPos
	record.TotalPos = totalPos

	if recordJson != nil && recordJson.Code != RST_USER_NOT_EXIST && recordJson.Code != RST_CALL_ERR {
		record.BestLuckPrice = recordJson.BestLuckPrice
		record.NowPos = recordJson.CouponsCount
		record.Finished = recordJson.Finished
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
		e.Logf("get record info error: %v", err)
		return
	}
	e.Logln(recordJson)
	if recordJson.Finished {
		e.Logln("该活动已结束")
		err = errors.New("该活动已结束")
		return
	}
	var record = &ActivityRecord{}
	e.getRecordFromJson(record, channel, urlKey, luckBestPos, recordJson)
	record.WaitingForJobs = true

	err = e.PoolActivity.Add(record)
	if err != nil {
		// 没有插入新的记录
		e.Logln("重复记录")
	} else {
		// 插入成功，启动一个单独的协程来处理循环这条记录
		go e.processActivity(record)
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

	if err != nil {
		return
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	recordJson = new(ActivityInfoJson)
	baseJson := new(BaseJsonRst)
	baseJson.Rst = recordJson

	recordJson.Finished = true
	err = json.Unmarshal(body, baseJson)
	//common.Log.INFO.Println(string(body))
	return
}

// 每条记录自己单独的抢红包逻辑
func (e *TaskExeServer) processActivity(record *ActivityRecord) {
	//e.Logln("new exe:", record.ID)

	//初始化信号
	sigNewTasks := make(chan []SigNewTask, 10)
	e.PoolActivity.ActivityChans[record.ID] = sigNewTasks
	//e.updateActivityPoolStatus()
	e.updateSelfActivityStatus(record)

	var tasks []SigNewTask
	var task SigNewTask
	ifFinished := false
	for {
		select {
		case tasks = <-sigNewTasks:
			if len(tasks) > 0 {
				record.WaitingForJobs = false
				//对任务进行一次排序，如果有best任务，name要放在合适的位置去循环。但是也不一定，因为别人也在一起抢
				e.Logf("新任务%v,%v", tasks[0].ID, record.ID)
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
							e.PoolActivity.Delete(record)
							//e.updateActivityPoolStatus()
							break
						}
					}
					// 任务全部完成也要通知下
					//e.updateActivityPoolStatus()
					e.updateSelfActivityStatus(record)
				} else {
					if hasBestTask {
						e.goodLuckLogic(bestTask, record)
					}
				}
			} else {
				time.Sleep(time.Second * 10)
				e.updateRecord(record)
				e.updateSelfActivityStatus(record)
			}

		default:
			record.WaitingForJobs = true
			time.Sleep(time.Microsecond)
		}
		if ifFinished {
			break
		}
	}
}

// 告知分发服务器当前执行服务器的状态
func (e *TaskExeServer) updateActivityPoolStatus() {
	e.ActivityLocker.Lock()
	//var oldValue SigPoolActivityStatus
	//oldValue = *e.ActivityStatus
	e.ActivityStatus = &SigPoolActivityStatus{}
	e.ActivityStatus.PoolSize = len(e.getRecords())
	e.ActivityStatus.BestLuckChance = 0
	for _, record := range e.getRecords() {
		if record.WaitingForJobs {
			if record.LeftBestIf {
				e.ActivityStatus.BestLuckChance += 1
			} else {
				e.ActivityStatus.SimpleLuckChance += record.LeftSimpleNum
			}
		}
	}
	//common.Log.INFO.Printf("%v,%v", oldValue, e.ActivityStatus)
	//if oldValue.BestLuckChance != e.ActivityStatus.BestLuckChance || oldValue.SimpleLuckChance != e.ActivityStatus.SimpleLuckChance {
	//	e.SigPoolActivityStatus <- e.ActivityStatus
	//}
	e.SigPoolActivityStatus <- e.ActivityStatus
	e.ActivityLocker.Unlock()
}

func (e *TaskExeServer) updateSelfActivityStatus(record *ActivityRecord) {
	activityStatus := &SigPoolActivityStatus{}
	activityStatus.BestLuckChance = 0
	if record.LeftBestIf {
		activityStatus.BestLuckChance = 1
	}
	if record.LeftSimpleNum > 0 {
		activityStatus.SimpleLuckChance = record.LeftSimpleNum
	}
	if activityStatus.BestLuckChance+activityStatus.SimpleLuckChance > 0 {
		activityStatus.ID = record.ID
		activityStatus.Chan = e.PoolActivity.ActivityChans[record.ID]
		e.SigPoolActivityStatus <- activityStatus
	}

}

func (e *TaskExeServer) goodLuckLogic(task SigNewTask, record *ActivityRecord) (result int) {
	recordJson, err := e.goodLuckAction(task.Mobile, record.Channel, record.UrlKey)
	//fmt.Printf("%v", recordJson)

	if err != nil {
		//执行失败，标记任务失败，不减次数
		result = RST_CALL_ERR
		recordJson = &ActivityInfoJson{
			CouponsCount:  0,
			BestLuckPrice: 0,
			CanContinue:   false,
			Finished:      false,
			Code:          RST_CALL_ERR,
		}
		//return
	}
	common.Log.INFO.Printf("status:%v", recordJson.Code)
	go func() {
		e.TaskResult <- TaskResult{
			Task:     &task,
			Status:   recordJson.Code,
			RecordID: record.ID,
		}
	}()

	e.getRecordFromJson(record, record.Channel, record.UrlKey, record.BestLuckPos, recordJson)
	err = e.PoolActivity.Update(record)
	return RST_OK
}

func (e *TaskExeServer) goodLuckAction(mobile string, channel string, urlKey string) (recordJson *ActivityInfoJson, err error) {
	urlRequire := strings.Replace(viper.GetString("luck_server.luck_address"), "[channel]", channel, -1)
	urlRequire = strings.Replace(urlRequire, "[urlKey]", urlKey, -1)
	urlRequire = strings.Replace(urlRequire, "[userPhone]", mobile, -1)
	res, err := http.Get(urlRequire)

	if err != nil {
		return
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	recordJson = new(ActivityInfoJson)
	baseJson := new(BaseJsonRst)
	baseJson.Rst = recordJson

	err = json.Unmarshal(body, baseJson)
	//common.Log.INFO.Println(string(body))
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
func (e *TaskExeServer) pickBestTasks(tasks []SigNewTask) (rst []SigNewTask) {
	for i := 0; i < len(tasks); i++ {
		if tasks[i].Type == TYPE_TASK_BEST {
			rst = append(rst, tasks[i])
		}
	}
	return rst
}
func (e *TaskExeServer) Logln(v ...interface{}) {
	v = append([]interface{}{"[exe]"}, v...)
	common.Log.INFO.Println(v...)
}

func (e *TaskExeServer) Logf(format string, v ...interface{}) {
	common.Log.INFO.Printf("[exe]"+format, v...)
}

//func (e *TaskExeServer) repeatBroadcastStatusChange() {
//	for {
//		e.updateActivityPoolStatus()
//		time.Sleep(time.Second * 1)
//	}
//}

const (
	totalPos            = 20
	RST_USER_NOT_EXIST  = 4201 //直接标记任务失败，标记用户状态为无效
	RST_USER_TODAY_FULL = 7001 //直接标记任务失败，总次数不减
	RST_USER_PICKED     = 4002 //直接标记任务取回，下次可以重取，总次数不减
	RST_NO_LEFT         = 4000 //直接标记任务取回，下次可以重取，总次数不减
	RST_ACTIVITY_PASS   = 2002 //直接标记任务取回，下次可以重取，总次数不减
	RST_NOT_GOT         = 2007 //没领到
	RST_CALL_ERR        = 9999 // 执行直接错误，可能HTTP
	RST_OK              = 1    //执行成功
)
