// Copyright © 2017 devctang <devctang@163.com>
// This file is part of {{ .appName }}.

package cmd

import (
	"fmt"

	"github.com/gorilla/mux"
	"github.com/spf13/cobra"
	"io"
	"log"
	"net/http"
	url2 "net/url"
)

// luckCmd represents the luck command
var luckCmd = &cobra.Command{
	Use:   "luck",
	Short: "抢红包进程，用于在分发过来的红包链接池进行红包分配",
	Long:  `抢红包进程，用于在分发过来的红包链接池进行红包分配`,
	Run: func(cmd *cobra.Command, args []string) {
		luckProcess()
	},
}

func luckProcess() {
	rtr := mux.NewRouter()
	rtr.HandleFunc("/msg/{msgType}/{fromUid}/{channel}/{urlKey}", msgServer).Methods("GET")
	http.Handle("/", rtr)
	log.Fatalln(http.ListenAndServe(":6036", nil))
}

func msgServer(res http.ResponseWriter, req *http.Request) {
	isFromUser := true

	params := mux.Vars(req)
	msgType := params["msgType"]
	fromUid := params["fromUid"]
	channel := params["channel"]
	urlKey := params["urlKey"]
	fmt.Printf("callback %s\t%s\t%s\t%s", msgType, fromUid, channel, urlKey)
	io.WriteString(res, fmt.Sprintf("callback %s\t%s\t%s\t%s", msgType, fromUid, channel, urlKey))

	if fromUid[:2] == "@@" {
		isFromUser = false
	}

	//来源于分组的消息

	if isFromUser {
		url := fmt.Sprintf("http://127.0.0.1:5036/msg/%s/%s", fromUid, url2.QueryEscape("你抽中了2元红包，请打开美团客户端查看"))
		go http.Get(url)
	}

}

func init() {
	RootCmd.AddCommand(luckCmd)
}
