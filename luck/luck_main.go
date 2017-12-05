package luck

import "yx.com/meituan-luck/common"

func Main() {
	luck, _ := NewLuck()
	defer luck.CloseConn()
	common.Log.INFO.Println("dsds")

	// 接收外部通讯消息
	//go luck.MsgServer.Start()

	// 生成抢红包任务
	go luck.TaskGenServer.Start()
	common.SystemLoop()
}
