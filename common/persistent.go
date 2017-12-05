package common

import (
	"fmt"
	"github.com/garyburd/redigo/redis"
	"github.com/spf13/viper"
)

var Persistent *PersistentData

func InitPersistent() {
	if Persistent != nil {
		return
	}
	redisConn, err := redis.Dial("tcp", viper.GetString("redis_address"))
	if err != nil {
		return
	}
	Persistent = &PersistentData{
		RedisConn:  redisConn,
		PrependKey: "_key_",
	}
}

func (p *PersistentData) GetBool(key string) bool {
	key = p.getKey(key)
	value, err := p.RedisConn.Do("GET", key)
	value = fmt.Sprintf("%s", value)
	if err == nil && value == "1" {
		return true
	}
	return false
}

func (p *PersistentData) SetBool(key string, value bool) {
	key = p.getKey(key)
	savedValue := "1"
	if !value {
		savedValue = "0"
	}
	p.RedisConn.Do("SET", key, savedValue)

}
func (p *PersistentData) getKey(key string) string {
	return Md5(fmt.Sprintf("%s%s", p.PrependKey, key))
}

type PersistentData struct {
	RedisConn  redis.Conn
	PrependKey string
}
