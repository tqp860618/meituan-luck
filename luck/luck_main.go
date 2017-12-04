package luck

import "yx.com/meituan-luck/common"

func Main() {
	luck, conn, _ := NewLuck()
	defer conn.Close()

	go luck.MsgServer.Start()
	common.SystemLoop()
}
