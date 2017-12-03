package common

func SystemLoop() {
	system := make(chan bool)
	<-system
}
