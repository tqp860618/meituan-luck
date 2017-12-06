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
	//一条有效的activity已经生成，现在可以开始执行抢红包任务了
	go e.handleNewActivity()

}
func (e *TaskExeServer) handleNewActivity() {

}

func (e *TaskExeServer) handleNewActivityMsg() {
	msg := MsgNewActivity{}
	for {
		select {
		case msg = <-e.ChanNewActivity:
			go e.addNewActivity(msg.Channel, msg.UrlKey, msg.BestNum)
		default:
			time.Sleep(time.Microsecond * 200)
		}
	}
}

func (e *TaskExeServer) addNewActivity(channel string, urlKey string, luckBestNum int) (err error) {
	//先获取记录信息
	recordJson, err := e.getRecordInfo(channel, urlKey)
	if err != nil {
		return
	}
	if recordJson.Finished {
		err = errors.New("该活动已结束")
		return
	}
	record := &ActivityRecord{
		Channel:     channel,
		UrlKey:      urlKey,
		LuckBestNum: luckBestNum,
		LeftCount:   20 - recordJson.CouponsCount,
		BestLuck:    recordJson.BestLuck,
		CanContinue: recordJson.CanContinue,
		Finished:    recordJson.Finished,
	}
	_, err = e.PoolActivity.Add(channel+urlKey, record)
	if err != nil {
		// 没有插入新的记录
	} else {
		// 插入成功，启动一个单独的协程来处理循环这条记录
		go e.ProcessActivity(record)
	}
	return
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
func (e *TaskExeServer) ProcessActivity(record *ActivityRecord) {

}
