// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"github.com/spf13/cobra"
	"yx.com/meituan-luck/message"
)

// messageCmd represents the message command
var messageCmd = &cobra.Command{
	Use:   "message",
	Short: "A brief description of your command",
	Long: `A longer description that spans multiple lines and likely contains examples
and usage of using your command. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.`,
	Run: func(cmd *cobra.Command, args []string) {
		message.Main()
	},
}

func init() {
	RootCmd.AddCommand(messageCmd)
}
