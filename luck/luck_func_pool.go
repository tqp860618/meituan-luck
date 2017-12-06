package luck

import (
	"errors"
	"yx.com/meituan-luck/common"
)

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
