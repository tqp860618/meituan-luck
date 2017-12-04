package luck

import (
	"encoding/json"
	"errors"
	"github.com/garyburd/redigo/redis"
	"github.com/spf13/viper"
	"io/ioutil"
	"net/http"
	"strings"
	"sync"
	"yx.com/meituan-luck/common"
)

func NewLuck() (luck *Luck, conn redis.Conn, err error) {
	conn, err = redis.Dial("tcp", viper.GetString("luck_server.redis_address"))
	if err != nil {
		return
	}
	luck = &Luck{
		PoolActivity: &StorePool{
			RedisConn: conn,
			KeyAppend: "_meituan_luck",
			ParentKey: "_meituan_activity_p",
			Locker:    &sync.Mutex{},
		},
		MsgServer: &MsgServer{
			LuckServer: nil,
		},
	}
	luck.MsgServer.LuckServer = luck

	return
}
func (l *Luck) getRecordInfo(channel string, urlKey string) (recordJson *ActivityInfoJson, err error) {
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

func (l *Luck) AddActivity(channel string, urlKey string, luckBestNum int) (err error) {
	//先获取记录信息
	recordJson, err := l.getRecordInfo(channel, urlKey)
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
	_, err = l.PoolActivity.Add(channel+urlKey, record)
	if err != nil {
		// 没有插入新的记录
	} else {
		// 插入成功，启动一个单独的协程来处理循环这条记录
		go l.ProcessActivity(record)
	}
	return
}

// 每条记录自己单独的抢红包逻辑
func (l *Luck) ProcessActivity(record *ActivityRecord) {

}
