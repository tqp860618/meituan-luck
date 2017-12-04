package common

import (
	"crypto"
	"fmt"
	"io"
)

func SystemLoop() {
	system := make(chan bool)
	<-system
}
func Md5(str string) string {
	h := crypto.MD5.New()
	io.WriteString(h, str)
	return fmt.Sprintf("%x", h.Sum(nil))
}
