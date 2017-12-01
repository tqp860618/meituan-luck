package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path"
	WeChat "yx.com/wechat-auto-server/wechat"
	jww "github.com/spf13/jwalterweatherman"
)

const (
	maxChanSize = 50
)

type Config struct {
	SaveToFile   bool     `json:"save_to_file"`
	AutoReply    bool     `json:"auto_reply"`
	AutoReplySrc bool     `json:"auto_reply_src"`
	ReplyMsg     []string `json:"reply_msg"`
}

func main() {
	var logFile *os.File
	defer logFile.Close()
	err, wxNotepad := getWXLogger(logFile)

	wxNotepad.INFO.Print("启动...")

	wechat := WeChat.NewWechat(wxNotepad)

	if err := wechat.WaitForLogin(); err != nil {
		wxNotepad.ERROR.Printf("等待失败：%s\n", err.Error())
		return
	}
	srcPath, err := os.Getwd()
	if err != nil {
		wxNotepad.INFO.Printf("获得路径失败:%#v\n", err)
	}
	configFile := path.Join(path.Clean(srcPath), "config.json")
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		wxNotepad.ERROR.Printf("请提供配置文件：config.json")
		return
	}

	b, err := ioutil.ReadFile(configFile)
	if err != nil {
		wxNotepad.ERROR.Printf("读取文件失败：%#v", err)
		return
	}
	var config *Config
	err = json.Unmarshal(b, &config)

	wxNotepad.INFO.Printf("登陆...\n")

	wechat.AutoReplyMode = config.AutoReply
	wechat.ReplyMsgs = config.ReplyMsg
	wechat.AutoReplySrc = config.AutoReplySrc

	if err := wechat.Login(); err != nil {
		wxNotepad.INFO.Printf("登陆失败：%v\n", err)
		return
	}
	wxNotepad.DEBUG.Printf("配置文件:%+v\n", config)

	wxNotepad.INFO.Print("成功!")

	wxNotepad.INFO.Print("微信初始化成功...")

	wxNotepad.INFO.Print("开启状态栏通知...")
	if err := wechat.StatusNotify(); err != nil {
		return
	}
	if err := wechat.GetContacts(); err != nil {
		wxNotepad.ERROR.Printf("拉取联系人失败:%v\n", err)
		return
	}

	if err := wechat.TestCheck(); err != nil {
		wxNotepad.ERROR.Printf("检查状态失败:%v\n", err)
		return
	}

	msgIn := make(chan WeChat.Message, maxChanSize)
	msgOut := make(chan WeChat.MessageOut, maxChanSize)
	autoChan := make(chan int, 1)

	go wechat.SyncDaemon(msgIn)
	go wechat.MsgDaemon(msgOut, autoChan)
	go wechat.MsgProcessDaemon(msgIn)

	WeChat.SystemLoop()
}
func getWXLogger(logFile *os.File) (error, *jww.Notepad) {
	fileName := "log.txt"
	logFile, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
	wxNotepad := jww.NewNotepad(jww.LevelInfo, jww.LevelDebug, os.Stdout, logFile, "wechat", log.Ldate|log.Ltime)
	return err, wxNotepad
}
