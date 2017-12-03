package common

import (
	"fmt"
	jww "github.com/spf13/jwalterweatherman"
	"github.com/spf13/viper"
	"log"
	"os"
	"time"
)

var Log *CTLogger

func PrepareLog() {
	if Log != nil {
		return
	}
	var err error
	Log, err = newLog()
	if err != nil {
		log.Fatalln(err)
	}
}

func newLog() (c *CTLogger, err error) {
	fileName := viper.GetString("weixin_server.log_file")
	fileName = fmt.Sprintf(fileName, time.Now().Format("2006-01-02-15:04:05"))
	logFile, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
	notebook := jww.NewNotepad(jww.LevelInfo, jww.LevelDebug, os.Stdout, logFile, "wechat", log.Ldate|log.Ltime)
	c = &CTLogger{
		ERROR: notebook.ERROR,
		INFO:  notebook.INFO,
		WARN:  notebook.WARN,
		DEBUG: notebook.DEBUG,
	}
	//defer logFile.Close()
	return
}

type CTLogger struct {
	ERROR *log.Logger
	INFO  *log.Logger
	WARN  *log.Logger
	DEBUG *log.Logger
}
