package message

import "yx.com/meituan-luck/common"

func Main() {
	m := New()
	defer m.Close()
	go m.ReceiveWeChatMsg()

	common.SystemLoop()
}
