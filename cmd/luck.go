// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"github.com/spf13/cobra"
	"yx.com/meituan-luck/luck"
)

// luckCmd represents the luck command
var luckCmd = &cobra.Command{
	Use:   "luck",
	Short: "抢红包进程，用于在分发过来的红包链接池进行红包分配",
	Long:  `抢红包进程，用于在分发过来的红包链接池进行红包分配`,
	Run: func(cmd *cobra.Command, args []string) {
		luck.Main()
	},
}

func init() {
	RootCmd.AddCommand(luckCmd)
}
