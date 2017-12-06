package luck

import "yx.com/meituan-luck/common"

func Main() {
	luck, _ := NewLuck()

	// 确保链接关闭
	defer luck.CloseConn()

	// 生成抢红包任务
	go luck.TaskGenServer.Start()

	// 运行任务分配器
	go luck.TaskDisServer.Start()

	// 运行任务执行器
	go luck.TaskExeServer.Start()

	// 接收外部通讯消息
	go luck.MsgServer.Start()

	common.SystemLoop()
}
