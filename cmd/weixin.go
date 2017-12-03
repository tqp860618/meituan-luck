// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	jww "github.com/spf13/jwalterweatherman"
	"github.com/spf13/viper"
	"log"
	"os"
	"path"
	"time"
	WeChat "yx.com/meituan-luck/wechat"
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

func msgProcess() {
	var logFile *os.File
	defer logFile.Close()
	err, wxNotepad := getWXLogger(logFile)
	LogError := wxNotepad.ERROR
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

	LogInfo.Printf("登陆...\n")

	wechat.AutoReplyMode = viper.GetBool("weixin_server.auto_reply")
	wechat.ReplyMsgs = viper.GetStringSlice("weixin_server.reply_msg")
	wechat.AutoReplySrc = viper.GetBool("weixin_server.auto_reply_src")

	if err := wechat.Login(); err != nil {
		LogInfo.Printf("登陆失败：%v\n", err)
		return
	}

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
	fileName := viper.GetString("weixin_server.log_file")
	fileName = fmt.Sprintf(fileName, time.Now().Format("2006-01-02-15:04:05"))
	logFile, err := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0666)
	wxNotepad := jww.NewNotepad(jww.LevelInfo, jww.LevelDebug, os.Stdout, logFile, "wechat", log.Ldate|log.Ltime)
	return err, wxNotepad
}
