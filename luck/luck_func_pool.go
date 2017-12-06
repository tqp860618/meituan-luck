package luck

import (
	"errors"
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
	_, err = a.StoreBack.Update(record.ID, record)
	if err != nil {
		return
	}
	a.StoreMem[record.ID] = record
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
