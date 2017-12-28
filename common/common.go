package common

import (
	"crypto"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

type Caller interface {
	IsSuccess() bool
	Error() error
}

func Init() {
	InitLog()
	InitPersistent()
}

func SystemLoop() {
	system := make(chan bool)
	<-system
}

func UrlEscape(str string) string {
	return strings.Replace(base64.StdEncoding.EncodeToString([]byte(str)), "/", "_$22$_", -1)
	//return strings.Replace(url.QueryEscape(base64.StdEncoding.EncodeToString([]byte(str))), "%2F", "_$22$_", -1)
}
func UrlUnEscape(str string) string {
	str = strings.Replace(str, "_$22$_", "/", -1)
	//str, _ = url.QueryUnescape(str)
	strByte, _ := base64.StdEncoding.DecodeString(str)
	return string(strByte)
}
func Md5(str string) string {
	h := crypto.MD5.New()
	io.WriteString(h, str)
	return fmt.Sprintf("%x", h.Sum(nil))
}

func Today() string {
	return time.Now().Format(`2006-01-02`)
}
func SleepRandn(microsecond int64) {
	time.Sleep(time.Duration(rand.Int63n(microsecond)))
}

func HttpGet(apiURI string, call Caller) (err error) {
	resp, err := http.Get(apiURI)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	reader := resp.Body.(io.Reader)
	if err = json.NewDecoder(reader).Decode(call); err != nil {
		Log.WARN.Printf("the error:%+v", err)
		return
	}
	if !call.IsSuccess() {
		err = call.Error()
	}
	return
}
