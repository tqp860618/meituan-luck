// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"github.com/spf13/cobra"
	"path"
	"io/ioutil"
	"encoding/json"
	"log"
	"os"
	WeChat "yx.com/meituan-luck/wechat"
	jww "github.com/spf13/jwalterweatherman"
)

var weixinCmd = &cobra.Command{
	Use:   "weixin",
	Short: `微信自动获取消息到消息队列`,
	Long:  `微信自动获取消息到消息队列`,
	Run: func(cmd *cobra.Command, args []string) {
		msgProcess()
	},
}

func init() {
	RootCmd.AddCommand(weixinCmd)
}

const (
	maxChanSize = 50
)

type Config struct {
	SaveToFile   bool     `json:"save_to_file"`
	AutoReply    bool     `json:"auto_reply"`
	AutoReplySrc bool     `json:"auto_reply_src"`
	ReplyMsg     []string `json:"reply_msg"`
	MTAutoTouch  string   `json:"mt_auto_touch"`
}

func msgProcess() {
	var logFile *os.File
	defer logFile.Close()
	err, wxNotepad := getWXLogger(logFile)
	LogError := wxNotepad.ERROR
	LogDebug := wxNotepad.DEBUG
	LogInfo := wxNotepad.INFO

	LogInfo.Print("启动...")

	wechat := WeChat.NewWechat(wxNotepad)

	if err := wechat.WaitForLogin(); err != nil {
		LogError.Printf("等待失败：%s\n", err.Error())
		return
	}
	srcPath, err := os.Getwd()
	if err != nil {
		LogInfo.Printf("获得路径失败:%#v\n", err)
	}
	configFile := path.Join(path.Clean(srcPath), "config.json")
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		LogError.Printf("请提供配置文件：config.json")
		return
	}

	b, err := ioutil.ReadFile(configFile)
	if err != nil {
		LogError.Printf("读取文件失败：%#v", err)
		return
	}
	var config *Config
	err = json.Unmarshal(b, &config)

	LogInfo.Printf("登陆...\n")

	wechat.AutoReplyMode = config.AutoReply
	wechat.ReplyMsgs = config.ReplyMsg
	wechat.AutoReplySrc = config.AutoReplySrc
	wechat.Meituan.MTAutoTouch = config.MTAutoTouch

	if err := wechat.Login(); err != nil {
		LogInfo.Printf("登陆失败：%v\n", err)
		return
	}
	LogDebug.Printf("配置文件:%+v\n", config)

	LogInfo.Print("成功!")

	LogInfo.Print("微信初始化成功...")

	if err := wechat.StatusNotify(); err != nil {
		return
	}
	if err := wechat.GetContacts(); err != nil {
		LogError.Printf("拉取联系人失败:%v\n", err)
		return
	}

	if err := wechat.TestCheck(); err != nil {
		LogError.Printf("检查状态失败:%v\n", err)
		return
	}

	msgIn := make(chan WeChat.Message, maxChanSize)
	msgOut := make(chan WeChat.MessageOut, maxChanSize)
	autoChan := make(chan int, 1)

	go wechat.SyncDaemon(msgIn)
	go wechat.MsgDaemon(msgOut, autoChan)
	go wechat.MsgProcessDaemon(msgIn)
	go wechat.ServerDaemon()
	LogInfo.Println("Http服务器已开启")

	WeChat.SystemLoop()
}
func getWXLogger(logFile *os.File) (error, *jww.Notepad) {
	fileName := "log.txt"
	logFile, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
	wxNotepad := jww.NewNotepad(jww.LevelInfo, jww.LevelDebug, os.Stdout, logFile, "wechat", log.Ldate|log.Ltime)
	return err, wxNotepad
}
