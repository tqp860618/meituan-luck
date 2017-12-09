package layout

import (
	"fmt"
	tui "github.com/gizak/termui"
	"time"
	"yx.com/meituan-luck/common"
)

//windows := map[string]map[string]string{
//"Win 1": {
//"Com 1": "hello",
//},
//}
func NewUI(title string, windows map[string]map[string]string) (ui *UI) {
	err := tui.Init()
	ui.Title = title

	if err != nil {
		common.Log.ERROR.Fatalln(err)
		return
	}
	ui.initTitle()
	ui.initWindows(windows)
	ui.initEvent()
	return
}
func (l *UI) Run() {
	l.Render()
	l.loop()
}

func (l *UI) initWindows(windows map[string]map[string]string) {
	l.initTitle()
	for title, components := range windows {
		l.initWindow(title, components)
	}

}
func (l *UI) initWindow(title string, components map[string]string) {
	window := &UIWindow{
		Data:  l.newComponents(components),
		Key:   title,
		Title: title,
	}
	size := len(window.Data)
	if size == 0 {
		size = 5
	}
	l.Windows = append(l.Windows, window)
	ls := tui.NewList()
	ls.Items = window.Data
	ls.ItemFgColor = tui.ColorYellow
	ls.BorderLabel = window.Title
	ls.Height = size
	ls.Width = 25
	ls.Y = 0
}

func (l *UI) newComponents(components map[string]string) []string {
	var rst []string
	for k, v := range components {
		rst = append(rst, fmt.Sprintf("[%s] %s", k, v))
	}
	return rst
}

func (l *UI) initTitle() {
	title := l.getTitle()
	l.TitleComponent = tui.NewPar(title)
	l.TitleComponent.Height = 3
	l.TitleComponent.Width = tui.Body.Width
	l.TitleComponent.X = (tui.Body.Width - len(title)) / 2
	l.TitleComponent.Y = 0
	l.TitleComponent.TextFgColor = tui.ColorWhite
	l.TitleComponent.Border = false
}
func (l *UI) getTitle() string {
	return l.Title + "(" + time.Now().Format(`2006-01-02 15:04:05`) + ")"
}
func (l *UI) updateTitle() {
	l.TitleComponent.Text = l.getTitle()
	l.TitleComponent.X = (tui.Body.Width - len(l.TitleComponent.Text)) / 2
	tui.Render(l.TitleComponent)
}
func (l *UI) initEvent() {
	tui.Handle("/sys/kbd/q", func(tui.Event) {
		// press q to quit
		tui.StopLoop()
	})

	tui.Handle("/sys/kbd/C-x", func(tui.Event) {
		// handle Ctrl + x combination
	})
	tui.Handle("/sys/kbd", func(tui.Event) {
		// handle all other key pressing
	})

	// handle a 1s timer
	tui.Handle("/timer/1s", func(e tui.Event) {
		l.updateTitle()
		//t := e.Data.(tui.EvtTimer)
		//// t is a EvtTimer
		//if t.Count%2 == 0 {
		//	// do something
		//}
	})
}

func (l *UI) Render() {
	tui.Render(l.TitleComponent) // feel free to call Render, it's async and non-b

}

func (l *UI) Close() {
	tui.Close()
}

func (l *UI) loop() {
	tui.Loop()
}
