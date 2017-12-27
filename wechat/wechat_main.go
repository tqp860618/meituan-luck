package wechat

import (
	"github.com/spf13/viper"
	"os"
	"path"
	"yx.com/meituan-luck/common"
)

func Main() {
	common.Log.INFO.Print("启动...")

	wechat := NewWechat()

	if err := wechat.WaitForLogin(); err != nil {
		common.Log.ERROR.Printf("等待失败：%s\n", err.Error())
		return
	}
	srcPath, err := os.Getwd()
	if err != nil {
		common.Log.INFO.Printf("获得路径失败:%#v\n", err)
	}
	configFile := path.Join(path.Clean(srcPath), "config.json")
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		common.Log.ERROR.Printf("请提供配置文件：config.json")
		return
	}

	common.Log.INFO.Printf("登陆...\n")

	wechat.AutoReplyMode = viper.GetBool("weixin_server.auto_reply")
	wechat.ReplyMsgs = viper.GetStringSlice("weixin_server.reply_msg")
	wechat.AutoReplySrc = viper.GetBool("weixin_server.auto_reply_src")

	if err := wechat.Login(); err != nil {
		common.Log.INFO.Printf("登陆失败：%v\n", err)
		return
	}

	common.Log.INFO.Print("成功!")

	common.Log.INFO.Print("微信初始化成功...")

	if err := wechat.StatusNotify(); err != nil {
		return
	}
	if err := wechat.GetContacts(); err != nil {
		common.Log.ERROR.Printf("拉取联系人失败:%v\n", err)
		return
	}

	if err := wechat.TestCheck(); err != nil {
		common.Log.ERROR.Printf("检查状态失败:%v\n", err)
		return
	}

	msgIn := make(chan *Message, maxChanSize)
	msgOut := make(chan MessageOut, maxChanSize)
	autoChan := make(chan int, 1)
	ipPortChan := make(chan string, 1)

	go wechat.SyncDaemon(msgIn)
	go wechat.MsgDaemon(msgOut, autoChan)
	go wechat.MsgOut(msgIn, ipPortChan)
	go wechat.ServerDaemon(ipPortChan)
	common.Log.INFO.Println("Http服务器已开启")

	// 启动UI线程
	//windows := map[string]map[string]string{
	//	"Win 1": {
	//		"Com 1": "hello",
	//	},
	//}
	//
	//ui := layout.NewUI("微信机器人", windows)
	//defer ui.Close()
	common.SystemLoop()
}

const (
	maxChanSize = 50
)
