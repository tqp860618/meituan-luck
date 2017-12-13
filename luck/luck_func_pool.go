package luck

import (
	"errors"
	"github.com/garyburd/redigo/redis"
	"yx.com/meituan-luck/common"
)

func (a *PoolActivity) Add(record *ActivityRecord) (err error) {
	_, err = a.StoreBack.Add(record.ID, record)
	if err != nil {
		return
	}
	a.StoreMem[record.ID] = record
	return
}
func (a *PoolActivity) Update(record *ActivityRecord) (err error) {
	if record.Finished {
		err = a.StoreBack.Delete(record.ID)
		if err != nil {
			return
		}
		delete(a.StoreMem, record.ID)

	} else {
		_, err = a.StoreBack.Update(record.ID, record)
		if err != nil {
			return
		}
		a.StoreMem[record.ID] = record
	}

	return
}

func (a *PoolActivity) Delete(record *ActivityRecord) (err error) {
	delete(a.StoreMem, record.ID)
	err = a.StoreBack.Delete(record.ID)
	if err != nil {
		return
	}
	return
}
func (a *PoolActivity) FetchRecordsFromStore() {
	if len(a.StoreMem) == 0 {
		var recordsAll = a.StoreBack.GetAll()
		for i := 0; i < len(recordsAll); i++ {
			if !recordsAll[i].Finished && (recordsAll[i].LeftSimpleNum > 0 || recordsAll[i].LeftBestIf) {

				a.StoreMem[recordsAll[i].ID] = &recordsAll[i]
			}
		}
	}
	return
}

func (a *PoolActivity) Restore() {
	// todo 启动时重置activity值和执行状态值¬
}
func (p *StorePool) Update(key string, value StoreValue) (res interface{}, err error) {
	key = p.getStoreKey(key)
	valueEncode, err := value.Serialize()
	if err != nil {
		return
	}
	res, err = p.RedisConn.Do("SET", key, valueEncode)
	return
}

func (p *StorePool) GetAll() (res []ActivityRecord) {
	parentKey := p.getStoreKey(p.ParentKey)
	resKeysI, _ := p.RedisConn.Do("SMEMBERS", parentKey)
	var keys []interface{}
	for i := 0; i < len(resKeysI.([]interface{})); i++ {
		keys = append(keys, string(resKeysI.([]interface{})[i].([]byte)))
	}
	replyI, err := redis.Values(p.RedisConn.Do("MGET", keys...))
	for i := 0; i < len(replyI); i++ {
		item := ActivityRecord{
			WaitingForJobs: true,
		}
		if replyI[i] != nil {
			item.UnSerialize(string(replyI[i].([]byte)))
			res = append(res, item)
		}

	}
	if err != nil {
		common.Log.INFO.Println(err)
	}

	return
}
func (p *StorePool) Delete(key string) (err error) {
	parentKey := p.getStoreKey(p.ParentKey)
	key = p.getStoreKey(key)
	_, err = p.RedisConn.Do("SREM", parentKey, key)
	_, err = p.RedisConn.Do("DEL", key)
	return
}
func (p *StorePool) Add(key string, value StoreValue) (res interface{}, err error) {
	parentKey := p.getStoreKey(p.ParentKey)
	key = p.getStoreKey(key)
	common.Log.INFO.Printf("存储Key:\t%v %v\n", parentKey, key)

	p.Locker.Lock()

	resBefore, err := p.RedisConn.Do("SCARD", parentKey)
	p.RedisConn.Do("SADD", parentKey, key)
	resAfter, err := p.RedisConn.Do("SCARD", parentKey)

	p.Locker.Unlock()
	if err != nil {
		return
	}
	countAffected := resAfter.(int64) - resBefore.(int64)
	if countAffected <= 0 {
		err = errors.New("key exist")
		return
	}

	valueEncode, err := value.Serialize()
	if err != nil {
		return
	}
	res, err = p.RedisConn.Do("SET", key, valueEncode)
	return
}

func (p *StorePool) getStoreKey(key string) string {
	return common.Md5(key + p.KeyAppend)
}
