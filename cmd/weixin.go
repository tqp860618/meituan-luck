// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"github.com/spf13/cobra"
	"yx.com/meituan-luck/wechat"
)

var weixinCmd = &cobra.Command{
	Use:   "weixin",
	Short: `微信自动获取消息到消息队列`,
	Long:  `微信自动获取消息到消息队列`,
	Run: func(cmd *cobra.Command, args []string) {
		wechat.Main()
	},
}

func init() {
	RootCmd.AddCommand(weixinCmd)
}
