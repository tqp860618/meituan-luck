package luck

import (
	"yx.com/meituan-luck/common"
)

func Main() {
	luck, _ := NewLuck()

	// 确保链接关闭
	defer luck.CloseConn()

	go luck.StatusReport()
	// 生成抢红包任务
	go luck.TaskGenServer.Start()

	// 运行任务分配器
	go luck.TaskDisServer.Start()

	// 运行任务执行器
	go luck.TaskExeServer.Start()

	// 接收外部通讯消息
	go luck.MsgServer.Start()

	// 启动UI线程
	//// 启动UI线程
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
